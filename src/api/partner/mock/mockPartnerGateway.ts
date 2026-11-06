import "server-only";

import { createHash, randomUUID, scryptSync, timingSafeEqual, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { StatusCodes } from "#/constants/httpStatus";
import { REQUIRED_DOCUMENTS } from "#/constants/partner";
import type { Application, ApplicationStatus, DocumentType, PartnerDocument, PartnerSession, PartnerType } from "#/types/partner.types";
import { ApiError } from "#/utils/ApiError";
import { addBusinessHours } from "#/utils/businessTime";
import type { PartnerGateway, ReviewDecision, SignedIn, UploadedFile } from "../partnerGateway";
import { MOCK_DEMO_ACCOUNTS, MOCK_DEMO_PASSWORD, MOCK_EMAIL_CODE, MOCK_REVIEW_REASONS } from "./mockData";

/**
 * Implémentation simulée du contrat PartnerGateway, en mémoire, sauvegardée dans
 * `.mock-data/partner-accounts.json` (ignoré par git) pour survivre aux redémarrages du serveur.
 * Elle reproduit les règles de la spécification (statuts, verrouillage, codes à 5 essais, 48 h ouvrées)
 * pour que les écrans se comportent comme avec la future API.
 * Les fichiers ne sont pas conservés : seules leurs métadonnées sont gardées.
 */

type CodePurpose = "verify" | "reset";
type OneTimeCode = { hash: string; expiresAt: number; attempts: number };

type MockAccount = {
  id: string;
  partnerType: PartnerType;
  email: string;
  phoneNumber: string;
  displayName: string;
  passwordHash: string;
  emailVerified: boolean;
  codes: Partial<Record<CodePurpose, OneTimeCode>>;
  application: {
    status: ApplicationStatus;
    submittedAt: string | null;
    reviewDueAt: string | null;
    decidedAt: string | null;
    rejectionReason: string | null;
    documents: PartnerDocument[];
  };
};

const CODE_TTL_MS = 15 * 60 * 1000;
const CODE_MAX_ATTEMPTS = 5;

// --- Mots de passe et codes ------------------------------------------------------------------

const hashPassword = (password: string): string => {
  const salt = randomBytes(16);
  return `${salt.toString("base64")}:${scryptSync(password, salt, 32).toString("base64")}`;
};

const verifyPassword = (password: string, stored: string): boolean => {
  const [salt, hash] = stored.split(":");
  const expected = Buffer.from(hash, "base64");
  const actual = scryptSync(password, Buffer.from(salt, "base64"), 32);
  return timingSafeEqual(expected, actual);
};

/** Hachage factice : même coût de calcul qu'un vrai compte (pas de détection par le temps de réponse). */
const DUMMY_HASH = hashPassword(randomUUID());

const hashCode = (code: string) => createHash("sha256").update(code).digest("hex");

const issueCode = (account: MockAccount, purpose: CodePurpose) => {
  account.codes[purpose] = { hash: hashCode(MOCK_EMAIL_CODE), expiresAt: Date.now() + CODE_TTL_MS, attempts: 0 };
};

const consumeCode = (account: MockAccount | undefined, purpose: CodePurpose, code: string) => {
  const entry = account?.codes[purpose];
  if (!account || !entry || entry.expiresAt < Date.now() || entry.attempts >= CODE_MAX_ATTEMPTS) {
    if (account) delete account.codes[purpose];
    throw new ApiError("Code expired", "OTP_EXPIRED", StatusCodes.GONE);
  }
  const ok = timingSafeEqual(Buffer.from(entry.hash), Buffer.from(hashCode(code)));
  if (!ok) {
    entry.attempts += 1;
    throw new ApiError("Invalid code", "OTP_INVALID", StatusCodes.BAD_REQUEST);
  }
  delete account.codes[purpose];
};

// --- Stockage ----------------------------------------------------------------------------------

const emptyApplication = (): MockAccount["application"] => ({
  status: "DRAFT",
  submittedAt: null,
  reviewDueAt: null,
  decidedAt: null,
  rejectionReason: null,
  documents: [],
});

const STORE_FILE = join(process.cwd(), ".mock-data", "partner-accounts.json");

const loadSaved = (): MockAccount[] => {
  try {
    if (!existsSync(STORE_FILE)) return [];
    const saved = JSON.parse(readFileSync(STORE_FILE, "utf8")) as MockAccount[];
    // Sauvegardes antérieures : la liste de livreurs ne fait plus partie du dossier
    return saved.map(({ application: { status, submittedAt, reviewDueAt, decidedAt, rejectionReason, documents }, ...rest }) => ({
      ...rest,
      application: { status, submittedAt, reviewDueAt, decidedAt, rejectionReason, documents },
    }));
  } catch {
    return []; // fichier illisible : on repart des comptes de démonstration
  }
};

const createStore = () => {
  const accounts = new Map<string, MockAccount>(loadSaved().map((a) => [a.id, a]));
  const demoHash = hashPassword(MOCK_DEMO_PASSWORD);
  for (const demo of MOCK_DEMO_ACCOUNTS) {
    if ([...accounts.values()].some((a) => a.email === demo.email)) continue;
    const id = randomUUID();
    accounts.set(id, { id, ...demo, passwordHash: demoHash, emailVerified: true, codes: {}, application: emptyApplication() });
  }
  return accounts;
};

/** Écriture atomique (fichier temporaire puis renommage) après chaque modification. */
const persist = () => {
  try {
    mkdirSync(join(process.cwd(), ".mock-data"), { recursive: true });
    writeFileSync(`${STORE_FILE}.tmp`, JSON.stringify([...accounts.values()]));
    renameSync(`${STORE_FILE}.tmp`, STORE_FILE);
  } catch {
    // mode démo : une sauvegarde manquée n'empêche pas le parcours
  }
};

/** Singleton conservé entre les rechargements à chaud du serveur de développement. */
const globalStore = globalThis as typeof globalThis & { __mboaMockAccounts?: Map<string, MockAccount> };
const accounts = (globalStore.__mboaMockAccounts ??= createStore());

const findByEmail = (email: string) => [...accounts.values()].find((a) => a.email === email.toLowerCase());

const accountOf = (session: PartnerSession): MockAccount => {
  const account = accounts.get(session.ref);
  if (!account) throw ApiError.unauthenticated(); // ex. compte simulé perdu au redémarrage
  return account;
};

// --- Règles du dossier -------------------------------------------------------------------------

const isEditable = (status: ApplicationStatus) => status === "DRAFT" || status === "CHANGES_REQUESTED";

/** Pièces requises encore absentes ou refusées (les livreurs se gèrent dans le panel flotte). */
const missingItems = (account: MockAccount): string[] =>
  REQUIRED_DOCUMENTS[account.partnerType].filter((type) => !account.application.documents.some((d) => d.type === type && d.status !== "REFUSED"));

const toApplication = (account: MockAccount): Application => ({
  partnerType: account.partnerType,
  ...structuredClone(account.application),
  requiredDocuments: [...REQUIRED_DOCUMENTS[account.partnerType]],
  canSubmit: isEditable(account.application.status) && missingItems(account).length === 0,
});

const locked = () => new ApiError("Application locked", "APPLICATION_LOCKED", StatusCodes.CONFLICT);

/** En correction, seules les pièces refusées (ou manquantes) peuvent être remplacées. */
const assertDocumentEditable = (account: MockAccount, type: DocumentType) => {
  const { status, documents } = account.application;
  if (!isEditable(status)) throw locked();
  if (status === "CHANGES_REQUESTED" && documents.some((d) => d.type === type && d.status !== "REFUSED")) throw locked();
};

// --- Implémentation ----------------------------------------------------------------------------

const signIn = (account: MockAccount): SignedIn => ({ ref: account.id, partnerType: account.partnerType });

const createAccount = (data: { partnerType: PartnerType; email: string; phoneNumber: string; displayName: string; password: string }) => {
  if (findByEmail(data.email) || [...accounts.values()].some((a) => a.phoneNumber === data.phoneNumber)) {
    throw new ApiError("Account already exists", "ACCOUNT_CONFLICT", StatusCodes.CONFLICT);
  }
  const account: MockAccount = {
    id: randomUUID(),
    partnerType: data.partnerType,
    email: data.email.toLowerCase(),
    phoneNumber: data.phoneNumber,
    displayName: data.displayName,
    passwordHash: hashPassword(data.password),
    emailVerified: false,
    codes: {},
    application: emptyApplication(),
  };
  issueCode(account, "verify");
  accounts.set(account.id, account);
  return { email: account.email };
};

const implementation: PartnerGateway = {
  source: "mock",

  async signupMerchant(_ctx, data) {
    return createAccount({ partnerType: "MERCHANT", email: data.email, phoneNumber: data.phoneNumber, displayName: data.businessName, password: data.password });
  },

  async signupDeliveryCompany(_ctx, data) {
    return createAccount({
      partnerType: "DELIVERY_COMPANY",
      email: data.managerEmail,
      phoneNumber: data.managerPhone,
      displayName: data.companyName,
      password: data.password,
    });
  },

  async requestEmailCode(_ctx, email) {
    const account = findByEmail(email);
    if (account && !account.emailVerified) issueCode(account, "verify");
  },

  async verifyEmailCode(_ctx, email, code) {
    const account = findByEmail(email);
    consumeCode(account, "verify", code);
    account!.emailVerified = true;
    return signIn(account!);
  },

  async login(_ctx, email, password) {
    const account = findByEmail(email);
    const passwordOk = verifyPassword(password, account?.passwordHash ?? DUMMY_HASH);
    if (!account || !passwordOk) throw new ApiError("Invalid credentials", "INVALID_CREDENTIALS", StatusCodes.UNAUTHORIZED);
    if (!account.emailVerified) {
      issueCode(account, "verify");
      throw new ApiError("Email not verified", "EMAIL_NOT_VERIFIED", StatusCodes.FORBIDDEN);
    }
    return signIn(account);
  },

  async requestPasswordReset(_ctx, email) {
    const account = findByEmail(email);
    if (account) issueCode(account, "reset");
  },

  async confirmPasswordReset(_ctx, email, code, password) {
    const account = findByEmail(email);
    consumeCode(account, "reset", code);
    account!.passwordHash = hashPassword(password);
    account!.emailVerified = true; // le code reçu par e-mail prouve aussi la possession de l'adresse
  },

  async getProfile(_ctx, session) {
    const a = accountOf(session);
    return { displayName: a.displayName, partnerType: a.partnerType, email: a.email, phoneNumber: a.phoneNumber };
  },

  async getApplication(_ctx, session) {
    return toApplication(accountOf(session));
  },

  async uploadDocument(_ctx, session, type, file: UploadedFile) {
    const account = accountOf(session);
    assertDocumentEditable(account, type);
    if (!REQUIRED_DOCUMENTS[account.partnerType].includes(type)) {
      throw new ApiError("Unexpected document type", "VALIDATION_ERROR", StatusCodes.BAD_REQUEST, { fieldErrors: { type: ["validation.required"] } });
    }
    const document: PartnerDocument = {
      id: randomUUID(),
      type,
      fileName: file.fileName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      status: "PENDING",
      rejectionReason: null,
      uploadedAt: new Date().toISOString(),
    };
    account.application.documents = [...account.application.documents.filter((d) => d.type !== type), document];
    return structuredClone(document);
  },

  async deleteDocument(_ctx, session, documentId) {
    const account = accountOf(session);
    const document = account.application.documents.find((d) => d.id === documentId);
    if (!document) return;
    assertDocumentEditable(account, document.type);
    account.application.documents = account.application.documents.filter((d) => d.id !== documentId);
  },

  async submitApplication(_ctx, session) {
    const account = accountOf(session);
    if (!isEditable(account.application.status)) throw locked();
    const missing = missingItems(account);
    if (missing.length) {
      throw new ApiError("Documents missing", "DOCUMENTS_MISSING", StatusCodes.UNPROCESSABLE_ENTITY, { details: missing });
    }
    const now = new Date();
    Object.assign(account.application, {
      status: "IN_REVIEW",
      submittedAt: now.toISOString(),
      reviewDueAt: addBusinessHours(now).toISOString(),
      decidedAt: null,
      rejectionReason: null,
    });
    return toApplication(account);
  },

  async simulateReview(_ctx, session, decision: ReviewDecision) {
    const account = accountOf(session);
    const app = account.application;
    if (app.status !== "IN_REVIEW") throw locked();
    const decidedAt = new Date().toISOString();

    if (decision === "approve") {
      app.documents = app.documents.map((d) => ({ ...d, status: "ACCEPTED", rejectionReason: null }));
      Object.assign(app, { status: "APPROVED", decidedAt });
    } else if (decision === "request_changes") {
      // La pièce d'identité est refusée, les autres acceptées (scénario le plus fréquent)
      app.documents = app.documents.map((d) =>
        d.type === "ID_CARD"
          ? { ...d, status: "REFUSED", rejectionReason: MOCK_REVIEW_REASONS.documentRefused }
          : { ...d, status: "ACCEPTED", rejectionReason: null },
      );
      Object.assign(app, { status: "CHANGES_REQUESTED", decidedAt });
    } else {
      Object.assign(app, { status: "REJECTED", decidedAt, rejectionReason: MOCK_REVIEW_REASONS.applicationRejected });
    }
    return toApplication(account);
  },
};

/** Toute méthode qui peut modifier un compte (y compris en échec : compteur d'essais) déclenche une sauvegarde. */
const READ_ONLY = new Set<PropertyKey>(["source", "getProfile", "getApplication"]);

export const mockPartnerGateway: PartnerGateway = new Proxy(implementation, {
  get(target, key, receiver) {
    const value: unknown = Reflect.get(target, key, receiver);
    if (typeof value !== "function" || READ_ONLY.has(key)) return value;
    return async (...args: unknown[]) => {
      try {
        return await (value as (...a: unknown[]) => Promise<unknown>).apply(target, args);
      } finally {
        persist();
      }
    };
  },
});

# STANDARDS.md — Mboa Partenaires (web)

**Version :** 1.0
**Base :** standards communs des projets (`sungaplus`, `sungaplusBackend`, `mboaDelivery`, `mboadeliveryBackend`), adaptés à Next.js 16 (App Router).
**Usage :** tout code écrit ou généré dans ce projet respecte ces règles. La sécurité est détaillée dans [SECURITY.md](SECURITY.md).

---

## 1. Arborescence (SOLID, par domaine)

```text
src/
├── api/                  # Client HTTP serveur de l'API Mboa Eat (« intercepteurs ») + liste blanche des routes
├── app/                  # Routes Next uniquement (fichiers minces : résolution de la langue → View)
│   └── [lang]/           # Toutes les pages sont préfixées par la langue (fr | en)
├── components/           # UI partagée (ui/ = primitives, layout/ = en-tête, pied de page, langue)
├── config/               # Configuration serveur validée par Zod (env.ts)
├── constants/            # Constantes et énumérations (villes, types, limites, routes, images)
├── hooks/                # Hooks globaux partagés
├── i18n/                 # i18next / react-i18next, translateError, useAppLanguage
├── locales/              # fr.json, en.json (source unique des textes)
├── modules/              # Domaines métier (le cœur)
│   └── {domaine}/
│       ├── components/   # Composants du module (UI pure)
│       ├── flows/        # Logique métier serveur (*.flow.ts)
│       ├── hooks/        # Logique client (use{Action}{Domaine}.ts)
│       ├── schemas/      # Schémas Zod partagés client / serveur
│       ├── services/     # Server Actions (*.actions.ts) : points d'entrée minces
│       ├── types/        # Types du module
│       └── views/        # Pages complètes du module
├── types/                # Types globaux (ActionResponse, RequestContext)
├── utils/                # ApiError, runAction, logger, rateLimiter, phone…
└── proxy.ts              # Langue + Content-Security-Policy à nonce
```

## 2. Flows serveur (Vertical Slice)

1. **Emplacement** : `src/modules/{module}/flows/{action}.flow.ts`.
2. **Signature** : `export const actionFlow = async (input: unknown, ctx: RequestContext): Promise<Result>` (fonction fléchée, pas de classe).
3. **Validation en première ligne** : `const data = parseInput(schema, input, ctx);`.
4. **Erreurs** : uniquement `throw new ApiError(message, CODE, status)` ou les helpers `ApiError.validation()`, `ApiError.tooManyRequests()`… Jamais de `catch` vide.
5. **Types** : inférés des schémas (`z.infer<typeof schema>`), jamais `any`.
6. **Appels amont** : via `mboaPost(MBOA_ENDPOINTS.x, payload, ctx)`, uniquement vers des routes de la liste blanche.
7. **Journalisation** : `logger.info|warn|error(événement, champs)`, avec des téléphones masqués et des IP pseudonymisées.

## 3. Server Actions (`services/*.actions.ts`)

- Fichier `"use server"`, **aucune logique**. Une action convertit le FormData et délègue : `return runAction(flow, formDataToObject(formData), locale)`.
- Réponse unifiée, identique à celle des backends :
  - succès : `{ success: true, data }`
  - échec : `{ success: false, error: { code, fieldErrors?, details?, retryAfterSec? } }`
- Elle ne renvoie que ce dont l'interface a besoin (jamais de jeton, d'objet amont brut ni de trace).

## 4. Front (Client Components)

1. **Les composants n'affichent que l'UI.** La logique, les appels et les transformations sont dans des hooks `use{Action}{Domaine}.ts` (ex. `useRegisterMerchant.ts`, `useVerifyRegistrationOtp.ts`).
2. **Validation** : le même schéma Zod côté navigateur (retour immédiat) et côté serveur (source de vérité).
3. **Erreurs** : traduites via `getTranslatedErrorMessage(t, failure)` (`api_errors.<CODE>`) et `translateFieldError(t, keys)` (`validation.*`).
4. **Server Components** par défaut. `"use client"` uniquement pour ce qui est interactif.

## 5. Internationalisation

1. **Aucun texte en dur** : tout passe par `t("…")`. Côté serveur, `getT(lang)` ; côté client, `useTranslation()`.
2. Les clés de `fr.json` et `en.json` sont **identiques** (vérifié en test).
3. Chaque code d'`ApiError` a sa clé `api_errors.<CODE>` dans les deux langues. Les messages Zod sont des clés `validation.*`.
4. La langue vient de l'URL (`/fr`, `/en`). Le choix est persisté dans le cookie `app_language` (équivalent de l'AsyncStorage du mobile) et géré par `useAppLanguage()`.

## 6. Règles générales

- TypeScript strict, **pas de `any`**, exports nommés (sauf fichiers imposés par Next : `page`, `layout`, `error`, `not-found`).
- Style fonctionnel ; JSDoc sur la logique non évidente.
- **Ordre des imports** : bibliothèques externes → absolus `#/…` → relatifs.
- Avant chaque livraison : `npm run check` (types, lint, audit des dépendances de production).

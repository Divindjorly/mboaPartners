# SECURITY.md — Mboa Partenaires

Référentiel : **OWASP Top 10:2025** (avec renvois à OWASP ASVS 5 et NIST SP 800-63B pour l'authentification).
Périmètre : site d'inscription des restaurants et des entreprises de livraison, avec un espace partenaire connecté (dépôt du dossier). Il n'a pas de base de données : toutes les écritures passent par l'API Mboa Eat, appelée côté serveur (ou, en mode démo, par une implémentation simulée en mémoire).

## Correspondance OWASP Top 10:2025

| # | Catégorie | Mesures dans ce projet | Fichiers |
|---|---|---|---|
| A01 | Broken Access Control | Espace partenaire protégé **côté serveur** : la page et chaque action relisent la session chiffrée (`requirePartnerSession`), jamais un état client. Server Actions protégées par le contrôle d'origine CSRF de Next ; la route d'envoi de fichiers vérifie elle-même l'en-tête `Origin` (403 sinon). Règles de verrouillage du dossier appliquées par la couche de données (pièces non modifiables pendant l'analyse). Liste blanche des routes amont (anti-SSRF). | `modules/space/flows/`, `app/api/partenaire/documents/route.ts`, `api/endpoints.ts` |
| A02 | Security Misconfiguration | En-têtes HSTS, `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` (géolocalisation limitée au site), COOP/CORP. `X-Powered-By` et source maps navigateur désactivés. Configuration validée au démarrage, sinon l'application ne démarre pas. | `next.config.ts`, `config/env.ts` |
| A03 | Software Supply Chain Failures | Versions figées (`package.json` + `package-lock.json`, `save-exact`), `engine-strict`. `npm run audit:prod` dans `npm run check`. Aucun script ni CDN tiers chargé par les pages. | `package.json`, `.npmrc` |
| A04 | Cryptographic Failures | HTTPS imposé vers l'API en production, HSTS. Session dans un cookie **chiffré et authentifié (AES-256-GCM)**, `HttpOnly`, `SameSite=Lax`, `Secure` + préfixe `__Host-` en production, expiration vérifiée côté serveur ; `SESSION_SECRET` obligatoire en production. Le jeton d'accès API ne quitte jamais le serveur. Mots de passe jamais stockés ni journalisés. | `utils/session.ts`, `config/env.ts` |
| A05 | Injection | Validation Zod côté serveur sur chaque entrée (formulaires, livreurs, liste JSON bornée). Fichiers : **type réel contrôlé par signature** (PDF, JPEG, PNG), nom d'affichage assaini, jamais utilisé comme chemin. Fichier Excel lu dans le navigateur, puis revalidé. React échappe le rendu ; aucun `dangerouslySetInnerHTML`. **CSP stricte avec nonce par requête** + `strict-dynamic`, `object-src 'none'`, `frame-ancestors 'none'`. | `modules/*/schemas/`, `utils/fileSignature.ts`, `proxy.ts` |
| A06 | Insecure Design | Limitation de débit par IP, e-mail, numéro et compte (inscription, code, connexion, réinitialisation, écritures du dossier, envois de fichiers). Champ piège anti-robot. Corps des Server Actions limité à 256 Ko ; envoi de fichiers limité à 10 Mo (`Content-Length` exigé, route exclue du proxy pour éviter la mise en tampon). Réponses identiques que le compte existe ou non (renvoi de code, mot de passe oublié). | `constants/security.ts`, `utils/rateLimiter.ts`, `app/api/partenaire/documents/route.ts` |
| A07 | Authentication Failures | Mot de passe d'au moins 12 caractères, liste noire, sans le numéro (ASVS 5 / NIST 800-63B). Connexion par e-mail + mot de passe avec message unique en cas d'échec ; e-mail vérifié par code à 6 chiffres (15 min, 5 essais, haché). Session de 7 jours, déconnexion qui efface le cookie. | `modules/auth/`, `utils/session.ts` |
| A08 | Software or Data Integrity Failures | Server Actions chiffrées par Next (identifiants et fermetures). Les données envoyées à l'API sont reconstruites champ par champ à partir des valeurs validées : aucun objet client n'est relayé tel quel. Redirections amont refusées (`redirect: "error"`). | `flows/*.flow.ts`, `api/mboaClient.ts` |
| A09 | Logging & Alerting Failures | Journal JSON structuré avec `requestId`. Événements : connexions réussies et échouées, codes, réinitialisations, dépôts et refus de fichiers, soumissions, CSRF bloqué, session invalide, limitation atteinte. E-mails et téléphones masqués, IP pseudonymisées, champs sensibles caviardés. | `utils/logger.ts` |
| A10 | Mishandling of Exceptional Conditions | `runAction` transforme toute exception inattendue en `INTERNAL_ERROR` générique et la journalise : traitement « fermé », sans trace côté client. Les erreurs 5xx de l'API ne sont jamais relayées en détail. Délai maximal sur chaque appel amont. Pages `error.tsx`, `global-error.tsx` et `not-found.tsx` sans détail technique. | `utils/runAction.ts`, `api/mboaClient.ts`, `app/` |

## Risques résiduels connus

1. **Limitation de débit en mémoire** : elle n'est valable que pour une seule instance. Au-delà, il faut la remplacer par un stockage partagé (Redis), car un redémarrage remet les compteurs à zéro.
2. **`style-src-attr 'unsafe-inline'`** : nécessaire aux attributs `style` posés par `next/image`. C'est un risque faible (aucune exécution de script possible), qui disparaîtra si `next/image` est remplacé.
3. **Énumération de comptes** : l'API renvoie 409 si le numéro existe déjà. Le message affiché reste neutre, mais un attaquant patient peut déduire l'existence d'un compte. La limitation par IP et par numéro freine ce sondage.
4. **Dépendances de développement** : `npm audit` signale `minimatch` (DoS, sévérité modérée) via ESLint. `exceljs` a été écarté pour la même raison : le modèle Excel est généré avec `fflate`. Il n'est pas livré en production, et aucun correctif non cassant n'est disponible à ce jour.
5. **Dépendance à l'API amont** : elle accepte des numéros invalides. Le site compense par sa propre validation, mais l'API doit corriger ce point de son côté.
6. **Mode démo** : `PARTNER_DATA_SOURCE=mock` affiche un code fixe et des comptes de test. Il ne doit **jamais** être actif sur le site public : passer à `api` dès que les endpoints existent.
7. **Fichiers non analysés par antivirus** : seuls la taille et le type réel sont contrôlés. L'API devra analyser les fichiers et les stocker dans un bucket privé (cf. spec).
8. **Pas de CAPTCHA** : le champ piège et la limitation de débit arrêtent les robots simples. Il faudra ajouter un CAPTCHA respectueux de la vie privée si des abus apparaissent dans les journaux.

## Exploitation

- Variables de production : voir `.env.example` (`TRUSTED_PROXY_HOPS` à régler selon l'infrastructure ; une valeur fausse fausse la limitation par IP).
- Avant chaque mise en production : `npm run check`.
- Signaler une vulnérabilité à l'équipe technique Mboa, sans la divulguer publiquement.

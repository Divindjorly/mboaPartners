# Mboa Partenaires

Landing page d'inscription des **restaurants / commerces** et des **entreprises de livraison** sur Mboa (République du Congo, +242).

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Zod 4 · i18next. Pas de base de données : les inscriptions passent par l'API Mboa Eat, appelée **uniquement côté serveur** (Server Actions).

## Démarrer

```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run check      # types + lint + audit des dépendances de production
```

## Parcours

Spécification complète (statuts, endpoints, règles) : [docs/specs/parcours-inscription-partenaires.md](docs/specs/parcours-inscription-partenaires.md).

| Page | Rôle |
|---|---|
| `/fr`, `/en` | Landing (`/` redirige selon le cookie `app_language`, puis la langue du navigateur) |
| `/{lang}/inscription/restaurant` · `/livraison` | Formulaire → code à 6 chiffres reçu par **e-mail** → session ouverte → espace |
| `/{lang}/connexion` | Connexion e-mail + mot de passe (compte non vérifié → saisie du code) |
| `/{lang}/mot-de-passe-oublie` | Code par e-mail + nouveau mot de passe |
| `/{lang}/espace` | **Mon dossier** (protégé) : pièces à déposer, soumission en une fois, suivi de l'analyse (48 h hors week-end), décision. Les livreurs d'une entreprise s'ajoutent dans le **panel flotte** (projet séparé), après l'approbation |
| `POST /api/partenaire/documents` | Envoi d'une pièce (multipart, 10 Mo max, type réel contrôlé) |

Statuts du dossier : `DRAFT` → `IN_REVIEW` → `APPROVED`, ou `CHANGES_REQUESTED` (retour au dépôt des pièces refusées), ou `REJECTED` (définitif).

### Données simulées (mode démo)

Tant que les endpoints de la spec n'existent pas, `PARTNER_DATA_SOURCE=mock` (valeur par défaut) branche le parcours sur une implémentation simulée (`src/api/partner/mock/`), qui applique les mêmes règles que la future API. Les comptes sont sauvegardés dans `.mock-data/partner-accounts.json` (ignoré par git) et survivent aux redémarrages ; supprimez ce dossier pour repartir des comptes de démonstration. Les fichiers déposés ne sont pas conservés, seulement leurs informations.

- Code reçu « par e-mail » : toujours **123456** (aucun e-mail n'est envoyé).
- Comptes déjà vérifiés : `demo.restaurant@mboa.cg` et `demo.flotte@mboa.cg`, mot de passe `Demo-Mboa-2026`.
- Dans l'espace, un encadré « Simulation de l'analyse » permet d'approuver, de demander une correction ou de refuser le dossier.
- Ces informations s'affichent à l'écran en mode démo uniquement.

Passer à l'API réelle : `PARTNER_DATA_SOURCE=api`. Les inscriptions y sont déjà branchées ; les autres méthodes de `src/api/partner/livePartnerGateway.ts` répondent « service pas encore disponible » jusqu'à ce qu'elles soient reliées aux endpoints de la spec.

## Architecture et sécurité

- **Architecture** : voir [STANDARDS.md](STANDARDS.md). Domaines dans `src/modules/{domaine}/` (flows, schemas, services, hooks, components, views), réponse unifiée `{ success, data | error }`, `ApiError` + codes traduits.
- **Sécurité** : voir [SECURITY.md](SECURITY.md), avec la correspondance OWASP Top 10:2025 et les risques résiduels.
- **Traductions** : `src/locales/fr.json` et `src/locales/en.json`.

## Images

Les photos se déclarent dans [`src/constants/images.ts`](src/constants/images.ts). Déposez le fichier dans `src/assets/` (nom sans espace ni accent), importez-le dans ce fichier, puis renseignez `src`. Next l'optimise et ajoute un flou de chargement. Le texte alternatif se traduit sous `images.<clé>` dans les fichiers de langue. Tant que `src` vaut `null`, un visuel aux couleurs Mboa s'affiche.

| Emplacement | Où | Format conseillé |
|---|---|---|
| `restaurant` | Chapitre 01 de l'accueil + page d'inscription restaurant | ≥ 1800 px de large, paysage (fourni : cheffe) |
| `fleet` | Chapitre 02 de l'accueil + page d'inscription livraison | ≥ 1800 px de large, paysage : livreur / motos en ville |

Identité visuelle : couleurs Mboa (jaune du logo en page de garde façon Glovo, vert Mboa pour l'action), une seule famille de police (Barlow pour le texte, Barlow Condensed en capitales pour les titres et boutons), boutons pilule façon Yango (`src/components/ui/Button.tsx`), coins arrondis partout.

## Points ouverts (API Mboa Eat)

- **Endpoints du parcours** (vérification par e-mail, connexion par e-mail, dossier, pièces, livreurs, analyse) : à créer selon la spec ; le site tourne en mode démo d'ici là.
- **`businessType`** : les valeurs envoyées (`restaurant`, `fast_food`, `bakery`, `grocery`, `caterer`) sont à confirmer avec l'API.
- **Adresses après approbation** : `MERCHANT_PLATFORM_URL` et `FLEET_PANEL_URL` valent des adresses provisoires.
- **Numéros** : l'API accepte n'importe quelle chaîne (`"abc"`) ; seul le site valide le format congolais.

## Responsive (obligatoire pour toute modification)

Le site doit fonctionner de 320 px (petits Android) à 1440 px et plus. Règles :

- Concevoir mobile d'abord ; points de rupture Tailwind `sm` 640, `lg` 1024 (menu burger sous 1024 px).
- Aucun texte de bouton en `whitespace-nowrap` sauf s'il est court et garanti de tenir ; les boutons ont une hauteur minimale et peuvent passer à la ligne.
- Un enfant de grille / flex qui contient du texte long ou un formulaire reçoit `min-w-0` (et `fieldset` aussi).
- Ne jamais combiner `hidden` avec un composant qui pose sa propre classe d'affichage (`inline-flex`…) : envelopper dans un `div hidden sm:block`.
- Cibles tactiles ≥ 44 px ; contenu utile (formulaire, boutons d'action) visible tôt sur mobile.
- Avant de livrer : `npm run build && npm start`, puis `npm run audit:responsive` (doit afficher « Aucun débordement horizontal »). Pour des captures : `SLICE=1200 node scripts/responsive-audit.mjs <dossier> fr 390,768,1024 1`.

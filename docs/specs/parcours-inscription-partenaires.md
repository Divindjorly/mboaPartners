# Parcours d'inscription des partenaires — spécification API

> Statut : **proposition à valider** (3 novembre 2026).
> Concerne : marchands (restaurants et commerces) et entreprises de livraison.
> Côté client : le site partenaires (`mboaPartners`) ; côté serveur : l'API Mboa Eat.

## 1. Parcours

```
1 Demande ─▶ 2 E-mail vérifié ─▶ 3 Dossier ─▶ 4 Analyse ─▶ 5 Décision ─▶ 6 Activation
  (site)       (code par e-mail)  (espace)     (≤ 48 h ouvrées) ✓ approuvé    plateforme marchand
                                                 ▲              ↺ à corriger   ou panel flotte
                                                 └──────────────┘ ✗ refusé (définitif)
```

| # | Étape | Partenaire | Équipe Mboa |
|---|---|---|---|
| 1 | Demande | Remplit le formulaire (e-mail **obligatoire**) | — |
| 2 | Vérification | Saisit le code à 6 chiffres reçu par e-mail ; le compte est actif et il est connecté | — |
| 3 | Dossier | Dépose tous les documents, puis soumet **en une seule fois** | — |
| 4 | Analyse | Attend ; réponse au plus tard 48 h ouvrées après la soumission | Contrôle chaque document |
| 5 | Décision | Corrige les éléments refusés et soumet à nouveau, ou accède à son outil | Accepte / refuse chaque document, puis décide |
| 6 | Activation | Marchand → plateforme marchand ; entreprise → panel flotte | — |

La commission est **identique pour tous les partenaires** : aucune acceptation en ligne.

## 2. Statuts du dossier

| Statut | Signification | Le partenaire peut… |
|---|---|---|
| `DRAFT` | Compte vérifié, dossier non soumis | déposer, remplacer, supprimer des documents ; soumettre |
| `IN_REVIEW` | Soumis, en cours d'analyse | consulter uniquement |
| `CHANGES_REQUESTED` | Au moins un élément refusé | remplacer les éléments refusés ; soumettre à nouveau |
| `APPROVED` | Partenaire validé | accéder à la plateforme marchand / au panel flotte (où l'entreprise ajoute ses livreurs) |
| `REJECTED` | Refus définitif (fraude, activité non éligible…) | consulter le motif ; contacter Mboa |

Transitions autorisées :

```
DRAFT ─submit─▶ IN_REVIEW ─approve─▶ APPROVED
                   │ ├─reject──▶ REJECTED
                   │ └─request changes (≥ 1 élément REFUSED)─▶ CHANGES_REQUESTED ─submit─▶ IN_REVIEW
```

**Délai affiché (`reviewDueAt`)** : `submittedAt` + 48 h en ne comptant pas le samedi ni le dimanche.
Exemple : soumis le vendredi à 15 h → réponse au plus tard le mardi à 15 h. Recalculé à chaque nouvelle soumission.

## 3. Vérification de l'identité par e-mail

Remplace le code WhatsApp/SMS **pour les comptes partenaires** (marchand, entreprise de livraison). Le téléphone reste obligatoire comme contact (appels du conseiller, notifications WhatsApp), mais n'est plus vérifié à l'inscription ni utilisé pour se connecter.

| Méthode | Route | Corps | Réponse |
|---|---|---|---|
| `POST` | `/v1/auth/signup/merchant` · `/v1/auth/signup/delivery-company` | inchangé, mais **tous les téléphones et e-mails sont requis** : marchand `phoneNumber`, `email`, `managerPhone` ; entreprise `contactPhone`, `contactEmail`, `managerPhone`, `managerEmail` | `201` + envoi automatique du code par e-mail |
| `POST` | `/v1/auth/email/verification/request` | `{ email }` | `202` toujours (ne révèle pas si le compte existe) |
| `POST` | `/v1/auth/email/verification/confirm` | `{ email, code }` | `200 { accessToken, refreshToken, user }` |
| `POST` | `/v1/auth/login` | **ajouter** la connexion `{ email, password }` — c'est la **seule** méthode de connexion des comptes partenaires (pas de connexion par téléphone ni par code) | inchangé |
| `POST` | `/v1/auth/password/reset-request` · `reset-confirm` | **ajouter** la variante par `email` | inchangé |

Règles du code :

- 6 chiffres, valable 15 minutes, 5 essais au plus, puis code invalidé ;
- nouvel envoi possible après 60 s, 5 envois par heure au plus ;
- stocké haché, comme le code SMS actuel ;
- l'e-mail contient le code **et** un lien `https://partenaires.mboaeat.tech/fr/verifier-email?token=…` (jeton à usage unique, 15 min) pour ceux qui ouvrent l'e-mail sur un autre appareil ;
- erreurs : `400 OTP_INVALID`, `410 OTP_EXPIRED`, `429 RATE_LIMITED` (avec `Retry-After`) ;
- un compte partenaire non vérifié ne peut pas se connecter : `403 EMAIL_NOT_VERIFIED`.

## 4. Dossier marchand

Documents, tous obligatoires :

| `type` | Libellé |
|---|---|
| `RCCM` | Registre du commerce |
| `NIU` | Numéro d'identification unique |
| `ID_CARD` | CNI du gérant |
| `LOCATION_PLAN` | Plan de localisation ou photo de la façade |
| `BUSINESS_LICENSE` | Licence d'exploitation |

La carte menu n'est **pas** un document du dossier : elle se crée dans la plateforme marchand après l'approbation.

| Méthode | Route | Corps | Réponse |
|---|---|---|---|
| `POST` | `/v1/users/me/merchant/documents` | `multipart/form-data` : `file`, `type`, `documentNumber?` | `201 Document` — remplace le document du même type |
| `DELETE` | `/v1/users/me/merchant/documents/{id}` | — | `204` |
| `GET` | `/v1/users/me/merchant/application` | — | `200 Application` |
| `POST` | `/v1/users/me/merchant/application/submit` | — | `200 Application` |

Le `POST` JSON actuel (avec `documentUrl`) peut rester pour la rétrocompatibilité ; le site n'utilisera que la variante multipart.

## 5. Dossier entreprise de livraison

Documents, tous obligatoires : `RCCM`, `NIU`, `ID_CARD` (CNI du responsable), `VEHICLE_INSURANCE` (attestation d'assurance des véhicules).

| Méthode | Route | Corps | Réponse |
|---|---|---|---|
| `POST` | `/v1/fleet/documents` | `multipart/form-data` : `file`, `type`, `documentNumber?` | `201 Document` |
| `DELETE` | `/v1/fleet/documents/{id}` | — | `204` |
| `GET` | `/v1/fleet/application` | — | `200 Application` |
| `POST` | `/v1/fleet/application/submit` | — | `200 Application` |

### Livreurs — dans le panel flotte, après validation

Les livreurs **ne s'ajoutent pas sur le site partenaires** : ils se gèrent dans le **panel flotte** (projet à venir), accessible une fois le dossier `APPROVED`. Le site renvoie vers ce panel depuis l'écran « Approuvé ».

Règles décidées pour le panel (à reprendre dans sa propre spécification) :

- aucun livreur tant que l'entreprise n'est pas `APPROVED` (`403 ACCOUNT_NOT_APPROVED`) ;
- ajout un par un **ou** import d'un modèle Excel fourni par Mboa, avec aperçu des erreurs ligne par ligne avant l'ajout ;
- colonnes = champs de l'inscription dans l'app livreur : Prénom, Nom, Téléphone, E-mail (requis) ; Date de naissance, Genre (facultatifs) ; Type de véhicule, Marque, Couleur (requis) ; Modèle et Plaque d'immatriculation (requis sauf vélo) ;
- téléphone et e-mail uniques ; 500 livreurs au plus par import ;
- chaque livreur reçoit une invitation (`/v1/fleet/invitations`) pour terminer son inscription dans l'app, où il dépose lui-même ses documents et sa photo.

## 6. Objets renvoyés

```jsonc
// Application
{
  "partnerType": "MERCHANT",            // ou "DELIVERY_COMPANY"
  "status": "CHANGES_REQUESTED",
  "submittedAt": "2026-11-07T15:00:00Z", // null tant que DRAFT
  "reviewDueAt": "2026-11-11T15:00:00Z", // null tant que DRAFT
  "decidedAt": null,
  "rejectionReason": null,               // rempli si REJECTED
  "requiredDocuments": ["RCCM", "NIU", "ID_CARD", "LOCATION_PLAN", "BUSINESS_LICENSE"],
  "documents": [Document],
  "canSubmit": true                      // tous les éléments requis sont présents et le statut le permet
}

// Document
{
  "id": "uuid",
  "type": "ID_CARD",
  "fileName": "cni-gerant.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 812345,
  "documentNumber": null,
  "status": "REFUSED",                   // PENDING | ACCEPTED | REFUSED
  "rejectionReason": "Photo floue, numéro illisible",
  "uploadedAt": "2026-11-07T14:52:00Z"
}
```

`/v1/auth/me` doit renvoyer `partnerType` et `application.status`, pour que le site oriente l'utilisateur dès la connexion.

## 7. Côté équipe Mboa (admin)

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/v1/admin/applications?status=IN_REVIEW&partnerType=` | File d'analyse, triée par `reviewDueAt` croissant |
| `GET` | `/v1/admin/applications/{id}` | Détail, avec un lien signé (5 min) par document |
| `POST` | `/v1/admin/applications/{id}/documents/{docId}/review` | `{ status: "ACCEPTED" \| "REFUSED", reason? }` (`reason` requis si `REFUSED`) |
| `POST` | `/v1/admin/applications/{id}/decision` | `{ decision: "APPROVE" \| "REQUEST_CHANGES" \| "REJECT", reason? }` |

Règles : `APPROVE` exige que tous les documents soient `ACCEPTED` ; `REQUEST_CHANGES` exige au moins un document `REFUSED` ; `REJECT` exige un motif. Chaque action est journalisée dans les audit logs existants.

## 8. Fichiers et sécurité

- Types acceptés : PDF, JPEG, PNG ; 10 Mo au plus. Vérification du **type réel** (signature du fichier), pas seulement de l'extension ou du `Content-Type`.
- Stockage dans un bucket **privé** ; jamais d'URL publique. Nom de fichier régénéré côté serveur ; nom d'origine conservé uniquement pour l'affichage.
- Accès limité au propriétaire du dossier et aux rôles admin ; liens signés de courte durée.
- Dépôt, suppression et soumission refusés hors des statuts `DRAFT` et `CHANGES_REQUESTED` (`409 APPLICATION_LOCKED`).
- `submit` incomplet : `422 DOCUMENTS_MISSING` avec la liste des éléments manquants.
- Erreurs au format habituel de l'API : `{ statusCode, error, message, details[], traceId }`.

## 9. Notifications

| Événement | Canal | Contenu |
|---|---|---|
| Inscription | E-mail | Code de vérification (+ lien) |
| Dossier soumis | E-mail + WhatsApp | Accusé de réception, date limite de réponse |
| À corriger | E-mail + WhatsApp | Éléments refusés et motifs, lien vers « Mon dossier » |
| Approuvé | E-mail + WhatsApp | Bienvenue, lien vers la plateforme marchand ou le panel flotte |
| Refusé | E-mail | Motif, contact |

## 10. Décisions prises et points ouverts

Décidé :

- vérification de l'identité par **e-mail** ; connexion par **e-mail + mot de passe** uniquement ;
- délai d'analyse : **48 h hors samedi et dimanche** (les jours fériés comptent) ;
- livreurs : ajoutés **dans le panel flotte**, seulement après l'approbation de l'entreprise (saisie ou import Excel, colonnes alignées sur l'app livreur) ;
- commission identique pour tous : pas d'acceptation en ligne ;
- statut de refus définitif `REJECTED` en plus de `CHANGES_REQUESTED`.

Encore ouvert :

1. Adresses de la plateforme marchand et du panel flotte (boutons de l'écran « Approuvé »).

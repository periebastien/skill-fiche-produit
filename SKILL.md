---
name: fiche-produit
description: Créer une fiche produit en brouillon sur la boutique Plaine Altitude (WooCommerce) à partir de la page web ou du PDF d'un fabricant de parapente (voile, sellette, secours, casque, sac, électronique, accessoire), en posant à l'utilisateur les questions de vente (photos, prix, disponibilité, ancien modèle) avant l'envoi. Utiliser dès qu'on donne un lien de fabricant, un PDF de produit, ou qu'on demande de « créer la fiche », « ajouter le produit », « faire la fiche de la … ».
---

# Créer une fiche produit Plaine Altitude

Tu aides l'équipe de Plaine Altitude (Timothée le plus souvent, parfois Hervé) à créer une fiche produit. Tu lis la source du
fabricant, tu **poses les questions que seule la boutique peut trancher**, tu rédiges dans la voix de la boutique, et le serveur crée
un **brouillon** : tu ne publies jamais. Le but : un brouillon aussi complet que possible, qu'il ne reste qu'à relire et publier.

Lis d'abord `persona-herve.md` (qui parle, comment) et `guide-redaction.md` (règles de rédaction et de structure).

Parle en français, simplement, sans jargon technique. Ne montre jamais de JSON brut : résume, et montre des tableaux courts.
**Pose les questions avec l'outil de questions (AskUserQuestion) dès que les réponses sont des choix** (une à quatre questions à la
fois, ta recommandation en premier) ; en texte libre pour les numéros de photos et les prix. Une étape à la fois : n'enchaîne pas
toutes les questions d'un coup, et ne passe pas à l'étape suivante sans réponse.

Tous les appels passent par `client.mjs`, dans le dossier de cette skill (`node "<dossier de la skill>/client.mjs" …`). Travaille dans
un dossier par produit (`Documents/fiches/<marque>-<modele>/`) : `fiche.json`, `photos.txt`, le référentiel et les rapports y restent.

## Déroulé

### 1. Source et famille
Une adresse de page, un PDF (chemin sur le poste), ou les deux. Famille : parapente, sellette, secours, casque, sac, electronique,
accessoire (demande-la si elle n'est pas évidente). Packs et bons cadeaux : refuser, ils se font à la main.
Première fois de la séance : `node client.mjs verifier` (échec : voir `INSTALLATION.md`).

### 2. Existant : doublon et anciens modèles
`node client.mjs doublons "<marque>" "<modele>" <famille>`.
- **exact** : le produit existe déjà (même en brouillon). Arrête-toi, donne son nom et son lien d'édition, demande si c'est vraiment
  un autre produit (autre millésime, autre version). Mettre à jour une fiche existante n'est pas prévu.
- **precedent** : générations précédentes du même modèle (la Cure 2 et la Cure 3 pour une Cure 4). Note-les pour l'étape 7.
- **proche** : signale-le en une ligne (accessoire du modèle, version voisine) et continue.

### 3. Référentiel et lecture de la source
`node client.mjs referentiel <famille>`, puis lis le fichier : catégories, marques, tailles, coloris existants (nom, couleur),
homologations, pratiques, lignes, critères des sellettes, caractéristiques de la grille, et **deux fiches modèles** de la même famille
(imite leur structure et leur niveau de détail).
- Page web : lis-la (WebFetch) et ses pages liées utiles (caractéristiques, coloris, téléchargements). Pour les adresses exactes des
  photos, vidéos et PDF, télécharge le HTML brut (`curl -sL "<adresse>"`) : `src`, `srcset`, `data-src`, liens `.pdf`, liens YouTube
  ou Vimeo. Prends toujours la plus grande version de chaque photo.
- PDF : lis-le (outil Read, par pages). Ses photos ne s'extraient pas : prends-les sur le site du fabricant, ou demande les fichiers.
- Note ce que la source ne dit pas : tu le diras, tu ne l'inventes pas.
- Prix public du fabricant en euros, s'il est affiché : note-le, il servira de proposition à l'étape 6.

### 4. Ce qu'est le produit (questions groupées)
Résume en quelques lignes ce que tu as compris, puis confirme par l'outil de questions :
- **catégories** : ta proposition (sous-catégories du référentiel, en t'appuyant sur les fiches modèles) et une ou deux variantes ;
- **tailles** vendues (toutes celles du fabricant, ou seulement certaines ?) ;
- **coloris** : rapproche chaque coloris du fabricant d'un coloris existant de la boutique (« LOU » -> « Bleu ») ; montre la
  correspondance et fais-la valider ; un coloris personnalisé (sur mesure) n'est pas décliné, sauf demande ;
- **état** : neuve, en général ; démo ou occasion se font plutôt à la main.

### 5. Photos : lesquelles et dans quel ordre
1. Écris `photos.txt` : une photo par ligne, adresse de la **plus grande version**, puis une note courte (« coloris Bleu »,
   « en vol », « détail élévateurs »).
2. `node client.mjs planche photos.txt "<produit> : photos trouvées"` : la page numérotée s'ouvre dans le navigateur, avec la taille
   de chaque photo (les petites sont signalées).
3. Propose une sélection : l'image principale (le produit entier, de préférence sur fond blanc, grande), une photo par coloris,
   puis les plus parlantes ; une à trois photos pour la description (détails qui illustrent une section), sans doublon de vue.
   Pas besoin de tout prendre : dix à vingt photos suffisent.
4. Demande à l'utilisateur, en texte libre : « Quelles photos, dans quel ordre ? (ex. 3, 1, 7, 12) », et lesquelles vont dans la
   description. Signale les photos petites ou floues.

### 6. Vente : disponibilité, prix, réglages
Par l'outil de questions, puis en texte libre pour les montants :
- **Disponibilité** : « En stock en boutique » (quelles tailles et coloris, combien ?), « Sur commande » (délai à afficher, ex. « Sur
  commande, environ 3 semaines » ; le reprendre tel que l'utilisateur le dit), « Bientôt disponible » (date d'arrivée prévue), ou
  « Pas de commande pour l'instant ». Commande possible quand le stock est vide : oui par défaut.
- **Prix TTC par taille** : le coloris ne change pas le prix. Montre le tableau des tailles et demande les prix en une réponse
  (« XS 5290, S 5290, MS 5390… » ou « tout à 4590 »). Propose le prix public du fabricant s'il est connu. Relis-les en tableau avant
  de continuer.
- **Réglages** (une question à choix multiples) : « Tarif public conseillé » affiché (oui en général), bouton « Demander mon devis »
  (oui en général), et pour une voile, une sellette, un secours ou un casque : **remise si le produit est vendu dans un pack**
  (en %, 0 par défaut).
- Le poids de chaque taille vient de la grille technique (le port se calcule au poids) : rien à demander, sauf si la source ne le
  donne pas (signale-le).

### 7. Ancien modèle
S'il y a des **precedent** (étape 2) : présente-les (nom, en vente ou non, en stock ou non, nouveau modèle déjà indiqué) et demande :
- « Cette fiche remplace-t-elle ces modèles ? » : le lien « Un nouveau modèle existe » sera posé sur leurs fiches **à la publication**
  de la nouvelle (pas avant : le brouillon est invisible) ;
- pour chacun : encore en vente (il reste du stock, laisser vendre) ou « plus en vente » (case « Ancien modèle » : ni panier ni devis).
Recommande « encore en vente » si le produit a du stock, « plus en vente » sinon.

### 8. Contenus complémentaires
Propose, en une question à choix multiples : vidéos trouvées (YouTube, Vimeo), documents PDF (manuel, certificat), FAQ, « Livré avec »,
année de sortie (badge « Nouveauté »). Demande s'il y a un **essai** ou une expérience de la boutique sur ce produit (vol, stage,
élèves, portique) : si oui, quelques mots de l'utilisateur, que tu intègres à la description, en « nous ».

### 9. Rédaction et aperçu
Rédige `fiche.json` (format ci-dessous) selon `persona-herve.md` et `guide-redaction.md`. Puis
`node client.mjs apercu fiche.json` : l'aperçu complet s'ouvre (vente, photos dans l'ordre, description avec ses images, grille,
référencement). Demande à l'utilisateur de le relire et de dire ce qu'il veut changer ; corrige et régénère l'aperçu jusqu'à son accord.

### 10. Essai puis envoi
- `node client.mjs envoyer fiche.json --essai` : le serveur contrôle tout sans rien créer.
  - `erreurs` : corrige et recommence.
  - `nouveaux` (marque, taille ou coloris inconnus) : vérifie qu'ils n'existent pas sous un autre nom dans le référentiel ; ceux qui
    restent, fais-les valider.
  - `avertissements` : dis-les (photos petites, prix manquants, délai vide…).
  - `vente` et `remplace` du rapport : montre le tableau final (taille, prix, poids) et les anciens modèles reliés, pour un dernier oui.
- `node client.mjs envoyer fiche.json` (avec `--confirmer-nouveaux` et `--forcer-doublon` seulement après accord explicite).
  Les photos partent une par une ; après une erreur, corrige et relance : celles déjà reçues ne repartent pas.

### 11. Fin
Donne le lien d'édition et ce qui reste à faire dans l'administration : relire, faire écrire « L'avis d'Hervé » par Hervé, publier.
Rappelle que les liens « Nouveau modèle » sur les anciennes fiches se poseront à la publication.

## Format de `fiche.json`

```json
{
  "source": "https://www.exemple.com/produit",
  "nom": "Parapente OZONE - Zeno 2",
  "modele": "Zeno 2",
  "marque": "Ozone",
  "famille": "parapente",
  "categories": [654],
  "resume": "<h2>Accroche</h2>\n<p>Deux ou trois phrases.</p>",
  "description": "<h2>Présentation …</h2>\n<h3>Première section</h3>\n{{image:6}}\n<p>…</p>\n<ul><li><strong>Point :</strong> …</li></ul>",
  "meta_titre": "Parapente Ozone Zeno 2 : voile EN D deux lignes",
  "meta_description": "150 caractères environ.",
  "famille_affichee": "",
  "annee_sortie": 2026,
  "livre_avec": [{ "element": "Sac de pliage", "detail": "" }],
  "faq": [{ "question": "…", "reponse": "…" }],
  "videos": [{ "lien": "https://www.youtube.com/watch?v=…", "titre": "Présentation par Ozone" }],
  "documents": [{ "url": "https://…/manuel.pdf", "titre": "Manuel d'utilisation" }],
  "criteres": { "homologation": ["d"], "pratiques": ["cross", "competition"], "lignes": ["2"],
                "protection": [], "container": [], "homologation_sellette": [] },
  "declinaisons": { "tailles": ["XS", "S", "MS"], "coloris": [{ "nom": "Bleu" }, { "nom": "Bleu lagon", "couleur": "#1d8fb3" }], "etats": ["neuve"] },
  "vente": {
    "disponibilite": "commande",
    "delai": "Sur commande, environ 3 semaines",
    "date_arrivee": "",
    "commande_sans_stock": true,
    "prix_par_taille": { "XS": 5290, "S": 5290, "MS": 5390 },
    "stock": [{ "taille": "MS", "coloris": "Bleu", "quantite": 1 }],
    "tarif_conseille": true,
    "demande_devis": true,
    "remise_pack": 0
  },
  "remplace": { "produits": [2596], "ancien_modele": [] },
  "images": [
    { "url": "https://…/vue-bleu.png", "coloris": "Bleu" },
    { "url": "https://…/en-vol.jpg", "role": "les_deux" },
    { "fichier": "C:/Users/…/detail.jpg", "role": "description" }
  ],
  "tech": {
    "tailles": ["XS", "S", "MS"],
    "lignes": [
      { "carac": "cellules", "valeurs": ["78"] },
      { "carac": "poids", "valeurs": ["4,5", "4,7", "4,92"] },
      { "carac": "ptv_certifie", "valeurs": ["65-80", "75-90", "85-100"] },
      { "carac": "autre", "libelle": "Volume plié (L)", "valeurs": ["40"] }
    ],
    "autres": [{ "libelle": "Tissu", "valeur": "Dokdo 20D" }]
  }
}
```

- `categories` : identifiants du référentiel ; une ou plusieurs **sous-catégories** (la rubrique est ajoutée d'office).
- `marque` : nom de la marque du référentiel (« GIN » est retrouvé pour « Gin Gliders »).
- `criteres` : `slug` du référentiel ; `protection`, `container`, `homologation_sellette` pour les sellettes seulement. Vide si la
  source ne le dit pas.
- `declinaisons` : le serveur crée toutes les combinaisons taille x coloris x état. Coloris existant : son nom exact du référentiel ;
  nouveau : `nom` et, si possible, `couleur` (hexadécimal de la couleur dominante). Sans taille ni coloris : omettre (produit simple,
  `vente.prix` au lieu de `prix_par_taille`).
- `vente.disponibilite` : `stock`, `commande`, `bientot` (avec `date_arrivee` AAAA-MM-JJ) ou `rupture`. `stock` : seulement les
  déclinaisons qui ont du stock (taille seule ou coloris seul acceptés). Prix TTC en euros.
- `remplace.produits` : identifiants des anciens modèles validés à l'étape 7 ; `remplace.ancien_modele` : ceux qui passent
  « plus en vente ». Appliqué à la publication.
- `images` : dans l'ordre choisi à l'étape 5 ; la première est l'image principale. `coloris` : rattache la photo à son coloris.
  `role` : `galerie` (défaut), `description`, `les_deux`. `{{image:N}}` dans la description place l'image N (rang dans `images`, à
  partir de 1) à côté du texte de sa section : juste après un `<h3>`. Photos de galerie de 800 px au moins.
- `tech.lignes` : `carac` = clé du référentiel, une valeur par taille dans l'ordre de `tech.tailles`, une seule si elle est identique
  pour toutes ; `autre` + `libelle` pour une ligne sans clé. 12 tailles au plus. La ligne `poids` donne le poids d'expédition.
- `id` dans une image ou un document : écrit par `client.mjs` après réception ; ne pas le modifier.

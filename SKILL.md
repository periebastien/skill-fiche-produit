---
name: fiche-produit
description: Créer une fiche produit en brouillon sur la boutique Plaine Altitude (WooCommerce) à partir de la page web ou du PDF d'un fabricant de parapente (voile, sellette, secours, casque, sac, électronique, accessoire), en posant à l'utilisateur les questions de vente (photos, prix, disponibilité, ancien modèle) avant l'envoi. Utiliser dès qu'on donne un lien de fabricant, un PDF de produit, ou qu'on demande de « créer la fiche », « ajouter le produit », « faire la fiche de la … ».
---

# Créer une fiche produit Plaine Altitude

Tu aides l'équipe de Plaine Altitude (Timothée le plus souvent, parfois Hervé) à créer une fiche produit. Tu lis la source du
fabricant, tu **poses les questions que seule la boutique peut trancher**, tu rédiges dans la voix de la boutique, et le serveur crée
un **brouillon**, que l'utilisateur relit sur le site. Tu ne publies que sur son accord explicite. Le but : un brouillon aussi complet
que possible, qu'il ne reste qu'à relire et publier.

Lis d'abord `persona-herve.md` (qui parle, comment) et `guide-redaction.md` (règles de rédaction et de structure).

Parle en français, simplement, sans jargon technique. Ne montre jamais de JSON brut : résume, et montre des tableaux courts.
**Pose les questions avec l'outil de questions (AskUserQuestion) dès que les réponses sont des choix** (une à quatre questions à la
fois, ta recommandation en premier) ; en texte libre pour les numéros de photos et les prix. Une étape à la fois : n'enchaîne pas
toutes les questions d'un coup, et ne passe pas à l'étape suivante sans réponse.

Pages locales (planche des photos, coloris) : `client.mjs` les ouvre **une seule fois** dans le navigateur ; quand tu relances la
commande, la page déjà ouverte se met à jour d'elle-même. Ne demande pas d'ouvrir un autre onglet, dis seulement « la page est à
jour ». Pas d'autre page locale : la fiche elle-même se relit sur le site, en brouillon.

Tous les appels passent par `client.mjs`, dans le dossier de cette skill (`node "<dossier de la skill>/client.mjs" …`). Travaille dans
un dossier par produit (`Documents/fiches/<marque>-<modele>/`) : `fiche.json`, `photos.txt`, le référentiel et les rapports y restent.

## Déroulé

### 1. Source et famille
Une adresse de page, un PDF (chemin sur le poste), ou les deux. Famille : parapente, sellette, secours, casque, sac, electronique,
accessoire (demande-la si elle n'est pas évidente). Packs et bons cadeaux : refuser, ils se font à la main.
Première fois de la séance : `node client.mjs verifier` (échec : voir `INSTALLATION.md`). Il dit sur quel site partent les
brouillons : la boutique en production, sauf réglage d'essai ; dans ce cas, dis-le à l'utilisateur.

### 2. Existant : doublon et anciens modèles
`node client.mjs doublons "<marque>" "<modele>" <famille>`.
- **exact** : le produit existe déjà (même en brouillon). S'il s'agit de la fiche de ce dossier (`brouillon_id` ou `publie_id` de
  `fiche.json`), c'est normal : on la modifie (« Modifier une fiche déjà envoyée », plus bas). Sinon, arrête-toi, donne son nom et
  son lien d'édition, demande si c'est vraiment un autre produit (autre millésime, autre version). Une fiche créée par la skill dans
  un autre dossier se modifie depuis ce dossier-là (`Documents/fiches/<marque>-<modele>/`) ; une fiche faite à la main, dans
  l'administration.
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

### 4. Ce qu'est le produit : tes déductions, à valider
Tout se **déduit de la source** (page, PDF, document fourni), puis se **propose** à l'utilisateur, qui valide ou corrige. Résume
d'abord en quelques lignes ce que tu as compris, puis demande par l'outil de questions (ta proposition en premier, avec ce qui la
justifie dans la source : « homologué EN D selon le tableau d'Ozone ») :
- **catégories** : sous-catégories du référentiel déduites de la source (niveau EN, type de sellette, usage), en t'appuyant sur les
  catégories des fiches modèles ; une ou deux variantes ; l'utilisateur peut en donner une autre ;
- **pratiques** (cross, marche et vol, compétition…), **homologation**, **nombre de lignes**, et pour une sellette **protection,
  container, homologation de la sellette** : déduits de la source, à valider ; ce que la source ne dit pas reste vide (et tu le dis) ;
- **année de sortie** (badge « Nouveauté ») : propose **l'année en cours** (un produit ajouté est en général de l'année), ou celle de
  la source si elle en donne une autre ; à valider ;
- **tailles** vendues (toutes celles du fabricant, ou seulement certaines ?) ;
- **état** : neuve, en général ; démo ou occasion se font plutôt à la main.

### 4 bis. Coloris : nom du fabricant et pastille
Chaque coloris devient une valeur propre au produit, avec le **nom donné par le fabricant** (page, affiche, PDF, données de la page :
« Lou », « Sky », « Fire », pas « Bleu ») et une pastille :
- **voile** : une étiquette de **trois bandes** horizontales, aux trois couleurs principales de la voile (la couleur dominante en
  haut, puis les deux suivantes) ;
- **sellette, casque, sac, autres** : une pastille de couleur simple (une couleur, ou deux pour un bicolore) avec le nom.
Méthode :
1. Relève chaque coloris standard du fabricant (les coloris personnalisés sur mesure ne sont pas déclinés, sauf demande) : son nom,
   son code s'il y en a un, et la photo qui le montre le mieux (vue du produit seul, de préférence).
2. Écris `coloris.json` : `[{ "nom": "Lou", "code": "LOU", "image": "<adresse de la photo>" }]`, puis
   `node client.mjs coloris coloris.json <famille>` : le serveur relève les couleurs dominantes de chaque photo (fond écarté, ombres
   regroupées), écrites dans `proposees`. Aucune page ne s'ouvre encore (les pastilles ne sont pas choisies) : n'en parle pas.
3. Choisis les couleurs de chaque pastille (`couleurs` : 3 pour une voile, 1 ou 2 sinon), en regardant aussi la photo toi-même :
   l'analyse donne les surfaces, toi tu juges ce qui caractérise la voile (une couleur d'accent peu étendue mais très visible
   compte). Relance `node client.mjs coloris coloris.json <famille>` : la page s'ouvre alors, une seule fois, et montre pour chaque
   coloris la photo, les couleurs relevées et la pastille telle qu'elle apparaîtra sur la fiche.
4. Demande à l'utilisateur de valider les noms et les pastilles, ou de dire quoi changer (« la bande 2 plus foncée », « le nom est
   Sky Blue ») ; corrige `coloris.json` et relance la commande (la page ouverte se met à jour) jusqu'à son accord. Reporte ensuite les coloris validés dans `fiche.json`
   (`declinaisons.coloris` : `nom` et `couleurs`).

### 5. Photos : lesquelles et dans quel ordre
1. Écris `photos.txt` : une photo par ligne, adresse de la **plus grande version** (ou chemin d'un fichier du poste, espaces
   permis), puis une note courte (« coloris Bleu », « en vol », « détail élévateurs »).
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
- **Vidéos (toujours demander)** : montre celles que tu as trouvées (YouTube, Vimeo, chez le fabricant ou sur sa chaîne), puis
  demande en texte libre : « Avez-vous d'autres liens de vidéos à mettre dans la galerie (YouTube ou Vimeo) ? ». Les vidéos
  s'affichent dans la galerie de la fiche, à côté des photos.
- Puis, en une question à choix multiples : documents PDF (manuel, certificat), FAQ, « Livré avec ». Documents : PDF seulement ;
  si le fabricant ne donne qu'une page de téléchargement, demande le PDF à l'utilisateur ou dis qu'il s'ajoutera à la main. Demande s'il y a un **essai** ou une expérience de la boutique sur ce produit (vol, stage,
élèves, portique) : si oui, quelques mots de l'utilisateur, que tu intègres à la description, en « nous ».

### 9. Rédaction et référencement
Rédige `fiche.json` (format ci-dessous) selon `persona-herve.md` et `guide-redaction.md`, y compris le **référencement** :
`meta_titre` (60 caractères environ : famille, marque, modèle et ce qui le distingue), `meta_description` (150 caractères environ),
`famille_affichee` si la famille du nom ne suffit pas (« Parapente biplace »). L'adresse de la fiche (rubrique + nom), le nom et le
texte alternatif des photos, et les données structurées pour Google sont produits par le serveur et le thème : rien à écrire.
**Grille technique : chaque ligne a une valeur dans chaque colonne de taille**, même quand elle est identique pour toutes (« 78 »
cellules pour les cinq tailles) : sur mobile, chaque taille lit sa propre colonne. Pas d'aperçu local : la relecture se fait sur
le brouillon, à l'étape 11.

### 10. Essai puis envoi du brouillon
- `node client.mjs envoyer fiche.json --essai` : le serveur contrôle tout sans rien créer.
  - `erreurs` : corrige et recommence.
  - `nouveaux` (marque, taille ou coloris inconnus) : vérifie qu'ils n'existent pas sous un autre nom dans le référentiel ; ceux qui
    restent, fais-les valider.
  - `avertissements` : dis-les (photos petites, prix manquants, délai vide…).
  - `vente` et `remplace` du rapport : montre le tableau final (taille, prix, poids) et les anciens modèles reliés, pour un dernier oui.
- Puis, sans attendre d'autre question, `node client.mjs envoyer fiche.json` (avec `--confirmer-nouveaux` et `--forcer-doublon`
  seulement après accord explicite) : le brouillon est créé sur le site. Les photos partent une par une ; après une erreur, corrige
  et relance : celles déjà reçues ne repartent pas. `envoyer` ne sert qu'à la création : une fois `brouillon_id` noté, tout
  passe par `modifier`.
- Si la sortie contient **« ATTENTION, contrôle après envoi »** (déclinaison sans coloris, attribut vide…) : dis-le tout de suite à
  l'utilisateur, ne propose pas de publier ; corrige `fiche.json` et passe par `modifier`, ou laisse la correction à la main.

### 11. Relecture sur le site : publier, corriger ou laisser en brouillon
Donne les deux liens affichés par `envoyer` : **Aperçu** (la fiche telle que les clients la verront ; il faut être connecté au site
dans le navigateur) et **Édition** (l'administration). Dis en quelques lignes ce que tu n'as pas pu remplir et pourquoi. Puis demande,
par l'outil de questions :
- **Faire des corrections** : l'utilisateur dit quoi changer ; corrige `fiche.json` (et `coloris.json`, `photos.txt` si besoin),
  puis suis « Modifier une fiche déjà envoyée » ci-dessous : le brouillon garde ses liens. Recommence l'étape 11 jusqu'à ce qu'il
  choisisse autre chose.
- **Publier maintenant** : rappelle d'abord que « L'avis d'Hervé » est vide (Hervé l'écrira) et, s'il y en a, que les anciens modèles
  recevront le lien « Nouveau modèle » ; puis, sur un oui explicite, `node client.mjs publier fiche.json` et donne le lien public.
- **Laisser en brouillon** : pour la relecture d'Hervé ou des retouches à la main ; la publication se fera dans l'administration.

## Modifier une fiche déjà envoyée (brouillon ou publiée)
Pour une correction après relecture, ou plus tard sur une fiche en ligne (nouveau prix, nouveau coloris, ligne du tableau,
photo…), depuis le dossier du produit (`fiche.json` avec `brouillon_id` ou `publie_id`). Le produit garde son identifiant, son
adresse, son référencement et son statut : une fiche en ligne **reste en ligne**. Seul ce qui change dans `fiche.json` est écrit ;
déclinaisons, photos, coloris et pastilles déjà en place sont repris ; l'avis d'Hervé et les champs que la skill ne gère pas ne sont
jamais touchés.
1. Corrige `fiche.json` selon la demande, rien d'autre. Nouveau coloris : étape 4 bis pour ses couleurs. Nouvelle photo : ajoute-la
   dans `images` (sans `id`).
2. `node client.mjs modifier fiche.json --essai` : la liste des changements prévus, rien n'est écrit. Montre-la à l'utilisateur
   (libellé, avant, après), avec les déclinaisons ajoutées ou supprimées et les avertissements. **Rien ne s'écrit sans son oui.**
   - « Gardé tel quel » : une valeur retouchée à la main dans l'administration depuis le dernier envoi, que `fiche.json` ne change
     pas ; elle reste. Dis-le en une ligne.
   - « la nouvelle valeur remplace une retouche faite à la main » : demande s'il faut vraiment l'écraser.
   - Fiche créée avant le 2026-11-28 (message « Fiche créée avant le suivi des envois ») : toute différence avec le site est listée,
     même celles qui viennent d'une retouche à la main. Fais trier : ce qui doit rester tel quel sur le site s'ajoute avec
     `--garder=<clé>` (la clé entre crochets dans la liste, plusieurs séparées par des virgules ; `--garder=prix` garde les prix de
     toutes les déclinaisons). Le stock n'est jamais touché sur ces fiches.
3. Sur son accord, la même commande sans `--essai` (avec les mêmes `--garder`). Redonne les liens affichés. Si la sortie contient
   « ATTENTION, contrôle après envoi », dis-le tout de suite.
Supprimer une taille ou un coloris supprime ses déclinaisons : signale-le clairement avant d'écrire. Passer d'un produit simple à
un produit à déclinaisons (ou l'inverse) se fait à la main.

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
  "declinaisons": { "tailles": ["XS", "S", "MS"], "coloris": [{ "nom": "Lou", "couleurs": ["#0037df", "#e53503", "#e8b10c"] }], "etats": ["neuve"] },
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
      { "carac": "cellules", "valeurs": ["78", "78", "78"] },
      { "carac": "poids", "valeurs": ["4,5", "4,7", "4,92"] },
      { "carac": "ptv_certifie", "valeurs": ["65-80", "75-90", "85-100"] },
      { "carac": "autre", "libelle": "Volume plié (L)", "valeurs": ["40"] }
    ],
    "autres": []
  }
}
```

- `categories` : identifiants du référentiel ; une ou plusieurs **sous-catégories** (la rubrique est ajoutée d'office).
- `marque` : nom de la marque du référentiel (« GIN » est retrouvé pour « Gin Gliders »).
- `criteres` : `slug` du référentiel ; `protection`, `container`, `homologation_sellette` pour les sellettes seulement. Vide si la
  source ne le dit pas.
- `declinaisons` : le serveur crée toutes les combinaisons taille x coloris x état. Coloris : `nom` du fabricant et `couleurs`
  validées à l'étape 4 bis (1 à 3 codes hexadécimaux) ; le serveur crée le coloris propre au produit et sa pastille (image à bandes
  pour une voile). `id` d'un coloris existant seulement si l'utilisateur le demande. Sans taille ni coloris : omettre (produit simple,
  `vente.prix` au lieu de `prix_par_taille`).
- `vente.disponibilite` : `stock`, `commande`, `bientot` (avec `date_arrivee` AAAA-MM-JJ) ou `rupture`. `stock` : seulement les
  déclinaisons qui ont du stock (taille seule ou coloris seul acceptés). Prix TTC en euros.
- `remplace.produits` : identifiants des anciens modèles validés à l'étape 7 ; `remplace.ancien_modele` : ceux qui passent
  « plus en vente ». Appliqué à la publication.
- `images` : dans l'ordre choisi à l'étape 5 ; la première est l'image principale. `coloris` : rattache la photo à son coloris.
  `role` : `galerie` (défaut), `description`, `les_deux`. `{{image:N}}` dans la description place l'image N (rang dans `images`, à
  partir de 1) à côté du texte de sa section : juste après un `<h3>`. Photos de galerie de 800 px au moins.
- `tech.lignes` : `carac` = clé du référentiel, **une valeur par taille** dans l'ordre de `tech.tailles`, même identique (le serveur
  recopie une valeur seule dans toutes les colonnes, mais écris-les) ; `autre` + `libelle` pour une ligne sans clé. 12 tailles au plus. La ligne `poids` donne le poids d'expédition.
- `tech.autres` : vide en général ; les matériaux vont en dernière section de la description (`guide-redaction.md`).
- `id` dans une image ou un document, `brouillon_id` et `publie_id` : écrits par `client.mjs` ; ne pas les modifier.

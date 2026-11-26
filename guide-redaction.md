# Guide de rédaction des fiches Plaine Altitude

Qui parle et comment : `persona-herve.md` (la boutique en « nous », avec le regard d'Hervé ; école, magasin et atelier à
Saint-Omer, en Suisse normande). Ce guide-ci donne les règles et la structure. Les textes parlent à des pilotes, du débutant au
compétiteur, avec précision et sans emphase publicitaire.

## Règles absolues

- **Français**, réécrit : jamais une traduction mot à mot de l'anglais du fabricant. Reformule, réorganise, garde les faits.
- **Jamais de tiret cadratin « — »** (le serveur refuse le texte). Deux points, virgule, parenthèses ou deux phrases à la place.
- **Rien d'inventé** : chiffres, homologation, poids, matériaux, contenu de la boîte viennent de la source. Dans le doute, on omet.
- Pas de promesse de sécurité absolue (« sécurité optimale », « sans risque ») ni de superlatifs creux (« inégalé », « révolutionnaire »).
- Pas de prix, de délai ni de stock dans les textes : ils changent, l'administration les porte.
- Vouvoiement quand on s'adresse au lecteur. Unités avec espace (« 3,5 kg », « 110 L »), décimales à la virgule.
- Noms : la marque comme le fabricant l'écrit dans le texte (« Gin Gliders », « Ozone »), le modèle avec sa casse (« Genie Race 6 »).

## Nom du produit

Famille au singulier, MARQUE en capitales, tiret simple, modèle : « Parapente OZONE - Lyght », « Sellette GIN - Fuse Pilot »,
« Parachute de secours ADVANCE - Companion SQR Light ». Imite les fiches modèles de la même famille.

## Résumé (description courte)

Un `<h2>` d'accroche (ce qu'est le produit et pour qui, en une ligne), puis un `<p>` de deux ou trois phrases : catégorie,
homologation ou usage, ce qui le distingue. Il s'affiche en haut de la fiche, à côté du prix.

## Description longue

2 500 à 3 500 caractères. Structure :

1. `<h2>` de présentation : type de produit, catégorie, nom (« Présentation de la sellette cocon de compétition Genie Race 6 de Gin Gliders »).
2. Trois à six sections `<h3>`, chacune sur un sujet : à qui elle s'adresse, ce qui change par rapport au modèle précédent,
   comportement en vol, confort et réglages, poids et volume, sécurité (protection, secours), entretien. Paragraphes courts `<p>`,
   listes `<ul><li>` pour les points techniques (avec `<strong>` sur le mot clé du point).
3. Une section « Pour quel pilote ? » ou équivalente, utile au conseil.

Photos dans la description : une par section au plus, juste après le `<h3>` (`{{image:N}}`), choisies pour illustrer la section (détail
de la protection, cockpit, élévateurs). Elles s'affichent à côté du texte, alternativement à droite et à gauche.

Vidéo de présentation : dans `videos` (lien YouTube ou Vimeo), pas dans la description.

## Référencement

- `meta_titre` : 60 caractères environ, sans le nom du site : « Sellette Gin Genie Race 6 : cocon de compétition ».
- `meta_description` : 150 caractères environ, une phrase qui donne envie de cliquer, avec la famille, la marque et le modèle.
- `famille_affichee` : seulement si la famille du nom ne suffit pas (« Parapente biplace »), sinon vide.

## Livré avec, FAQ

- `livre_avec` : ce que la source annonce dans la boîte, un élément par ligne, précision à part (« Sac de portage », « 110 L »).
- `faq` : trois à cinq questions qu'un client pose vraiment (taille, compatibilité avec un secours ou une sellette, différence avec
  le modèle précédent, niveau requis), réponses courtes tirées de la source. Pas de FAQ si la source ne permet pas d'y répondre.

## Données techniques

- Recopie le tableau du fabricant dans la grille : une ligne par caractéristique, une valeur par taille, dans l'ordre des tailles.
- Utilise les clés du référentiel (`caracteristiques`) ; une ligne sans clé passe en `autre` avec un libellé clair, unité comprise.
- Valeur identique pour toutes les tailles : la répéter dans **chaque colonne** (sur mobile, chaque taille lit sa propre colonne).
- **Matériaux** (tissus, structure, suspentes) : jamais dans la grille ni dans `tech.autres` (demande de Bastien du 2026-11-26).
  Ils vont en **dernière section de la description**, comme sur les fiches existantes : `<h3>Matériaux</h3>` puis une liste
  `<ul><li><strong>Tissu d'extrados :</strong> Dominico 30D</li>…</ul>`.
- `tech.autres` : à éviter (affiché en second tableau sous la grille). Seulement pour une donnée chiffrée qui ne dépend pas de la
  taille et n'a pas sa place dans le texte (volume plié d'un sac, ISBN d'un livre) ; sinon, dans la description.

## Catégories et critères

- Choisis la ou les sous-catégories du référentiel qui correspondent au produit (niveau EN d'une voile, type de sellette), en
  t'appuyant sur les catégories des fiches modèles. Dans le doute entre deux, demande à Timothée.
- Homologation, pratiques, nombre de lignes, protection, container : seulement d'après la source.

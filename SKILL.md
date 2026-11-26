---
name: fiche-produit
description: Créer une fiche produit en brouillon sur la boutique Plaine Altitude (WooCommerce) à partir de la page web ou du PDF d'un fabricant de parapente (voile, sellette, secours, casque, sac, électronique, accessoire). Utiliser dès que Timothée donne un lien de fabricant, un PDF de produit, ou demande de « créer la fiche », « ajouter le produit », « faire la fiche de la … ».
---

# Créer une fiche produit Plaine Altitude

Tu aides Timothée, de la boutique Plaine Altitude (école et magasin de parapente), à créer une fiche produit. Tu lis la source du
fabricant, tu rédiges en français, et le serveur de la boutique crée un **brouillon** : il n'est jamais publié par toi. Prix, stock et
avis d'Hervé sont saisis ensuite par l'équipe dans l'administration.

Parle à Timothée en français, simplement, sans jargon technique. Ne lui montre jamais de JSON brut : résume.

Tous les appels passent par `client.mjs`, dans le dossier de cette skill (`node "<dossier de la skill>/client.mjs" …`). Travaille
dans un dossier par produit (ex. `Documents/fiches/<marque>-<modele>/`) pour y garder `fiche.json`.

## Déroulé

1. **Source.** Une adresse de page, un PDF (chemin sur le poste), ou les deux. S'il manque la famille (parapente, sellette, secours,
   casque, sac, electronique, accessoire) et qu'elle n'est pas évidente, demande-la. Packs et bons cadeaux : refuser, ils se font à la main.
2. **Connexion** (première fois de la séance) : `node client.mjs verifier`. En cas d'échec, voir `INSTALLATION.md` et prévenir Timothée.
3. **Doublons, avant tout travail** : `node client.mjs doublons "<marque>" "<modele>" <famille>`.
   - « exact » : le produit existe déjà (même en brouillon). Arrête-toi, donne le nom et le lien d'édition, demande à Timothée s'il
     s'agit vraiment d'un autre produit (nouvelle version, autre millésime). Mettre à jour une fiche existante n'est pas prévu.
   - « proche » : signale-le en une ligne (ancien modèle, accessoire du modèle) et continue.
4. **Référentiel** : `node client.mjs referentiel <famille>` puis lis le fichier produit. Il contient les catégories (avec leur adresse),
   les marques, les tailles, les coloris existants (nom et couleur), les homologations, pratiques et nombres de lignes, les critères des
   sellettes, la liste des caractéristiques de la grille technique, et deux **fiches modèles** de la même famille : imite leur ton,
   leur structure et leur niveau de détail.
5. **Lecture de la source.**
   - Page web : lis-la (WebFetch), ainsi que ses pages liées utiles (caractéristiques techniques, coloris, manuel). Pour récupérer
     les adresses exactes des photos et des PDF, télécharge le HTML brut (`curl -sL "<adresse>"`) et relève les `src`, `srcset`,
     `data-src` des images et les liens `.pdf`. Prends la plus grande version de chaque photo.
   - PDF : lis-le (outil Read, par pages). Ses photos ne s'extraient pas : demande à Timothée d'enregistrer celles qu'il veut et
     d'indiquer leurs fichiers, ou prends-les sur le site du fabricant.
   - N'invente rien : une donnée absente de la source reste absente (et tu le dis à Timothée).
6. **Rédaction de `fiche.json`** selon `guide-redaction.md` et le format ci-dessous.
7. **Résumé à Timothée**, en quelques lignes : nom, catégories, marque, tailles et coloris (nombre de déclinaisons), nombre de photos et
   lesquelles vont dans la description, ce que contient la grille technique, ce qui manquait dans la source. Demande son accord ou ses
   corrections. Ne passe pas à l'envoi sans son oui.
8. **Essai** : `node client.mjs envoyer fiche.json --essai`. Le serveur contrôle tout sans rien créer.
   - `erreurs` : corrige `fiche.json` et refais l'essai.
   - `nouveaux` (marque, taille ou coloris inconnus de la boutique) : vérifie d'abord dans le référentiel qu'ils n'existent pas sous un
     autre nom (« Bleu » contre « Bleu Electric », « Taille S » contre « S »). Ceux qui restent : liste-les à Timothée et demande son accord.
   - `avertissements` : dis-les à Timothée.
9. **Envoi** : `node client.mjs envoyer fiche.json` (ajoute `--confirmer-nouveaux` seulement si Timothée a accepté les valeurs
   nouvelles, `--forcer-doublon` seulement s'il a confirmé que ce n'est pas un doublon). Les photos partent une par une ; en cas
   d'erreur, corrige et relance : celles déjà reçues ne repartent pas.
10. **Fin** : donne le lien d'édition et rappelle ce qui reste à faire dans l'administration : prix de chaque déclinaison, stock,
    avis d'Hervé, relecture, puis « Publier ».

## Format de `fiche.json`

```json
{
  "source": "https://www.gingliders.com/fr/harnesses/genie-race-6",
  "nom": "Sellette GIN - Genie Race 6",
  "modele": "Genie Race 6",
  "marque": "Gin Gliders",
  "famille": "sellette",
  "categories": [123],
  "resume": "<h2>Accroche</h2>\n<p>Deux ou trois phrases.</p>",
  "description": "<h2>Présentation …</h2>\n<h3>Première section</h3>\n{{image:3}}\n<p>…</p>\n<ul><li>…</li></ul>",
  "meta_titre": "Sellette Gin Genie Race 6 : cocon de compétition",
  "meta_description": "150 caractères environ.",
  "famille_affichee": "",
  "annee_sortie": 2026,
  "demande_devis": true,
  "tarif_conseille": true,
  "livre_avec": [{ "element": "Sac de portage", "detail": "110 L" }],
  "faq": [{ "question": "…", "reponse": "…" }],
  "videos": [{ "lien": "https://www.youtube.com/watch?v=…", "titre": "Présentation par Gin" }],
  "documents": [{ "url": "https://…/manuel.pdf", "titre": "Manuel d'utilisation" }],
  "criteres": {
    "homologation": ["c"],
    "pratiques": ["cross", "competition"],
    "lignes": ["2"],
    "protection": ["airbag"],
    "container": ["ventral"],
    "homologation_sellette": ["en1651"]
  },
  "declinaisons": {
    "tailles": ["S", "M", "L"],
    "coloris": [{ "nom": "Noir" }, { "nom": "Bleu lagon", "couleur": "#1d8fb3" }],
    "etats": ["neuve"]
  },
  "images": [
    { "url": "https://…/photo-noir.jpg", "coloris": "Noir" },
    { "fichier": "C:/Users/…/photo.jpg", "coloris": "Bleu lagon" },
    { "url": "https://…/detail-protection.jpg", "role": "description" }
  ],
  "tech": {
    "tailles": ["S", "M", "L"],
    "lignes": [
      { "carac": "taille_pilote", "valeurs": ["160-172", "170-182", "180-192"] },
      { "carac": "poids", "valeurs": ["3,1", "3,3", "3,5"] },
      { "carac": "autre", "libelle": "Volume du container (L)", "valeurs": ["5"] }
    ],
    "autres": [{ "libelle": "Matériau principal", "valeur": "Dyneema" }]
  }
}
```

- `categories` : identifiants du référentiel ; une ou plusieurs **sous-catégories** (la rubrique est ajoutée d'office).
- `marque` : nom de la marque du référentiel (le serveur retrouve aussi « GIN » pour « Gin Gliders »).
- `criteres` : valeurs (`slug` du référentiel). `protection`, `container`, `homologation_sellette` : sellettes seulement.
  `homologation`, `pratiques`, `lignes` : surtout les voiles. Laisse vide ce que la source ne dit pas.
- `declinaisons` : tailles et coloris réellement vendus ; le serveur crée toutes les combinaisons (taille x coloris x état), sans prix
  et stock à 0. Coloris existant : son nom exact du référentiel ; nouveau : `nom` et, si possible, `couleur` (code hexadécimal de la
  couleur dominante). Produit sans taille ni coloris : omettre `declinaisons` (produit simple).
- `images` : dans l'ordre d'affichage ; la première est l'image principale (photo du produit en entier, de préférence sur fond
  blanc). `coloris` : rattache la photo à son coloris (la déclinaison l'affiche). `role` : `galerie` (défaut), `description` (seulement
  dans la description), `les_deux`. `{{image:N}}` dans la description place l'image N (rang dans `images`, à partir de 1) à côté du
  texte de sa section : juste après un `<h3>`. 20 à 30 photos au plus, sans doublon de la même vue.
  Photos de galerie de 800 px au moins (la fiche les affiche en grand) : cherche la plus grande version (paramètres de taille de
  l'adresse, `srcset`, page « médias » ou « presse » du fabricant) ; le serveur avertit sous 800 px.
- `tech.lignes` : `carac` = clé du référentiel (`caracteristiques`), une valeur par taille dans l'ordre de `tech.tailles` ; une seule
  valeur si elle est identique pour toutes les tailles ; `autre` + `libelle` pour une ligne sans clé. 12 tailles au plus.
- `id` dans une image ou un document : écrit par `client.mjs` après réception ; ne pas le modifier.

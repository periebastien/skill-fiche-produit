# Installation chez Timothée

1. **Claude Code** installé sur le poste (application Claude, onglet Code, ou en ligne de commande), avec un abonnement Claude.
   Node.js 18 ou plus récent pour `client.mjs` : si `node -v` ne répond pas dans un terminal, l'installer depuis https://nodejs.org (version LTS).
2. **La skill** : copier le dossier `fiche-produit` (ce dossier) dans `C:\Users\<compte>\.claude\skills\fiche-produit\`.
   Claude Code la propose dès qu'on lui donne un lien de fabricant ou qu'on parle de créer une fiche.
3. **Le compte de la boutique** (fait par Bastien, administrateur : le rôle Gérant ne peut pas créer ce type de compte) :
   - Utilisateurs > Ajouter : identifiant `fiches-timothee`, rôle « Rédacteur de fiches (API) ». Ce compte ne peut que créer des
     brouillons par la skill ; il ne peut pas se connecter à l'administration.
   - Sur le profil de ce compte, « Mots de passe d'application » : nom « Poste de Timothée », Ajouter, copier le mot de passe affiché
     (il ne sera plus visible). Pour couper l'accès : « Révoquer » sur ce même écran.
4. **Le fichier de réglages** `C:\Users\<compte>\.pa-fiches.json` (jamais ailleurs, jamais envoyé) :

   ```json
   { "site": "https://boutique.plaine-altitude.com", "compte": "fiches-timothee", "mot_de_passe_application": "xxxx xxxx xxxx xxxx xxxx xxxx" }
   ```

5. **Vérifier** : demander à Claude « vérifie la connexion à la boutique » (il lance `node client.mjs verifier`).

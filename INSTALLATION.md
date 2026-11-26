# Installation sur un poste (Timothée, Hervé ou autre)

1. **Claude Code** installé sur le poste (application Claude, onglet Code, ou en ligne de commande), avec un abonnement Claude.
   Node.js 18 ou plus récent pour `client.mjs` : si `node -v` ne répond pas dans un terminal, l'installer depuis https://nodejs.org (version LTS).
   Git pour Windows : si `git --version` ne répond pas, l'installer depuis https://git-scm.com/download/win (réglages par défaut).
2. **Le dépôt** https://github.com/periebastien/skill-fiche-produit est public : pas besoin de compte GitHub.
3. **La skill**, dans PowerShell :

   ```powershell
   git clone https://github.com/periebastien/skill-fiche-produit.git "$env:USERPROFILE\.claude\skills\fiche-produit"
   ```

   Si le dossier existe déjà (ancienne copie à la main), le supprimer avant. Claude Code propose la skill dès qu'on lui donne un lien
   de fabricant ou qu'on parle de créer une fiche.
4. **Mettre à jour la skill** (quand Bastien l'annonce), dans PowerShell :

   ```powershell
   git -C "$env:USERPROFILE\.claude\skills\fiche-produit" pull
   ```

5. **Le compte de la boutique** (fait par Bastien, administrateur : le rôle Gérant ne peut pas créer ce type de compte) :
   - Utilisateurs > Ajouter : identifiant `fiches-timothee`, rôle « Rédacteur de fiches (API) ». Ce compte ne peut que créer des
     brouillons par la skill ; il ne peut pas se connecter à l'administration.
   - Sur le profil de ce compte, « Mots de passe d'application » : nom « Poste de Timothée », Ajouter, copier le mot de passe affiché
     (il ne sera plus visible). Pour couper l'accès : « Révoquer » sur ce même écran.
6. **Le fichier de réglages** `C:\Users\<compte>\.pa-fiches.json` (jamais ailleurs, jamais envoyé, jamais dans le dépôt) :

   ```json
   { "compte": "fiches-timothee", "mot_de_passe_application": "xxxx xxxx xxxx xxxx xxxx xxxx" }
   ```

   Les brouillons partent sur la boutique en production (https://boutique.plaine-altitude.com). La ligne `"site"` ne sert qu'aux
   essais de Bastien sur le site de développement (`"site": "https://boutique.cogitoweb.net"`) : sans elle, c'est la production.

7. **Vérifier** : demander à Claude « vérifie la connexion à la boutique » (il lance `node client.mjs verifier`). La réponse doit
   dire « Connexion correcte à la boutique en production ».

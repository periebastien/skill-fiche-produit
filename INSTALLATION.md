# Installation sur un poste Windows ou Mac (Timothée, Hervé ou autre)

Les commandes se tapent dans **PowerShell** sous Windows, dans le **Terminal** sous Mac (Applications > Utilitaires > Terminal).

1. **Claude Code** installé sur le poste (application Claude, onglet Code, ou en ligne de commande), avec un abonnement Claude.
   - **Node.js** 18 ou plus récent pour `client.mjs` : si `node -v` ne répond pas, l'installer depuis https://nodejs.org (version LTS,
     installateur Windows ou macOS).
   - **Git** : si `git --version` ne répond pas, sous Windows l'installer depuis https://git-scm.com/download/win (réglages par
     défaut) ; sous Mac, la commande `git --version` propose elle-même d'installer les « outils de ligne de commande » : accepter.
2. **Le dépôt** https://github.com/periebastien/skill-fiche-produit est public : pas besoin de compte GitHub.
3. **La skill** (si le dossier existe déjà, ancienne copie à la main, le supprimer avant) :

   Windows (PowerShell) :
   ```powershell
   git clone https://github.com/periebastien/skill-fiche-produit.git "$env:USERPROFILE\.claude\skills\fiche-produit"
   ```

   Mac (Terminal) :
   ```bash
   git clone https://github.com/periebastien/skill-fiche-produit.git ~/.claude/skills/fiche-produit
   ```

   Claude Code propose la skill dès qu'on lui donne un lien de fabricant ou qu'on parle de créer une fiche.
4. **Mettre à jour la skill** (quand Bastien l'annonce) :

   Windows (PowerShell) :
   ```powershell
   git -C "$env:USERPROFILE\.claude\skills\fiche-produit" pull
   ```

   Mac (Terminal) :
   ```bash
   git -C ~/.claude/skills/fiche-produit pull
   ```

5. **Le compte de la boutique** (fait par Bastien, administrateur : le rôle Gérant ne peut pas créer ce type de compte) :
   - Utilisateurs > Ajouter : identifiant `fiches-timothee`, rôle « Rédacteur de fiches (API) ». Ce compte ne peut que créer des
     brouillons par la skill ; il ne peut pas se connecter à l'administration.
   - Sur le profil de ce compte, « Mots de passe d'application » : nom « Poste de Timothée », Ajouter, copier le mot de passe affiché
     (il ne sera plus visible). Pour couper l'accès : « Révoquer » sur ce même écran.
6. **Le fichier de réglages** `.pa-fiches.json` dans le dossier personnel (`C:\Users\<compte>\` sous Windows, `/Users/<compte>/`
   sous Mac ; jamais ailleurs, jamais envoyé, jamais dans le dépôt). Remplacer les x par le mot de passe d'application, espaces
   compris :

   Windows (PowerShell) :
   ```powershell
   Set-Content -Path ~\.pa-fiches.json -Value '{ "compte": "fiches-timothee", "mot_de_passe_application": "xxxx xxxx xxxx xxxx xxxx xxxx" }'
   ```

   Mac (Terminal) :
   ```bash
   echo '{ "compte": "fiches-timothee", "mot_de_passe_application": "xxxx xxxx xxxx xxxx xxxx xxxx" }' > ~/.pa-fiches.json
   ```

   Les brouillons partent sur la boutique en production (https://boutique.plaine-altitude.com). La ligne `"site"` ne sert qu'aux
   essais de Bastien sur le site de développement (`"site": "https://boutique.cogitoweb.net"`) : sans elle, c'est la production.

7. **Vérifier** : demander à Claude « vérifie la connexion à la boutique » (il lance `node client.mjs verifier`). La réponse doit
   dire « brouillons envoyés sur la boutique en production ».

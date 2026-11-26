#!/usr/bin/env node
// Client de la création de fiches assistée (boutique Plaine Altitude). Appelé par la skill « fiche-produit » de Claude Code.
// Réglages : fichier .pa-fiches.json dans le dossier personnel (site, compte, mot de passe d'application). Jamais affichés.
//
//   node client.mjs verifier                               teste la connexion et les droits
//   node client.mjs referentiel <famille> [fichier]        enregistre le référentiel (défaut : referentiel-<famille>.json)
//   node client.mjs doublons "<marque>" "<modele>" [famille]
//   node client.mjs envoyer <fiche.json> [--essai] [--confirmer-nouveaux] [--forcer-doublon]
//
// « envoyer » sans --essai envoie d'abord les images et documents pas encore reçus (une requête par fichier), note leur
// identifiant dans fiche.json (une relance ne les renvoie pas), puis crée le brouillon. Code de sortie 1 si le serveur refuse.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, basename } from 'node:path';

const REGLAGES = join(homedir(), '.pa-fiches.json');
function reglages() {
  if (!existsSync(REGLAGES)) sortir(`Réglages absents : créer ${REGLAGES} (voir INSTALLATION.md).`);
  const r = JSON.parse(readFileSync(REGLAGES, 'utf8'));
  for (const k of ['site', 'compte', 'mot_de_passe_application']) if (!r[k]) sortir(`Réglage « ${k} » manquant dans ${REGLAGES}.`);
  return r;
}
function sortir(msg, code = 1) { console.error(msg); process.exit(code); }

async function api(methode, route, corps, requete = {}) {
  const r = reglages();
  const url = new URL(r.site.replace(/\/$/, '') + '/wp-json/pa/v1/fiches/' + route);
  for (const [k, v] of Object.entries(requete)) if (v) url.searchParams.set(k, v);
  const auth = 'Basic ' + Buffer.from(r.compte + ':' + r.mot_de_passe_application.replace(/\s+/g, '')).toString('base64');
  const rep = await fetch(url, {
    method: methode,
    headers: { Authorization: auth, ...(corps ? { 'Content-Type': 'application/json' } : {}) },
    body: corps ? JSON.stringify(corps) : undefined,
  });
  const texte = await rep.text();
  let donnees;
  try { donnees = JSON.parse(texte); } catch { donnees = { message: texte.slice(0, 500) }; }
  if (rep.status === 401 || rep.status === 403) sortir(`Accès refusé (${rep.status}) : compte ou mot de passe d'application à vérifier. ${donnees.message || ''}`);
  return { statut: rep.status, donnees };
}

const [commande, ...args] = process.argv.slice(2);
const options = new Set(args.filter(a => a.startsWith('--')));
const positions = args.filter(a => !a.startsWith('--'));

if (commande === 'verifier') {
  const { statut, donnees } = await api('GET', 'referentiel');
  if (statut !== 200) sortir(`Échec (${statut}) : ${donnees.message || JSON.stringify(donnees)}`);
  console.log(`Connexion correcte : ${donnees.categories.length} catégories, ${donnees.marques.length} marques.`);
} else if (commande === 'referentiel') {
  const famille = positions[0] || '';
  const fichier = positions[1] || `referentiel-${famille || 'general'}.json`;
  const { statut, donnees } = await api('GET', 'referentiel', null, { famille });
  if (statut !== 200) sortir(`Échec (${statut}) : ${donnees.message || ''}`);
  writeFileSync(fichier, JSON.stringify(donnees, null, 1));
  console.log(`Référentiel enregistré dans ${fichier} (${donnees.modeles.length} fiches modèles).`);
} else if (commande === 'doublons') {
  const [marque, modele, famille] = positions;
  if (!marque || !modele) sortir('Usage : doublons "<marque>" "<modele>" [famille]');
  const { donnees } = await api('GET', 'doublons', null, { marque, modele, famille });
  console.log(donnees.length ? JSON.stringify(donnees, null, 1) : 'Aucun produit proche.');
} else if (commande === 'envoyer') {
  const chemin = positions[0];
  if (!chemin || !existsSync(chemin)) sortir('Usage : envoyer <fiche.json> [--essai] [--confirmer-nouveaux] [--forcer-doublon]');
  const fiche = JSON.parse(readFileSync(chemin, 'utf8'));
  const essai = options.has('--essai');
  if (!essai) {
    // Fichiers d'abord : une requête par image ou document (limite d'envoi du serveur)
    const commun = { marque: fiche.marque, modele: fiche.modele, nom: fiche.nom };
    const envoyer = async (el, extra, etiquette) => {
      if (el.id) return;
      const corps = { ...commun, ...extra };
      if (el.url) corps.url = el.url;
      else if (el.fichier) { corps.donnees = readFileSync(el.fichier).toString('base64'); }
      else sortir(`${etiquette} : ni « url » ni « fichier ».`);
      const { statut, donnees } = await api('POST', 'image', corps);
      if (statut !== 200) sortir(`${etiquette} refusé (${statut}) : ${donnees.message || ''}\nCorriger fiche.json puis relancer (les fichiers déjà reçus ne sont pas renvoyés).`);
      el.id = donnees.id;
      writeFileSync(chemin, JSON.stringify(fiche, null, 1));
      console.log(`${etiquette} reçu : ${donnees.fichier} (${donnees.largeur} x ${donnees.hauteur})`);
    };
    for (const [i, im] of (fiche.images || []).entries()) await envoyer(im, { coloris: im.coloris || '', rang: i + 1 }, `Image ${i + 1} (${im.url ? basename(new URL(im.url).pathname) : im.fichier})`);
    for (const [i, doc] of (fiche.documents || []).entries()) await envoyer(doc, { type: 'document', titre: doc.titre || '' }, `Document ${i + 1} (${doc.titre || ''})`);
  }
  const corps = { ...fiche, essai, confirmer_nouveaux: options.has('--confirmer-nouveaux'), forcer_doublon: options.has('--forcer-doublon') };
  const { statut, donnees } = await api('POST', 'brouillon', corps);
  console.log(JSON.stringify(donnees, null, 1));
  if (statut !== 200) process.exit(1);
} else {
  sortir('Commandes : verifier, referentiel, doublons, envoyer (voir l\'en-tête de client.mjs).');
}

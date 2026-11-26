#!/usr/bin/env node
// Client de la création de fiches assistée (boutique Plaine Altitude). Appelé par la skill « fiche-produit » de Claude Code.
// Réglages : fichier .pa-fiches.json dans le dossier personnel (site, compte, mot de passe d'application). Jamais affichés.
//
//   node client.mjs verifier                               teste la connexion et les droits
//   node client.mjs referentiel <famille> [fichier]        enregistre le référentiel (défaut : referentiel-<famille>.json)
//   node client.mjs doublons "<marque>" "<modele>" [famille]
//   node client.mjs planche <photos.txt> [titre]           page numérotée des photos trouvées (une adresse ou un fichier par
//                                                          ligne, puis une note facultative)
//   node client.mjs coloris <coloris.json> [famille]       analyse les photos des coloris (couleurs dominantes) ; page de
//                                                          validation des pastilles dès que chaque coloris a ses « couleurs »
//   node client.mjs envoyer <fiche.json> [--essai] [--confirmer-nouveaux] [--forcer-doublon]
//   node client.mjs publier <fiche.json>                   publie le brouillon de fiche.json (après accord de l'utilisateur)
//
// Pages locales (planche, coloris) : ouvertes une seule fois dans le navigateur, puis rechargées d'elles-mêmes quand la commande
// est relancée (pas de nouvel onglet).
// « envoyer » sans --essai envoie d'abord les images et documents pas encore reçus (une requête par fichier), note leur
// identifiant dans fiche.json (une relance ne les renvoie pas), puis crée le brouillon et note son identifiant (« brouillon_id »).
// Relancé après des corrections, il remplace ce brouillon par la nouvelle version. Le rapport du serveur est gardé dans
// rapport-essai.json ou rapport-envoi.json, à côté de fiche.json. Code de sortie 1 si le serveur refuse.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, basename, resolve, dirname } from 'node:path';
import { spawn } from 'node:child_process';

const REGLAGES = join(homedir(), '.pa-fiches.json');
function reglages() {
  if (!existsSync(REGLAGES)) sortir(`Réglages absents : créer ${REGLAGES} (voir INSTALLATION.md).`);
  const r = JSON.parse(readFileSync(REGLAGES, 'utf8'));
  for (const k of ['site', 'compte', 'mot_de_passe_application']) if (!r[k]) sortir(`Réglage « ${k} » manquant dans ${REGLAGES}.`);
  return r;
}
// Arrêt : code de sortie posé, puis fin sans process.exit (qui plante Node sous Windows après un fetch)
class Arret extends Error {}
function sortir(msg, code = 1) { console.error(msg); process.exitCode = code; throw new Arret(msg); }
process.on('uncaughtException', e => { if (!(e instanceof Arret)) { console.error(e); process.exitCode = 1; } });

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

function esc(t) { return String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function source(adresse, base) { return /^https?:/i.test(adresse) ? adresse : 'file:///' + resolve(base, adresse).replace(/\\/g, '/'); }
function page(titre, corps) {
  return `<!doctype html><html lang="fr"><meta charset="utf-8"><title>${esc(titre)}</title><style>
body{font:16px/1.6 system-ui,sans-serif;max-width:1100px;margin:2rem auto;padding:0 1rem;color:#292728;background:#f8fafb}
h1{font-size:2rem;margin:.2rem 0}h2{margin-top:2rem;border-bottom:2px solid #20c4c3}.meta{color:#0b7a79}
.planche{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
figure{margin:0;background:#fff;border-radius:12px;overflow:hidden;position:relative;box-shadow:0 1px 3px #0002}
figure b{position:absolute;top:6px;left:6px;background:#292728;color:#fff;border-radius:6px;padding:0 8px;font-size:1.1rem}
figure img{width:100%;aspect-ratio:4/3;object-fit:contain;background:#eee;display:block}figcaption,figure small{display:block;padding:4px 8px;font-size:.85rem}
.pastille{width:48px;height:48px;border-radius:10px;border:1px solid #ccc;margin:0 auto 4px}.pastille.rond{border-radius:50%}.coloris{display:flex;gap:16px;margin:1rem 0}.coloris span{text-align:center;font-size:.9rem}img.desc{float:right;width:300px;margin:0 0 1rem 1.5rem;border-radius:12px}.description h3{clear:both}
table{border-collapse:collapse;background:#fff}td,th{border:1px solid #ddd;padding:4px 10px;text-align:left}
</style><h1>${esc(titre)}</h1>${corps}</html>`;
}
// Pastille telle que la fiche l'affichera : bandes horizontales (voile) ou couleur simple / bicolore (autres familles)
function pastilleHtml(cs, voile) {
  if (!cs || !cs.length) return '<div class="pastille vide">?</div>';
  if (voile && cs.length > 1) return `<div class="pastille" style="background:linear-gradient(${cs.map((x, i) => `${x} ${(i * 100 / cs.length).toFixed(1)}% ${((i + 1) * 100 / cs.length).toFixed(1)}%`).join(',')})"></div>`;
  return `<div class="pastille rond" style="background:${cs[1] ? `linear-gradient(135deg,${cs[0]} 50%,${cs[1]} 50%)` : cs[0]}"></div>`;
}
// Écrit une page locale qui se recharge seule quand elle est réécrite (fichier <nom>-version.js), et ne l'ouvre qu'une fois
function pageLocale(sortie, html, afficher = true) {
  const version = sortie.replace(/\.html$/, '-version.js');
  const nom = basename(version);
  const veille = `<script>setInterval(()=>{const s=document.createElement('script');s.src='${nom}?'+Date.now();s.onload=()=>{if(window.__v0===undefined)window.__v0=window.__v;else if(window.__v!==window.__v0)location.reload();s.remove()};document.head.appendChild(s)},2000)</script>`;
  writeFileSync(sortie, html.replace('</html>', veille + '</html>'));
  writeFileSync(version, `window.__v=${Date.now()};`);
  const marque = sortie + '.ouverte';
  if (afficher && !existsSync(marque)) { writeFileSync(marque, ''); ouvrir(sortie); }
}
function ouvrir(fichier) {
  if (process.env.PA_FICHES_SANS_OUVRIR) return;   // essais automatiques : pas de fenêtre
  const [cmd, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', fichier]] : [process.platform === 'darwin' ? 'open' : 'xdg-open', [fichier]];
  try { spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref(); } catch { /* le chemin est affiché */ }
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
} else if (commande === 'planche') {
  const liste = positions[0];
  if (!liste || !existsSync(liste)) sortir('Usage : planche <photos.txt> [titre]');
  const base = dirname(resolve(liste));
  const lignes = readFileSync(liste, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  const cartes = lignes.map((l, i) => {
    const [adresse, ...note] = l.split(/\s+/);
    return `<figure><b>${i + 1}</b><img src="${esc(source(adresse, base))}" loading="lazy" onload="this.nextElementSibling.textContent=this.naturalWidth+' x '+this.naturalHeight+' px'+(Math.max(this.naturalWidth,this.naturalHeight)<800?' : petite, floue en grand':'')"><figcaption>chargement…</figcaption>${note.length ? `<small>${esc(note.join(' '))}</small>` : ''}</figure>`;
  }).join('');
  const sortie = resolve(base, 'planche.html');
  pageLocale(sortie, page(positions[1] || 'Photos trouvées', `<p>Notez les numéros à garder, dans l'ordre voulu (la première sera l'image principale), et celles à mettre dans la description.</p><div class="planche">${cartes}</div>`));
  console.log(`Planche de ${lignes.length} photos : ${sortie}`);
} else if (commande === 'coloris') {
  // coloris.json : [{ "nom": "Lou", "code": "LOU", "image": "<photo du coloris chez le fabricant>", "couleurs": ["#…"] }]
  // Sans « couleurs » : le serveur analyse la photo et propose ses couleurs dominantes (« proposees »), écrites dans le fichier.
  const chemin = positions[0];
  if (!chemin || !existsSync(chemin)) sortir('Usage : coloris <coloris.json> [famille]');
  const base = dirname(resolve(chemin));
  const famille = positions[1] || 'parapente';
  const liste = JSON.parse(readFileSync(chemin, 'utf8'));
  for (const c of liste) {
    if (c.proposees || !c.image) continue;
    const corps = /^https?:/i.test(c.image) ? { url: c.image } : { donnees: readFileSync(resolve(base, c.image)).toString('base64') };
    const { statut, donnees } = await api('POST', 'coloris', corps);
    if (statut !== 200) { console.error(`Coloris ${c.nom} : analyse impossible (${donnees.message || statut})`); continue; }
    c.proposees = donnees.couleurs;
  }
  writeFileSync(chemin, JSON.stringify(liste, null, 1));
  const pastille = (cs, voile) => pastilleHtml(cs, voile);
  const lignes = liste.map((c, i) => `<tr><td><b>${i + 1}</b></td><td>${c.image ? `<img src="${esc(source(c.image, base))}">` : ''}</td>
    <td><b>${esc(c.nom)}</b>${c.code ? `<br><small>code ${esc(c.code)}</small>` : ''}</td>
    <td>${(c.proposees || []).map(x => `<span class="ech" style="background:${esc(x.hex)}"></span>${esc(x.hex)} ${x.part} %`).join('<br>')}</td>
    <td>${pastille(c.couleurs, famille === 'parapente')}<small>${esc((c.couleurs || []).join(' · ') || 'à choisir')}</small></td></tr>`).join('');
  const sortie = resolve(base, 'coloris.html');
  const html = page('Coloris à valider', `<style>td img{width:180px;aspect-ratio:4/3;object-fit:contain;background:#fff}.pastille{width:64px;height:64px;border-radius:12px;border:1px solid #ccc;margin-bottom:4px}.pastille.rond{border-radius:50%}.vide{display:grid;place-items:center}.ech{display:inline-block;width:14px;height:14px;border-radius:3px;margin-right:6px;vertical-align:middle;border:1px solid #ccc}td{vertical-align:middle}</style>
    <p>Pour chaque coloris : la photo du fabricant, les couleurs relevées sur la photo (part de la surface), et la pastille proposée telle qu'elle apparaîtra sur la fiche${famille === 'parapente' ? ' (étiquette à bandes, couleur principale en haut)' : ''}. Vérifiez le nom et les couleurs.</p>
    <table><tr><th></th><th>Photo</th><th>Nom</th><th>Couleurs relevées</th><th>Pastille</th></tr>${lignes}</table>`);
  // Page montrée seulement quand chaque coloris a ses couleurs retenues (pas de page de pastilles vides)
  const pret = liste.every(c => (c.couleurs || []).length);
  pageLocale(sortie, html, pret);
  console.log(pret ? `${liste.length} coloris, page de validation : ${sortie}` : `${liste.length} coloris analysés : choisir les « couleurs » de chacun, puis relancer (la page s'ouvrira alors).`);
  for (const c of liste) console.log(`- ${c.nom} : relevées ${(c.proposees || []).slice(0, 5).map(x => x.hex + ' ' + x.part + '%').join(', ') || 'aucune'} ; retenues ${(c.couleurs || []).join(' ') || 'à choisir'}`);
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
      else if (el.fichier) corps.donnees = readFileSync(resolve(dirname(resolve(chemin)), el.fichier)).toString('base64');
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
  const { brouillon_id, publie_id, ...donneesFiche } = fiche;
  if (publie_id && !brouillon_id) sortir(`Cette fiche est déjà publiée (produit ${publie_id}) : les corrections se font maintenant dans l'administration.`);
  const corps = { ...donneesFiche, essai, confirmer_nouveaux: options.has('--confirmer-nouveaux'), forcer_doublon: options.has('--forcer-doublon'), ...(brouillon_id ? { remplacer: brouillon_id } : {}) };
  const { statut, donnees } = await api('POST', 'brouillon', corps);
  writeFileSync(resolve(dirname(resolve(chemin)), essai ? 'rapport-essai.json' : 'rapport-envoi.json'), JSON.stringify(donnees, null, 1));
  if (statut === 200 && donnees.id) { fiche.brouillon_id = donnees.id; writeFileSync(chemin, JSON.stringify(fiche, null, 1)); }
  console.log(JSON.stringify(donnees, null, 1));
  if (statut === 200 && donnees.id) console.log(`\nBrouillon ${donnees.id}${brouillon_id ? ` (remplace ${brouillon_id})` : ''}\nAperçu : ${donnees.apercu}\nÉdition : ${donnees.edition}`);
  if (statut !== 200) process.exitCode = 1;   // pas de process.exit après fetch : plantage de Node sous Windows
} else if (commande === 'publier') {
  const chemin = positions[0];
  if (!chemin || !existsSync(chemin)) sortir('Usage : publier <fiche.json>');
  const fiche = JSON.parse(readFileSync(chemin, 'utf8'));
  if (!fiche.brouillon_id) sortir("Pas de brouillon dans fiche.json : l'envoyer d'abord.");
  const { statut, donnees } = await api('POST', 'publier', { id: fiche.brouillon_id });
  if (statut !== 200) sortir(`Publication refusée (${statut}) : ${donnees.message || ''}`);
  fiche.publie_id = fiche.brouillon_id; delete fiche.brouillon_id;
  writeFileSync(chemin, JSON.stringify(fiche, null, 1));
  console.log(`Publiée : ${donnees.lien}\nÉdition : ${donnees.edition}`);
} else {
  sortir('Commandes : verifier, referentiel, doublons, planche, coloris, envoyer, publier (voir l\'en-tête de client.mjs).');
}

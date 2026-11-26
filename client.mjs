#!/usr/bin/env node
// Client de la création de fiches assistée (boutique Plaine Altitude). Appelé par la skill « fiche-produit » de Claude Code.
// Réglages : fichier .pa-fiches.json dans le dossier personnel (site, compte, mot de passe d'application). Jamais affichés.
//
//   node client.mjs verifier                               teste la connexion et les droits
//   node client.mjs referentiel <famille> [fichier]        enregistre le référentiel (défaut : referentiel-<famille>.json)
//   node client.mjs doublons "<marque>" "<modele>" [famille]
//   node client.mjs planche <photos.txt> [titre]           page numérotée des photos trouvées (une adresse ou un fichier par
//                                                          ligne, puis une note facultative), ouverte dans le navigateur
//   node client.mjs apercu <fiche.json>                    aperçu complet de la fiche (vente, photos, textes, grille), ouvert
//   node client.mjs envoyer <fiche.json> [--essai] [--confirmer-nouveaux] [--forcer-doublon]
//
// « envoyer » sans --essai envoie d'abord les images et documents pas encore reçus (une requête par fichier), note leur
// identifiant dans fiche.json (une relance ne les renvoie pas), puis crée le brouillon. Le rapport du serveur est gardé dans
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
img.desc{float:right;width:300px;margin:0 0 1rem 1.5rem;border-radius:12px}.description h3{clear:both}
table{border-collapse:collapse;background:#fff}td,th{border:1px solid #ddd;padding:4px 10px;text-align:left}
</style><h1>${esc(titre)}</h1>${corps}</html>`;
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
  writeFileSync(sortie, page(positions[1] || 'Photos trouvées', `<p>Notez les numéros à garder, dans l'ordre voulu (la première sera l'image principale), et celles à mettre dans la description.</p><div class="planche">${cartes}</div>`));
  ouvrir(sortie);
  console.log(`Planche de ${lignes.length} photos : ${sortie}`);
} else if (commande === 'apercu') {
  const chemin = positions[0];
  if (!chemin || !existsSync(chemin)) sortir('Usage : apercu <fiche.json>');
  const base = dirname(resolve(chemin));
  const f = JSON.parse(readFileSync(chemin, 'utf8'));
  const srcImg = im => source(im.url || im.fichier || '', base);
  const desc = String(f.description || '').replace(/\{\{image:(\d+)\}\}/g, (_, n) => { const im = (f.images || [])[n - 1]; return im ? `<img class="desc" src="${esc(srcImg(im))}">` : `<b>[image ${n} introuvable]</b>`; });
  const role = { description: 'Description seulement', les_deux: 'Galerie et description' };
  const photos = (f.images || []).map((im, i) => `<figure><b>${i + 1}</b><img src="${esc(srcImg(im))}"><figcaption>${i === 0 ? 'Image principale' : (role[im.role] || 'Galerie')}${im.coloris ? ' · ' + esc(im.coloris) : ''}</figcaption></figure>`).join('');
  const v = f.vente || {};
  const dec = f.declinaisons || {};
  const tailles = dec.tailles || [];
  const prix = t => (v.prix_par_taille && v.prix_par_taille[t]) || v.prix || '<i>à saisir</i>';
  const dispo = { stock: 'En stock', commande: 'Sur commande' + (v.delai ? ' : ' + esc(v.delai) : ''), bientot: 'Bientôt disponible' + (v.date_arrivee ? ' (' + esc(v.date_arrivee) + ')' : ''), rupture: 'Ni stock ni commande' }[v.disponibilite || 'commande'];
  const vente = `<table><tr><th>Taille</th><th>Prix TTC</th></tr>${(tailles.length ? tailles : ['Prix unique']).map(t => `<tr><td>${esc(t)}</td><td>${prix(t)} €</td></tr>`).join('')}</table>
    <p>Coloris : ${(dec.coloris || []).map(c => esc(c.nom || c)).join(', ') || 'aucun'} · ${dispo} · Tarif public conseillé : ${v.tarif_conseille === false ? 'non' : 'oui'} · Demande de devis : ${v.demande_devis === false ? 'non' : 'oui'}${v.remise_pack ? ' · Remise en pack : ' + esc(v.remise_pack) + ' %' : ''}</p>
    ${(v.stock || []).length ? '<p>Stock : ' + v.stock.map(s => `${esc(s.taille)} ${esc(s.coloris)} : ${esc(s.quantite)}`).join(', ') + '</p>' : ''}
    ${f.remplace && (f.remplace.produits || []).length ? `<p>Remplace les fiches ${esc(f.remplace.produits.join(', '))} (lien « Nouveau modèle » posé à la publication)${(f.remplace.ancien_modele || []).length ? ' ; passées « plus en vente » : ' + esc(f.remplace.ancien_modele.join(', ')) : ''}</p>` : ''}`;
  const t = f.tech || {};
  const nb = (t.tailles || []).length || 1;
  // Libellés des caractéristiques : référentiel de la famille s'il est dans le dossier du produit
  let carac = {};
  try { carac = JSON.parse(readFileSync(resolve(base, `referentiel-${f.famille}.json`), 'utf8')).caracteristiques || {}; } catch { /* clés brutes */ }
  const tech = `<table><tr><th></th>${(t.tailles || []).map(x => `<th>${esc(x)}</th>`).join('')}</tr>${(t.lignes || []).map(l => `<tr><th>${esc(l.libelle || carac[l.carac] || l.carac)}</th>${(l.valeurs || []).length === 1 ? `<td colspan="${nb}">${esc(l.valeurs[0])}</td>` : (l.valeurs || []).map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</table>${(t.autres || []).map(a => `<p>${esc(a.libelle)} : ${esc(a.valeur)}</p>`).join('')}`;
  const liste = (titre, el) => el && el.length ? `<h2>${titre}</h2><ul>${el.join('')}</ul>` : '';
  const corps = `<p class="meta">${esc(f.famille)} · ${esc(f.marque)} · catégories ${esc((f.categories || []).join(', '))}</p>
    <div class="resume">${f.resume || ''}</div>
    <h2>Vente</h2>${vente}
    <h2>Photos, dans l'ordre</h2><div class="planche">${photos}</div>
    <h2>Description (${String(f.description || '').replace(/<[^>]+>/g, '').length} caractères)</h2><div class="description">${desc}</div>
    ${liste('Livré avec', (f.livre_avec || []).map(l => `<li>${esc(l.element)}${l.detail ? ' : ' + esc(l.detail) : ''}</li>`))}
    ${liste('Questions fréquentes', (f.faq || []).map(q => `<li><b>${esc(q.question)}</b><br>${esc(q.reponse)}</li>`))}
    ${liste('Vidéos', (f.videos || []).map(x => `<li>${esc(x.titre)} ${esc(x.lien)}</li>`))}
    ${liste('Documents', (f.documents || []).map(x => `<li>${esc(x.titre)} ${esc(x.url || x.fichier)}</li>`))}
    <h2>Données techniques</h2>${tech}
    <h2>Référencement</h2><p><b>${esc(f.meta_titre)}</b> (${(f.meta_titre || '').length} car.)<br>${esc(f.meta_description)} (${(f.meta_description || '').length} car.)</p>`;
  const sortie = resolve(base, 'apercu.html');
  writeFileSync(sortie, page(f.nom || 'Aperçu', corps));
  ouvrir(sortie);
  console.log(`Aperçu : ${sortie}`);
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
  const corps = { ...fiche, essai, confirmer_nouveaux: options.has('--confirmer-nouveaux'), forcer_doublon: options.has('--forcer-doublon') };
  const { statut, donnees } = await api('POST', 'brouillon', corps);
  writeFileSync(resolve(dirname(resolve(chemin)), essai ? 'rapport-essai.json' : 'rapport-envoi.json'), JSON.stringify(donnees, null, 1));
  console.log(JSON.stringify(donnees, null, 1));
  if (statut !== 200) process.exit(1);
} else {
  sortir('Commandes : verifier, referentiel, doublons, planche, apercu, envoyer (voir l\'en-tête de client.mjs).');
}

/* ── Sezione: Wiki / Guida interattiva ──
 * Domande frequenti con risposta, cercabile.
 * Cliccando "📍 Vai" apre direttamente la sezione di destinazione.
 */

const WIKI_FAQ = [
  // ── Navigazione ──
  {
    cat: 'Navigazione',
    q: 'Come vedo il dettaglio di una singola commessa?',
    a: 'Clicca su una qualsiasi riga di una tabella (in Sedi, Clienti, Corsi, Alert, ecc.). Si apre una finestra di dettaglio (drill-down) con tutti i campi e i KPI di quel gruppo. Da lì puoi continuare a "scavare" per cliente, sede, responsabile, ecc.',
    goto: null
  },
  {
    cat: 'Navigazione',
    q: 'Come apro la commessa in Qnet?',
    a: 'In tutte le tabelle di drill-down c\'è una colonna "Qnet" con un pulsante. Cliccaci sopra e si apre il gestionale Qnet sulla commessa corrispondente in una nuova tab.',
    goto: null
  },
  {
    cat: 'Navigazione',
    q: 'Come cambio tema chiaro/scuro?',
    a: 'In alto a destra c\'è un pulsante tondo con l\'icona ☀️ o 🌙. Clicca per cambiare tema. La scelta si ricorda nel tuo browser.',
    goto: null
  },

  // ── Filtri ──
  {
    cat: 'Filtri',
    q: 'Come filtro per anno (es. solo 2026)?',
    a: 'In alto, sotto l\'header, c\'è il dropdown "Periodo (data inizio)". Selezionalo e scegli "2026" (o un altro anno). Tutta la dashboard si filtra. Per un range personalizzato scegli "Personalizza..." e imposti da-a.',
    goto: null
  },
  {
    cat: 'Filtri',
    q: 'Cosa sono i "Quick Filters" colorati?',
    a: 'Sono filtri preimpostati cliccabili: 🟢 Solo aperte (esclude annullate e concluse), 📅 2026 (solo anno corrente), 💸 Senza incasso (commesse con 0 € incassati), ⚠️ Margine basso (MOL < 5%), 🐢 Stalled (avz < 50% con data fine passata). Clicca per attivarli, X per rimuoverli.',
    goto: null
  },
  {
    cat: 'Filtri',
    q: 'Come tolgo tutti i filtri?',
    a: 'Click sul bottone "Reset" nella barra dei filtri. Resetta sia i filtri MultiSelect (Status, Cliente, Sede, ecc.) sia i Quick Filters sia il Periodo.',
    goto: null
  },

  // ── Economia e Finanziario ──
  {
    cat: 'Economia',
    q: 'Dove vedo i Ricavi totali, MOL e Margine?',
    a: 'Vai in 💰 Finanza → Econ. & Finanziario. Trovi prima il "Budget Commessa" (allineato a Qnet), poi il "Reddituale" (Ricavi, Costi, MOL, Margine %, Ore, €/h).',
    goto: 'econFin'
  },
  {
    cat: 'Economia',
    q: 'Cos\'è il "Budget Commessa allineato a Qnet"?',
    a: 'Sono i tre blocchi del prospetto economico di Qnet: Consuntivo Economico (Ec. Ricavi/Costi/MOL Cons. = totali × % avanzamento), Documentale (quanto è stato fatturato), Finanziario (Fin. Incassi/Uscite/Delta = movimenti di cassa reali).',
    goto: 'econFin'
  },
  {
    cat: 'Economia',
    q: 'Qual è la differenza tra Ricavi e Ec. Ricavi Cons.?',
    a: 'Ricavi = totale teorico della commessa (Importo Consulenza). Ec. Ricavi Cons. = la parte di ricavi già "consuntivata" in base alla % di avanzamento. Esempio: commessa da 10K al 30% → Ricavi=10K, Ec. Ricavi Cons.=3K.',
    goto: 'econFin'
  },

  // ── Incassi ──
  {
    cat: 'Incassi',
    q: 'Come si calcola "Da Incassare (Residuo)"?',
    a: 'È la formula: Ricavi − Già Incassato (mai negativo per commessa). Indica il credito ancora aperto verso il cliente o l\'ente finanziatore.',
    goto: 'econFin'
  },
  {
    cat: 'Incassi',
    q: 'Dove vedo le commesse senza incasso?',
    a: 'Modo veloce: Quick Filter "💸 Senza incasso" in alto. Per il dettaglio: 💰 Finanza → Econ. & Finanziario → blocco "Analisi Incassi & Crediti" → tabella "Top 10 commesse senza incasso" (con età in giorni).',
    goto: 'econFin'
  },
  {
    cat: 'Incassi',
    q: 'Come trovo i clienti più esposti (alto credito aperto)?',
    a: 'Vai in ⚠️ Stato → Alert. La tabella "Clienti a rischio" mostra chi ha esposizione > 50K e % incasso < 30%, ordinati per esposizione.',
    goto: 'alert'
  },
  {
    cat: 'Incassi',
    q: 'Cosa significa "% Incasso"?',
    a: 'È la percentuale di ricavi già incassati: Già Incassato ÷ Ricavi × 100. Esempio: ricavi 10K, incassato 6K → % Incasso = 60%.',
    goto: null
  },

  // ── Alert e anomalie ──
  {
    cat: 'Alert',
    q: 'Cosa vuol dire "Stalled"?',
    a: 'Una commessa è "Stalled" quando l\'avanzamento è ancora sotto il 50% MA la data fine è già passata. Significa che è in ritardo. Le trovi in ⚠️ Stato → Alert → tabella "Stalled" (ordinate per giorni di ritardo).',
    goto: 'alert'
  },
  {
    cat: 'Alert',
    q: 'Dove vedo le commesse in perdita (MOL negativo)?',
    a: 'Modo veloce: in Executive Summary c\'è la card rossa "MOL Negativo". Cliccaci sopra. Oppure ⚠️ Stato → Alert → tabella "Top 10 commesse con MOL negativo".',
    goto: 'alert'
  },

  // ── Analytics ──
  {
    cat: 'Analytics',
    q: 'Dove sono le sedi più performanti?',
    a: 'Vai in 📊 Analytics → Sedi. Trovi grafico con le top 15 per ricavi e tabella completa di tutte le sedi con commesse, ricavi e MOL.',
    goto: 'sedi'
  },
  {
    cat: 'Analytics',
    q: 'Come confronto le regioni tra loro?',
    a: 'In Executive Summary c\'è il grafico "Ricavi per Regione". Oppure imposta il filtro globale "Regione" in alto per filtrare tutta la dashboard su una specifica regione.',
    goto: 'executive'
  },
  {
    cat: 'Analytics',
    q: 'Come vedo l\'andamento nei mesi?',
    a: 'Vai in 📋 Overview → Executive Summary. C\'è un grafico "Trend Ricavi mensile" che mostra gli ultimi 12 mesi rolling.',
    goto: 'executive'
  },
  {
    cat: 'Analytics',
    q: 'Come faccio analisi su più dimensioni insieme (es. Cliente per Regione)?',
    a: 'Vai in 💰 Finanza → Specifica Economica. Scegli uno dei preset di gerarchia (A, B, C, D, E) o costruiscine uno personalizzato. Tutto è espandibile a tree, fino al singolo corso.',
    goto: 'specEcon'
  },

  // ── Partner ──
  {
    cat: 'Partner',
    q: 'Come mando un link a un partner di una sede?',
    a: '(solo admin) Vai in 🔧 Admin → Link Partner. Trovi tutti i 38 link, uno per sede. Click "Copia" sul link che vuoi mandare e incollalo su WhatsApp/email.',
    goto: 'linkPartner'
  },
  {
    cat: 'Partner',
    q: 'Come scrivo il nome del partner accanto al link?',
    a: '(solo admin) In Link Partner, scrivi il nome nel campo "Partner" accanto al link. Si salva automaticamente nel tuo browser. Per averlo su altri PC, clicca "Esporta come file" e committa il JSON sul repo.',
    goto: 'linkPartner'
  },
  {
    cat: 'Partner',
    q: 'Cosa vede un partner col suo link?',
    a: 'Vede la stessa dashboard che vedi tu, ma SOLO con i dati della sua sede. Non può vedere altre sedi, non può modificare niente, non gli serve login.',
    goto: null
  },

  // ── Aggiornamento dati ──
  {
    cat: 'Dati',
    q: 'Come aggiorno la dashboard con un nuovo Excel?',
    a: '(solo admin) Click sul pulsante "📤 Carica Excel" in alto, seleziona il nuovo file. La dashboard si aggiorna in vista. Click "⬇ Scarica JSON e apri GitHub" → ti si scarica il file e si apre GitHub. Su GitHub trascini il file (rinominato in "commesse_for.json") nella cartella data e clicchi "Commit". In 30 secondi il bot 🤖 aggiorna anche tutti i partner automaticamente.',
    goto: null
  },
  {
    cat: 'Dati',
    q: 'Quanto tempo ci vuole prima che i partner vedano i nuovi dati?',
    a: 'Circa 30-60 secondi dopo il commit del JSON su GitHub. Un bot automatico (GitHub Action) rigenera tutti i dati partner e li pubblica.',
    goto: null
  }
];

let _wikiFilter = '';
let _wikiCat = '';

function renderWiki() {
  const el = document.getElementById('sec-wiki');
  if (!el) return;

  const cats = [...new Set(WIKI_FAQ.map(f => f.cat))];

  let h = '<div class="sec"><h3 class="sec-title">❓ Wiki &mdash; Trova rapidamente quello che cerchi</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Scrivi una parola chiave per cercare (es. "incasso", "MOL", "anno", "partner") o naviga per categoria. Click su una domanda per aprire la risposta.</p>';

  // Search box
  h += '<div class="card" style="margin-bottom:14px;padding:14px">';
  h += '<input type="text" id="wikiSearch" placeholder="🔍 Scrivi una parola chiave..." value="' + (_wikiFilter || '').replace(/"/g, '&quot;') + '" ';
  h += 'style="width:100%;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);color:var(--text);border-radius:6px;font-size:14px;outline:none" ';
  h += 'oninput="_wikiOnSearch(this.value)">';

  // Category chips
  h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">';
  h += '<button class="qf-btn' + (!_wikiCat ? ' active' : '') + '" onclick="_wikiSetCat(\'\')">Tutte</button>';
  cats.forEach(c => {
    h += '<button class="qf-btn' + (_wikiCat === c ? ' active' : '') + '" onclick="_wikiSetCat(\'' + c + '\')">' + c + '</button>';
  });
  h += '</div>';
  h += '</div>';

  // FAQ list
  const filter = (_wikiFilter || '').toLowerCase().trim();
  const filtered = WIKI_FAQ.filter(f => {
    if (_wikiCat && f.cat !== _wikiCat) return false;
    if (filter) {
      const hay = (f.cat + ' ' + f.q + ' ' + f.a).toLowerCase();
      return hay.includes(filter);
    }
    return true;
  });

  if (!filtered.length) {
    h += '<div class="card" style="padding:20px;text-align:center;color:var(--text2)">Nessuna domanda corrisponde a "' + filter + '". Prova con un\'altra parola.</div>';
  } else {
    h += '<div class="card" style="padding:6px 0">';
    filtered.forEach((f, idx) => {
      const qid = 'wq_' + idx;
      h += '<details style="border-bottom:1px solid var(--border);padding:12px 18px" ' + (filter && filter.length >= 3 ? 'open' : '') + '>';
      h += '<summary style="cursor:pointer;font-weight:600;font-size:13px;color:var(--text);outline:none;list-style:none;display:flex;align-items:center;gap:8px">';
      h += '<span style="color:#6366f1;font-size:11px;font-weight:700;background:rgba(99,102,241,.12);padding:2px 8px;border-radius:10px;flex-shrink:0">' + f.cat + '</span>';
      h += '<span>' + f.q + '</span>';
      h += '</summary>';
      h += '<div style="margin-top:10px;color:var(--text2);font-size:12px;line-height:1.6;padding-left:4px">';
      h += f.a;
      if (f.goto) {
        h += '<div style="margin-top:10px"><button class="btn-erp" onclick="event.preventDefault();showSec(\'' + f.goto + '\')">📍 Vai a questa sezione</button></div>';
      }
      h += '</div>';
      h += '</details>';
    });
    h += '</div>';
  }

  h += '<p style="color:var(--text3);font-size:11px;margin-top:14px;text-align:center">Non trovi quello che cerchi? Scrivi al tuo referente.</p>';
  h += '</div>';

  el.innerHTML = h;
}

function _wikiOnSearch(v) {
  _wikiFilter = v;
  renderWiki();
  // Mantieni il focus sull'input
  setTimeout(() => {
    const inp = document.getElementById('wikiSearch');
    if (inp) {
      inp.focus();
      inp.setSelectionRange(inp.value.length, inp.value.length);
    }
  }, 10);
}

function _wikiSetCat(c) {
  _wikiCat = c;
  renderWiki();
}

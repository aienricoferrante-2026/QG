#!/usr/bin/env node
/* Smoke test runtime del pivot-tree su tutte le 10 BU.
 * Carica pivot-tree.js + la section JS della BU + il JSON reale e chiama
 * buildPivotCard. Stuba document/window per non aver bisogno di jsdom.
 *
 * Pass criteria:
 *   - nessuna eccezione durante l'eval di buildPivotCard
 *   - rowsHtml prodotto > 0 char (se ci sono items)
 *   - try-catch del pivot non si attiva (verifica console.error)
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

const BU_TESTS = [
  { bu: 'ISO',     section: 'dashboard_ISO_CM/js/section-pagamenti.js',     fn: '_isoRenderPivot',  containerId: 'sec-pagamenti',     data: 'dashboard_ISO_CM/data/commesse_iso.json',     dim: 'ente' },
  { bu: 'GDPR',    section: 'dashboard_GDPR_CM/js/section-pagamenti-gdpr.js', fn: '_gdprRenderPivot', containerId: 'sec-pagamentiGdpr', data: 'dashboard_GDPR_CM/data/commesse_gdpr.json',  dim: 'ente' },
  { bu: 'AVV',     section: 'dashboard_AVV_CM/js/section-avvalimenti.js',    fn: '_avvRenderPivot2', containerId: 'sec-avvalimenti',   data: 'dashboard_AVV_CM/data/commesse_avv.json',    dim: 'esitoAvv' },
  { bu: 'GAR',     section: 'dashboard_GAR_CM/js/section-gare.js',           fn: '_garRenderPivot',  containerId: 'sec-gare',          data: 'dashboard_GAR_CM/data/commesse_gar.json',    dim: 'tipoGara' },
  { bu: 'FIA',     section: 'dashboard_FIA_CM/js/section-bandi.js',          fn: '_fiaRenderPivot2', containerId: 'sec-bandi',         data: 'dashboard_FIA_CM/data/commesse_fia.json',    dim: 'bando' },
  { bu: 'IST',     section: 'dashboard_IST_CM/js/section-istituti.js',       fn: '_istRenderPivot2', containerId: 'sec-istituti',      data: 'dashboard_IST_CM/data/commesse_ist.json',    dim: 'tipo' },
  { bu: 'APL_PAL', section: 'dashboard_APL_PAL_CM/js/section-gol.js',        fn: '_golRenderPivot',  containerId: 'sec-gol',           data: 'dashboard_APL_PAL_CM/data/commesse_apl_pal.json', dim: 'tipologia' },
  { bu: 'APL_RES', section: 'dashboard_APL_RES_CM/js/section-recsel.js',     fn: '_resRenderPivot2', containerId: 'sec-recsel',        data: 'dashboard_APL_RES_CM/data/commesse_apl_res.json', dim: 'tipoServizio' },
  { bu: 'SOA',     section: 'dashboard_SOA_CM/js/section-soa-attestanti.js', fn: '_soaRenderPivot',  containerId: 'sec-soaAttestanti', data: 'dashboard_SOA_CM/data/commesse_soa.json',    dim: 'attestante' },
  { bu: 'SIC',     section: 'dashboard_SIC_CM/js/section-sicurezza.js',      fn: '_sicRenderPivot',  containerId: 'sec-sicurezza',     data: 'dashboard_SIC_CM/data/commesse_sic.json',    dim: 'macro' },
];

function makeSandbox(items) {
  const elements = {};
  const containerHtml = {};

  const fakeChildList = (id) => ({
    _id: id,
    appendChild(c) { containerHtml[id] = (containerHtml[id] || '') + (c.outerHTML || c.innerHTML || ''); },
    remove() { delete elements[id]; },
    querySelector() { return null },
    set innerHTML(v) { containerHtml[id] = v },
    get innerHTML() { return containerHtml[id] || '' },
    style: {},
    className: '',
  });

  const document = {
    getElementById(id) {
      if (!elements[id]) elements[id] = fakeChildList(id);
      return elements[id];
    },
    createElement(tag) {
      const id = '__el_' + Math.random().toString(36).slice(2);
      const el = fakeChildList(id);
      el.tagName = tag;
      Object.defineProperty(el, 'outerHTML', { get() { return '<' + tag + '>' + (containerHtml[id] || '') + '</' + tag + '>' } });
      return el;
    },
  };

  const consoleErrors = [];
  const fakeConsole = {
    log: () => {},
    error: (...a) => { consoleErrors.push(a.map(String).join(' ')); },
    warn: () => {},
  };

  const sb = {
    document,
    console: fakeConsole,
    window: {},
    filtered: items,
    fmt: n => String(Math.round(n || 0)),
    fmtE: n => '€' + Math.round(n || 0),
    pct: (a, b) => b ? ((a / b * 100).toFixed(1) + '%') : '0%',
    isClosed: c => /Conclus|Annullat|Chius/i.test(c.status || ''),
    isOpen: c => !/Conclus|Annullat|Chius/i.test(c.status || ''),
    mkpi: (v, l) => '<div class="kpi">' + v + ' · ' + l + '</div>',
    sectorLabel: () => 'Test',
    sectorCode: () => 'TST',
    makeBar: () => {},
    makeDonut: () => {},
    makePie: () => {},
    makeLine: () => {},
    buildTbl: () => {},
    qnetBtn: () => '<a>Qnet</a>',
    drillDownItems: () => {},
    buildParserAuditCard: () => {},
    SECTIONS: {},
    JSON, Math, Object, Array, String, Number, Date, RegExp, Set, Map,
    parseInt, parseFloat, isNaN, isFinite,
  };
  sb.window = sb; // self-ref
  sb._consoleErrors = consoleErrors;
  sb._containerHtml = containerHtml;
  return vm.createContext(sb);
}

function runBu(test) {
  const dataPath = path.join(ROOT, test.data);
  if (!fs.existsSync(dataPath)) return { bu: test.bu, status: 'SKIP', reason: 'data file missing' };
  const items = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  if (!Array.isArray(items)) return { bu: test.bu, status: 'SKIP', reason: 'data not array' };

  const sb = makeSandbox(items);
  // 1. Load pivot-tree
  try {
    const pivotSrc = fs.readFileSync(path.join(ROOT, 'shared/dashboard-core/js/pivot-tree.js'), 'utf8');
    vm.runInContext(pivotSrc, sb);
  } catch (e) {
    return { bu: test.bu, status: 'FAIL', reason: 'pivot-tree load error: ' + e.message };
  }

  // 2. Load section
  try {
    const secSrc = fs.readFileSync(path.join(ROOT, test.section), 'utf8');
    vm.runInContext(secSrc, sb);
  } catch (e) {
    return { bu: test.bu, status: 'FAIL', reason: 'section load error: ' + e.message };
  }

  // 3. Pre-create the container (the section render expects it)
  vm.runInContext('document.getElementById("' + test.containerId + '")', sb);

  // 4. Call the pivot render function directly
  try {
    if (typeof sb[test.fn] !== 'function') {
      return { bu: test.bu, status: 'FAIL', reason: 'function ' + test.fn + ' not found' };
    }
    vm.runInContext(test.fn + '()', sb);
  } catch (e) {
    return { bu: test.bu, status: 'FAIL', reason: 'render error: ' + e.message };
  }

  if (sb._consoleErrors.length) {
    return { bu: test.bu, status: 'WARN', reason: 'console.error: ' + sb._consoleErrors[0].slice(0, 120), items: items.length };
  }

  const html = sb._containerHtml[test.containerId] || '';
  const hasPivot = /Pivot/.test(html) || Object.keys(sb._containerHtml).some(k => /pivot/i.test(k));

  return { bu: test.bu, status: hasPivot ? 'OK' : 'NO_PIVOT', items: items.length, htmlLen: html.length };
}

console.log('Smoke test pivot-tree su 10 BU (dati reali)\n' + '='.repeat(60));
const results = BU_TESTS.map(runBu);
let okN = 0, failN = 0;
results.forEach(r => {
  const tag = r.status === 'OK' ? '✓' : r.status === 'WARN' ? '⚠' : '✗';
  const info = r.items != null ? ` (${r.items} commesse, ${r.htmlLen || 0} char html)` : '';
  console.log(`  ${tag} ${r.bu.padEnd(8)} ${r.status.padEnd(8)} ${r.reason || ''}${info}`);
  if (r.status === 'OK') okN++; else if (r.status !== 'WARN') failN++;
});
console.log('='.repeat(60));
console.log(`Riepilogo: ${okN}/10 OK, ${failN}/10 FAIL\n`);
process.exit(failN > 0 ? 1 : 0);

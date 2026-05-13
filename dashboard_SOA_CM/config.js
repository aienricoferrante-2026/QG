/* SECTOR_CONFIG — Settore SOA — Attestazioni SOA
 * Dashboard sul kit condiviso `shared/dashboard-core/` con sezioni
 * SOA-specifiche locali (Caso 2 della governance).
 *
 * Sezioni SOA-specifiche (fork interno alla BU):
 *  - soaAttestanti  → analytics su SOA Attestante
 *  - entiCert9001   → analytics su Ente Certificazione 9001
 *  - consorzio      → analytics su appartenenza/nome Consorzio
 *  - firmaContratto → stato firma contratto (Data Firma Contratto)
 *  - aggSettimanale → review aggiornamenti settimanali
 */
window.SECTOR_CONFIG = {
  code: 'SOA',
  label: 'Attestazioni SOA',
  icon: '🏗️',
  color: '#f59e0b',
  dataFile: 'data/commesse_soa.json',
  adminEmail: 'soa@qualificagroup.it',
  adminPassHash: 'd28673a3e666f6fc7d128e35a08e3395a639e7c7d3263cf7fed1f653850efa91',
  defaultSection: 'explore',
  partnersJsonUrl: 'partners_soa/_links.json',
  partnersBaseUrl: 'partners_soa/view.html',
  targetsFile: 'data/targets.json',

  /* Drill-down: oltre ai default aggiungiamo i campi SOA. */
  drillFields: [
    { key: 'sedeNorm',      label: 'Sede' },
    { key: 'sedeOp',        label: 'Sede Operativa' },
    { key: 'cliente',       label: 'Cliente' },
    { key: 'regione',       label: 'Regione' },
    { key: 'responsabile',  label: 'Responsabile' },
    { key: 'societa',       label: 'Societa' },
    { key: 'status',        label: 'Status' },
    { key: 'statoLav',      label: 'Stato Lavorazione' },
    { key: 'soaAttestante', label: 'SOA Attestante' },
    { key: 'enteCert9001',  label: 'Ente Cert. 9001' },
    { key: 'consorzio',     label: 'Consorzio' },
    { key: 'agente',        label: 'Commerciale' }
  ],

  /* Quick filters: default + uno SOA-specifico per la firma pendente.
     "inLav" è il filtro sticky introdotto in Tappa 1 Performance. */
  quickFilters: [
    { name: 'inLav', label: '⚙️ Solo in lavorazione', title: 'Status contiene "Lavorazione" (case-insensitive). Es. "In Lavorazione".',
      predicate: c => /lavorazione/i.test(c.status || '') },
    { name: 'open',  label: '🟢 Solo aperte', title: 'Esclude commesse Annullate o Chiuse',
      predicate: c => typeof isOpen === 'function' ? isOpen(c) : (c.status !== 'Annullato' && c.status !== 'Concluso' && c.status !== 'Chiusa') },
    { name: 'year',  label: '📅 ' + new Date().getFullYear(), title: 'Solo commesse iniziate nell\'anno corrente',
      predicate: c => {
        const yy = String(new Date().getFullYear());
        return (c.dataInizio || c.dataPianInizio || '').endsWith('-' + yy)
            || (c.dataInizio || c.dataPianInizio || '').endsWith('/' + yy);
      } },
    { name: 'thisMonth', label: '🗓️ Questo mese', title: 'Data inizio dentro al mese corrente',
      predicate: c => {
        const d = (typeof _qfStart === 'function') ? _qfStart(c) : null;
        if (!d) return false;
        const now = new Date();
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      } },
    { name: 'lastMonth', label: '⬅️ Mese scorso', title: 'Data inizio dentro al mese precedente',
      predicate: c => {
        const d = (typeof _qfStart === 'function') ? _qfStart(c) : null;
        if (!d) return false;
        const now = new Date();
        const ref = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
      } },
    { name: 'lastQuarter', label: '📈 Ultimo trimestre', title: 'Data inizio negli ultimi 90 giorni',
      predicate: c => {
        const d = (typeof _qfStart === 'function') ? _qfStart(c) : null;
        if (!d) return false;
        const now = new Date();
        const from = new Date(now); from.setDate(from.getDate() - 90);
        return d >= from && d <= now;
      } },
    { name: 'noFirma', label: '✍️ Firma mancante', title: 'Commesse aperte senza Data Firma Contratto',
      predicate: c => (typeof isOpen === 'function' ? isOpen(c) : true) && !(c.dataFirmaContratto || '').trim() },
    { name: 'noincasso', label: '💸 Senza incasso', title: 'Già Incassato a 0 e ricavi > 0',
      predicate: c => (c.giaIncassato || 0) === 0 && (c.consulenza || 0) > 0 },
    { name: 'stalled', label: '🐢 Stalled', title: 'Avz. < 50% e data fine già passata',
      predicate: c => {
        if ((c.avanzamento || 0) >= 50 || !c.dataFine) return false;
        const m = String(c.dataFine).match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
        if (!m) return false;
        const fine = new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
        return fine < new Date();
      } }
  ],

  /* Sezioni: base del kit + 5 SOA-specifiche caricate dai file locali js/section-soa-*.js. */
  sections: {
    executive:      () => typeof renderExecutive       === 'function' && renderExecutive(),
    ricavi:         () => typeof renderRicavi          === 'function' && renderRicavi(),
    econFin:        () => typeof renderEconFin         === 'function' && renderEconFin(),
    analisiIncassi: () => typeof renderAnalisiIncassi  === 'function' && renderAnalisiIncassi(),
    responsabili:   () => typeof renderResponsabili    === 'function' && renderResponsabili(),
    clienti:        () => typeof renderClienti         === 'function' && renderClienti(),
    sedi:           () => typeof renderSedi            === 'function' && renderSedi(),
    avanzamento:    () => typeof renderAvanzamento     === 'function' && renderAvanzamento(),
    alert:          () => typeof renderAlert           === 'function' && renderAlert(),
    linkPartner:    () => typeof renderLinkPartner     === 'function' && renderLinkPartner(),
    explore:        () => typeof renderExplore         === 'function' && renderExplore(),
    soaAttestanti:  () => typeof renderSoaAttestanti   === 'function' && renderSoaAttestanti(),
    entiCert9001:   () => typeof renderEntiCert9001    === 'function' && renderEntiCert9001(),
    consorzio:      () => typeof renderConsorzio       === 'function' && renderConsorzio(),
    firmaContratto: () => typeof renderFirmaContratto  === 'function' && renderFirmaContratto(),
    aggSettimanale: () => typeof renderAggSettimanale  === 'function' && renderAggSettimanale()
  }
};

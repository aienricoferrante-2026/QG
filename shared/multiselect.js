/**
 * Multi-Select Filter Component - Qualifica Group Dashboards
 * Replaces standard <select> dropdowns with multi-select checkbox panels.
 *
 * Usage:
 *   1. Include this script: <script src="../shared/multiselect.js"></script>
 *   2. Replace <select id="fXxx"> with <div class="ms-wrap" id="fXxx"></div>
 *   3. Call: MultiSelect.create('fXxx', optionsArray, 'Tutti')
 *   4. Read selected: MultiSelect.getSelected('fXxx') → Set (empty = all)
 *   5. Check membership: MultiSelect.matches('fXxx', value) → boolean
 *   6. Reset all: MultiSelect.resetAll()
 */
(function () {
  const _state = {};

  function injectCSS() {
    if (document.getElementById('ms-styles')) return;
    const style = document.createElement('style');
    style.id = 'ms-styles';
    style.textContent = `
.ms-wrap{position:relative;min-width:170px}
.ms-btn{background:var(--card,#1e293b);border:1px solid var(--border,#475569);color:var(--text,#f1f5f9);padding:8px 12px;border-radius:8px;font-size:.85rem;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:6px;width:100%;text-align:left;min-height:37px}
.ms-btn:hover,.ms-btn.open{border-color:var(--accent,#3b82f6)}
.ms-btn .ms-arrow{font-size:.6rem;color:var(--text2,#94a3b8);transition:transform .2s}
.ms-btn.open .ms-arrow{transform:rotate(180deg)}
.ms-btn .ms-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
.ms-badge-count{background:var(--accent,#3b82f6);color:#fff;font-size:.65rem;font-weight:700;padding:1px 6px;border-radius:10px;min-width:18px;text-align:center}
.ms-panel{position:absolute;top:calc(100% + 4px);left:0;min-width:240px;background:var(--card,#1e293b);border:1px solid var(--border,#475569);border-radius:8px;z-index:100;display:none;max-height:280px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.4);flex-direction:column}
.ms-panel.show{display:flex}
.ms-search{background:var(--card2,#334155);border:none;border-bottom:1px solid var(--border,#475569);color:var(--text,#f1f5f9);padding:8px 12px;font-size:.82rem;outline:none;width:100%}
.ms-list{overflow-y:auto;flex:1;padding:4px 0}
.ms-item{display:flex;align-items:center;gap:8px;padding:6px 12px;cursor:pointer;font-size:.82rem;color:var(--text,#f1f5f9)}
.ms-item:hover{background:rgba(59,130,246,.1)}
.ms-item input[type=checkbox]{accent-color:var(--accent,#3b82f6);width:15px;height:15px;cursor:pointer;flex-shrink:0}
.ms-item span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ms-item .ms-count{color:var(--text2,#94a3b8);font-size:.72rem;margin-left:auto;flex-shrink:0}
.ms-actions{display:flex;border-top:1px solid var(--border,#475569);padding:6px 8px;gap:6px}
.ms-actions button{flex:1;background:var(--card2,#334155);border:1px solid var(--border,#475569);color:var(--text2,#94a3b8);padding:4px 8px;border-radius:6px;font-size:.72rem;cursor:pointer}
.ms-actions button:hover{color:var(--text,#f1f5f9);border-color:var(--accent,#3b82f6)}
`;
    document.head.appendChild(style);
  }

  function closeAll() {
    document.querySelectorAll('.ms-panel.show').forEach(p => p.classList.remove('show'));
    document.querySelectorAll('.ms-btn.open').forEach(b => b.classList.remove('open'));
  }

  /**
   * Create a multi-select dropdown.
   * @param {string} id - DOM element id of the .ms-wrap container
   * @param {Array} options - array of option values (strings or numbers)
   * @param {string} placeholder - text when nothing selected (e.g. "Tutti", "Tutte")
   * @param {object} [opts] - optional config
   * @param {function} [opts.onChange] - callback after selection changes
   * @param {function} [opts.countFn] - function(value) returning count to display, or null
   */
  function create(id, options, placeholder, opts) {
    injectCSS();
    opts = opts || {};
    const wrap = document.getElementById(id);
    if (!wrap) return;
    wrap.innerHTML = '';
    _state[id] = new Set();

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ms-btn';
    btn.innerHTML = `<span class="ms-text">${placeholder}</span><span class="ms-arrow">&#9660;</span>`;

    const panel = document.createElement('div');
    panel.className = 'ms-panel';

    const search = document.createElement('input');
    search.className = 'ms-search';
    search.placeholder = 'Cerca...';

    const list = document.createElement('div');
    list.className = 'ms-list';

    const actions = document.createElement('div');
    actions.className = 'ms-actions';
    const btnAll = document.createElement('button');
    btnAll.textContent = 'Seleziona tutti';
    const btnNone = document.createElement('button');
    btnNone.textContent = 'Deseleziona';
    actions.append(btnAll, btnNone);

    panel.append(search, list, actions);
    wrap.append(btn, panel);

    // Store references for dynamic updates
    wrap._ms = { btn, panel, search, list, options, placeholder, opts };

    function renderList(filter) {
      list.innerHTML = '';
      const f = filter ? filter.toLowerCase() : '';
      options.forEach(v => {
        const vStr = String(v);
        if (f && !vStr.toLowerCase().includes(f)) return;
        const item = document.createElement('label');
        item.className = 'ms-item';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = _state[id].has(v);
        const sp = document.createElement('span');
        const displayText = vStr.length > 40 ? vStr.substring(0, 38) + '..' : vStr;
        sp.textContent = displayText;
        sp.title = vStr;
        item.append(cb, sp);
        if (opts.countFn) {
          const cnt = opts.countFn(v);
          if (cnt !== null && cnt !== undefined) {
            const cntSpan = document.createElement('span');
            cntSpan.className = 'ms-count';
            cntSpan.textContent = '(' + cnt + ')';
            item.appendChild(cntSpan);
          }
        }
        cb.addEventListener('change', () => {
          if (cb.checked) _state[id].add(v); else _state[id].delete(v);
          updateBtn();
          if (opts.onChange) opts.onChange();
        });
        list.appendChild(item);
      });
    }

    function updateBtn() {
      const n = _state[id].size;
      if (n === 0)
        btn.innerHTML = `<span class="ms-text">${placeholder}</span><span class="ms-arrow">&#9660;</span>`;
      else if (n === 1)
        btn.innerHTML = `<span class="ms-text">${[..._state[id]][0]}</span><span class="ms-badge-count">1</span><span class="ms-arrow">&#9660;</span>`;
      else
        btn.innerHTML = `<span class="ms-text">${n} selezionati</span><span class="ms-badge-count">${n}</span><span class="ms-arrow">&#9660;</span>`;
      if (panel.classList.contains('show')) btn.classList.add('open');
      else btn.classList.remove('open');
    }

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = panel.classList.contains('show');
      closeAll();
      if (!isOpen) {
        panel.classList.add('show');
        btn.classList.add('open');
        search.value = '';
        renderList('');
        search.focus();
      }
    });

    search.addEventListener('input', () => renderList(search.value));
    search.addEventListener('click', e => e.stopPropagation());
    panel.addEventListener('click', e => e.stopPropagation());
    btnAll.addEventListener('click', () => {
      options.forEach(v => _state[id].add(v));
      renderList(search.value);
      updateBtn();
      if (opts.onChange) opts.onChange();
    });
    btnNone.addEventListener('click', () => {
      _state[id].clear();
      renderList(search.value);
      updateBtn();
      if (opts.onChange) opts.onChange();
    });

    renderList('');
  }

  /** Get selected values as a Set. Empty set means "all" (no filter). */
  function getSelected(id) {
    return _state[id] || new Set();
  }

  /** Check if a value matches the filter (true if nothing selected OR value is in set). */
  function matches(id, value) {
    const s = _state[id];
    return !s || s.size === 0 || s.has(value);
  }

  /** Reset all multi-selects. */
  function resetAll() {
    Object.keys(_state).forEach(id => {
      _state[id].clear();
      const wrap = document.getElementById(id);
      if (!wrap || !wrap._ms) return;
      const { btn, placeholder, list } = wrap._ms;
      btn.innerHTML = `<span class="ms-text">${placeholder}</span><span class="ms-arrow">&#9660;</span>`;
      if (list) list.querySelectorAll('input[type=checkbox]').forEach(cb => { cb.checked = false; });
    });
  }

  /** Reset a single multi-select. */
  function reset(id) {
    if (!_state[id]) return;
    _state[id].clear();
    const wrap = document.getElementById(id);
    if (!wrap || !wrap._ms) return;
    const { btn, placeholder, list } = wrap._ms;
    btn.innerHTML = `<span class="ms-text">${placeholder}</span><span class="ms-arrow">&#9660;</span>`;
    if (list) list.querySelectorAll('input[type=checkbox]').forEach(cb => { cb.checked = false; });
  }

  /** Update options and counts dynamically (for rebuildFilterCounts). */
  function updateOptions(id, options, countFn) {
    const wrap = document.getElementById(id);
    if (!wrap || !wrap._ms) return;
    wrap._ms.options = options;
    if (countFn) wrap._ms.opts.countFn = countFn;
    // Re-render list if panel is open
    const panel = wrap._ms.panel;
    if (panel.classList.contains('show')) {
      const search = wrap._ms.search;
      const list = wrap._ms.list;
      list.innerHTML = '';
      const f = search.value ? search.value.toLowerCase() : '';
      options.forEach(v => {
        const vStr = String(v);
        if (f && !vStr.toLowerCase().includes(f)) return;
        const item = document.createElement('label');
        item.className = 'ms-item';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = _state[id].has(v);
        const sp = document.createElement('span');
        const displayText = vStr.length > 40 ? vStr.substring(0, 38) + '..' : vStr;
        sp.textContent = displayText;
        sp.title = vStr;
        item.append(cb, sp);
        if (countFn) {
          const cnt = countFn(v);
          if (cnt !== null && cnt !== undefined) {
            const cntSpan = document.createElement('span');
            cntSpan.className = 'ms-count';
            cntSpan.textContent = '(' + cnt + ')';
            item.appendChild(cntSpan);
          }
        }
        cb.addEventListener('change', () => {
          if (cb.checked) _state[id].add(v); else _state[id].delete(v);
          const btn = wrap._ms.btn;
          const n = _state[id].size;
          const placeholder = wrap._ms.placeholder;
          if (n === 0)
            btn.innerHTML = `<span class="ms-text">${placeholder}</span><span class="ms-arrow">&#9660;</span>`;
          else if (n === 1)
            btn.innerHTML = `<span class="ms-text">${[..._state[id]][0]}</span><span class="ms-badge-count">1</span><span class="ms-arrow">&#9660;</span>`;
          else
            btn.innerHTML = `<span class="ms-text">${n} selezionati</span><span class="ms-badge-count">${n}</span><span class="ms-arrow">&#9660;</span>`;
          if (wrap._ms.opts.onChange) wrap._ms.opts.onChange();
        });
        list.appendChild(item);
      });
    }
    // Remove stale selections
    _state[id].forEach(v => { if (!options.includes(v)) _state[id].delete(v); });
  }

  // Close panels on outside click
  document.addEventListener('click', closeAll);

  window.MultiSelect = { create, getSelected, matches, reset, resetAll, updateOptions };
})();

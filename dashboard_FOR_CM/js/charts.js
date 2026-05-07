/* ── Chart Helpers ── */

const CHART_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16','#f97316','#6366f1'];
const STATUS_COLORS = { 'Eseguito': '#10b981', 'Pianificato': '#3b82f6', 'Da pianificare': '#f59e0b', 'Annullato': '#ef4444' };
const CORSO_COLORS = { 'Concluso': '#10b981', 'In corso': '#06b6d4', 'Fine Corso (Attesa nulla osta)': '#8b5cf6', 'In partenza': '#f59e0b' };

const _charts = {};

/* Tick / grid / tooltip colors adattivi al tema. Letti dalle CSS variables. */
function _chartTick() {
  return document.body.classList.contains('theme-light') ? '#475569' : '#94a3b8';
}
function _chartTick2() {
  return document.body.classList.contains('theme-light') ? '#64748b' : '#64748b';
}
function _chartGrid() {
  return document.body.classList.contains('theme-light') ? 'rgba(15,23,42,.08)' : 'rgba(71,85,105,.2)';
}
function _chartTooltipBg() {
  return document.body.classList.contains('theme-light') ? '#ffffff' : '#1e293b';
}
function _chartTooltipText() {
  return document.body.classList.contains('theme-light') ? '#0f172a' : '#f1f5f9';
}

function cOpts() {
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: _chartTooltipBg(), titleColor: _chartTooltipText(), bodyColor: _chartTick(),
        borderColor: '#475569', borderWidth: 1, padding: 10
      }
    }
  };
}

function makeDonut(id, labels, data, colors) {
  if (_charts[id]) _charts[id].destroy();
  _charts[id] = new Chart(document.getElementById(id), {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }] },
    options: {
      ...cOpts(), cutout: '65%',
      plugins: {
        legend: { display: true, position: 'right', labels: { color: _chartTick(), font: { size: 10 }, padding: 6, usePointStyle: true } },
        tooltip: { callbacks: { label: ctx => fmt(ctx.raw) + ' (' + pct(ctx.raw, data.reduce((a, b) => a + b, 0)) + ')' } }
      }
    }
  });
}

function makeBar(id, labels, data, color, horiz) {
  if (_charts[id]) _charts[id].destroy();
  _charts[id] = new Chart(document.getElementById(id), {
    type: 'bar',
    data: { labels, datasets: [{ data, backgroundColor: (color || '#3b82f6') + 'cc', borderRadius: 4, barPercentage: .6 }] },
    options: {
      ...cOpts(),
      indexAxis: horiz ? 'y' : 'x',
      scales: {
        x: { ticks: { color: _chartTick2(), font: { size: 9 }, callback: v => horiz ? fmtK(v) : v }, grid: { color: horiz ? _chartGrid() : 'transparent' } },
        y: { ticks: { color: _chartTick(), font: { size: 9 }, callback: v => horiz ? v : fmtK(v) }, grid: { color: horiz ? 'transparent' : _chartGrid() } }
      }
    }
  });
}

function makeBarStacked(id, labels, datasets) {
  if (_charts[id]) _charts[id].destroy();
  _charts[id] = new Chart(document.getElementById(id), {
    type: 'bar',
    data: { labels, datasets },
    options: {
      ...cOpts(),
      scales: {
        x: { stacked: true, ticks: { color: _chartTick(), font: { size: 9 } }, grid: { display: false } },
        y: { stacked: true, ticks: { color: _chartTick2(), callback: v => fmtK(v) }, grid: { color: _chartGrid() } }
      },
      plugins: {
        legend: { display: true, position: 'top', labels: { color: _chartTick(), font: { size: 10 }, usePointStyle: true, padding: 10 } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtE(ctx.raw) } }
      }
    }
  });
}

function makeLine(id, labels, data, color) {
  if (_charts[id]) _charts[id].destroy();
  _charts[id] = new Chart(document.getElementById(id), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data, borderColor: color || '#3b82f6',
        backgroundColor: (color || '#3b82f6') + '1a',
        fill: true, tension: .3, pointRadius: 3
      }]
    },
    options: {
      ...cOpts(),
      scales: {
        x: { ticks: { color: _chartTick(), font: { size: 9 }, maxRotation: 45 }, grid: { display: false } },
        y: { ticks: { color: _chartTick2(), callback: v => fmtK(v) }, grid: { color: _chartGrid() } }
      }
    }
  });
}

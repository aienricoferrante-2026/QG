/* ── Chart Helpers ── */

const CHART_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16','#f97316','#6366f1'];
const STATUS_COLORS = { 'Offerta Contrattualizzata': '#10b981', 'Offerta Accettata': '#3b82f6', 'Accettata dal Cliente': '#8b5cf6', 'Offerta Presentata': '#f59e0b', 'Offerta Rifiutata': '#ef4444' };

const _charts = {};

function cOpts() {
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8',
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
        legend: { display: true, position: 'right', labels: { color: '#94a3b8', font: { size: 10 }, padding: 6, usePointStyle: true } },
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
        x: { ticks: { color: '#64748b', font: { size: 9 }, callback: v => horiz ? fmtK(v) : v }, grid: { color: horiz ? 'rgba(71,85,105,.2)' : 'transparent' } },
        y: { ticks: { color: '#94a3b8', font: { size: 9 }, callback: v => horiz ? v : fmtK(v) }, grid: { color: horiz ? 'transparent' : 'rgba(71,85,105,.2)' } }
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
        x: { stacked: true, ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { display: false } },
        y: { stacked: true, ticks: { color: '#64748b', callback: v => fmt(v) }, grid: { color: 'rgba(71,85,105,.2)' } }
      },
      plugins: {
        legend: { display: true, position: 'top', labels: { color: '#94a3b8', font: { size: 10 }, usePointStyle: true, padding: 10 } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw) } }
      }
    }
  });
}

function makeLine(id, labels, data, color) {
  if (_charts[id]) _charts[id].destroy();
  _charts[id] = new Chart(document.getElementById(id), {
    type: 'line',
    data: { labels, datasets: [{ data, borderColor: color || '#3b82f6', backgroundColor: (color || '#3b82f6') + '1a', fill: true, tension: .3, pointRadius: 3 }] },
    options: {
      ...cOpts(),
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 9 }, maxRotation: 45 }, grid: { display: false } },
        y: { ticks: { color: '#64748b', callback: v => fmtK(v) }, grid: { color: 'rgba(71,85,105,.2)' } }
      }
    }
  });
}

function makeBarConv(id, labels, values) {
  if (_charts[id]) _charts[id].destroy();
  _charts[id] = new Chart(document.getElementById(id), {
    type: 'bar',
    data: { labels, datasets: [{ data: values, backgroundColor: values.map(v => v > 70 ? '#10b981cc' : v > 40 ? '#f59e0bcc' : '#ef4444cc'), borderRadius: 4, barPercentage: .6 }] },
    options: {
      ...cOpts(),
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { display: false } },
        y: { ticks: { color: '#64748b', callback: v => v + '%' }, grid: { color: 'rgba(71,85,105,.2)' }, max: 100 }
      },
      plugins: { tooltip: { callbacks: { label: ctx => ctx.raw.toFixed(1) + '%' } } }
    }
  });
}

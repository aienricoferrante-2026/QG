/* ── Chart Helpers ── */

const COLORS = {
  'Offerta Contrattualizzata': '#10b981',
  'Offerta Accettata': '#3b82f6',
  'Accettata dal Cliente': '#8b5cf6',
  'Offerta Presentata': '#f59e0b',
  'Offerta Rifiutata': '#ef4444'
};

const CAT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
];

const charts = {};

function chartOpts(title) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#475569',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: ctx => {
            const v = ctx.parsed || ctx.raw;
            return typeof v === 'number' ? '€ ' + fmt(v) : v;
          }
        }
      }
    }
  };
}

function updateDonut(id, labels, data, colors) {
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(document.getElementById(id), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }]
    },
    options: {
      ...chartOpts(),
      cutout: '65%',
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: { color: '#94a3b8', font: { size: 11 }, padding: 8, usePointStyle: true }
        },
        tooltip: {
          callbacks: {
            label: ctx => '€ ' + fmt(ctx.raw) + ' (' + ((ctx.raw / data.reduce((a, b) => a + b, 0)) * 100).toFixed(1) + '%)'
          }
        }
      }
    }
  });
}

function updateLine(id, labels, values, counts) {
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(document.getElementById(id), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Valore',
        data: values,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,.1)',
        fill: true,
        tension: .3,
        pointRadius: 3,
        pointBackgroundColor: '#3b82f6'
      }]
    },
    options: {
      ...chartOpts(),
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 10 }, maxRotation: 45 }, grid: { display: false } },
        y: { ticks: { color: '#64748b', callback: v => '€ ' + fmtK(v) }, grid: { color: 'rgba(71,85,105,.2)' } }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => '€ ' + fmt(ctx.raw),
            afterLabel: (ctx) => counts[ctx.dataIndex] + ' offerte'
          }
        }
      }
    }
  });
}

function updateBar(id, labels, values, color) {
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(document.getElementById(id), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: color + 'cc', borderRadius: 4, barPercentage: .6 }]
    },
    options: {
      ...chartOpts(),
      indexAxis: 'y',
      scales: {
        x: { ticks: { color: '#64748b', callback: v => '€ ' + fmtK(v) }, grid: { color: 'rgba(71,85,105,.2)' } },
        y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } }
      }
    }
  });
}

function updateBarConv(id, labels, values) {
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(document.getElementById(id), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: values.map(v => v > 70 ? '#10b981cc' : v > 40 ? '#f59e0bcc' : '#ef4444cc'),
        borderRadius: 4,
        barPercentage: .6
      }]
    },
    options: {
      ...chartOpts(),
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: '#64748b', callback: v => v + '%' }, grid: { color: 'rgba(71,85,105,.2)' }, max: 100 }
      },
      plugins: {
        tooltip: { callbacks: { label: ctx => ctx.raw.toFixed(1) + '%' } }
      }
    }
  });
}

function updateHistogram() {
  const id = 'chartDistrib';
  const ranges = ['0-100', '100-500', '500-1K', '1K-5K', '5K-10K', '10K-50K', '50K+'];
  const bins = [0, 0, 0, 0, 0, 0, 0];
  filtered.forEach(d => {
    const v = d.totale;
    if (v <= 100) bins[0]++;
    else if (v <= 500) bins[1]++;
    else if (v <= 1000) bins[2]++;
    else if (v <= 5000) bins[3]++;
    else if (v <= 10000) bins[4]++;
    else if (v <= 50000) bins[5]++;
    else bins[6]++;
  });
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(document.getElementById(id), {
    type: 'bar',
    data: {
      labels: ranges,
      datasets: [{ data: bins, backgroundColor: '#06b6d4cc', borderRadius: 4, barPercentage: .7 }]
    },
    options: {
      ...chartOpts(),
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
        y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(71,85,105,.2)' } }
      },
      plugins: {
        tooltip: { callbacks: { label: ctx => ctx.raw + ' offerte' } }
      }
    }
  });
}

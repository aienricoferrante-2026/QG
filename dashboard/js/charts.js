/* Chart.js defaults */
Chart.defaults.color = '#64748b';
Chart.defaults.borderColor = '#1e2a42';
Chart.defaults.font.family = 'Inter,-apple-system,sans-serif';
Chart.defaults.font.size = 11;

const chartInstances = {};

function makeChart(id, cfg) {
  if (chartInstances[id]) chartInstances[id].destroy();
  const canvas = document.getElementById(id);
  if (canvas) chartInstances[id] = new Chart(canvas, cfg);
}

/* Common chart configs */
function lineChart(id, labels, datasets) {
  makeChart(id, {
    type: 'line',
    data: { labels, datasets: datasets.map(ds => ({
      ...ds, tension: .3, borderWidth: 2, fill: true,
      backgroundColor: ds.borderColor.replace(')', ',.08)').replace('rgb', 'rgba')
    }))},
    options: { responsive: true, plugins: { legend: { position: 'bottom' } },
      scales: { y: { ticks: { callback: v => fmtE(v) } } } }
  });
}

function stackedBar(id, labels, datasets, horiz = false) {
  makeChart(id, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true, indexAxis: horiz ? 'y' : 'x',
      scales: {
        x: { stacked: true, ticks: horiz ? { callback: v => fmtE(v) } : {} },
        y: { stacked: true, ticks: horiz ? {} : { callback: v => fmtE(v) } }
      },
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function simpleBar(id, labels, data, color = '#3b82f6', horiz = false) {
  makeChart(id, {
    type: 'bar',
    data: { labels, datasets: [{ data, backgroundColor: color }] },
    options: {
      responsive: true, indexAxis: horiz ? 'y' : 'x',
      plugins: { legend: { display: false } },
      scales: horiz ? {} : { y: { ticks: { callback: v => fmtE(v) } } }
    }
  });
}

function donutChart(id, labels, data, colors) {
  makeChart(id, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
    options: { responsive: true, cutout: '60%', plugins: { legend: { position: 'bottom' } } }
  });
}

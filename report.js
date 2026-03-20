const fs = require('fs');

const reportPath = './report.json';
const phonesPath = './phones.json';

function loadJson(path) {
  try {
    const data = fs.readFileSync(path, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Failed to read or parse ${path}:`, err.message);
    process.exit(1);
  }
}

const reportData = loadJson(reportPath);
const phones = loadJson(phonesPath);

function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/\D/g, '');
}

function matchKey(phone) {
  const d = normalizePhone(phone);
  if (!d) return '';
  if (d.length <= 6) return d;
  return d.slice(-6);
}

function getDuplicateForeignPhones(entries) {
  const counts = new Map();
  const duplicates = new Set();

  for (const entry of entries) {
    const key = normalizePhone(entry.phoneNumber);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
    if (counts.get(key) > 1) {
      duplicates.add(entry.phoneNumber);
    }
  }

  return [...duplicates];
}

// Build map of phones entries for date 2026-03-18 keyed by last 6 normalized digits.
const phonesDate18 = phones.filter((o) => {
  if (!o || typeof o.voteDate !== 'string') return false;
  return o.voteDate.startsWith('2026-03-20');
});

const phoneMap = new Map();
phonesDate18.forEach((o) => {
  const key = matchKey(o.phoneNumber);
  if (!key) return;
  if (!phoneMap.has(key)) {
    phoneMap.set(key, []);
  }
  phoneMap.get(key).push({ phoneNumber: o.phoneNumber, voteDate: o.voteDate });
});

const duplicates = getDuplicateForeignPhones(reportData);

const uniqueForeignByKey = new Map();
for (const entry of reportData) {
  const key = normalizePhone(entry.phoneNumber);
  if (!key) continue;
  if (!uniqueForeignByKey.has(key)) {
    uniqueForeignByKey.set(key, entry);
  }
}

const uniqueForeigns = [...uniqueForeignByKey.values()];
const found = [];
const notFound = [];

for (const entry of uniqueForeigns) {
  const key = matchKey(entry.phoneNumber);
  if (!key) continue;

  if (phoneMap.has(key)) {
    const matches = phoneMap.get(key);
    matches.forEach((match) => {
      found.push({ foreignPhone: entry.phoneNumber, foreignDate: entry.voteDate || '', phonesNumber: match.phoneNumber, phonesDate: match.voteDate });
    });
  } else {
    notFound.push({ foreignPhone: entry.phoneNumber, foreignDate: entry.voteDate || '' });
  }
}

const total = reportData.length;
const uniqueCount = uniqueForeigns.length;
const duplicateCount = duplicates.length;
const foundCount = found.length;
const notFoundCount = notFound.length;

const generatedAt = new Date().toLocaleString('uz-UZ', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});

const lines = [];
lines.push('Tashqi va ichki raqamlar hisobot');
lines.push('Yaratilgan: ' + new Date().toISOString());
lines.push('');
lines.push(`Tashqi jami yozuvlar: ${total}`);
lines.push(`Tashqi noyob raqamlar (hisobotda ishlatilgan): ${uniqueCount}`);
lines.push(`Tashqi takroriy raqamlar: ${duplicateCount}`);
lines.push(`Ichki jadvaldan topilganlar (2026-03-18): ${foundCount}`);
lines.push(`Topilmaganlar: ${notFoundCount}`);
lines.push('');

lines.push('=== Topilganlar ===');
if (foundCount === 0) {
  lines.push('Yo‘q');
} else {
  lines.push('foreignPhone\tforeignVoteDate\tphonesNumber\tphonesVoteDate');
  found.forEach((item) => {
    lines.push(`${item.foreignPhone}\t${item.foreignDate}\t${item.phonesNumber}\t${item.phonesDate}`);
  });
}
lines.push('');

lines.push('=== Topilmaganlar ===');
if (notFoundCount === 0) {
  lines.push('Yo‘q');
} else {
  lines.push('foreignPhone\tforeignVoteDate');
  notFound.forEach((item) => {
    lines.push(`${item.foreignPhone}\t${item.foreignDate}`);
  });
}

lines.push('');
lines.push('=== Takroriy (duplicates) ===');
if (duplicateCount === 0) {
  lines.push('Yo‘q');
} else {
  lines.push('foreignPhone');
  duplicates.forEach((phone) => {
    lines.push(phone);
  });
}

const htmlOut = './report.html';
const htmlLines = [];
htmlLines.push('<!doctype html>');
htmlLines.push('<html lang="uz">');
htmlLines.push('<head>');
htmlLines.push('<meta charset="utf-8">');
htmlLines.push('<title>Hisobot</title>');
htmlLines.push('<style>body{font-family:Arial,sans-serif;background:#f5f7fb;color:#111;margin:0;padding:16px;} .card{background:#fff;border:1px solid #ddd;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,.08);padding:16px;max-width:1100px;margin:auto;} h1{margin:0 0 8px;font-size:1.35rem;} .meta{margin-top:0;font-size:.92rem;color:#444;} .header-summary{display:flex;flex-wrap:wrap;gap:10px;margin:10px 0;padding:8px;background:#eef4ff;border:1px solid #cfd9e8;border-radius:8px;} .header-summary .stat{background:#fff;border:1px solid #c8d4e9;border-radius:6px;padding:8px 10px;min-width:150px;box-shadow:0 1px 2px rgba(0,0,0,.05);} .header-summary .stat strong{display:block;font-size:.85rem;color:#4a6083;} .header-summary .stat span{font-size:1rem;color:#13306a;} table{width:100%;border-collapse:collapse;margin-top:14px;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background:#f0f4ff;} tr:nth-child(even){background:#fafbff;} .section{margin-top:22px;} .note{margin-top:12px;color:#333;} </style>');
htmlLines.push('</head>');
htmlLines.push('<body>');
htmlLines.push('<div class="card">');
htmlLines.push('<h1>HISOBOT</h1>');
htmlLines.push('<div class="header-summary">');
htmlLines.push(`<div class="stat"><strong>Yaratilgan:</strong><span>${generatedAt}</span></div>`);
htmlLines.push(`<div class="stat"><strong>Jami:</strong><span>${total}</span></div>`);
htmlLines.push(`<div class="stat"><strong>Noyob:</strong><span>${uniqueCount}</span></div>`);
htmlLines.push(`<div class="stat"><strong>Takroriy:</strong><span>${duplicateCount}</span></div>`);
htmlLines.push(`<div class="stat"><strong>Topilgan:</strong><span>${foundCount}</span></div>`);
htmlLines.push(`<div class="stat"><strong>Topilmagan:</strong><span>${notFoundCount}</span></div>`);
htmlLines.push('</div>');

htmlLines.push('<div class="section"><h2>TOPILGANLAR</h2>');
if (foundCount === 0) {
  htmlLines.push('<p>Yo‘q</p>');
} else {
  htmlLines.push('<table>');
  htmlLines.push('<thead><tr><th>#</th><th>Tashqi raqam</th><th>Tashqi sanasi</th><th>Ichki raqam</th><th>Ichki sanasi</th></tr></thead>');
  htmlLines.push('<tbody>');
  found.forEach((item, i) => {
    htmlLines.push(`<tr><td>${i+1}</td><td>${item.foreignPhone}</td><td>${item.foreignDate}</td><td>${item.phonesNumber}</td><td>${item.phonesDate}</td></tr>`);
  });
  htmlLines.push('</tbody>');
  htmlLines.push('</table>');
}
htmlLines.push('</div>');

htmlLines.push('<div class="section"><h2>TOPILMAGANLAR</h2>');
if (notFoundCount === 0) {
  htmlLines.push('<p>Yo‘q</p>');
} else {
  htmlLines.push('<table>');
  htmlLines.push('<thead><tr><th>#</th><th>Raqam</th><th>Sanasi</th></tr></thead>');
  htmlLines.push('<tbody>');
  notFound.forEach((item, i) => {
    htmlLines.push(`<tr><td>${i+1}</td><td>${item.foreignPhone}</td><td>${item.foreignDate}</td></tr>`);
  });
  htmlLines.push('</tbody>');
  htmlLines.push('</table>');
}
htmlLines.push('</div>');

htmlLines.push('<div class="section"><h2>TAKRORIY RAQAMLAR</h2>');
if (duplicateCount === 0) {
  htmlLines.push('<p>Yo‘q</p>');
} else {
  htmlLines.push('<table>');
  htmlLines.push('<thead><tr><th>#</th><th>Raqam</th></tr></thead>');
  htmlLines.push('<tbody>');
  duplicates.forEach((phone, i) => {
    htmlLines.push(`<tr><td>${i + 1}</td><td>${phone}</td></tr>`);
  });
  htmlLines.push('</tbody>');
  htmlLines.push('</table>');
}
htmlLines.push('</div>');

htmlLines.push('</div>');
htmlLines.push('</body>');
htmlLines.push('</html>');

fs.writeFileSync(htmlOut, htmlLines.join('\n'), 'utf8');
console.log(`Report written to ${htmlOut}. total=${total} unique=${uniqueCount} duplicates=${duplicateCount} found=${foundCount} notFound=${notFoundCount}`);

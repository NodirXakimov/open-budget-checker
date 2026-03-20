const fs = require('fs');

const foreignPath = './foreign.json';
const phonesPath = './phones.json';
const outPath = './foreign-report.txt';

function loadJson(path) {
  try {
    const data = fs.readFileSync(path, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Failed to read or parse ${path}:`, err.message);
    process.exit(1);
  }
}

const foreign = loadJson(foreignPath);
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

const found = [];
const notFound = [];

for (const entry of foreign) {
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

const total = foreign.length;
const foundCount = found.length;
const notFoundCount = notFound.length;

const lines = [];
lines.push('Foreign va Phones (2026-03-18) hisobot');
lines.push('Yaratilgan: ' + new Date().toISOString());
lines.push('');
lines.push(`Foreign jami yozuvlar: ${total}`);
lines.push(`Telefonlar jadvalidan topilganlar (2026-03-18): ${foundCount}`);
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

fs.writeFileSync(outPath, lines.join('\n'), 'utf8');

const htmlOut = './foreign-report.html';
const htmlLines = [];
htmlLines.push('<!doctype html>');
htmlLines.push('<html lang="uz">');
htmlLines.push('<head>');
htmlLines.push('<meta charset="utf-8">');
htmlLines.push('<title>Hisobot</title>');
htmlLines.push('<style>body{font-family:Arial,sans-serif;background:#f5f7fb;color:#111;margin:0;padding:16px;} .card{background:#fff;border:1px solid #ddd;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,.08);padding:16px;max-width:1100px;margin:auto;} h1{margin:0 0 8px;font-size:1.35rem;} .meta{margin-top:0;font-size:.92rem;color:#444;} table{width:100%;border-collapse:collapse;margin-top:14px;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background:#f0f4ff;} tr:nth-child(even){background:#fafbff;} .section{margin-top:22px;} .note{margin-top:12px;color:#333;} </style>');
htmlLines.push('</head>');
htmlLines.push('<body>');
htmlLines.push('<div class="card">');
htmlLines.push('<h1>Hisobot</h1>');
htmlLines.push(`<div class="meta">Yaratilgan: ${new Date().toISOString()}</div>`);
htmlLines.push(`<div class="note">Jami: ${total} | Topilgan: ${foundCount} | Topilmagan: ${notFoundCount}</div>`);

htmlLines.push('<div class="section"><h2>Topilganlar</h2>');
if (foundCount === 0) {
  htmlLines.push('<p>Yo‘q</p>');
} else {
  htmlLines.push('<table>');
  htmlLines.push('<thead><tr><th>#</th><th>Foreign raqam</th><th>Foreign sanasi</th><th>Phones raqam</th><th>Phones sanasi</th></tr></thead>');
  htmlLines.push('<tbody>');
  found.forEach((item, i) => {
    htmlLines.push(`<tr><td>${i+1}</td><td>${item.foreignPhone}</td><td>${item.foreignDate}</td><td>${item.phonesNumber}</td><td>${item.phonesDate}</td></tr>`);
  });
  htmlLines.push('</tbody>');
  htmlLines.push('</table>');
}
htmlLines.push('</div>');

htmlLines.push('<div class="section"><h2>Topilmaganlar</h2>');
if (notFoundCount === 0) {
  htmlLines.push('<p>Yo‘q</p>');
} else {
  htmlLines.push('<table>');
  htmlLines.push('<thead><tr><th>#</th><th>Foreign raqam</th><th>Foreign sanasi</th></tr></thead>');
  htmlLines.push('<tbody>');
  notFound.forEach((item, i) => {
    htmlLines.push(`<tr><td>${i+1}</td><td>${item.foreignPhone}</td><td>${item.foreignDate}</td></tr>`);
  });
  htmlLines.push('</tbody>');
  htmlLines.push('</table>');
}
htmlLines.push('</div>');
htmlLines.push('</div>');
htmlLines.push('</body>');
htmlLines.push('</html>');

fs.writeFileSync(htmlOut, htmlLines.join('\n'), 'utf8');
console.log(`Report written to ${outPath} and ${htmlOut}. total=${total} found=${foundCount} notFound=${notFoundCount}`);

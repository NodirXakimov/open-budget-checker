import fs from 'fs'

// read data
const data = JSON.parse(fs.readFileSync('./foreign.json', 'utf-8'))

function getDuplicatePhones(arr) {
  const seen = new Set()
  const duplicates = new Set()

  for (const item of arr) {
    const phone = item.phoneNumber?.trim()
    if (!phone) continue

    if (seen.has(phone)) {
      duplicates.add(phone)
    } else {
      seen.add(phone)
    }
  }

  return [...duplicates]
}

const duplicates = getDuplicatePhones(data)

// generate simple HTML
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Duplicates</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: #f9fafb;
    }
    h1 {
      color: #111;
    }
    ul {
      margin-top: 10px;
    }
    li {
      padding: 6px 0;
      font-size: 16px;
      color: #2563eb;
    }
  </style>
</head>
<body>

<h1>Duplicate Phone Numbers (${duplicates.length})</h1>

<ul>
  ${duplicates.map(p => `<li>${p}</li>`).join('')}
</ul>

</body>
</html>
`

fs.writeFileSync('./duplicates-on-foreign.html', html)

console.log('✅ duplicates.html generated')

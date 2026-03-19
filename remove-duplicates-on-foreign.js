import fs from 'fs'

// read file
const data = JSON.parse(fs.readFileSync('./foreign.json', 'utf-8'))

function removeDuplicatePhones(arr) {
  const map = new Map()

  for (const item of arr) {
    const phone = item.phoneNumber?.trim()
    if (!phone) continue

    // keep FIRST occurrence
    if (!map.has(phone)) {
      map.set(phone, item)
    }
  }

  return [...map.values()]
}

const cleaned = removeDuplicatePhones(data)

// overwrite original file
fs.writeFileSync(
  './foreign.json',
  JSON.stringify(cleaned, null, 2)
)

console.log(`✅ Cleaned. Removed ${data.length - cleaned.length} duplicates`)

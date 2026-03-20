import fs from "fs"

// read file
const data = JSON.parse(fs.readFileSync("phones.json", "utf-8"))

const seen = new Set()
const duplicates = []

for (const item of data) {
  const key = `${item.phoneNumber}|${item.voteDate}`
  if(seen.has(key)) {
    duplicates.push(item)
  } else {
    seen.add(key)
  }
}

// output
console.log("Total records:", data.length)
console.log("Duplicate count:", duplicates.length)

if(duplicates.length > 0) {
  console.log("\nDuplicates:\n")
  console.log(duplicates)
}

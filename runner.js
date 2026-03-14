import fs from "fs"

const base = "https://openbudget.uz/api/v2/info/votes/69b5032190779305e2b90893"

const headers = {
  "Accept": "application/json",
  "User-Agent": "Mozilla/5.0",
  "Referer": "https://openbudget.uz/"
}

async function getAll() {

  // first request to get total pages
  const firstRes = await fetch(`${base}?page=1`, { headers })
  const first = await firstRes.json()

  const totalPages = first.totalPages
  console.log("Total pages:", totalPages)

  let all = [...first.content]

  // create requests for remaining pages
  const requests = []

  for (let page = 2; page <= totalPages; page++) {

    requests.push(
      fetch(`${base}?page=${page}`, { headers })
        .then(r => r.json())
        .then(d => d.content)
        .catch(() => [])
    )

  }

  // run all requests at once
  const results = await Promise.all(requests)

  results.forEach(arr => {
    all.push(...arr)
  })

  fs.writeFileSync("votes.json", JSON.stringify(all, null, 2))

  console.log("Saved votes:", all.length)

}

getAll()

import fs from "fs"

const base = "https://openbudget.uz/api/v2/info/votes/69b50f003d01cb2096d30d59"

async function getAll(){

  let all=[]

  const firstRes = await fetch(`${base}?page=1`,{
    headers:{
      "Accept":"application/json",
      "User-Agent":"Mozilla/5.0",
      "Referer":"https://openbudget.uz/"
    }
  })

  const firstText = await firstRes.text()
  const first = JSON.parse(firstText)

  all.push(...first.content)

  const totalPages = first.totalPages

  for(let page=2; page<=totalPages; page++){

    const res = await fetch(`${base}?page=${page}`)
    const text = await res.text()

    if(!text){
      console.log("Empty page",page)
      continue
    }

    const data = JSON.parse(text)

    all.push(...data.content)

    console.log(`Page ${page}/${totalPages}`)

  }

  fs.writeFileSync("votes.json",JSON.stringify(all,null,2))

  console.log("Saved",all.length)

}

getAll()

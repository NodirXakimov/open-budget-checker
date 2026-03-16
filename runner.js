import fs from "fs"

const base = "https://openbudget.uz/api/v2/info/votes/69b7ca7f3d01cb2096da2e08"

async function getAll(){

  let all=[]

  const firstRes = await fetch(`${base}?page=0`,{
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

  for(let page=1; page<=20; page++){  // page<=totalPages

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

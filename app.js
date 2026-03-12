const phoneNumbers = [
{ number:"**-*24-23-10", date:"2026-03-12 09:15" },
{ number:"**-*02-12-74", date:"2026-03-12 09:13" },
{ number:"**-*35-56-72", date:"2026-03-12 09:12" },
{ number:"**-*23-86-60", date:"2026-03-12 09:09" },
{ number:"**-*84-29-05", date:"2026-03-12 09:03" },
{ number:"**-*20-25-35", date:"2026-03-12 08:54" },
{ number:"**-*65-25-67", date:"2026-03-12 08:26" },
{ number:"**-*54-53-02", date:"2026-03-12 08:05" }
]

const tableBody=document.getElementById("tableBody")
const searchInput=document.getElementById("searchInput")
const totalCount=document.getElementById("totalCount")
const resultCount=document.getElementById("resultCount")

totalCount.textContent=`Жами рақамлар: ${phoneNumbers.length}`

function highlight(text,query){

if(!query) return text

const regex=new RegExp(query,"gi")

return text.replace(regex,match=>{
return `<span class="highlight">${match}</span>`
})

}

function render(list,query=""){

tableBody.innerHTML=""

resultCount.textContent=`Натижа: ${list.length}`

list.forEach((item,index)=>{

const tr=document.createElement("tr")

tr.innerHTML=`
<td>${index+1}</td>
<td>${highlight(item.number,query)}</td>
<td>${item.date}</td>
`

tableBody.appendChild(tr)

})

}

function filterNumbers(query){

query = query.replace(/\D/g,'')

if(!query) return phoneNumbers

return phoneNumbers.filter(p => {
  const normalized = p.number.replace(/\D/g,'')
  return normalized.includes(query)
})

}

searchInput.addEventListener("input",e=>{

const query=e.target.value

const filtered=filterNumbers(query)

render(filtered,query)

})

render(phoneNumbers)
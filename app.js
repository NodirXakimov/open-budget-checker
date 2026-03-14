/** @format */

let phoneNumbers = [];

const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const totalCount = document.getElementById("totalCount");
const resultCount = document.getElementById("resultCount");

fetch("phones.json")
  .then((res) => res.json())
  .then((data) => {
    phoneNumbers = data;

    totalCount.textContent = `Жами рақамлар: ${phoneNumbers.length}`;

    render(phoneNumbers);
  });

totalCount.textContent = `Жами рақамлар: ${phoneNumbers.length}`;

function highlight(text, query) {
  if (!query) return text;

  const regex = new RegExp(query, "gi");

  return text.replace(regex, (match) => {
    return `<span class="highlight">${match}</span>`;
  });
}

function render(list, query = "") {
  tableBody.innerHTML = "";

  resultCount.textContent = `Натижа: ${list.length}`;

  list.forEach((item, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
<td>${index + 1}</td>
<td>${highlight(item.phoneNumber, query)}</td>
<td>${item.voteDate}</td>
`;

    tableBody.appendChild(tr);
  });
}

function filterNumbers(query) {
  query = query.replace(/\D/g, "");

  if (!query) return phoneNumbers;

  return phoneNumbers.filter((p) => {
    const normalized = p.phoneNumber.replace(/\D/g, "");
    return normalized.includes(query);
  });
}

searchInput.addEventListener("input", (e) => {
  const query = e.target.value;

  const filtered = filterNumbers(query);

  render(filtered, query);
});

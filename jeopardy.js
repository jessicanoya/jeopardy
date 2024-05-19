const API_CATEGORIES_URL =
  "https://rithm-jeopardy.herokuapp.com/api/categories?count=100";
const API_CATEGORY_ID_URL =
  "https://rithm-jeopardy.herokuapp.com/api/category?id=";

const start = document.querySelector("#start");
const spinner = document.querySelector("#spinner");
const numCategories = 6;
const numQuestionsPerCategory = 5;
let categoryID = [];
let categories = [];

async function getCategoryIds() {
  const response = await axios.get(API_CATEGORIES_URL);
  return response.data.forEach(function (category) {
    return categoryID.push(category.id);
  });
}

async function getCategory(catId) {
  const response = await axios.get(`${API_CATEGORY_ID_URL}${catId}`);
  const clues = response.data.clues.map(function (data) {
    return {
      question: data.question,
      answer: data.answer,
      showing: null,
    };
  });
  return categories.push({ title: response.data.title, clues: clues });
}

function shuffleID(array) {
  for (let index = array.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }
  return array.slice(0, numCategories);
}

async function fillTable() {
  const table = document.querySelector("#jeopardy");
  table.innerHTML = "";

  const tableHead = document.createElement("thead");
  const tableHeadRow = document.createElement("tr");

  for (let category of categories) {
    const th = document.createElement("th");
    th.innerText = category.title.toUpperCase();
    tableHeadRow.appendChild(th);
  }
  tableHead.appendChild(tableHeadRow);
  table.appendChild(tableHead);

  const tableBody = document.createElement("tbody");
  for (let index = 0; index < numQuestionsPerCategory; index++) {
    console.log(index);
    const row = document.createElement("tr");
    categories.forEach(function (category, categoryIndex) {
      const tableCell = document.createElement("td");
      tableCell.addEventListener("click", handleClick);
      tableCell.innerText = "?";
      tableCell.setAttribute("data-category-index", categoryIndex);
      tableCell.setAttribute("data-clue-index", index);
      row.appendChild(tableCell);
    });
    tableBody.appendChild(row);
  }
  table.appendChild(tableBody);
}

function handleClick(event) {
  const tableCell = event.target;
  console.log(tableCell);
  const categoryIndex = tableCell.getAttribute("data-category-index");
  const clueIndex = tableCell.getAttribute("data-clue-index");
  const clue = categories[categoryIndex].clues[clueIndex];

  if (!clue.showing) {
    tableCell.innerHTML = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    tableCell.innerHTML = clue.answer;
    clue.showing = "answer";
    tableCell.style.backgroundColor = "#28a200";
  }
}

function showLoadingView() {
  start.innerText = "Loading...";
  spinner.classList.remove("visually-hidden");
  start.disabled = true;
}

function hideLoadingView() {
  spinner.classList.add("visually-hidden");
  start.innerText = "Restart!";
  start.disabled = false;
}

async function setupAndStart() {
  showLoadingView();

  await getCategoryIds();
  const shuffledID = shuffleID(categoryID);

  for (let id of shuffledID) {
    await getCategory(id);
  }

  fillTable();

  hideLoadingView();
}

document.addEventListener("DOMContentLoaded", function () {
  start.addEventListener("click", function () {
    console.log(start.innerText);
    if (start.innerText === "Start!") {
      setupAndStart();
    } else if (start.innerText === "Restart!") {
      const table = document.querySelector("#jeopardy");
      table.innerHTML = "";

      categoryID = [];
      categories = [];

      setupAndStart();
    }
  });
});

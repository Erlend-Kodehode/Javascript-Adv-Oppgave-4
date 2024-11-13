const form = document.querySelector("#submit-form");
const nameInput = document.querySelector("#name-input");
const showFinished = document.querySelector("#show-finished");
const sort = document.querySelector("#sort");
// const priorityInput = document.querySelector("#priority-input");
const listContainer = document.querySelector("#list-container");

let gameArr = [];
let idNum = 0;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formdata = new FormData(form);
  gameArr.forEach((e) => e.priority++);
  gameArr.push({
    name: formdata.get("name-input"),
    priority: 1,
    id: idNum++,
    finished: false,
  });
  nameInput.value = "";
  renderlist();
});

showFinished.addEventListener("change", () => renderlist());
sort.addEventListener("change", () => renderlist());

function renderlist() {
  generateList(sortAndFilter(gameArr));
}

function sortAndFilter(arr) {
  return arr
    .filter((e) => (showFinished.checked ? e : !e.finished))
    .sort((a, b) => {
      switch (sort.value) {
        case "asc":
          return a.priority - b.priority;

        case "desc":
          return b.priority - a.priority;
      }
    });
}

function generateList(arr) {
  while (listContainer.firstChild) listContainer.firstChild.remove();
  arr.forEach((game) => {
    const gameContainer = document.createElement("div");
    gameContainer.classList.add("game-container");
    const gamePriority = document.createElement("input");
    gamePriority.type = "number";
    gamePriority.value = game.priority;
    gamePriority.addEventListener("change", () => {
      let biggestNum = 0;
      let PriorityNum = parseInt(gamePriority.value);
      gameArr.forEach((e) => {
        if (e.priority > biggestNum) biggestNum = e.priority;
        if (PriorityNum === e.priority) e.priority = gameArr[game.id].priority;
      });
      if (PriorityNum > 0 && PriorityNum < biggestNum)
        gameArr[game.id].priority = PriorityNum;
      renderlist();
    });
    const gameName = document.createElement("p");
    gameName.textContent = game.name;
    const gameFinished = document.createElement("input");
    gameFinished.type = "checkbox";
    gameFinished.checked = game.finished;
    if (game.finished) gameContainer.classList.add("finished");
    gameFinished.addEventListener("change", () => {
      gameArr[game.id].finished = gameFinished.checked;
      renderlist();
    });
    listContainer.prepend(gameContainer);
    gameContainer.append(gamePriority, gameName, gameFinished);
  });
}

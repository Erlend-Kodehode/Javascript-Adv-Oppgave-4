const form = document.querySelector("#submit-form");
const nameInput = document.querySelector("#name-input");
const showFinished = document.querySelector("#show-finished");
const sort = document.querySelector("#sort");
// const priorityInput = document.querySelector("#priority-input");
const listContainer = document.querySelector("#list-container");

let gameArr = [];
let idNum = 0;

const storedArr = localStorage.getItem("gameArr");
if (storedArr) {
  showFinished.checked = localStorage.getItem("showFinished") === "true";
  sort.value = localStorage.getItem("sort");
  gameArr = JSON.parse(storedArr);
  idNum = parseInt(localStorage.getItem("gameId"));
  saveAndRender();
}

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
  saveAndRender();
});

showFinished.addEventListener("change", saveAndRender);
sort.addEventListener("change", saveAndRender);

function saveAndRender() {
  if (gameArr.length > 0) {
    localStorage.setItem("showFinished", showFinished.checked);
    localStorage.setItem("sort", sort.value);
    localStorage.setItem("gameArr", JSON.stringify(gameArr));
    localStorage.setItem("gameId", idNum);
  } else {
    localStorage.removeItem("showFinished");
    localStorage.removeItem("sort");
    localStorage.removeItem("gameArr");
    localStorage.removeItem("gameId");
  }
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

function updateOrder(priority, id) {
  let biggestNum = 0;
  const priorityNum = parseInt(priority);
  gameArr.forEach((e) => {
    if (e.priority > biggestNum) biggestNum = e.priority;
    if (priorityNum === e.priority) e.priority = gameArr[id].priority;
  });
  if (priorityNum > 0 && priorityNum <= biggestNum)
    gameArr[id].priority = priorityNum;
  saveAndRender();
}

function generateList(arr) {
  while (listContainer.firstChild) listContainer.firstChild.remove();
  arr.forEach((game) => {
    const gameContainer = document.createElement("div");
    gameContainer.classList.add("game-container");

    const gamePriority = document.createElement("input");
    gamePriority.type = "number";
    gamePriority.value = game.priority;
    gamePriority.addEventListener("change", () =>
      updateOrder(gamePriority.value, game.id)
    );

    const gameName = document.createElement("p");
    gameName.textContent = game.name;

    const gameFinished = document.createElement("input");
    gameFinished.type = "checkbox";
    gameFinished.checked = game.finished;
    if (game.finished) gameContainer.classList.add("finished");
    gameFinished.addEventListener("change", () => {
      gameArr[game.id].finished = gameFinished.checked;
      if (gameFinished.checked) {
        gameArr.forEach((e) => {
          if (e.priority > game.priority) {
            e.priority--;
          }
        });
        game.priority = gameArr.length;
      }
      saveAndRender();
    });

    const gameDelete = document.createElement("button");
    gameDelete.textContent = "Delete";
    gameDelete.addEventListener("click", () => {
      gameArr.forEach((e) => {
        if (e.id > game.id) e.id--;
        if (e.priority > game.priority) e.priority--;
      });
      idNum--;
      gameArr.splice(game.id, 1);
      saveAndRender();
    });

    const arrowContainer = document.createElement("div");
    const upArrow = document.createElement("button");
    upArrow.textContent = "↑";
    upArrow.addEventListener("click", () => {
      gamePriority.value =
        sort.value === "asc" ? game.priority + 1 : game.priority - 1;
      updateOrder(gamePriority.value, game.id);
    });
    const downArrow = document.createElement("button");
    downArrow.textContent = "↓";
    downArrow.addEventListener("click", () => {
      gamePriority.value =
        sort.value === "asc" ? game.priority - 1 : game.priority + 1;
      updateOrder(gamePriority.value, game.id);
    });

    listContainer.prepend(gameContainer);
    arrowContainer.append(upArrow, downArrow);
    gameContainer.append(
      gamePriority,
      gameName,
      gameFinished,
      gameDelete,
      arrowContainer
    );
  });
}

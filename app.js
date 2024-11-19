const form = document.querySelector("#submit-form");
const nameInput = document.querySelector("#name-input");
const showFinished = document.querySelector("#show-finished");
const sort = document.querySelector("#sort");
const listContainer = document.querySelector("#list-container");

let mediaArr = [];
let idNum = 0;

const storedArr = localStorage.getItem("mediaArr");
if (storedArr) {
  showFinished.checked = localStorage.getItem("showFinished") === "true";
  sort.value = localStorage.getItem("sort");
  mediaArr = JSON.parse(storedArr);
  idNum = parseInt(localStorage.getItem("mediaId"));
  saveAndRender();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formdata = new FormData(form);
  mediaArr.forEach((e) => e.priority++);
  mediaArr.push({
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
  if (mediaArr.length > 0) {
    localStorage.setItem("showFinished", showFinished.checked);
    localStorage.setItem("sort", sort.value);
    localStorage.setItem("mediaArr", JSON.stringify(mediaArr));
    localStorage.setItem("mediaId", idNum);
  } else {
    localStorage.removeItem("showFinished");
    localStorage.removeItem("sort");
    localStorage.removeItem("mediaArr");
    localStorage.removeItem("mediaId");
  }
  generateList(sortAndFilter(mediaArr));
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
  mediaArr.forEach((e) => {
    if (e.priority > biggestNum) biggestNum = e.priority;
    if (priorityNum === e.priority) e.priority = mediaArr[id].priority;
  });
  if (priorityNum > 0 && priorityNum <= biggestNum)
    mediaArr[id].priority = priorityNum;
  saveAndRender();
}

function generateList(arr) {
  while (listContainer.firstChild) listContainer.firstChild.remove();
  arr.forEach((media) => {
    const mediaContainer = document.createElement("div");
    mediaContainer.classList.add("media-container");

    const leftContainer = document.createElement("div");
    leftContainer.classList.add("container");

    const mediaFinished = document.createElement("input");
    mediaFinished.type = "checkbox";
    mediaFinished.checked = media.finished;
    mediaFinished.classList.add("pointer");
    if (media.finished) mediaContainer.classList.add("finished");
    mediaFinished.addEventListener("change", () => {
      mediaArr[media.id].finished = mediaFinished.checked;
      if (mediaFinished.checked) {
        mediaArr.forEach((e) => {
          if (e.priority > media.priority) e.priority--;
        });
        media.priority = mediaArr.length;
      }
      saveAndRender();
    });

    const mediaPriority = document.createElement("input");
    mediaPriority.type = "number";
    mediaPriority.value = media.priority;
    mediaPriority.addEventListener("change", () =>
      updateOrder(mediaPriority.value, media.id)
    );

    const mediaName = document.createElement("p");
    mediaName.textContent = media.name;

    const rightContainer = document.createElement("div");
    rightContainer.classList.add("container");

    const mediaDelete = document.createElement("button");
    mediaDelete.textContent = "Delete";
    mediaDelete.classList.add("pointer");
    mediaDelete.addEventListener("click", () => {
      mediaArr.forEach((e) => {
        if (e.id > media.id) e.id--;
        if (e.priority > media.priority) e.priority--;
      });
      idNum--;
      mediaArr.splice(media.id, 1);
      saveAndRender();
    });

    const arrowContainer = document.createElement("div");
    const upArrow = document.createElement("button");
    upArrow.textContent = "\u2B9D";
    upArrow.classList.add("pointer");
    upArrow.addEventListener("click", () => {
      mediaPriority.value =
        sort.value === "asc" ? media.priority + 1 : media.priority - 1;
      updateOrder(mediaPriority.value, media.id);
    });
    const downArrow = document.createElement("button");
    downArrow.textContent = "\u2B9F";
    downArrow.classList.add("pointer");
    downArrow.addEventListener("click", () => {
      mediaPriority.value =
        sort.value === "asc" ? media.priority - 1 : media.priority + 1;
      updateOrder(mediaPriority.value, media.id);
    });

    arrowContainer.append(upArrow, downArrow);
    rightContainer.append(mediaDelete, arrowContainer);
    leftContainer.append(mediaPriority, mediaFinished);
    mediaContainer.append(leftContainer, mediaName, rightContainer);
    listContainer.prepend(mediaContainer);
  });
}

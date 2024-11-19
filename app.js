const form = document.querySelector("#submit-form");
const nameInput = document.querySelector("#name-input");
const showFinished = document.querySelector("#show-finished");
const sort = document.querySelector("#sort");
const listContainer = document.querySelector("#list-container");

let mediaArr = [];
let idNum = 0;

// loads items from storage on page load
const storedArr = localStorage.getItem("mediaArr");
if (storedArr) {
  showFinished.checked = localStorage.getItem("showFinished") === "true";
  sort.value = localStorage.getItem("sort");
  mediaArr = JSON.parse(storedArr);
  idNum = parseInt(localStorage.getItem("mediaId"));
  saveAndRender();
}

//evenlistener for submit button
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formdata = new FormData(form);
  //adds one to priority to all existing media so new media is always displayed on top
  mediaArr.forEach((media) => media.priority++);
  //adds a new media to the array
  mediaArr.push({
    name: formdata.get("name-input"),
    //priority dictates display order
    priority: 1,
    //unique id that matches the entry's index to keep track of the media entry
    id: idNum++,
    finished: false,
  });
  //clears the input after you submit
  nameInput.value = "";
  saveAndRender();
});

//eventlistener to save and rerender the list if there ever is a change
showFinished.addEventListener("change", saveAndRender);
sort.addEventListener("change", saveAndRender);

function saveAndRender() {
  //saves the state of various elements if there are any items left in the array
  //if the are none all keys gets deleted
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

//filters out finished media and sorts them either in an descending or ascending order based on priority
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

//gets called whenever the user changes a priority of an item
function updateOrder(priority, id) {
  let biggestNum = 0;
  //parses int since the value of a number-input is sometimes randomly given as a string
  const priorityNum = parseInt(priority);
  mediaArr.forEach((e) => {
    //finds the highest priority
    if (e.priority > biggestNum) biggestNum = e.priority;
    //swaps the priorities of the element that has the same priority as the user set the current element to
    if (priorityNum === e.priority) e.priority = mediaArr[id].priority;
  });
  //updates the current elements priority as long as it is inbounds of the list
  if (priorityNum > 0 && priorityNum <= biggestNum)
    mediaArr[id].priority = priorityNum;
  saveAndRender();
}

//generates the list
function generateList(arr) {
  //removes all previous entries
  while (listContainer.firstChild) listContainer.firstChild.remove();
  arr.forEach((media) => {
    //main container
    const mediaContainer = document.createElement("div");
    mediaContainer.classList.add("media-container");

    //div for styling
    const leftContainer = document.createElement("div");
    leftContainer.classList.add("container");

    //creates checkbox
    const mediaFinished = document.createElement("input");
    mediaFinished.type = "checkbox";
    mediaFinished.checked = media.finished;
    mediaFinished.classList.add("pointer");
    if (media.finished) mediaContainer.classList.add("finished");
    //eventlistener for the checkbox for when the media is finished
    mediaFinished.addEventListener("change", () => {
      //updates the original array
      mediaArr[media.id].finished = mediaFinished.checked;
      //changes the priority to make it so that the entry is moved to the bottom of the list
      //and lowers the priority of entries with higher priority to avoid making gaps
      if (mediaFinished.checked) {
        mediaArr.forEach((e) => {
          if (e.priority > media.priority) e.priority--;
        });
        media.priority = mediaArr.length;
      }
      saveAndRender();
    });

    //priority display and input
    const mediaPriority = document.createElement("input");
    mediaPriority.type = "number";
    mediaPriority.value = media.priority;
    //runs the update order function whenever the user changes a number
    mediaPriority.addEventListener("change", () =>
      updateOrder(mediaPriority.value, media.id)
    );

    //name of entry
    const mediaName = document.createElement("p");
    mediaName.textContent = media.name;

    //div for styling
    const rightContainer = document.createElement("div");
    rightContainer.classList.add("container");

    //Delete button
    const mediaDelete = document.createElement("button");
    mediaDelete.textContent = "Delete";
    mediaDelete.classList.add("pointer");
    mediaDelete.addEventListener("click", () => {
      mediaArr.forEach((e) => {
        //lowers the id of all entries with a higher id to match their new index
        if (e.id > media.id) e.id--;
        //lowers the priority of all entries with a higher priority to avoid leaving gaps
        if (e.priority > media.priority) e.priority--;
      });
      //lowers the id number by one to match the index on new entries
      idNum--;
      //removes the the entry from the original array
      mediaArr.splice(media.id, 1);
      saveAndRender();
    });

    //up and down arrows
    const arrowContainer = document.createElement("div");
    const upArrow = document.createElement("button");
    upArrow.textContent = "\u2B9D";
    upArrow.classList.add("pointer");
    upArrow.addEventListener("click", () => {
      //changes the prority up or down depending on the current sort
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

    //appends
    arrowContainer.append(upArrow, downArrow);
    rightContainer.append(mediaDelete, arrowContainer);
    leftContainer.append(mediaPriority, mediaFinished);
    mediaContainer.append(leftContainer, mediaName, rightContainer);
    listContainer.prepend(mediaContainer);
  });
}

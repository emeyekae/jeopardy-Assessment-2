const URL_BASE_API= "https://jservice.io/api/";
const NUM_CATEGORIES = 6;
const NUM_CLUES_PER_CAT = 5;

let categories = [];

async function getCategoryIds() {
        let response = await axios.get(`${URL_BASE_API}categories`,{params:{count:100,timeout:5000}});
        let catIds = response.data.map(cat => cat.id);
        console.log(` ${catIds}  `);
       return randomValues(catIds,NUM_CATEGORIES);
      }

      function randomValues(arr, numValues) {
        let randomValues = [];
        let randomizedArray = arr.sort(() => Math.random() - 0.5);
        let index = 0;
        while (randomValues.length < numValues) {
          if (randomValues.indexOf(randomizedArray[index]) === -1) {
            randomValues.push(randomizedArray[index]);
          }
          index++;
        }
        return randomValues;
      };


async function getCategory(catId) {
  let response = await axios.get(`${URL_BASE_API}category`,{params:{id:catId, timeout:5000}});
  let cat = response.data;
  let catIdClues = cat.clues;
  let randomClues =  randomValues(catIdClues, NUM_CLUES_PER_CAT);
  let clues = randomClues.map(clu => ({
    question: clu.question,
    answer: clu.answer,
    showing: null,
  }));
return { title:cat.title, clues };
}
  

async function fillTable() {
  $("#jeopardy thead").empty();
  let $tr = $("<tr>");
  for (let catIndex = 0; catIndex < NUM_CATEGORIES; catIndex++) {
    $tr.append($("<th>").text(categories[catIndex].title));
  }
  $("#jeopardy thead").append($tr);
  $("#jeopardy tbody").empty();
  for (let clueIndex = 0; clueIndex < NUM_CLUES_PER_CAT; clueIndex++) {
    let $tr = $("<tr>");
    for (let catIndex = 0; catIndex < NUM_CATEGORIES; catIndex++) {
      $tr.append($("<td>").attr("id", `${catIndex}-${clueIndex}`).text("?"));
    }
    $("#jeopardy tbody").append($tr);
  }
}


function handleClick(evt) {
  let id = evt.target.id;
  let [catId, clueId] = id.split("-");
  let clue = categories[catId].clues[clueId];
  let cellText;
  if (!clue.showing) {
    cellText = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    cellText= clue.answer;
    cellText.showing = "answer";
  } else {
    return
  }
  $(`#${catId}-${clueId}`).html(cellText);
}


async function showLoadingView() {
$("#jeopardy tbody").empty();
$("#spin-container").show();
}


function hideLoadingView() {
  $("#spin-container").hide();
}

async function setupAndStart() {
  showLoadingView();
  let catIds = await getCategoryIds();
  categories = [];
  for (let catId of catIds) {
    categories.push(await getCategory(catId));
  }
  fillTable();
  hideLoadingView();
}


document.querySelector("#start").addEventListener("click", function (e){
   e.preventDefault();
  setupAndStart()
})

 $(async function (){
    setupAndStart();
    $("#jeopardy").on("click", "td", handleClick);
 }
)
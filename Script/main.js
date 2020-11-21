import { optionsSelected } from "./state.js"
import { getCourseData } from "./apiCall.js"

$('#courseDropdown').change(function (event) {
    optionsSelected.courseOption = event.target.value;
    console.log(optionsSelected.courseOption)
    console.log(optionsSelected);
    scorecardData()
})

$('#teeTypeDropDown').change(function (event) {
    optionsSelected.teeOption = event.target.value;
    console.log(optionsSelected.teeOption)
    console.log(optionsSelected)
    scorecardData()
})
$('#holesDropdown').change(function (event) {
    optionsSelected.numberOfHoles = event.target.value;
    console.log(optionsSelected.numberOfHoles)
    console.log(optionsSelected)
    scorecardData()
})
$('#submitOptions').click(function (event) {
    validateOptions();
    scorecardData();
    populateScoreCard();
})

$('#playerDropdown').change(function (event) {
    createPlayerEntry();
})

function createPlayerEntry() {
    const playerOption = event.target.value;
    optionsSelected.numberOfPlayers = event.target.value;
    const playerEntry = document.getElementById('player-name-entry')
    console.log(optionsSelected.numberOfPlayers)
    console.log(optionsSelected);
    const header = `
        <div>
        <h4 class='d-flex flex-column align-items-center' aria-describedby="playerNameHeader">
        Enter the player names: 
        </h4>
        <small id="playerNameHeader" class="text-muted d-flex flex-column align-items-center">
            Names entered cannot match other players
      </small>
      </div>
    `
    playerEntry.innerHTML = header;
    let playerNumber = parseInt(playerOption);
    const playerTemplate = `
    <div class='justify-content-center row'>
            <p> Player:  <p>
                <input class='col-md names form-control' type="text" placeholder="Name">
    </div> `
    for (let i = 1; i <= playerNumber; i++) {
        playerEntry.innerHTML += playerTemplate;
    }
    const names = document.getElementsByClassName('names');
    for (let i = 0; i < names.length; i++) {
        names[i].id = `names${i}`;
        console.log(names[i])
    }
    $('.names').blur(function (event) {
        getNameData();
    })
}

function getNameData() {
    const namesClass = document.getElementsByClassName('names');
    console.log(namesClass);
    let playerNames = [];
    for (let i = 0; i < namesClass.length; i++) {
        playerNames.push(namesClass[i].value);
    }
    console.log(playerNames)
    optionsSelected.playerNames = playerNames;
    console.log(optionsSelected)
}

async function scorecardData() {
    const courseData = await getCourseData(optionsSelected.courseOption);
    const proPar = document.getElementById("professional");
    const course = [];
    let holesToPlay = courseData.data.holes;
    if (optionsSelected.numberOfHoles == 'front9') {
        holesToPlay = holesToPlay.splice(9);
    } else if (optionsSelected.numberOfHoles == 'back9') {
        holesToPlay = holesToPlay.splice(0, 9);
    }
    if (optionsSelected.courseOption == "19002") {
    } else {
        proPar.classList.remove('d-none')
    }
    for (let i = 0; i < holesToPlay.length; i++) {
        const hole = {};
        hole.number = courseData.data.holes[i].hole;
        if (optionsSelected.teeOption == "pro") {
            hole.par = courseData.data.holes[i].teeBoxes[0].par;
            hole.yards = courseData.data.holes[i].teeBoxes[0].yards;
            hole.hcp = courseData.data.holes[i].teeBoxes[0].hcp;
        } else if (optionsSelected.teeOption == "champ") {
            hole.par = courseData.data.holes[i].teeBoxes[1].par;
            hole.yards = courseData.data.holes[i].teeBoxes[1].yards;
            hole.hcp = courseData.data.holes[i].teeBoxes[1].hcp;
        } else if (optionsSelected.teeOption == "men") {
            hole.par = courseData.data.holes[i].teeBoxes[2].par;
            hole.yards = courseData.data.holes[i].teeBoxes[2].yards;
            hole.hcp = courseData.data.holes[i].teeBoxes[2].hcp;
        } else if (optionsSelected.teeOption == "women") {
            hole.par = courseData.data.holes[i].teeBoxes[3].par;
            hole.yards = courseData.data.holes[i].teeBoxes[3].yards;
            hole.hcp = courseData.data.holes[i].teeBoxes[3].hcp;

        }
        course.push(hole);
    }
    course.parTotal = 0;
    course.hcpTotal = 0;
    course.yardsTotal = 0;
    for (let i = 0; i < course.length; i++) {
        course.parTotal += course[i].par;
        course.hcpTotal += course[i].hcp;
        course.yardsTotal += course[i].yards;

    }
    return course;
}

async function calculateScore() {
    const processedData = await scorecardData();
    //have a for loop for each player, grab length of holes, 
    //loop through those id on the inputs and add them for that player. 
    //then, add player score to player score total.
    let player1 = optionsSelected.playerNames[0];
    let player2 = optionsSelected.playerNames[1];
    let player3 = optionsSelected.playerNames[2];
    let player4 = optionsSelected.playerNames[3];
    let playerScores = [];
    let score1 = 0;
    console.log(player1)
    if(optionsSelected.numberOfPlayers == 1) {
        for(let i = 0; i < processedData.length; i++) {
            score1 += document.getElementById(`${player1}${i}`.value)
            console.log(document.getElementById(`${player1}${i}`))
            console.log(score1)
        }
    }
    console.log(score1)

}

window.calculateScore = calculateScore;

async function populateScoreCard() {
    const processedData = await scorecardData();
    let scorecardDiv = document.getElementById('scorecard');
    let holesRow = `
    <tbody id='debug'>
    <tr>
    <th>Holes</th>
    `
    let yardsRow = `
    <tr>
    <th>Yards</th>
    `
    let parRow = `
    <tr>
    <th>Par</th>
    `

    let namesArray = [];
    for (let i = 0; i < optionsSelected.playerNames.length; i++) {
        let nameRow = `
        <tr>
        <th>${optionsSelected.playerNames[i]}</th>
        `
        for (let i = 0; i < processedData.length; i++) {
            nameRow += `
            <td><input id="${optionsSelected.playerNames}${i}" onkeyup="calculateScore()" type="number"></td>
            `
        }
        nameRow += `
        <td id="scoreTotal${i}"></td>
        </tr>
        `
        namesArray.push(nameRow);
    }

    for (let i = 0; i < processedData.length; i++) {
        holesRow += `
        <th>${processedData[i].number}</th>
        `
        yardsRow += `
        <td>${processedData[i].yards}</td>
        `
        parRow += `
        <td>${processedData[i].par}</td>
        `
    }
    scorecardDiv.innerHTML = `
    ${holesRow}
    <td>Total</td>
    </tr>
    ${yardsRow}
    <td>${processedData.yardsTotal}</td>
    </tr>
    ${parRow}
    <td>${processedData.parTotal}</td>
    </tr>
    ${namesArray.join('')}
    </tbody>
    `
}

function validateOptions() {
    const allForms = document.getElementsByClassName('form-control');
    for (let i = 0; i < allForms.length; i++) {
        if (allForms[i].value == '0') {
            allForms[i].classList.add('is-invalid');
        } else {
            allForms[i].classList.remove('is-invalid');
        }
    };
    const names = document.getElementsByClassName('names');
    for (let i = 0; i < names.length; i++) {
        if (names[i].value == '') {
            names[i].classList.add('is-invalid');
        }
        else {
            names[i].classList.remove('is-invalid');
        }
    }
};
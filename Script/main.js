import { optionsSelected } from "./state.js"
import { getCourseData } from "./apiCall.js"

$('#courseDropdown').change(function (event) {
    optionsSelected.courseOption = event.target.value;
    scorecardData()
})

$('#teeTypeDropDown').change(function (event) {
    optionsSelected.teeOption = event.target.value;
    scorecardData()
})
$('#holesDropdown').change(function (event) {
    optionsSelected.numberOfHoles = event.target.value;
    scorecardData()
})
$('#submitOptions').click(function (event) {
    validateDropdownOptions();
})

$('#playerDropdown').change(function (event) {
    createPlayerEntry();
})

function createPlayerEntry() {
    const playerOption = event.target.value;
    optionsSelected.numberOfPlayers = event.target.value;
    const playerEntry = document.getElementById('player-name-entry')
    const header = `
        <div>
        <h4 class='d-flex flex-column align-items-center' aria-describedby="playerNameHeader">
        Enter the player names: 
        </h4>
        <small id="playerNameWarning" class="d-flex flex-column align-items-center">
            Names entered cannot match other players
      </small>
      </div>
    `
    playerEntry.innerHTML = header;
    let playerNumber = parseInt(playerOption);
    const playerTemplate = (id) => `
    <div class='justify-content-center row'>
            <p class="player"> Player:  <p>
                <input id="player-${id}" class='col-md names form-control' type="text" placeholder="Name">
    </div> `
    for (let i = 0; i < playerNumber; i++) {
        playerEntry.innerHTML += playerTemplate(i);
    }
    for (let i = 0; i < playerNumber; i++) {
        $(`#player-${i}`).blur(function (event) {
            getNameData();
            compareNames(i);
        })
    }
}

function compareNames(currentSelectedId) {
    const namesClass = document.getElementsByClassName('names');
    let duplicateNames = false;
    const selectedNameInput = document.getElementById(`player-${currentSelectedId}`);
    for (let i = 0; i < namesClass.length; i++) {
        const nameInput = document.getElementById(`player-${i}`);
        if (nameInput.value == selectedNameInput.value && nameInput.id != selectedNameInput.id) {
            //where we find a duplicate
            duplicateNames = true;
        }
    }
    if (duplicateNames == true) {
        selectedNameInput.classList.add('is-invalid');
    }
    else {
        selectedNameInput.classList.remove('is-invalid');
    }
    optionsSelected.duplicateNames = duplicateNames;
    optionsSelected.nameInput[currentSelectedId] = currentSelectedId;
}

function getNameData() {
    const namesClass = document.getElementsByClassName('names');
    let playerNames = [];
    for (let i = 0; i < namesClass.length; i++) {
        const player = {
            name: namesClass[i].value,
            score: 0
        };
        playerNames.push(player);
    }
    optionsSelected.playerNames = playerNames;
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
    optionsSelected.totalPar = course.parTotal;
    return course;
}

async function calculateScore() {
    const processedData = await scorecardData();
    for (let count = 0; count < optionsSelected.playerNames.length; count++) {
        let score = 0;
        for (let i = 0; i < processedData.length; i++) {
            let aScore = parseInt(document.getElementById(`${optionsSelected.playerNames[count].name}${i}`).value)
            score += isNaN(aScore) ? 0 : aScore;
        }
        document.getElementById(`scoreTotal${count}`).innerText = score;
        document.getElementById(`scoreTotal${count}`).innerText = score;
        optionsSelected.playerNames[count].score = score;
    }
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
    let handicapRow = `
    <tr>
    <th>Handicap</th>
    `

    let namesArray = [];
    for (let i = 0; i < optionsSelected.playerNames.length; i++) {
        let nameRow = `
        <tr>
        <th>${optionsSelected.playerNames[i].name}</th>
        `
        for (let j = 0; j < processedData.length; j++) {
            nameRow += `
            <td><input class='scoreInput${i}' id="${optionsSelected.playerNames[i].name}${j}" onkeyup="calculateScore()" type="number"></td>
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
        handicapRow += `
        <td>${processedData[i].hcp}</td>
        `
    }
    scorecardDiv.innerHTML = `
    ${holesRow}
    <th>Total</th>
    </tr>
    ${yardsRow}
    <td>${processedData.yardsTotal}</td>
    </tr>
    ${parRow}
    <td>${processedData.parTotal}</td>
    </tr>
    ${handicapRow}
    <td>${processedData.hcpTotal}</td>
    </tr>
    ${namesArray.join('')}
    </tbody>
    `
    for(let i = 0; i < processedData.length; i++) {
        const scoreInput = $(`.scoreInput${i}`);
        scoreInput.blur(function (event) {
            checkScoreInputs(i);
        })
    }
}

function checkScoreInputs(playerId) {
    const scoreInputs =  document.getElementsByClassName(`scoreInput${playerId}`)
    let allInputsFilled = true;
    for(let i = 0; i < scoreInputs.length; i++) {
        if(!scoreInputs[i].value) {
            allInputsFilled = false;
        }
    }
    if(allInputsFilled) {
        finalScore(playerId);
    }
}

function validateDropdownOptions() {
    const allForms = document.getElementsByClassName('checkValid');
    let formControlValid = true;
    let nameValid = true;
    for (let i = 0; i < allForms.length; i++) {
        if (allForms[i].value == '0') {
            allForms[i].classList.add('is-invalid');
            formControlValid = false;
        } else {
            allForms[i].classList.remove('is-invalid');
        }
    };
    const nameDropdown = document.getElementsByClassName('checkPlayerValid');
    for (let i = 0; i < nameDropdown.length; i++) {
        if (nameDropdown[i].value == '0') {
            nameDropdown[i].classList.add('is-invalid');
            nameValid = false;
        }
        else {
            nameDropdown[i].classList.remove('is-invalid');
        }
    }
    const names = document.getElementsByClassName('names')
    for (let i = 0; i < names.length; i++) {
        if (names[i].value == '') {
            names[i].classList.add('is-invalid');
            nameValid = false;
        }
        else {
            if (names[i].id != `player-${optionsSelected.nameInput[i]}`) {
                names[i].classList.remove('is-invalid');
            }
        }
    }
    optionsSelected.formValidity = nameValid && formControlValid && !optionsSelected.duplicateNames;
    // optionsSelected.formValidity = nameValid == true && formControlValid == true ? true : false;
    if (optionsSelected.formValidity) {
        if($('#forms-container').is(':visible')) {
            $('#forms-container').hide();
        }
        scorecardData();
        populateScoreCard();
    }
};


function finalScore(playerId) {
        const playerScore = parseInt(optionsSelected.playerNames[playerId].score);
        const scoreVsPar = playerScore - parseInt(optionsSelected.totalPar);
        const playerName = optionsSelected.playerNames[playerId].name;
        if (playerScore > optionsSelected.totalPar) {
            document.getElementById(`scoreDetails`).innerHTML = `${playerName}'s final score is ${scoreVsPar}`
            document.getElementById(`finalMessage`).innerHTML = "Keep practicing that swing!"
        }
        if (playerScore == optionsSelected.totalPar) {
            document.getElementById(`scoreDetails`).innerHTML = `${playerName}'s final score is 0`
            document.getElementById(`finalMessage`).innerHTML = 'Right on the money!'
        }
        if (playerScore < optionsSelected.totalPar) {
            document.getElementById(`scoreDetails`).innerHTML = `${playerName}'s final score is ${playerScore}`
            document.getElementById(`finalMessage`).innerHTML = 'On to the PGA!'
        }
    $('#finalScoreMessage').modal('show')
}

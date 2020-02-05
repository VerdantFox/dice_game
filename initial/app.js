/************************************************
 * Classes
 *************************************************/
class State {
    constructor () {
        this.allDiceArr = [];
        this.selectedDiceArr = [];
        this.keptDiceArr = [];
        this.rollDiceArr = [];
        this.prevScore = 0;
        this.selectedScore = 0;
        this.totalScore = 0;
        this.playerArr = [];
        this.currentPlayerIndex = 0;
        this.currentPlayer;
        this.hasKept = false;
        this.prevScoreDOM = document.getElementById('prev-score');
        this.selectedScoreDOM = document.getElementById('selected-score');
        this.totalScoreDOM = document.getElementById('round-total');
    };

    updateSelectedDiceArr() {
        this.selectedDiceArr = [];
        this.allDiceArr.forEach(die => {
            if (die.selected) {
                this.selectedDiceArr.push(die);
            };
        });
    };
    updateKeptDiceArr() {
        this.keptDiceArr = [];
        this.allDiceArr.forEach(die => {
            if (die.kept) {
                this.keptDiceArr.push(die);
            };
        });
    };
    updateRollDiceArr() {
        this.rollDiceArr = [];
        this.allDiceArr.forEach(die => {
            if (! die.kept && ! die.selected) {
                this.rollDiceArr.push(die);
            };
        });
    };
    updateArrays() {
        this.updateSelectedDiceArr();
        this.updateKeptDiceArr();
        this.updateRollDiceArr();
    };
    updateCurrentPlayer() {
        this.currentPlayer = this.playerArr[this.currentPlayerIndex];
        // show current player in DOM
    };
    updatePrevScore(score) {
        this.prevScore = score
        this.prevScoreDOM.textContent = score;
    };
    updateSelectedScore(score) {
        this.selectedScore = score
        this.selectedScoreDOM.textContent = score;
    };
    updateTotalScore(score) {
        this.totalScore = score
        this.totalScoreDOM.textContent = score;
    };
    resetRoundScores() {
        this.updatePrevScore(0);
        this.updateSelectedScore(0);
        this.updateTotalScore(0);
    };
};

class Player {
    constructor (index) {
        this.index = index;
        this.name = `Player ${index}`;
        this.abbreviation = `P${index}`;
        this.score = 0;
        this.playerNameDom = document.getElementById(`player${index}-name`);
        this.playerScoreDom = document.getElementById(`player${index}-score`);
    };
    createPlayerHTML() {

    };
    updateScoreDom(){
        this.playerScoreDom.textContent = `Score: ${this.score}`;
    };
    updateScore(newScore){
        this.score += newScore;
        this.updateScoreDom()
    };
    resetScore() {
        this.score = 0;
        this.updateScoreDom()
    };

};

class Die {
    constructor (position) {
        this.position = position;
        this.value = position;
        this.dom = document.getElementById(`dice${position}`);
        this.selected = false;
        this.kept = false;
        this.locked = false;
    };

    async roll() {
        let roll;
        const rollTime = Math.floor(Math.random() * 4) + 16;
        this.locked = true;
        for (let rollCount = 0; rollCount < rollTime;  rollCount++) {
            // wait for an increasing amount of time
            await timeout(7 * rollCount);

            // 1. Random number
            roll = Math.floor(Math.random() * 6) + 1;

            //2. Display the result
            this.dom.style.display = 'block';
            this.updateDieDOM(roll);
        };
        this.value = roll;
        this.locked = false;
    };
    updateDieDOM(roll) {
        this.dom.src = 'dice-' + roll + '.png';
    };
    clearBorders() {
        this.dom.classList.remove('die-select');
        this.dom.classList.remove('die-invalid');
    };
    refreshBorders() {
        this.clearBorders();
        if (this.selected) {
            this.dom.classList.add('die-select');
        };
    }
    select() {
        this.selected = true;
        this.clearBorders();
        this.dom.classList.add('die-select');
    };
    deselect() {
        this.selected = false;
        this.clearBorders();
    };
    invalid() {
        this.selected = true;
        this.clearBorders();
        this.dom.classList.add('die-invalid');
    }
    updateSelectedBorders() {
        if (this.selected) {
            this.clearBorders();
            this.dom.classList.add('die-select');
        } else {
            this.clearBorders();
        }
    }
    moveToKept() {
        // figure this out
    };
    moveToAvailable() {
        // figure this out
    }
    resetDie() {
        this.deselect();
        this.value = this.position;
        this.selected = false;
        this.kept = false;
        this.locked = false;
        this.updateDieDOM(this.value);
    };
};


/************************************************
 * Helper Functions
 *************************************************/
function timeout (ms) {
    return new Promise(res => setTimeout(res,ms));
}

function getMapKeyByValue(map, searchValue) {
    for (let [key, value] of map.entries()) {
      if (value === searchValue)
        return key;
    };
  };

function setMapBoolean(map, boolean) {
    for (let key of map.keys()) {
        map.set(key, boolean);
    };
};

function scoreDice(diceArray) {

    let results = {
        score: 0,
        anyUsable: true,
        wastedDice: [],
    };

    let diceSelected = [];
    let rollVals = [];
    diceArray.forEach(die => {
        diceSelected.push(die);
        rollVals.push(die.value);
    });
    
    let rollFreqMap = new Map([
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0],
        [6, 0],
    ]);
    rollVals.forEach(die => {
        rollFreqMap.set(die, rollFreqMap.get(die) + 1);
    });
    const rollFreqVals = Array.from(rollFreqMap.values())
    let freqfreqMap = new Map([
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0],
        [6, 0],
    ]);
   rollFreqVals.forEach( freq =>{
        if (freq !== 0) {
            freqfreqMap.set(freq, freqfreqMap.get(freq) + 1);
        };
    });
    const freqFreqVals = Array.from(freqfreqMap.values());

    // all dice are unused until scored
    let usedDiceMap = new Map();
    for (let [key, value] of rollFreqMap.entries()) {
        if (value !== 0) {
            usedDiceMap.set(key, false);
        };
    };

    // triple doubles
    if (freqFreqVals[1] === 3) {
        results.score += 600;
        allDiceUsed = true;
        setMapBoolean(usedDiceMap, true);
    }
    // large straight
    if (freqFreqVals[0] === 6) {
        results.score += 1500;
        allDiceUsed = true;
        setMapBoolean(usedDiceMap, true);
    }
    // 3, 4, 5, 6 of a kind
    for (let [key, value] of rollFreqMap.entries()) {
        if (value >= 3) {
            if (key === 1) {
                results.score += key * 1000;
            } else {
                results.score += key * 100;
            };
            usedDiceMap.set(key, true);
        };
        if (value >= 4 ) {
            results.score *= 2;
        };
        if (value >= 5) {
            results.score *= 2;
        };
        if (value === 6) {
            results.score *= 2;
        };
    };
    // score ones individually
    if (! usedDiceMap.get(1) && rollFreqMap.get(1)) {
        results.score += rollFreqMap.get(1) * 100;
        usedDiceMap.set(1, true);
    };
    // score fives individually
    if (! usedDiceMap.get(5) && rollFreqMap.get(5)) {
        results.score += rollFreqMap.get(5) * 50;
        usedDiceMap.set(5, true);
    };

    // figure out which dice were unused
    for (die of diceArray) {
        if (! usedDiceMap.get(die.value)) {
            results.wastedDice.push(die);
        };
    };
    // determine if any dice were usable (for zilch)
    if (results.wastedDice.length === diceArray.length) {
        results.anyUsable = false;
    };

    // console.log(results)

    return results;
};

function resetGame(state) {
    // reset player scores
    state.playerArr.forEach(player =>{
        player.resetScore();
    });

    // reset round scores
    state.resetRoundScores();

    // reset dice
    state.allDiceArr.forEach(die => die.resetDie());

};

async function updateFromDieSelection() {
    state.updateArrays();
    let result = scoreDice(state.selectedDiceArr);
    state.updateSelectedScore(result.score);
    console.log(result.wastedDice);
    state.allDiceArr.forEach(die => die.refreshBorders());
    await timeout(10); // needed to sync up wasted dice flashing
    result.wastedDice.forEach(die => die.invalid());
};


/************************************************
 * Global Variables
 *************************************************/
const domObj = {
    rollBtn: document.getElementById('btn-roll'),
    holdBtn: document.getElementById('btn-hold'),
    newGameBtn: document.getElementById('btn-new-game'),
};

/************************************************
 * Script Entry Point
 *************************************************/
console.log("PLAYING");

// State object (store other objects in here)
let state = new State();

// Player objects
for (let i = 1; i <= 4; i++) {
    // Areate player object
    let player = new Player(i);
    // Add event listeners

    // Create players in view

    // Add player to state
    state.playerArr.push(player);
};


// Dice objects
for (let position = 1; position <= 6; position++) {
    // create die object
    let die = new Die(position);
    // create on click event listener for die object
    die.dom.addEventListener('click', function() {
        if (die.selected) {
            die.deselect();
            updateFromDieSelection();
        } else {
            die.select();
            updateFromDieSelection();
        };
    });
    // push die object to the state allDiceArr
    state.allDiceArr.push(die);
};

// Roll button object
domObj.rollBtn.addEventListener('click', function() {
    // Evaluate score, reject if unused dice
    let result = scoreDice(state.selectedDiceArr);
    if (result.wastedDice.length !== 0) {
        result.wastedDice.forEach(die => {
            die.invalid();
        });
        return;
    };

    // Roll dice
    state.rollDiceArr.forEach(die => {
        die.roll();
    });
});

// Hold dice button object


// Evaluate button object
// domObj.holdBtn.addEventListener('click', function(){
//     scoreDice(state.allDiceArr, true);
// });

// New Game button
domObj.newGameBtn.addEventListener('click', function() {resetGame(state)});

resetGame(state);



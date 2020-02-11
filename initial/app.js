/************************************************
 * Classes
 *************************************************/
class State {
    constructor () {
        this.allDiceArr = [];
        this.selectedDiceArr = [];
        this.scoredDiceArr = [];
        this.rollDiceArr = [];
        this.prevScore = 0;
        this.selectedScore = 0;
        this.totalScore = 0;
        this.playerArr = [];
        this.currentPlayerIndex = 0;
        this.currentPlayer;
        this.hasKept = false;
        this.inPlayRow1Count = 3
        this.inPlayRow2Count = 3
        this.scoredRow1Count = 0
        this.scoredRow2Count = 0
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
    updateScoredDiceArr() {
        this.scoredDiceArr = [];
        this.allDiceArr.forEach(die => {
            if (die.scored) {
                this.scoredDiceArr.push(die);
            };
        });
    };
    updateRollDiceArr() {
        this.rollDiceArr = [];
        this.allDiceArr.forEach(die => {
            if (! die.scored && ! die.selected) {
                this.rollDiceArr.push(die);
            };
        });
    };
    updateArrays() {
        this.updateSelectedDiceArr();
        this.updateScoredDiceArr();
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
    updateTotalScore() {
        this.totalScore = this.selectedScore + this.prevScore
        this.totalScoreDOM.textContent = this.totalScore;
    };
    resetRoundScores() {
        this.updatePrevScore(0);
        this.updateSelectedScore(0);
        this.updateTotalScore();
    };
};

class Player {
    constructor (index) {
        this.index = index;
        this.name = `Player ${index}`;
        this.abbreviation = `P${index}`;
        this.score = 0;
        this.isMyTurn = false;
        this.playerDom = document.getElementById(`player${index}`);
        this.playerNameDom = document.getElementById(`player${index}-name`);
        this.playerScoreDom = document.getElementById(`player${index}-score`);
    };
    setName() {
        this.playerNameDom.textContent = this.name;
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
    myTurn() {
        this.isMyTurn = true;
        this.playerDom.classList.add('my-turn');
    };
    notMyTurn() {
        this.isMyTurn = false;
        this.playerDom.classList.remove('my-turn');
    };

};

class Die {
    constructor (index, parentNode) {
        this.index = index;
        this.value = index;
        this.dom = document.getElementById(`dice${index}`);
        this.selected = false;
        this.scored = false;
        this.zilched = false;
        this.locked = false;
        this.parentNode = parentNode
    };

    roll() {
        return new Promise(async resolve => {
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
            resolve(this.value)
        });
    };
    updateDieDOM(roll) {
        this.dom.src = 'dice-' + roll + '.png';
    };
    clearBorders() {
        this.dom.classList.remove('die-select');
        this.dom.classList.remove('die-invalid');
        this.dom.classList.remove('die-zilch')
        this.dom.classList.remove('die-pair')
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
    zilch() {
        this.selected = false;
        this.zilched = true;
        this.clearBorders();
        this.dom.classList.add('die-zilch');
    };
    pair() {
        this.clearBorders();
        this.dom.classList.add('die-pair');
    };
    resetDie() {
        this.deselect();
        this.value = this.index;
        this.selected = false;
        this.scored = false;
        this.locked = false;
        this.updateDieDOM(this.value);
    };
    score(state, domObj) {
        let newParent;
        if (state.scoredRow1Count < 3) {
            // put in first row
            state.scoredRow1Count++;
            newParent = domObj.dieScoredRow1;
        } else {
            // put in 2nd row
            state.scoredRow2Count++;
            newParent = domObj.dieScoredRow2;
        };
        newParent.appendChild(this.dom);

        // remove old row count
        if (this.parentNode === domObj.dieInPlayRow1) {
            state.inPlayRow1Count--;
        } else {
            state.inPlayRow2Count--;
        }
        this.parentNode = newParent;

        this.scored = true;
        this.selected = false;
        this.clearBorders();
    };
    unScore(state, domObj) {

        let newParent;
        if (state.inPlayRow1Count < 3) {
            // put in first row
            state.inPlayRow1Count++;
            newParent = domObj.dieInPlayRow1;
        } else {
            // put in 2nd row
            state.inPlayRow2Count++;
            newParent = domObj.dieInPlayRow2;
        };
        newParent.appendChild(this.dom);

        // remove old row count
        if (this.parentNode === domObj.dieScoredRow1) {
            state.scoredRow1Count--;
        } else {
            state.scoredRow2Count--;
        }
        this.parentNode = newParent;

        this.scored = false;
        this.selected = false;
        this.clearBorders();
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

    const diceCount = diceArray.length

    let results = {
        score: 0,
        isPair: false,
        anyUsable: true,
        wastedDice: [],
    };

    let rollVals = [];
    diceArray.forEach(die => {
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
    if (results.wastedDice.length === diceCount) {
        results.anyUsable = false;
    };
    // determine if player had a single pair (for re-roll)
    if (freqFreqVals[1] === 1 && diceCount === 2) {
        results.isPair = true
    }

    return results;
};

function resetGame(state) {
    // reset player scores
    state.playerArr.forEach(player =>{
        player.resetScore();
        player.setName()
        if (player.index === 1) {
            player.myTurn();
        } else {
            player.notMyTurn();
        }
    });

    // reset round scores
    state.resetRoundScores();

    // reset dice
    state.allDiceArr.forEach(die => die.resetDie());

};

async function updateFromDieSelection(state) {
    state.updateArrays();
    let result = scoreDice(state.selectedDiceArr);
    state.updateSelectedScore(result.score);
    state.updateTotalScore();
    state.allDiceArr.forEach(die => die.refreshBorders());
    await timeout(10); // needed to sync up wasted dice flashing
    result.wastedDice.forEach(die => die.invalid());
};

function moveDiceToInPlay(state) {
    state.scoredDiceArr.forEach(die => {
        die.unScore(state, domObj)
    })
}

async function rollDice(state) {
    return new Promise(resolve => {
        // Evaluate score, reject if unused dice
        let result = scoreDice(state.selectedDiceArr);
        if (result.wastedDice.length !== 0) {
            result.wastedDice.forEach(die => {
                die.invalid();
            });
            resolve();
        };

        // Transfer "Selected" score to "Round so far" score
        state.updatePrevScore(state.totalScore);
        state.updateSelectedScore(0)
        state.updateTotalScore();

        // move scored dice
        state.selectedDiceArr.forEach(die => {
            dieValue = die.score(state, domObj);
        });

        state.updateArrays();
        // Move dice to in play area if scored is full
        if (state.scoredDiceArr.length === 6) {
            moveDiceToInPlay(state);
            state.updateArrays();
            rollDice(state);
        };

        // Roll dice unscored dice
        // Must resolve promise after last for loop awaited
        let completionsRemaining = state.rollDiceArr.length
        state.rollDiceArr.forEach(async die => {
            die.clearBorders();
            const value = await die.roll();
            completionsRemaining--
            if (completionsRemaining === 0) {
                result = scoreDice(state.rollDiceArr);
                console.log(result);
                if (! result.anyUsable && result.isPair) {
                    state.rollDiceArr.forEach(die => {
                        die.pair();
                        resolve();
                    });
                };
                console.log(state.rollDiceArr);
                if (! result.anyUsable && ! result.isPair) {
                    state.rollDiceArr.forEach(die => {
                        die.zilch();
                        resolve();
                    });
                };
                resolve();
            };
        });
    });
};


/************************************************
 * Global Variables
 *************************************************/
const domObj = {
    rollBtn: document.getElementById('btn-roll'),
    holdBtn: document.getElementById('btn-hold'),
    newGameBtn: document.getElementById('btn-new-game'),
    newDiceBtn: document.getElementById('btn-new-game'),
    dieInPlayRow1: document.getElementById('in-play-row-1'),
    dieInPlayRow2: document.getElementById('in-play-row-2'),
    dieScoredRow1: document.getElementById('scored-row-1'),
    dieScoredRow2: document.getElementById('scored-row-2'),
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
for (let index = 1; index <= 6; index++) {
    let die;
    // create die object
    if (index <= 3) {
        die = new Die(index, domObj.dieInPlayRow1);
    } else {
        die = new Die(index, domObj.dieInPlayRow2);
    }
    // create on click event listener for die object
    die.dom.addEventListener('click', function() {
        if (die.selected) {
            die.deselect();
        } else {
            die.select();
        };
        updateFromDieSelection(state);

    });
    // push die object to the state allDiceArr
    state.allDiceArr.push(die);
};

// Roll button object
domObj.rollBtn.addEventListener('click', async function() {
    const result = await rollDice(state);
});

// Hold dice button object
domObj.holdBtn.addEventListener('click', function(){
    let result = scoreDice(state.selectedDiceArr);
    if (result.wastedDice.length !== 0) {
        result.wastedDice.forEach(die => {
            die.invalid();
        });
        return;
    };
});

// New Game button
domObj.newGameBtn.addEventListener('click', function() {resetGame(state)});

resetGame(state);



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
        this.newPlayer = true;
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
    nextPlayer(domObj) {
        this.currentPlayer.notMyTurn()
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playerArr.length;
        this.updateCurrentPlayer()
        domObj.announcement.textContent += ` Your turn ${this.currentPlayer.name}...`
    }
    updateCurrentPlayer() {
        this.currentPlayer = this.playerArr[this.currentPlayerIndex];
        this.currentPlayer.myTurn();
    };
    updatePrevScore(score) {
        this.prevScore = score;
        this.prevScoreDOM.textContent = score;
    };
    updateSelectedScore(score) {
        this.selectedScore = score;
        this.selectedScoreDOM.textContent = score;
    };
    updateTotalScore() {
        this.totalScore = this.selectedScore + this.prevScore;
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
        this.updateScoreDom();
    };
    resetPlayer() {
        this.score = 0;
        this.isMyTurn = false;
        this.updateScoreDom();
        this.setName();
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
        this.invalid = false;
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
        this.dom.classList.remove('die-pair');
    };
    refreshBorders() {
        this.clearBorders();
        if (this.selected) {
            this.dom.classList.add('die-select');
        };
    }
    hover() {
        if (! this.locked) {
            if (this.invalid) {
                this.dom.classList.remove('die-invalid');
            };

            if (! this.selected) {
                this.dom.classList.add('die-hover-select');
            } else {
                this.dom.classList.add('die-hover-deselect');
            };
        };
    };
    unhover() {
        if (this.invalid) {
            this.dom.classList.add('die-invalid');
        };
        this.dom.classList.remove('die-hover-select');
        this.dom.classList.remove('die-hover-deselect');
    };
    select() {
        if (! this.selected && ! this.locked) {
            this.selected = true;
            this.clearBorders();
            this.dom.classList.add('die-select');
        };
    };
    deselect() {
        if (this.selected) {
            this.selected = false;
            this.invalid = false;
            this.clearBorders();
        };
    };
    invalidate() {
        this.invalid = true;
        this.selected = true;
        this.clearBorders();
        this.dom.classList.add('die-invalid');
    }
    zilch() {
        this.locked = true;
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
        this.value = this.index;
        this.locked = false;
        this.selected = false;
        this.invalid = false;
        this.deselect(state, domObj);
        this.updateDieDOM(this.value);
        if (this.scored) {
            this.unScore();
        };
        this.clearBorders();
        this.dom.classList.remove('die-zilch');
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

        this.locked = true;
        this.scored = true;
        this.selected = false;
        this.invalid = false;
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
};

function updateHoldBtn(state, domObj) {
    if (
            (state.currentPlayer.score >= 450 || state.totalScore >= 450)
            && ! state.newPlayer
            && state.selectedScore > 0
            && state.rollDiceArr.length > 0
        ) {
        domObj.holdBtn.disabled = false;
    } else {
        domObj.holdBtn.disabled = true;
    };
};


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

function calcDiceScore(diceArray) {

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

function newDice(state, domObj) {

    // reset round scores
    state.resetRoundScores();

    moveDiceToInPlay(state);
    state.updateArrays();
    state.allDiceArr.forEach(die => {
        die.resetDie();
        timeout(10);
        die.locked = true;
    });

    // disable "new dice"
    domObj.newDiceBtn.disabled = true;
    // disable "hold dice"
    domObj.holdBtn.disabled = true;
    // enable "roll dice"
    domObj.rollBtn.disabled = false;


};

function resetGame(state, domObj) {
    // reset players
    state.playerArr.forEach(player => {
        player.resetPlayer();
        if (player.index === 1) {
            state.currentPlayer = player;
            player.myTurn();
        } else {
            player.notMyTurn();
        }
    });

    // reset round scores
    state.resetRoundScores();

    // reset buttons
    newDice(state, domObj);

    // reset announcement
    const player1Name = state.playerArr[0].name
    domObj.announcement.textContent = `New Game! ${player1Name} start!`

};

async function updateFromDieSelection(state, domObj) {
    state.updateArrays();
    let result = calcDiceScore(state.selectedDiceArr);
    state.updateSelectedScore(result.score);
    state.updateTotalScore();
    updateHoldBtn(state, domObj);

    state.allDiceArr.forEach(die => die.refreshBorders());
    await timeout(10); // needed to sync up wasted dice flashing
    state.allDiceArr.forEach(die => {die.invalid = false});
    result.wastedDice.forEach(die => die.invalidate());
    if (result.wastedDice.length === 0 && state.selectedScore > 0) {
        domObj.rollBtn.disabled = false;
    };
};

function moveDiceToInPlay(state) {
    state.scoredDiceArr.forEach(die => {
        die.unScore(state, domObj);
    });
};

function scorePepTalk(score, state, domObj) {
    if (state.rollDiceArr.length < 3 && score > 0) {
        domObj.announcement.textContent = pickRandomString(rollComments[4]);
    } else if (score >= 1500) {
        domObj.announcement.textContent = pickRandomString(rollComments[3]);
    } else if (score >= 1000) {
        domObj.announcement.textContent = pickRandomString(rollComments[2]);
    } else if (score >= 300) {
        domObj.announcement.textContent = pickRandomString(rollComments[1]);
    } else if (score > 0) {
        domObj.announcement.textContent = pickRandomString(rollComments[0]);
    }; // else score === zero, don't change announcement
};

function moveScoredDice(state, domObj) {
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
        domObj.announcement.textContent = "And rolling!"
        moveDiceToInPlay(state);
        state.updateArrays();
        rollDice(state, domObj);
    };
}

async function rollDice(state, domObj) {
    return new Promise(resolve => {
        // Evaluate score, reject if unused dice
        let result = calcDiceScore(state.selectedDiceArr);
        if (result.wastedDice.length !== 0) {
            result.wastedDice.forEach(die => {
                die.invalidate();
            });
            return;
        };
        moveScoredDice(state, domObj);

        // disable all dice related buttons
        domObj.holdBtn.disabled = true;
        domObj.rollBtn.disabled = true;
        domObj.newDiceBtn.disabled = true;
        // Allow hold, since player has rolled once
        state.newPlayer = false;

        // Roll unscored dice
        // Must resolve promise after last for loop awaited
        let completionsRemaining = state.rollDiceArr.length
        state.rollDiceArr.forEach(async die => {
            die.clearBorders();
            const value = await die.roll();
            completionsRemaining--;
            if (completionsRemaining === 0) {
                result = calcDiceScore(state.rollDiceArr);
                scorePepTalk(result.score, state, domObj);
                if (result.wastedDice.length === 0) {
                    domObj.announcement.textContent = "And rolling!";
                }
                if (! result.anyUsable && result.isPair) {
                    domObj.rollBtn.disabled = false;
                    state.rollDiceArr.forEach(die => die.pair());
                    domObj.announcement.textContent = `Ooo... a pair. Staying alive...`;
                };
                if (! result.anyUsable && ! result.isPair) {
                    // prevent new player from holding
                    state.newPlayer = true;
                    state.rollDiceArr.forEach(die => die.zilch());
                    domObj.announcement.textContent = `Zilch!!!`;
                    domObj.holdBtn.disabled = true;
                    domObj.rollBtn.disabled = true;
                    domObj.newDiceBtn.disabled = false;
                    state.nextPlayer(domObj);
                };
                resolve();
            };
        });
    });
};

async function holdDice(state, domObj) {
    // Evaluate score, reject if unused dice
    let result = calcDiceScore(state.selectedDiceArr);
    if (result.wastedDice.length !== 0) {
        result.wastedDice.forEach(die => {
            die.invalidate();
        });
        return;
    };
    // prevent new player from holding
    state.newPlayer = true;
    // move scored dice to scored area
    moveScoredDice(state, domObj);
    // lock all roll-dice 
    state.rollDiceArr.forEach(die => {
        die.locked = true;
    })

    state.currentPlayer.updateScore(state.totalScore);
    domObj.announcement.textContent = `${state.currentPlayer.name} scored ${state.totalScore} points. `;
    state.nextPlayer(domObj);
    domObj.newDiceBtn.disabled = false;
    domObj.rollBtn.disabled = false;
    domObj.holdBtn.disabled = true;
};

function pickRandomString(array) {
    const index = Math.floor(Math.random() * array.length);
    return array[index]
}


/************************************************
 * Global Variables
 *************************************************/
const domObj = {
    rollBtn: document.getElementById('btn-roll'),
    holdBtn: document.getElementById('btn-hold'),
    newGameBtn: document.getElementById('btn-new-game'),
    newDiceBtn: document.getElementById('btn-new-dice'),
    dieInPlayRow1: document.getElementById('in-play-row-1'),
    dieInPlayRow2: document.getElementById('in-play-row-2'),
    dieScoredRow1: document.getElementById('scored-row-1'),
    dieScoredRow2: document.getElementById('scored-row-2'),
    announcement: document.getElementById('announcement'),
};

const insaneRollComments = [
    "Omg, that roll was insane!",
    "What?? That rolle was nuts!",
    "Your power level... it's over 9000!",
]
const highRollComments = [
    "Nice roll!",
    "Daaaaamn, now that's a roll!",
    "Some people get all the luck...",
    "Wow, what a roll!",
    "Oh baby! Nice roll!"
]
const midRollComments = [
    "Respectable roll.",
    "Ehh... I mean, it's alright...",
    "Not bad...",
    "Decent roll."
]
const lowRollComments = [
    "Slowly but surely...",
    "Keeping things moving...",
    "Still in the game...",
    "The next roll will be better, I'm sure...",
    "Oooph. Well at least it wasn't a Zilch!"
]
const rollSaveComments = [
    "Yes!",
    "What a nail biter!",
    "Phew, you did it!",
    "That was stressful..."
]
const rollComments = [
    lowRollComments,
    midRollComments,
    highRollComments,
    insaneRollComments,
    rollSaveComments,
]

/************************************************
 * Script Entry Point
 *************************************************/
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
    // create on CLICK event listener for die object
    die.dom.addEventListener('click', function() {
        if (die.selected) {
            die.deselect(state, domObj);
        } else {
            die.select(state, domObj);
        };
        updateFromDieSelection(state, domObj);
    });
    // create on HOVER event listener for die object
    die.dom.addEventListener('pointerenter', async function() {
        updateFromDieSelection(state, domObj);
        die.hover();
    });
    die.dom.addEventListener('pointerout', function() {
        updateFromDieSelection(state, domObj);
        die.unhover();
    });
    // push die object to the state allDiceArr
    state.allDiceArr.push(die);
};

// Roll button object
domObj.rollBtn.addEventListener('click', async function() {
    const result = await rollDice(state, domObj);
});

// New dice button object
domObj.newDiceBtn.addEventListener('click', function() {
    newDice(state, domObj);
});


// Hold dice button object
domObj.holdBtn.addEventListener('click', function(){
    holdDice(state, domObj);
});

// New Game button
domObj.newGameBtn.addEventListener('click', function() {
    resetGame(state, domObj);
});


resetGame(state, domObj);



/*
GAME RULES:

- The game has 2 players, playing in rounds
- In each turn, a player rolls a dice as many times as he whishes. Each result get added to his ROUND score
- BUT, if the player rolls a 1, all his ROUND score gets lost. After that, it's the next player's turn
- The player can choose to 'Hold', which means that his ROUND score gets added to his GLBAL score. After that, it's the next player's turn
- The first player to reach 100 points on GLOBAL score wins the game

*/
console.log("PLAYING")

const btnDOM = document.querySelector('.btn-roll');
const evalDOM = document.getElementById('evaluate')
let dieArr = [];
let tempScore = 0

function timeout (ms) {
    return new Promise(res => setTimeout(res,ms));
}

class dieClass {
    constructor (position) {
        this.position = position;
        this.value = position;
        this.dom = document.getElementById(`dice${position}`);
        this.held = false;
        this.selected = false;
        this.locked = false;
    }

    async roll() {
        let roll;
        const rollTime = Math.floor(Math.random() * 4) + 16;
        this.locked = true;
        for (let rollCount = 0; rollCount < rollTime;  rollCount++) {
            await timeout(7 * rollCount)
            // 1. Random number
            roll = Math.floor(Math.random() * 6) + 1;

            //2. Display the result
            this.dom.style.display = 'block';
            this.dom.src = 'dice-' + roll + '.png';
        }
        this.value = roll;
        this.locked = false;
    };

    hold() {
        console.log("HOLDING!")
        this.held = true;
        this.dom.classList.add('die-hold')
    }

    unhold() {
        console.log("UNHOLDING!")
        this.held = false;
        this.dom.classList.remove('die-hold')
    }
}

for (let position = 1; position <= 6; position++) {
    // create die object
    let die = new dieClass(position);
    // create on click event listener for die object
    die.dom.addEventListener('click', function() {
        if (die.held) {
            die.unhold()
        } else {
            die.hold()
        }
    });
    // push die object to the dieArr array
    dieArr.push(die)
};

btnDOM.addEventListener('click', function() {
    console.log("Roll!")
    dieArr.forEach( (die) => {
        if (die.held === false) {
            die.roll()
        }
    })
});

function getMapKeyByValue(map, searchValue) {
    for (let [key, value] of map.entries()) {
      if (value === searchValue)
        return key;
    }
  }

function scoreDice(diceArray, checkForHeld) {
    let score = 0;
    let diceHeld = [];
    let rollVals = [];
    diceArray.forEach(die => {
        if (die.held === true || ! checkForHeld) {
            diceHeld.push(die);
            rollVals.push(die.value);
        };
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
        }
    });
    const freqFreqVals = Array.from(freqfreqMap.values())

    // all dice are unused until scored
    let usedDiceMap = new Map();
    let allDiceUsed = false;
    for (let [key, value] of rollFreqMap.entries()) {
        if (value !== 0) {
            usedDiceMap.set(key, false)
        }
    }

    // triple doubles
    if (freqFreqVals[1] === 3) {
        score += 600;
        allDiceUsed = true;
    }
    // large straight
    if (freqFreqVals[0] === 6) {
        score += 1500;
        allDiceUsed = true;
    }
    // 3, 4, 5, 6 of a kind
    for (let [key, value] of rollFreqMap.entries()) {
        if (value >= 3) {
            if (key === 1) {
                score += key * 1000;
            } else {
                score += key * 100;
            };
            usedDiceMap.set(key, true);
        };
        if (value >= 4 ) {
            score *= 2;
        };
        if (value >= 5) {
            score *= 2;
        };
        if (value === 6) {
            score *= 2;
        };
    };
    // score ones individually
    if (! usedDiceMap.get(1) && rollFreqMap.get(1)) {
        score += rollFreqMap.get(1) * 100;
        usedDiceMap.set(1, true);
    };
    // score fives individually
    if (! usedDiceMap.get(5) && rollFreqMap.get(5)) {
        score += rollFreqMap.get(5) * 50;
        usedDiceMap.set(5, true);
    };

    console.log(`score=${score}`);

    let anyUsable = false
    for (let [key, value] of usedDiceMap.entries()) {
        if (value) {
            console.log(`key=${key}, value=${value}`)
            anyUsable = true
        } else {
            console.log(`${key} was unusable!`)
        }
    }
    console.log(`anyUsable=${anyUsable}`)
}

evalDOM.addEventListener('click', function(){
    scoreDice(dieArr, true);
});


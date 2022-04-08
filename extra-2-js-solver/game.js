let grid = [
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null]
];

let possibleWords = words;

let wrongLetters = [];
let wrongPlaceLetters = [];
let correctLetters = [null, null, null, null, null];

const LetterUnknown = 0
const LetterWrong = 1;
const LetterWrongPlace = 2;
const LetterCorrect = 3;

let guessY = 0;
let guessX = 0;
let correctWord = getRandomWord();

let showModal = false;
let showBoard = true;

const startTime = Date.now();
let currentTime = startTime;
let gamesPlayed = 0;
let gamesWon = 0;

function createCell(letter, state)
{
    return {
        letter: letter,
        state: state
    };
}

// done
function getRandomWord()
{
    const index = Math.floor(Math.random() * (answers.length));
    return answers[index];
}

// done
function getRandomGuess()
{
    const index = Math.floor(Math.random() * (possibleWords.length));
    return possibleWords[index];
}

function containsCorrectLetters(word)
{
    for (let index = 0; index < correctLetters.length; index++)
    {
        const correctLetter = correctLetters[index];
        if (correctLetter !== null && word[index] !== correctLetter)
        {
            return false;
        }
    }

    return true;
}

function containsWrongLetters(word)
{
    for (let index = 0; index < wrongLetters.length; index++)
    {
        const wrongLetter = wrongLetters[index];
        if (word.includes(wrongLetter))
        {
            return true;
        }
    }

    return false;
}

function filterPossibleWords()
{
    possibleWords = possibleWords.filter(word => containsCorrectLetters(word) && !containsWrongLetters(word));
}

function reset()
{
    guessY = 0;
    guessX = 0;
    correctWord = getRandomWord();
    grid = [
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null]
    ];
    possibleWords = words;
    wrongLetters = [];
    wrongPlaceLetters = [];
    correctLetters = [null, null, null, null, null];

    showModal = false;
}

function isLegalWord(word)
{
    return words.includes(word);
}

function isSolved()
{
    if (guessY > 5)
    {
        return false;
    }

    return grid[guessY].every((cell => cell !== null && cell.state === LetterCorrect));
}

function isLost()
{
    return guessY > 5;
}

function resolveGuess()
{
    // First, is this a valid word
    let guessWord = '';
    for (let i = 0; i < grid[guessY].length; i++)
    {
        guessWord += grid[guessY][i].letter;
    }

    if (!isLegalWord(guessWord))
    {
        showModal = true;
        return false;
    }

    let wordArray = correctWord.split('');

    // Resolve first for correct letters
    for (let index = 0; index < wordArray.length; index++)
    {
        const guessLetter = grid[guessY][index].letter;
        const answerLetter = wordArray[index];
        if (guessLetter === answerLetter)
        {
            grid[guessY][index].state = LetterCorrect;
            wordArray[index] = ' ';

            correctLetters[index] = guessLetter;
        }
    }

    // Then resolve for wrong locations
    for (let index = 0; index < wordArray.length; index++)
    {
        if (grid[guessY][index].state !== LetterUnknown)
        {
            continue;
        }

        const guessLetter = grid[guessY][index].letter;
        const answerIndex = wordArray.indexOf(guessLetter);
        if (answerIndex !== -1)
        {
            grid[guessY][index].state = LetterWrongPlace;
            wordArray[answerIndex] = ' ';

            if (wrongPlaceLetters.indexOf(guessLetter) === -1)
            {
                wrongPlaceLetters.push(guessLetter);
            }
        }
        else
        {
            grid[guessY][index].state = LetterWrong;
            if (wrongLetters.indexOf(guessLetter) === -1 && wrongPlaceLetters.indexOf(guessLetter) === -1 && correctLetters.indexOf(guessLetter) === -1)
            {
                wrongLetters.push(guessLetter);
            }
        }
    }

    return true;
}

function processLetter(letter)
{
    if (showModal)
    {
        showModal = false;
        return;
    }

    if (letter === 190)
    {
        showBoard = !showBoard;
    }

    // enter
    if (letter === 13 && guessX === 5 && guessY <= 5 && !isSolved())
    {
        if (resolveGuess() && !isSolved())
        {
            guessY++;
            guessX = 0;
        }
        return;
    }

    // backspace
    if (letter === 8 && guessX !== 0 && !isSolved())
    {
        guessX--;
        grid[guessY][guessX] = null;
        return;
    }

    // letter guess
    if (letter >= 65 && letter <= 90 && guessY <= 5 && guessX <= 4)
    {
        grid[guessY][guessX] = createCell(String.fromCharCode(letter), LetterUnknown);
        guessX++;
        return;
    }
}

function keyDownEvent(e)
{
    const letter = e.keyCode;
    processLetter(letter);
}

function update()
{
    const solved = isSolved();
    const lost = isLost();
    if (solved || lost)
    {
        reset();
        gamesPlayed++;

        if (solved)
        {
            gamesWon++;
        }
    }

    const guess = getRandomGuess();
    processLetter(guess.charCodeAt(0));
    processLetter(guess.charCodeAt(1));
    processLetter(guess.charCodeAt(2));
    processLetter(guess.charCodeAt(3));
    processLetter(guess.charCodeAt(4));
    processLetter(13);

    filterPossibleWords();
}

function drawBox(ctx, gridX, gridY, cell)
{
    const padding = 30;
    const width = 100;
    const offset = width + 10;

    const x = padding + gridX * offset;
    const y = padding + gridY * offset;

    if (cell === null)
    {
        ctx.beginPath();
        ctx.lineWidth = "4";
        ctx.strokeStyle = "gray";
        ctx.fillStyle = "aliceblue";
        ctx.rect(x, y, width, width);
        ctx.stroke();
    }
    else
    {
        if (cell.state === LetterUnknown)
        {
            ctx.beginPath();
            ctx.lineWidth = "4";
            ctx.strokeStyle = "gray";
            ctx.fillStyle = "aliceblue";
            ctx.rect(x, y, width, width);
            ctx.stroke();
        }
        else if (cell.state === LetterWrong)
        {
            ctx.fillStyle = "gray";
            ctx.fillRect(x, y, width, width);
        }
        else if (cell.state === LetterWrongPlace)
        {
            ctx.fillStyle = "gold";
            ctx.fillRect(x, y, width, width);
        }
        else if (cell.state === LetterCorrect)
        {
            ctx.fillStyle = "forestgreen";
            ctx.fillRect(x, y, width, width);
        }
        
        if (cell.state === LetterUnknown)
        {
            ctx.fillStyle = "gray";
        }
        else
        {
            ctx.fillStyle = "white";
        }

        ctx.font = "bold 80px Courier";
        ctx.fillText(cell.letter, x + 25, y + 73);
    }
}

function drawModal(ctx)
{
    if (!showModal)
    {
        return;
    }

    const x = 120;
    const y = 20;
    const width = 360;
    const height = 65;
    const modalText = "word not in allowed list";

    ctx.beginPath();
    ctx.lineWidth = "4";
    ctx.fillStyle = "maroon";
    ctx.strokeStyle = "red";
    ctx.rect(x, y, width, height);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "bold 20px Courier";
    ctx.fillText(modalText, x + 25, y + 38);
}

function draw(ctx, canvas)
{
    if (showBoard)
    {
        ctx.fillStyle = 'aliceblue';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < grid.length; y++)
        {
            for (let x = 0; x < grid[y].length; x++)
            {
                drawBox(ctx, x, y, grid[y][x]);
            }
        }
    }

    let x = 0;
    let y = 0;

    ctx.fillStyle = "gray";
    ctx.font = "bold 30px Courier";
    ctx.fillText("Games Played:  " + gamesPlayed, x + 25, y + 713);
    ctx.fillText("Games Won:     " + gamesWon, x + 25, y + 743);

    const secondsSinceStart = (currentTime - startTime) / 1000;
    const gamesPerSec = gamesPlayed / secondsSinceStart;
    ctx.fillText("Games Per sec: " + gamesPerSec.toFixed(2), x + 25, y + 773);

    drawModal(ctx);
}

function main()
{
    window.requestAnimationFrame(main);

    let canvas = document.getElementById('canvas');
    if (canvas.getContext)
    {
        let ctx = canvas.getContext('2d');
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        draw(ctx, canvas);

        ctx.restore();

        currentTime = Date.now();
    }
}

function callUpdate()
{
    update();
    setTimeout(callUpdate, 0);
}

window.addEventListener('keydown', keyDownEvent);
window.requestAnimationFrame(main);

callUpdate();
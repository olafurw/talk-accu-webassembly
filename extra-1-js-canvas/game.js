let grid = [
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null]
];

const LetterUnknown = 0
const LetterWrong = 1;
const LetterWrongPlace = 2;
const LetterCorrect = 3;

let guessY = 0;
let guessX = 0;
const word = getRandomWord();

let showModal = false;

function createCell(letter, state)
{
    return {
        letter: letter,
        state: state
    };
}

function getRandomWord()
{
    const index = Math.floor(Math.random() * (answers.length));
    return answers[index];
}

function isLegalWord(word)
{
    return words.includes(word);
}

function isSolved()
{
    return grid[guessY].every((cell => cell.state === LetterCorrect));
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

    let wordArray = word.split('');

    console.log(guessWord);
    console.log(wordArray);

    // Resolve first for correct letters
    for (let index = 0; index < wordArray.length; index++)
    {
        const guessLetter = grid[guessY][index].letter;
        const answerLetter = wordArray[index];
        console.log(guessLetter, answerLetter);
        if (guessLetter === answerLetter)
        {
            grid[guessY][index].state = LetterCorrect;
            wordArray[index] = ' ';
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
        }
        else
        {
            grid[guessY][index].state = LetterWrong;
        }
    }

    return true;
}

function keyDownEvent(e)
{
    const letter = e.keyCode;

    if (showModal)
    {
        showModal = false;
        return;
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
    if (letter >= 65 && letter <= 90 && guessX <= 4)
    {
        grid[guessY][guessX] = createCell(String.fromCharCode(letter), LetterUnknown);
        guessX++;
        return;
    }
}

function update()
{
   
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
    ctx.fillStyle = 'aliceblue';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < grid.length; y++)
    {
        for (let x = 0; x < grid[y].length; x++)
        {
            drawBox(ctx, x, y, grid[y][x]);
        }
    }

    drawModal(ctx);
}

const fps = 60;
const frameDuration = 1000 / fps;
let startTime = Date.now();
let delta = 0;

function main()
{
    window.requestAnimationFrame(main);

    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    startTime = currentTime;

    delta += elapsedTime;

    let canvas = document.getElementById('canvas');
    if (canvas.getContext)
    {
        let ctx = canvas.getContext('2d');
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        while (delta >= frameDuration)
        {
            update();

            delta -= frameDuration;
        }

        draw(ctx, canvas);

        ctx.restore();
    }
}

window.addEventListener('keydown', keyDownEvent);
window.requestAnimationFrame(main);
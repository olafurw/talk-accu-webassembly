var importObject = {
    env: {
        emscripten_random: function()
        {
            return Math.random();
        },
        emscripten_log: function(flags, str)
        {
            console.log(str);
        }
    },
    wasi_snapshot_preview1: { proc_exit: () => {} }
};

WebAssembly.instantiateStreaming(fetch('game_logic.wasm'), importObject)
.then((results) =>
{
    var update = results.instance.exports.update;
    var getGridHeight = results.instance.exports.getGridHeight;
    var getGridWidth = results.instance.exports.getGridWidth;
    var getCellLetter = results.instance.exports.getCellLetter;
    var getCellState = results.instance.exports.getCellState;
    var getGamesPlayed = results.instance.exports.getGamesPlayed;
    var getGamesWon = results.instance.exports.getGamesWon;

    const LetterUnknown = 0
    const LetterWrong = 1;
    const LetterWrongPlace = 2;
    const LetterCorrect = 3;

    const startTime = Date.now();
    let currentTime = startTime;

    let showBoard = true;

    function keyDownEvent(e)
    {
        const letter = e.keyCode;
        if (letter === 190)
        {
            showBoard = !showBoard;
        }
    }
    
    function drawBox(ctx, gridX, gridY)
    {
        const cellLetter = String.fromCharCode(getCellLetter(gridX, gridY));
        const cellState = getCellState(gridX, gridY);

        const padding = 30;
        const width = 100;
        const offset = width + 10;
    
        const x = padding + gridX * offset;
        const y = padding + gridY * offset;
    
        if (cellLetter === ' ')
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
            if (cellState === LetterUnknown)
            {
                ctx.beginPath();
                ctx.lineWidth = "4";
                ctx.strokeStyle = "gray";
                ctx.fillStyle = "aliceblue";
                ctx.rect(x, y, width, width);
                ctx.stroke();
            }
            else if (cellState === LetterWrong)
            {
                ctx.fillStyle = "gray";
                ctx.fillRect(x, y, width, width);
            }
            else if (cellState === LetterWrongPlace)
            {
                ctx.fillStyle = "gold";
                ctx.fillRect(x, y, width, width);
            }
            else if (cellState === LetterCorrect)
            {
                ctx.fillStyle = "forestgreen";
                ctx.fillRect(x, y, width, width);
            }
            
            if (cellState === LetterUnknown)
            {
                ctx.fillStyle = "gray";
            }
            else
            {
                ctx.fillStyle = "white";
            }
    
            ctx.font = "bold 80px Courier";
            ctx.fillText(cellLetter, x + 25, y + 73);
        }
    }
    
    function draw(ctx, canvas)
    {
        if (showBoard)
        {
            ctx.fillStyle = 'aliceblue';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            let gridHeight = getGridHeight();
            let gridWidth = getGridWidth();
            for (let y = 0; y < gridHeight; y++)
            {
                for (let x = 0; x < gridWidth; x++)
                {
                    drawBox(ctx, x, y);
                }
            }
        }
    
        let x = 0;
        let y = 0;

        const gamesPlayed = getGamesPlayed();
        const gamesWon = getGamesWon();
    
        ctx.fillStyle = "gray";
        ctx.font = "bold 30px Courier";
        ctx.fillText("Games Played:  " + gamesPlayed, x + 25, y + 713);
        ctx.fillText("Games Won:     " + gamesWon, x + 25, y + 743);
    
        const secondsSinceStart = (currentTime - startTime) / 1000;
        const gamesPerSec = gamesPlayed / secondsSinceStart;
        ctx.fillText("Games Per sec: " + gamesPerSec.toFixed(2), x + 25, y + 773);
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
});
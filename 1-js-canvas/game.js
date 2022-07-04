board[0][0] = createBox(0, 0, 2);

var fps = 60;
var startTime = Date.now();
var frameDuration = 1000 / fps;
var delta = 0;

function update()
{
    for (const row of board)
    {
        for (const box of row)
        {
            if (box !== null)
            {
                box.update();
            }
        }
    }

    var previousBoxesIteratedCount = boxesIteratedCount;
    boxesIteratedCount = iterateBoxes(keyXMove, keyYMove);
    areBoxesMoving = boxesIteratedCount > 0;

    if (previousBoxesIteratedCount > 0 && boxesIteratedCount === 0)
    {
        keyXMove = 0;
        keyYMove = 0;
        canCreateNewBox = true;
    }

    if (canCreateNewBox && !isAnyBoxMoving())
    {
        canCreateNewBox = false;
        var newX = 0;
        var newY = 0;
        do
        {
            newX = getRandomCoordinate();
            newY = getRandomCoordinate();
        }
        while(!isBoxEmpty(newX, newY));

        board[newY][newX] = createBox(newX, newY, 2);
    }
}

function draw(canvas, ctx)
{
    ctx.fillStyle = 'rgb(240, 240, 240)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const row of board)
    {
        for (const box of row)
        {
            if (box !== null)
            {
                box.draw(ctx);
            }
        }
    }
}

function main()
{
    window.requestAnimationFrame(main);

    var currentTime = Date.now();
    var elapsedTime = currentTime - startTime;
    startTime = currentTime;

    delta += elapsedTime;

    var canvas = document.getElementById('canvas');
    if (canvas.getContext)
    {
        var ctx = canvas.getContext('2d');
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        while (delta >= frameDuration)
        {
            update();

            delta -= frameDuration;
        }

        draw(canvas, ctx);

        ctx.restore();
    }
}

function keyDownEvent(e)
{
    if (areBoxesMoving)
    {
        return;
    }

    var code = e.keyCode;
    
    keyXMove = 0;
    keyYMove = 0;

    if (code === 39) // right
    {
        keyXMove = 1;
    }
    else if (code === 37) // left
    {
        keyXMove = -1;
    }
    else if (code === 38) // up
    {
        keyYMove = -1;
    }
    else if (code === 40) // down
    {
        keyYMove = 1;
    }
}

window.addEventListener('keydown', keyDownEvent);
window.requestAnimationFrame(main);
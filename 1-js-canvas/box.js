var board = [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null]
];

var boxSize = 100;
var boardScale = 100;

var keyXMove = 0;
var keyYMove = 0;
var areBoxesMoving = false;
var boxesIteratedCount = 0;
var canCreateNewBox = false;

function getRandomCoordinate()
{
    return Math.floor(Math.random() * 4);
}

function isOutbounds(x, y)
{
    return x >= board.length || x < 0 || y >= board.length || y < 0;
}

function isBoxEmpty(x, y)
{
    return board[y][x] === null;
}

function isBoxMergable(x, y, number)
{
    if (isOutbounds(x, y) || isBoxEmpty(x, y))
    {
        return false;
    }

    return board[y][x].number === number && board[y][x].deleteAfterMerge === false;
}

function isAnyBoxMoving()
{
    for (var x = 0; x < board.length; x++)
    {
        for (var y = 0; y < board.length; y++)
        {
            var box = board[y][x];
            if (box !== null && box.isMoving)
            {
                return true;
            }
        }
    }

    return false;
}

function iterateBox(x, xNext, y, yNext)
{
    if (isOutbounds(x, y) || isBoxEmpty(x, y))
    {
        return 0;
    }

    if (board[y][x].deleteAfterMerge)
    {
        board[y][x] = null;
        return 1;
    }

    if (isBoxEmpty(xNext, yNext))
    {
        board[yNext][xNext] = board[y][x];
        board[yNext][xNext].setLocation(xNext, yNext);
        board[y][x] = null;

        return 1;
    }
    else if (isBoxMergable(xNext, yNext, board[y][x].number))
    {
        board[y][x].setLocation(xNext, yNext);
        board[y][x].deleteAfterMerge = true;
        board[yNext][xNext].merge();

        return 1;
    }

    return 0;
}

function iterateRow(y, direction)
{
    var moveCount = 0;

    if (direction > 0)
    {
        for (var x = board.length - 2; x >= 0; x--)
        {
            moveCount += iterateBox(x, x + 1, y, y);
        }
    }
    else if (direction < 0)
    {
        for (var x = 1; x < board.length; x++)
        {
            moveCount += iterateBox(x, x - 1, y, y);
        }   
    }

    return moveCount;
}

function iterateColumn(x, direction)
{
    var moveCount = 0;

    if (direction > 0)
    {
        for (var y = board.length - 2; y >= 0; y--)
        {
            moveCount += iterateBox(x, x, y, y + 1);
        }
    }
    else if (direction < 0)
    {
        for (var y = 1; y < board.length; y++)
        {
            moveCount += iterateBox(x, x, y, y - 1);
        }   
    }

    return moveCount;
}

function iterateBoxes(xMove, yMove)
{
    var moveCount = 0;

    if (xMove !== 0)
    {
        for (var y = 0; y < board.length; y++)
        {
            moveCount += iterateRow(y, xMove);
        }
    }
    if (yMove !== 0)
    {
        for (var x = 0; x < board.length; x++)
        {
            moveCount += iterateColumn(x, yMove);
        }
    }

    return moveCount;
}

function createBox(x, y, number)
{
    return {
        xGrid: x,
        yGrid: y,
        xGridNext: x,
        yGridNext: y,
        x: boardScale * x,
        y: boardScale * y,
        xNext: boardScale * x,
        yNext: boardScale * y,
        isMoving: false,
        deleteAfterMerge: false,
        height: boxSize,
        width: boxSize,
        number: number,
        numberNext: number,
        color: 'rgb(200, 0, 0)',
        textColor: 'rgb(0, 0, 0)',
        textFont: 'bold 30px Arial',
        setLocation: function(newX, newY)
        {
            this.xGridNext = newX;
            this.yGridNext = newY;
            this.xNext = boardScale * newX;
            this.yNext = boardScale * newY;
        },
        merge: function()
        {
            this.numberNext = this.number * 2;
            this.number = this.numberNext;
        },
        update: function()
        {
            if (this.xGridNext !== this.xGrid)
            {
                this.isMoving = true;

                if (this.xGrid < this.xGridNext)
                {
                    this.x += 32.0;

                    if (this.x > this.xNext)
                    {
                        this.isMoving = false;
                        this.x = this.xNext;
                        this.xGrid = this.xGridNext;

                        if (this.numberNext != this.number)
                        {
                            this.number = this.numberNext;
                        }
                    }
                }
                else if (this.xGrid > this.xGridNext)
                {
                    this.x -= 32.0;

                    if (this.x < this.xNext)
                    {
                        this.isMoving = false;
                        this.x = this.xNext;
                        this.xGrid = this.xGridNext;

                        if (this.numberNext != this.number)
                        {
                            this.number = this.numberNext;
                        }
                    }
                }
            }

            if (this.yGridNext !== this.yGrid)
            {
                this.isMoving = true;

                if (this.yGrid < this.yGridNext)
                {
                    this.y += 32.0;

                    if (this.y > this.yNext)
                    {
                        this.isMoving = false;
                        this.y = this.yNext;
                        this.yGrid = this.yGridNext;

                        if (this.numberNext != this.number)
                        {
                            this.number = this.numberNext;
                        }
                    }
                }
                else if (this.yGrid > this.yGridNext)
                {
                    this.y -= 32.0;

                    if (this.y < this.yNext)
                    {
                        this.isMoving = false;
                        this.y = this.yNext;
                        this.yGrid = this.yGridNext;

                        if (this.numberNext != this.number)
                        {
                            this.number = this.numberNext;
                        }
                    }
                }
            }
        },
        draw: function(ctx)
        {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.height, this.width);

            ctx.fillStyle = this.textColor;
            ctx.font = this.textFont;
            ctx.textAlign = 'center';
            ctx.fillText(this.number, this.x + (this.width / 2), this.y + (this.height / 2) + 11);
        }
    };
}

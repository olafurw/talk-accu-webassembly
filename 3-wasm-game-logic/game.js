var keyXMove = 0;
var keyYMove = 0;

var importObject = {
    env: {
        emscripten_random: function()
        {
            return Math.random();
        },
    },
    wasi_snapshot_preview1: {}
};
WebAssembly.instantiateStreaming(fetch('game_logic.wasm'), importObject)
.then((results) =>
{
    var isBoxEmpty = results.instance.exports.isBoxEmpty;
    var update = results.instance.exports.update;
    var createBox = results.instance.exports.createBox;
    var getXCoordinate = results.instance.exports.getXCoordinate;
    var getYCoordinate = results.instance.exports.getYCoordinate;
    var getHeight = results.instance.exports.getHeight;
    var getWidth = results.instance.exports.getWidth;
    var getNumber = results.instance.exports.getNumber;
    var getBoardSize = results.instance.exports.getBoardSize;
    
    function keyDownEvent(e)
    {
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
    
    createBox(0, 0, 2);

    function draw(canvas, ctx)
    {
        ctx.fillStyle = 'rgb(240, 240, 240)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        var boardSize = getBoardSize();
        for (var x = 0; x < boardSize; x++)
        {
            for (var y = 0; y < boardSize; y++)
            {
                if (isBoxEmpty(x, y))
                {
                    continue;
                }

                var xCoord = getXCoordinate(x, y);
                var yCoord = getYCoordinate(x, y);
                var height = getHeight(x, y);
                var width = getWidth(x, y);
                var number = getNumber(x, y);

                ctx.fillStyle = 'rgb(200, 0, 0)';
                ctx.fillRect(xCoord, yCoord, height, width);
    
                ctx.fillStyle = 'rgb(0, 0, 0)';
                ctx.font = 'bold 30px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(number, xCoord + (width / 2), yCoord + (height / 2) + 11);
            }
        }
    }
    
    var fps = 60;
    var startTime = Date.now();
    var frameDuration = 1000 / fps;
    var delta = 0;
    
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
                if (update(keyXMove, keyYMove))
                {
                    keyXMove = 0;
                    keyYMove = 0;
                }
    
                delta -= frameDuration;
            }
    
            draw(canvas, ctx);
    
            ctx.restore();
        }
    }
    
    window.addEventListener('keydown', keyDownEvent);
    window.requestAnimationFrame(main);

});
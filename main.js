var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var intervalId;
var timerDelay = 100;
var rectLeft = 0;
var rectTop = 0;
var quit = false;

function redrawAll() {
    // erase everything -- not efficient, but simple!
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(rectLeft, rectTop, 40, 40);
    /*
    ctx.font = "20px Arial";
    ctx.fillText("Press 'q' to quit.", 20, 40);
    */
}

function onTimer() {
    if (quit) return;
    rectLeft = (rectLeft + 10) % 400;
    redrawAll();
}

function onKeyDown(event) {
    if (quit) return;
    var qCode = 81;
    var lCode = 37;
    var rCode = 39;
    var uCode = 38;
    var dCode = 40;
    if (event.keyCode === qCode) {
        clearInterval(intervalId);
        // ctx.clearRect(0, 0, 400, 400);
        ctx.fillStyle = "rgba(128,128,128,0.75)";
        ctx.fillRect(0, 0, 400, 400);
        quit = true;
    }else if (event.keyCode === lCode){
        console.log(rectLeft);
        console.log(canvas.width);
        rectLeft = ((rectLeft%canvas.width) - 40) % canvas.width;
        console.log(rectLeft);
        redrawAll();
    }else if (event.keyCode === rCode){
        rectLeft = (rectLeft + 40) % canvas.width;
        redrawAll();
    }else if (event.keyCode === uCode){
        rectTop = (rectTop - 40) % canvas.height;
        redrawAll();
    }else if (event.keyCode === dCode){
        rectTop = (rectTop + 40) % canvas.height;
        redrawAll();
    }
}

function run() {
    canvas.addEventListener('keydown', onKeyDown, false);
    // make canvas focusable, then give it focus!
    canvas.setAttribute('tabindex','0');
    canvas.focus();
    redrawAll();
    // For timer events uncomment following line
    //intervalId = setInterval(onTimer, timerDelay);
}

run();
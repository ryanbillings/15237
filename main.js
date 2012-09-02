/* 15237 Homework 1
 * achayes, rbilling
 */
 
/** Initialize the canvas **/
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

/** Global Variables **/
var cellSize = 40;
var height = canvas.height;
var width = canvas.width;
var gameLevel;
var backgroundColor = 'blue';
var CELL_EMPTY = 0;
var CELL_PLAYER = 1;
var CELL_BLOCK = 2;
var CELL_FINISH = 3;

/** Objects **/

/*
 * A character object for the player to move
 */
function Player(startX, startY){
    this.xPos = startX;
    this.yPos = startY;
    ctx.fillStyle = 'green';
    ctx.fillRect(startX*cellSize, startY*cellSize, cellSize, cellSize);
}

Player.prototype.move = function(xPos, yPos){
    /* Clear the current position */
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(this.xPos*cellSize, this.yPos*cellSize, cellSize, cellSize);
    /* Update the x and y for the player */
    this.xPos = xPos;
    this.yPos = yPos;
    /* Redraw the player */
    ctx.fillStyle = 'green';
    ctx.fillRect(this.xPos*cellSize, this.yPos*cellSize, cellSize, cellSize);
}

/*
 * A block object that will stop a player in its path
 */
function Block(posX, posY, blockWidth, blockHeight){
    // Declare block color (should be passed as param)
    ctx.fillStyle = 'red';
    // Draw the block
    ctx.fillRect(posX*cellSize, posY*cellSize, blockWidth, blockHeight);
}

/*
 * An object representing the current map
 */
function GameMap(rows, cols){
    this.rows = rows;
    this.cols = cols;
    // Create 2d Array representation of the map
    this.grid = new Array(rows);
    for(var i = 0; i < this.grid.length; i++){
        this.grid[i] = new Array(cols);
        for(var j = 0; j<cols; j++){
            this.grid[i][j] = CELL_EMPTY;
        }
    }
    // Clear the map
    ctx.clearRect(0,0,width,height);
    // Initialize an array of player objects
    this.players = new Array();
    // Initialize an array of block objects
    this.blocks = new Array();
}

GameMap.prototype.drawBackground = function(){
    ctx.fillStyle = 'blue';
    ctx.fillRect(0,0,width,height);
};

GameMap.prototype.drawPlayers = function(posX, posY){
    var player = new Player(posX, posY);
    this.players.push(player);
    this.grid[posX][posY] = CELL_PLAYER;
};

GameMap.prototype.drawBlocks = function(posX, posY){
    var block = new Block(posX, posY, cellSize, cellSize);
    this.blocks.push(block);
    this.grid[posX][posY] = CELL_BLOCK;
};

GameMap.prototype.drawFinish = function(posX, posY){
    this.finishX = posX;
    this.finishY = posY;
    this.grid[posX][posY] = CELL_FINISH;
    ctx.fillStyle = 'yellow';
    ctx.fillRect(posX*cellSize,posY*cellSize,cellSize,cellSize);
};

/* Move methods for players (ideally should check conditions before moving) */
GameMap.prototype.movePlayers = function(direction){
    var lCode = 37;
    var rCode = 39;
    var uCode = 38;
    var dCode = 40;
    for(var i = 0; i < this.players.length; i++){
        var player = this.players[i];
        var tempX = player.xPos;
        var tempY = player.yPos;
        if (direction === lCode){ // Move the player as far left as possible
            // Go through each cell in this row
            while(tempX > 0 && this.grid[tempX-1][tempY] !== CELL_BLOCK){
                tempX--;
            }
        }else if (direction === rCode){ // Move right
            // Go through each cell in this row
            while(tempX < this.rows-1 && this.grid[tempX+1][tempY] !== CELL_BLOCK){
                tempX++;
            }
        }else if (direction === uCode){ // Move up
            while(tempY > 0 && this.grid[tempX][tempY-1] !== CELL_BLOCK){
                tempY--;
            }
        }else if (direction === dCode){ // Move Down
            while(tempY < this.cols-1 && this.grid[tempX][tempY+1] !== CELL_BLOCK){
                tempY++;
            }
        }
        // Draw the move
        player.move(tempX,tempY);
        if(tempX === this.finishX && tempY == this.finishY){
            gameLevel.nextLevel();
        }
    }
    
};

/*
 * An object representing the properties of the level
 */
function Level(numLevel){
    this.numLevel = numLevel;
    // Main logic based on the level
    this.selectLevel();
}

Level.prototype.selectLevel = function(){
    switch(this.numLevel){
        case 1:
            console.log('Level 1');
            this.level1();
            break;
        case 2:
            console.log('Level 2');
            this.level2();
            break;
        default:
            console.log('Game Over');
            break;
    }
};

// Set up the canvas for level 1
Level.prototype.level1 = function(){
    // Initialize a new map containing graphics for this level
    this.map = new GameMap(20,15);
    // Create the background
    this.map.drawBackground();
    // Create the blocks
    this.map.drawBlocks(0,4);
    this.map.drawBlocks(3,14);
    this.map.drawBlocks(8,12);
    this.map.drawBlocks(1,3);
    this.map.drawBlocks(10,0);
    this.map.drawBlocks(10,8);
    this.map.drawBlocks(9,8);
    // Draw players
    this.map.drawPlayers(0,0);
    // Draw Finish
    this.map.drawFinish(19,14);
    return;
}

// Set up the canvas for level 2
Level.prototype.level2 = function(){
    // Initialize a new map containing graphics for this level
    this.map = new GameMap(20,15);
    // Create the background
    this.map.drawBackground();
    // Create the blocks
    this.map.drawBlocks(7,4);
    this.map.drawBlocks(7,14);
    this.map.drawBlocks(7,12);
    this.map.drawBlocks(1,3);
    this.map.drawBlocks(10,1);
    this.map.drawBlocks(10,8);
    this.map.drawBlocks(9,8);
    // Draw players
    this.map.drawPlayers(0,0);
    // Draw Finish
    this.map.drawFinish(5,5);
    return;
}


/** Game Functions **/
Level.prototype.nextLevel = function(){
    this.numLevel++;
    this.selectLevel();
}

function onTimer() {
    rectLeft = (rectLeft + 10) % 400;
    redrawAll();
}

function onKeyDown(event) {
    gameLevel.map.movePlayers(event.keyCode);
}

function run() {
    // make canvas focusable, then give it focus!
    canvas.setAttribute('tabindex','0');
    canvas.focus();
    // initialize the game
    gameLevel = new Level(1);
    // add key listeners
    canvas.addEventListener('keydown', onKeyDown, false);
}

run();
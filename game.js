/* 15237 Homework 1
 * achayes, khellste, rbilling
 */


var canvas = document.getElementById("myCanvas");
canvas.setAttribute('tabindex', '0');
canvas.focus();
canvas.addEventListener('keydown', onKeyDown, false);
var ctx = canvas.getContext("2d");
var EMPTY = 0;
var PLAYER = 1;
var BLOCK = 2;
var FINISH = 3;
var cellSize = 40;
var slideSpeed = 10; //blocks per second

/*
 * A basic object that stores location and size
 * It also has prototypes for drawing itself and updating its location
 */
function BaseObject(row, col, width, height){
    this.row = row
    this.col = col;
    this.startRow = row;
    this.startCol = col;
    this.x = col*cellSize;
    this.y = row*cellSize;
    this.width = width;
    this.height = height;
    this.dr = 0;
    this.dc = 0;
}
BaseObject.prototype.type = EMPTY;
BaseObject.prototype.drawFn = function() {
    ctx.fillRect(this.x, this.y, this.width, this.height);
};
BaseObject.prototype.reset = function() {
    this.row = this.startRow;
    this.col = this.startCol;
    this.x = this.col*cellSize;
    this.y = this.row*cellSize;
    this.dc = 0;
    this.dr = 0;
};
/*
 * Update the object's location based on how much time has passed
 * and the speed and direction the object is going.
 */
BaseObject.prototype.update = function(state, tdelt) {
    this.x += this.dc*slideSpeed*cellSize*tdelt/1000;
    this.y += this.dr*slideSpeed*cellSize*tdelt/1000;
    var cornerX = this.x + (this.dc < 0 ? cellSize : 0);
    var cornerY = this.y + (this.dr < 0 ? cellSize : 0);
    var xSign = this.x >= 0 ? 1 : -1;
    var ySign = this.y >= 0 ? 1 : -1;
    var col = Math.floor(cornerX/cellSize);
    var row = Math.floor(cornerY/cellSize);
    this.row = row;
    this.col = col;
    // Reset the object if it has gone off the screen
    if (col >= state.map.cols || col < 0 || row >= state.map.rows || row < 0){
        this.reset();
    }
    /* If the object is a player, check if the block it's about to hit is
       a block. If it is, interact with that block */
    if(this instanceof PlayerObj){
        var nextRow = this.row + this.dr;
        var nextCol = this.col + this.dc;
        var nBlock = state.map.grid[nextRow][nextCol];
        if(nBlock !== undefined && nBlock.type === BLOCK){
            nBlock.playerInteract(this);
        }
    }
};

/*
 * The player (inherits from BaseObject)
 * It has a different type and draw function.
 */
function PlayerObj(row, col, width, height){
    BaseObject.call(this, row, col, width, height);
};
PlayerObj.prototype = new BaseObject();
PlayerObj.prototype.constructor = PlayerObj;
PlayerObj.prototype.type = PLAYER;
PlayerObj.prototype.drawFn = function(){
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
};

/*
 * A generic block (inherits from BaseObject)
 * It has a different type and draw function.
 * Additionally, it has a playerInteract function
 * which is called if a player "hits" it.
 */
function BlockObj(row, col, width, height){
    BaseObject.call(this, row, col, width, height);
}
BlockObj.prototype = new BaseObject();
BlockObj.prototype.constructor = BlockObj;
BlockObj.prototype.type = BLOCK;
BlockObj.prototype.drawFn = function(){
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x, this.y, this.width, this.height);
};
/* This stops the player */
BlockObj.prototype.playerInteract = function(player){
    player.dr = 0;
    player.dc = 0;
    player.x = player.col*cellSize;
    player.y = player.row*cellSize;
};


/*
 * A very basic map that stores references to all the objects
 * currently in the game. They are stored in a grid, which is
 * used for interaction logic (even though the player technically
 * "slides" between grid squares, it's always treated as occupying
 * exactly one grid square at a time).
 */
function GameMap(rows, cols){
    this.rows = rows;
    this.cols = cols;
    // Create 2d Array representation of the map
    this.grid = new Array(rows);
    for(var i = 0; i < this.grid.length; i++){
        this.grid[i] = new Array(cols);
        for(var j = 0; j < cols; j++){
            this.grid[i][j] = new BaseObject(i, j, cellSize, cellSize);
        }
    }
}


/*
 * Stores the whole of the game state. This includes the game map,
 * lists of players and blocks, and some functions for game control.
 * Note that the players/blocks are stored in 2 data types: lists
 * of each respective object and a grid with their locations.
 */
function GameState(timerDelay, rows, cols) {
    this.map = new GameMap(rows, cols);
    this.timerDelay = timerDelay;
    // The types of objects stored in the game state
    // Used in [redraw,update]All to loop through all objects
    this.objTypes = ["players", "blocks"];
    // Initialize an array of player objects
    this.players = new Array();
    // Initialize an array of block objects
    this.blocks = new Array();
    /* Add an object to the game state by putting it in
       the correct list and adding it to the grid */
    this.addObject = function(object) {
        switch(object.type) {
            case PLAYER:
                this.players.push(object);
                break;
            case BLOCK:
                this.blocks.push(object);
                break;
            case FINISH:
                this.blocks.push(object);
                break;
            default:
                console.log("Invalid object type");
                return;
        }
        this.map.grid[object.row][object.col] = object;
    }
    /* Clears the canvas and redraws all the objects */
    this.redrawAll = function(state) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(var i = 0; i < state.objTypes.length; i++){
            var objs = state[state.objTypes[i]];
            for(var j = 0; j < objs.length; j++){
                objs[j].drawFn();
            }
        }
    };
    /* Calls the update function on all the objects */
    this.updateAll = function(state) {
        var tdelt = state.timerDelay;
        for(var i = 0; i < state.objTypes.length; i++){
            var objs = state[state.objTypes[i]];
            for(var j = 0; j < objs.length; j++){
                objs[j].update(state, tdelt);
            }
        }
    };
    var state = this;
    /* Starts the game by setting up the update/redraw intervals */
    this.startGame = function() {
        this.upInt = setInterval(function(){state.updateAll(state)}, state.timerDelay);
        this.drawInt = setInterval(function(){state.redrawAll(state)}, state.timerDelay);
    };
    /* If the player is not moving, change the player's speed/direction */
    this.keyPress = function(code) {
        var lCode = 37;
        var rCode = 39;
        var uCode = 38;
        var dCode = 40;
        var dr = 0;
        var dc = 0;
        switch(code) {
            case lCode:
                dc = -1;
                break;
            case rCode:
                dc = 1;
                break;
            case uCode:
                dr = -1;
                break;
            case dCode:
                dr = 1;
                break;
//            default:
//                clearInterval(this.upInt);
//                clearInterval(this.drawInt);
//                return;
        }
        var player;
        for (var i = 0; i < this.players.length; i++){
            player = this.players[i];
            if(player.dr === 0 && player.dc === 0) {
                this.players[i].dr = dr;
                this.players[i].dc = dc;
            }
        }
    };
}

function onKeyDown(event) {
    state.keyPress(event.keyCode);
}


// Create a new state and add objects
state = new GameState(10, 15, 20);
state.addObject(new PlayerObj(1, 1, cellSize, cellSize));
state.addObject(new BlockObj(1, 5, cellSize, cellSize));
state.addObject(new BlockObj(1, 0, cellSize, cellSize));
state.addObject(new BlockObj(0, 1, cellSize, cellSize));
state.addObject(new BlockObj(5, 1, cellSize, cellSize));
state.startGame();




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
var PORTAL = 4;
var cellSize = 40;
var slideSpeed = 20; //blocks per second

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
    var level = state.levels[state.curLevel];
    var cols = level.map.cols;
    var rows = level.map.rows;
    // Reset the object if it has gone off the screen
    if (col >= cols || col < 0 || row >= rows || row < 0){
        this.reset();
    }
    /* If the object is a player, check if the block it's about to hit is
       a block. If it is, interact with that block */
    if(this instanceof PlayerObj){
        if(row >= 0 && row < rows && col >= 0 && col < cols &&
           level.map.grid[row][col].type === FINISH) {
           level.map.grid[row][col].playerInteract(state);
           return;
        }
        var nextRow = this.row + this.dr;
        var nextCol = this.col + this.dc;
        if(nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols) {
            var nBlock = level.map.grid[nextRow][nextCol];
            if(nBlock !== undefined && (nBlock.type === BLOCK || nBlock.type === PORTAL)){
                nBlock.playerInteract(this);
            }
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
 * A pair of portal blocks that, when touched, spits you
 * out at the other portal
 */
function PortalObj(id, row, col, width, height){
    BaseObject.call(this, row, col, width, height);
    this.id = id;
    this.otherRow = 0;
    this.otherCol = 0;
}
PortalObj.prototype = new BaseObject();
PortalObj.prototype.constructor = PortalObj;
PortalObj.prototype.type = PORTAL;
PortalObj.prototype.drawFn = function(){
    ctx.fillStyle = "purple";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "white";
    ctx.font = cellSize + "px Arial";
    ctx.fillText(this.id, this.x, this.y + cellSize);
};
/* This stops the player */
PortalObj.prototype.playerInteract = function(player){
    player.row = this.otherRow;
    player.col = this.otherCol;
    player.x = player.col*cellSize;
    player.y = player.row*cellSize;
};


/*
 * A generic block (inherits from BaseObject)
 * It has a different type and draw function.
 * Additionally, it has a playerInteract function
 * which is called if a player "hits" it.
 */
function FinishObj(row, col, width, height){
    BaseObject.call(this, row, col, width, height);
}
FinishObj.prototype = new BaseObject();
FinishObj.prototype.constructor = FinishObj;
FinishObj.prototype.type = FINISH;
FinishObj.prototype.drawFn = function(){
    ctx.fillStyle = "green";
    ctx.fillRect(this.x, this.y, this.width, this.height);
};
/* This stops the player */
FinishObj.prototype.playerInteract = function(state){
    state.curLevel++;
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
 * Takes a level and a pattern and creates objects for that level
 * which match the pattern.
 * The pattern is a list of rows, where each row is a string of
 * 1 digit integers. Each integer corresponds to a player, block, or
 * empty space.
 * ex:
 ["1002",    This pattern corresponds to a map with 3 rows and 4 cols.
  "0300",    The player starts at the top left, and there are 2 blocks
  "0020"]    and an exit.
 * Exception: portals are specified with a character (a-z). Each portal
 * should have a matching portal of the same ID (there should be 2 a's, 
 * 2 b's, etc).
 */
function importPattern(level, pattern) {
    var row = 0;
    var col = 0;
    if(pattern.length !== level.map.rows || 
       pattern[0].length !== level.map.cols){
        console.log("Pattern doesn't match grid size");
        return;
    }
    var portalMatches = {};
    for (row = 0; row < pattern.length; row++) {
        rowStr = pattern[row];
        console.log(rowStr.length);
        for(col = 0; col < rowStr.length; col++) {
            switch(parseInt(rowStr[col])){
                case EMPTY:
                    level.addObject(new BaseObject(row, col, cellSize, cellSize), level);
                    break;
                case PLAYER:
                    level.addObject(new PlayerObj(row, col, cellSize, cellSize), level);
                    break;
                case FINISH:
                    level.addObject(new FinishObj(row, col, cellSize, cellSize), level);
                    break;
                case BLOCK:
                    level.addObject(new BlockObj(row, col, cellSize, cellSize), level);
                    break;
                default:
                    var id = rowStr[col];
                    var obj = new PortalObj(id, row, col, cellSize, cellSize);
                    var match = portalMatches[id]
                    if(match === undefined) {
                        portalMatches[id] = [row, col];
                    }
                    else{
                        var otherRow = match[0];
                        var otherCol = match[1]
                        obj.otherRow = otherRow;
                        obj.otherCol = otherCol;
                        level.map.grid[otherRow][otherCol].otherRow = row;
                        level.map.grid[otherRow][otherCol].otherCol = col;
                    }
                    level.addObject(obj, level);
                    break;
            }
        }
    }
}


/*
 * A level which takes a timerDelay, rows, cols,
 * and a pattern which describes the layout of the level.
 * This includes the game map,
 * lists of players and blocks, and some functions for game control.
 * Note that the players/blocks are stored in 2 data types: lists
 * of each respective object and a grid with their locations.
 */
function GameLevel(timerDelay, rows, cols, pattern) {
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
    this.addObject = function(object, self) {
        if (self === undefined)
            self = this;
        switch(object.type) {
            case PLAYER:
                self.players.push(object);
                break;
            case BLOCK:
            case FINISH:
            case PORTAL:
                self.blocks.push(object);
                break;
            case EMPTY:
                break;
            default:
                console.log("Invalid object type");
                return;
        }
        self.map.grid[object.row][object.col] = object;
    };
    importPattern(this, pattern);
    /* Clears the canvas and redraws all the objects */
    this.redrawAll = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(var i = 0; i < this.objTypes.length; i++){
            var objs = this[this.objTypes[i]];
            for(var j = 0; j < objs.length; j++){
                objs[j].drawFn();
            }
        }
    };
    /* Calls the update function on all the objects */
    this.updateAll = function(state) {
        var tdelt = this.timerDelay;
        for(var i = 0; i < this.objTypes.length; i++){
            var objs = this[this.objTypes[i]];
            for(var j = 0; j < objs.length; j++){
                objs[j].update(state, tdelt);
            }
        }
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
};


/*
 * Stores the whole of the game state. 
 * This has all the levels and functions to call their timer functions.
 */
function GameState(timerDelay) {
    this.timerDelay = timerDelay;
    this.curLevel = -1;
    this.levels = new Array();
    this.addLevel = function(rows, cols, pattern) {
        this.levels.push(new GameLevel(this.timerDelay, rows, cols, pattern));
    };
    /* Clears the canvas and redraws all the objects */
    this.redrawAll = function(state) {
        if(this.curLevel === -1)
            return;
        this.levels[this.curLevel].redrawAll(state);
    };
    /* Calls the update function on all the objects */
    this.updateAll = function(state) {
        if(this.curLevel === -1)
            return;
        this.levels[this.curLevel].updateAll(state);
    };
    var state = this;
    /* Starts the game by setting up the update/redraw intervals */
    this.startGame = function() {
        this.curLevel = 0;
        this.upInt = setInterval(function(){state.updateAll(state)}, state.timerDelay);
        this.drawInt = setInterval(function(){state.redrawAll(state)}, state.timerDelay);
    };
    this.keyPress = function(code) {
        if(this.curLevel === -1)
            return;
        this.levels[this.curLevel].keyPress(code);
    }
}

function onKeyDown(event) {
    state.keyPress(event.keyCode);
}


// Create a new state and add level
state = new GameState(10);
state.addLevel(15, 20, ["00200000000000000000",
                        "02100a00000000000002",
                        "00000000000000000000",
                        "000000a0020200000000",
                        "00200000000000000000",
                        "0000000000020000000b",
                        "00000000000000000000",
                        "000000020020000000b0",
                        "00000000000000000000",
                        "00002002000000000000",
                        "00000000000000000000",
                        "00002000000000000000",
                        "00000000000000000000",
                        "00000000000000000003",
                        "00000000020000000000"]);
state.addLevel(15, 20, ["22200000000000000000",
                        "02010200000000000000",
                        "00000000000000000000",
                        "00000000020200000000",
                        "00200000000000000000",
                        "00000000000200000000",
                        "00000000000000000000",
                        "00000002002000000000",
                        "00000000000000000000",
                        "00002002000000000000",
                        "00000000000000000000",
                        "00002000000000000000",
                        "00000000000000000000",
                        "00000000000000000030",
                        "00000000220000000000"]);
state.addLevel(15, 20, ["22200000000000000000",
                        "02010200000000000000",
                        "00000000001000000000",
                        "00000000020200000000",
                        "00200000000000000000",
                        "00000000000200000000",
                        "00000000000000000000",
                        "00000002002000000000",
                        "00000000000000000000",
                        "00002002000000000000",
                        "00000000000000000000",
                        "00002000000000000000",
                        "00000000000000000000",
                        "00000000000000000030",
                        "00000000220000000000"]);
state.startGame();

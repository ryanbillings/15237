/* 15237 Homework 1
 * achayes, khellste, rbilling
 */


var canvas = document.getElementById("myCanvas");
canvas.setAttribute('tabindex', '0');
canvas.focus();
//canvas.addEventListener('keydown', onKeyDown, false);
var ctx = canvas.getContext("2d");
var types = {
    "EMPTY": 0,
    "PLAYER": 1,
    "BLOCK": 2,
    "FINISH": 3,
    "PORTAL": 4,
    "BOMB": 5,
    "SLIDE": 6,
    "ARROW": 7
}
var blocks = [types.BLOCK, types.PORTAL, types.SLIDE];
var onBlocks = [types.ARROW, types.BOMB, types.FINISH];


var charToObj = {
    "0": BaseObject,
    "1": PlayerObj,
    "2": BlockObj,
    "3": FinishObj,
    "4": PortalObj,
    "5": BombObj,
    "6": SlideObj,
    "u": ArrowObj,
    "d": ArrowObj,
    "l": ArrowObj,
    "r": ArrowObj
}
var cellSize = 40;
var slideSpeed = 20; //blocks per second
var topbarSize = 50;
var lives = 10;
var selected;
var editGrid;
var editedLevel;
var iceColor = "rgb(229,244,255)";

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
BaseObject.prototype.type = types.EMPTY;
BaseObject.prototype.drawFn = function() {
    ctx.fillStyle = iceColor;
    ctx.fillRect(this.x, this.y + topbarSize, this.width, this.height);
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
    /* If the object is a player, check if the block it's about to hit is
       a block. If it is, interact with that block */
    if(this instanceof PlayerObj || this instanceof BlockObj){
        // Reset the object if it has gone off the screen
        if (this instanceof PlayerObj && 
            (col >= cols || col < 0 || row >= rows || row < 0)){
            lives--;
            this.reset();
        }
        if (this instanceof BlockObj){
            if((this.dr !== 0 && (row >= rows-1 || row <= 0)) ||
               (this.dc !== 0 && (col >= cols-1 || col <= 0)))
            {
                this.reset();
            }
        }
        if(this.row >= 0 && this.row < rows && this.col >= 0 && this.col < cols) {
            var nBlock = level.map.grid[this.row][this.col];
            if(nBlock !== undefined && onBlocks.indexOf(nBlock.type) !== -1){
                nBlock.playerInteract(this, state);
                if(nBlock.type === types.FINISH)
                    return;
            }
        }
        var nextRow = this.row + this.dr;
        var nextCol = this.col + this.dc;
        if(nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols) {
            var nBlock = level.map.grid[nextRow][nextCol];
            if(nBlock !== undefined && blocks.indexOf(nBlock.type) !== -1)
                nBlock.playerInteract(this, state);
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
PlayerObj.prototype.type = types.PLAYER;
PlayerObj.prototype.drawFn = function(){
    var adjustedY = this.y + topbarSize;
    function body(ctx, cx, cy, radius) {
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(cx, cy+5, radius, 0, 2*Math.PI, true);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
    
    function head(ctx, cx, cy, height, width) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(cx+width/2, cy + 12, height/3, 0, 2*Math.PI, true);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }
    
    function eyes(ctx, cx, cy, width){
        ctx.fillStyle = "white";
        // Left Eye
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(.9, 1);
        ctx.translate(-cx, -cy);
        ctx.beginPath();
        ctx.arc(cx+18, cy+10, 4, 0, Math.PI*2, false);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        
        ctx.fillStyle = "black";
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(.9, 1);
        ctx.translate(-cx, -cy);
        ctx.beginPath();
        ctx.arc(cx+18, cy+10, 2, 0, Math.PI*2, false);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        
        ctx.fillStyle = "white";
        // Right eye
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(.9, 1);
        ctx.translate(-cx, -cy);
        ctx.beginPath();
        ctx.arc(cx+27, cy+10, 4, 0, Math.PI*2, false);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        
        ctx.fillStyle = "black";
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(.9, 1);
        ctx.translate(-cx, -cy);
        ctx.beginPath();
        ctx.arc(cx+27, cy+10, 2, 0, Math.PI*2, false);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    
    function nose(ctx, cx, cy){
        ctx.fillStyle = "#FE9802";
        ctx.beginPath();
        ctx.moveTo(cx+10,cy+10);
        ctx.lineTo(cx+15,cy+15);
        ctx.lineTo(cx+20,cy+10);
        ctx.lineTo(cx+10,cy+10);
        ctx.fill();
        ctx.closePath();
    }
    
    function feet(ctx, cx, cy){
        ctx.fillStyle = "#FE9802";
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(.8, 1);
        ctx.translate(-cx, -cy);
        ctx.beginPath();
        ctx.arc(cx+18, cy+35, 5, 0, Math.PI*2, false);
        ctx.fill();
        ctx.arc(cx+30, cy+35, 5, 0, Math.PI*2, false);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    
    function arms(ctx, cx, cy){
        ctx.fillStyle = "black";
        ctx.strokeStyle = "white";
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(3*(Math.PI/4));
        ctx.scale(.7, 1);
        ctx.translate(-cx, -cy);
        ctx.beginPath();
        ctx.arc(cx-12, cy-40, 7, 0, Math.PI*2, false);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.PI/4);
        ctx.scale(.7, 1);
        ctx.translate(-cx, -cy);
        ctx.beginPath();
        ctx.arc(cx+30, cy+11, 7, 0, Math.PI*2, false);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    head(ctx, this.x, adjustedY, this.height, this.width);
    body(ctx, this.x+this.width/2, adjustedY+this.width/2, this.width/2-10);
    
    nose(ctx, this.x+5, adjustedY+5);
    eyes(ctx, this.x, adjustedY);
    feet(ctx, this.x, adjustedY);
    arms(ctx, this.x, adjustedY);
};

/*
 * A generic block (inherits from BaseObject)
 * It has a different type and draw function.
 * Additionally, it has a playerInteract function
 * which is called if a player "hits" it.
 */
function BlockObj(row, col, width, height){
    BaseObject.call(this, row, col, width, height);
    this.i = 0;
}
BlockObj.prototype = new BaseObject();
BlockObj.prototype.constructor = BlockObj;
BlockObj.prototype.type = types.BLOCK;
BlockObj.prototype.drawFn = function() {
    ctx.fillStyle = "#BFBFBF";
    ctx.strokeStyle = "#7F7F7F";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + topbarSize + cellSize);
    ctx.quadraticCurveTo(this.x, this.y + topbarSize + 10,this.x+5, this.y+topbarSize+5);
    ctx.quadraticCurveTo(this.x + cellSize/2, this.y + topbarSize - 10, this.x + cellSize-10, this.y+topbarSize+10);
    ctx.quadraticCurveTo(this.x + cellSize + 5, this.y + topbarSize + 20, this.x + cellSize, this.y+topbarSize + cellSize);
    ctx.lineTo(this.x, this.y + topbarSize + cellSize);    
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    /*
    ctx.save();
    ctx.fillStyle = "#CAA37C"; 
    ctx.translate(this.x, this.y);
    ctx.scale(1, 0.55);
    ctx.translate(-this.x, -this.y);
    ctx.beginPath();
    ctx.arc(this.x+7, this.y+topbarSize+2*cellSize+25, 8, 0, 2*Math.PI,false);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
    ctx.fillStyle = "#B2B2B2";
    ctx.beginPath();
    ctx.moveTo(this.x + cellSize/2, this.y + topbarSize + cellSize);
    ctx.quadraticCurveTo(this.x + cellSize/2 + 7, this.y + topbarSize + cellSize/2 - 10, this.x+cellSize, this.y+topbarSize+cellSize);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    */
};
/* This stops the player */
BlockObj.prototype.playerInteract = function(player){
    player.dr = 0;
    player.dc = 0;
    player.x = player.col*cellSize;
    player.y = player.row*cellSize;
};
BlockObj.prototype.reset = function() {
    this.x = this.col*cellSize;
    this.y = this.row*cellSize;
    this.dc = 0;
    this.dr = 0;
};

function SlideObj(row, col, width, height) {
    BlockObj.call(this, row, col, width, height);
}
SlideObj.prototype = new BlockObj();
SlideObj.prototype.constructor = SlideObj;
SlideObj.prototype.type = types.SLIDE;
SlideObj.prototype.drawFn = function(){
    ctx.fillStyle = "#C1E4FF";
    ctx.beginPath();
    ctx.moveTo(this.x,this.y+topbarSize+cellSize);
    ctx.lineTo(this.x, this.y+topbarSize+10);
    ctx.lineTo(this.x+cellSize-10, this.y+topbarSize+10);
    ctx.lineTo(this.x+cellSize-10, this.y+topbarSize+cellSize);
    ctx.lineTo(this.x, this.y+topbarSize+cellSize);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(this.x, this.y+topbarSize+10);
    ctx.lineTo(this.x + 10, this.y+topbarSize);
    ctx.lineTo(this.x + cellSize, this.y+topbarSize);
    ctx.lineTo(this.x+cellSize-10, this.y+topbarSize+10);
    ctx.lineTo(this.x, this.y+topbarSize + 10);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(this.x + cellSize, this.y+topbarSize);
    ctx.lineTo(this.x + cellSize, this.y+topbarSize+cellSize-10);
    ctx.lineTo(this.x + cellSize-10, this.y+topbarSize+cellSize);
    ctx.lineTo(this.x + cellSize-10, this.y+topbarSize+10);
    ctx.lineTo(this.x + cellSize, this.y+topbarSize);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
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
PortalObj.prototype.type = types.PORTAL;
PortalObj.prototype.drawFn = function(){
    ctx.fillStyle = "purple";
    
    for(var i = 2; i < 6; i++){
        switch(i){
            case 2:
                ctx.fillStyle = "#3B0C49";
                break;
            case 3:
                ctx.fillStyle = "#2D282E";
                break;
            case 4:
                ctx.fillStyle = "#A4A4A4";
                break;
            case 5:
                if(this.id == "a"){
                    ctx.fillStyle = "#FFFFFF";
                }else{
                    ctx.fillStyle = "#15EB4F";    
                }
                break;
        }
        ctx.beginPath();
        ctx.arc(this.x+cellSize/2, this.y+topbarSize+cellSize/2, cellSize/(i), 0, 2*Math.PI, true);
        //ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }
    
    
    /*
    ctx.fillRect(this.x, this.y+topbarSize, this.width, this.height);
    ctx.fillStyle = "white";
    ctx.font = cellSize + "px Arial";
    ctx.fillText(this.id, this.x, this.y + cellSize + topbarSize);
    */
};
/* This stops the player */
PortalObj.prototype.playerInteract = function(player){
    player.row = this.otherRow + player.dr;
    player.col = this.otherCol + player.dc;
    player.x = player.col*cellSize;
    player.y = player.row*cellSize;
};


function ArrowObj(row, col, width, height, dir){
    BaseObject.call(this, row, col, width, height);
    this.dir = dir;
    var pdr = 0;
    var pdc = 0;
    switch(dir){
        case "u":
            pdr = -1;
            break;
        case "d":
            pdr = 1;
            break;
        case "l":
            pdc = -1;
            break;
        case "r":
            pdc = 1;
            break;
    }
    this.pdr = pdr;
    this.pdc = pdc;
}
ArrowObj.prototype = new BaseObject();
ArrowObj.prototype.constructor = ArrowObj;
ArrowObj.prototype.type = types.ARROW;
ArrowObj.prototype.drawFn = function(){
    ctx.strokeStyle = "#0099CC";
    ctx.fillStyle = "#00ffff";
    switch(this.dir){
        case "u":
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + topbarSize + cellSize);
            ctx.lineTo(this.x + cellSize/2, this.y + cellSize/2 + topbarSize);
            ctx.lineTo(this.x+cellSize, this.y + topbarSize + cellSize);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + topbarSize + cellSize/2);
            ctx.lineTo(this.x + cellSize/2, this.y + topbarSize);
            ctx.lineTo(this.x + cellSize, this.y+ topbarSize + cellSize/2);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
            break;
        case "d":
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + topbarSize);
            ctx.lineTo(this.x + cellSize/2, this.y + cellSize/2 + topbarSize);
            ctx.lineTo(this.x+cellSize, this.y+ topbarSize);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + topbarSize + cellSize/2);
            ctx.lineTo(this.x + cellSize/2, this.y + cellSize + topbarSize);
            ctx.lineTo(this.x + cellSize, this.y+ topbarSize + cellSize/2);
            ctx.closePath();
            ctx.stroke();
            break;
        case "l":
            ctx.beginPath();
            ctx.moveTo(this.x+cellSize, this.y + topbarSize);
            ctx.lineTo(this.x + cellSize/2, this.y + cellSize/2 + topbarSize);
            ctx.lineTo(this.x+cellSize, this.y+ topbarSize + cellSize);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + cellSize/2, this.y + topbarSize);
            ctx.lineTo(this.x, this.y + cellSize/2 + topbarSize);
            ctx.lineTo(this.x + cellSize/2, this.y+ topbarSize + cellSize);
            ctx.closePath();
            ctx.stroke();
            break;
        case "r":
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + topbarSize);
            ctx.lineTo(this.x + cellSize/2, this.y + cellSize/2 + topbarSize);
            ctx.lineTo(this.x, this.y+ topbarSize + cellSize);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + cellSize/2, this.y + topbarSize);
            ctx.lineTo(this.x + cellSize, this.y + cellSize/2 + topbarSize);
            ctx.lineTo(this.x + cellSize/2, this.y+ topbarSize + cellSize);
            ctx.closePath();
            ctx.stroke();
            //ctx.fillStyle = "#FFFF00";
            break;
    }
    //ctx.strokeStyle = "gray";
    //ctx.strokeRect(this.x, this.y+topbarSize, this.width, this.height);
};
/* Change the player's direction */
ArrowObj.prototype.playerInteract = function(player){
    if(this.pdr !== 0){
        player.dr = this.pdr;
        player.dc = 0;
        player.col = this.col;
        player.x = player.col*cellSize;
    }
    else{
        player.dc = this.pdc;
        player.dr = 0;
        player.row = this.row;
        player.y = player.row*cellSize;
    }
};


function BombObj(row, col, width, height){
    BaseObject.call(this, row, col, width, height);
}
BombObj.prototype = new BaseObject();
BombObj.prototype.constructor = BombObj;
BombObj.prototype.type = types.BOMB;
BombObj.prototype.drawFn = function(){
    ctx.fillStyle = "#008080";
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.arc(this.x+cellSize/2, this.y+topbarSize+cellSize/2, this.width/2 - 5, 0, 2*Math.PI, true);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(this.x + (3/5) * cellSize, this.y+topbarSize + 7);
    ctx.lineTo(this.x + (3/5) * cellSize + 3, this.y+topbarSize + 2);
    ctx.lineTo(this.x + (3/5) * cellSize + 7, this.y+topbarSize + 4);
    ctx.lineTo(this.x + (3/5) * cellSize + 5, this.y+topbarSize + 7);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.beginPath();
    ctx.strokeStyle = "#A24C00";
    ctx.moveTo(this.x + (3/5) * cellSize + 4, this.y+topbarSize + 2);
    ctx.quadraticCurveTo(this.x + cellSize - 5, this.y+topbarSize - 5, this.x + cellSize, this.y+topbarSize)
    ctx.stroke();
    ctx.quadraticCurveTo(this.x + cellSize, this.y+topbarSize + 5, this.x+cellSize + 8, this.y+topbarSize-2);
    ctx.stroke();
    ctx.closePath();    
    
};
/* This kills the player */
BombObj.prototype.playerInteract = function(player, state){
    if(player.type === types.PLAYER) {
        player.x = player.startCol*cellSize;
        player.y = player.startRow*cellSize;
        player.dr = 0;
        player.dc = 0;
        lives--;
        this.reset();
    }
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
FinishObj.prototype.type = types.FINISH;
FinishObj.prototype.drawFn = function(){
    ctx.fillStyle = "#F2F2F2";
    ctx.strokeStyle = "#D9D9D9";
    ctx.save();
    ctx.lineWidth = '2';
    ctx.beginPath();
    ctx.arc(this.x + cellSize/2, this.y + topbarSize + cellSize/2, cellSize/2+3, Math.PI-.1, 2*Math.PI+.1, false);
    ctx.closePath();     
    ctx.fill();
    ctx.stroke();
     
    ctx.beginPath();
    ctx.arc(this.x+3, this.y + topbarSize + cellSize/2, 11, Math.PI-.1, 2*Math.PI+.1, false);
    ctx.closePath();     
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.x+3, this.y + topbarSize + cellSize/2, 8, Math.PI-.1, 2*Math.PI+.1, false);
    ctx.closePath();     
    ctx.fill();
    ctx.stroke();
    ctx.restore();
};
/* This stops the player */
FinishObj.prototype.playerInteract = function(player){
    if(player.type === types.PLAYER) {
        state.nextLevel();
    }
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
    this.update = function(state) {
        var that = this;
        var obj;
        for(var i = 0; i < this.grid.length; i++){
            for(var j = 0; j < cols; j++){
                obj = this.grid[i][j];
                if (obj.type !== types.EMPTY) {
                    this.grid[i][j] = new BaseObject(i, j, cellSize, cellSize);
                }
            }
        }
        state.levels[state.curLevel].blocks.forEach(function(obj){
            var row = obj.row;
            var col = obj.col;
            that.grid[row][col] = obj;
        });
    };
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
        for(col = 0; col < rowStr.length; col++) {
            var cha = rowStr[col];
            if(charToObj[cha] === undefined){
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
            }
            else {
                level.addObject(new charToObj[cha](row, col, cellSize, cellSize, cha), level);
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
function GameLevel(timerDelay, rows, cols, pattern, title) {
    this.map = new GameMap(rows, cols);
    this.timerDelay = timerDelay;
    this.title = title;
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
        if(self === undefined)
            self = this;
        var otype = object.type;
        if(otype === types.PLAYER) {
            self.players.push(object);
            return;
        }
        else if(blocks.indexOf(otype) !== -1 || onBlocks.indexOf(otype) !== -1){
            self.blocks.push(object);
        }
        else if(otype !== types.EMPTY){
            console.log("Invalid object type " + otype);
            return;
        }
        self.map.grid[object.row][object.col] = object;
    };
    importPattern(this, pattern);
    /* Clears the canvas and redraws all the objects */
    this.redrawAll = function() {
        ctx.clearRect(0, topbarSize, canvas.width, canvas.height-topbarSize);
        ctx.fillStyle = "rgb(229,244,255)";
        ctx.fillRect(0, topbarSize, canvas.width, canvas.height-topbarSize);
        /* SOME FUNCTION THAT DRAWS BG */
        this.blocks.forEach(function(block){
            block.drawFn();
        });
        this.players.forEach(function(player){
            player.drawFn();
        });
    };
    /* Calls the update function on all the objects */
    this.updateAll = function(state) {
        var tdelt = this.timerDelay;
        for(var i = 0; i < this.objTypes.length; i++){
            this[this.objTypes[i]].forEach(function (obj) {
                obj.update(state, tdelt);
            });
        }
        this.map.update(state);
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
                var nrow, ncol;
                nrow = player.row + dr;
                ncol = player.col + dc;
                if(this.map.grid[nrow][ncol].type === types.SLIDE){
                    this.map.grid[nrow][ncol].dr = dr;
                    this.map.grid[nrow][ncol].dc = dc;
                }
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
    this.addLevel = function(rows, cols, pattern, title) {
        this.levels.push(new GameLevel(this.timerDelay, rows, cols, pattern, title));
    };
    /* Clears the canvas and redraws all the objects */
    this.redrawAll = function(state) {
        if(this.curLevel === -1)
            return;
        this.levels[this.curLevel].redrawAll(state);
        updateTopbar(this);
    };
    /* Calls the update function on all the objects */
    this.updateAll = function(state) {
        if(this.curLevel === -1)
            return;
        this.levels[this.curLevel].updateAll(state);
    };
    var state = this;
    /* Starts the game by setting up the update/redraw intervals */
    this.startGame = function(curLevel) {
        this.curLevel = curLevel;
        if(this.upInt !== undefined)
            clearInterval(this.upInt);
        if(this.drawInt !== undefined)
            clearInterval(this.drawInt);
        this.upInt = setInterval(function(){state.updateAll(state)}, state.timerDelay);
        this.drawInt = setInterval(function(){state.redrawAll(state)}, state.timerDelay);
    };
    this.keyPress = function(code) {
        if(this.curLevel === -1)
            return;
        this.levels[this.curLevel].keyPress(code);
    };
    this.nextLevel = function(){
        this.startGame(this.curLevel+1);
    };
}

/* Updates the top bar with level, and lives left */
function updateTopbar(state){
    var level = state.curLevel;
    var title = state.levels[level].title;
    if(lives <= 0){
        endGame();
        return;
    }
    ctx.fillStyle = "rgb(193,228,255)";
    ctx.clearRect(0,0,canvas.width, topbarSize);
    ctx.fillRect(0,0,canvas.width, topbarSize);
    ctx.fillStyle = "black";
    ctx.font = "30px Segoe UI";
    var levelMeasure = ctx.measureText("Level " + level);
    ctx.fillText("Level " + level, 10, 35);
    ctx.fillText(" - " + title, 10+levelMeasure.width, 35);
    ctx.fillStyle = "rgb(240,121,2)";
    ctx.font = "16px Segoe UI";
    ctx.fillText("Lives: " + lives, canvas.width - 70, 20);
}

function startScreen(){
    ctx.fillStyle = "rgb(198,210,216)";
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillRect(0,0,canvas.width, canvas.height);
    ctx.save();
    ctx.font = "55px Segoe UI";
    ctx.fillStyle = 'black';
    var centerSpacing = canvas.width/2 - 95;
    ctx.fillText("Pen", centerSpacing, canvas.height/2);
    var pen = ctx.measureText("Pen");
    ctx.fillStyle = 'white';
    var g = ctx.measureText("g");
    ctx.fillText("g", centerSpacing+pen.width, canvas.height/2);
    ctx.fillStyle = 'black';
    ctx.fillText("uin", centerSpacing+pen.width+g.width,canvas.height/2);
    ctx.font = "11px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText("a game inspired by Pokemon", canvas.width/2, canvas.height/2 + 50);
    
    // Buttons
    ctx.fillStyle = "rgb(229,244,255)";
    ctx.strokeStyle = "rgb(193,228,255)";
    roundedRect(ctx, canvas.width/2 - 70, canvas.height - 220, 150, 75, 10);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = "rgb(253,128,3)";
    ctx.font = "25px Segoe UI";
    ctx.fillText("Start!", canvas.width/2 + 5, canvas.height - 175);
    
    ctx.fillStyle = "rgb(229,244,255)";
    roundedRect(ctx, canvas.width/2 - 70, canvas.height - 100, 150, 75, 10);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = "rgb(253,128,3)";
    ctx.font = "25px Segoe UI";
    ctx.fillText("Create Level", canvas.width/2 + 5, canvas.height - 55);
    
    
    ctx.restore();
    canvas.addEventListener('mousedown', chooseMode, false);
}

function chooseMode(event){
    var x = event.pageX - canvas.offsetLeft;  // do not use event.x, it's not cross-browser!!!
    var y = event.pageY - canvas.offsetTop;
    if (x > 330 & x < 480){
      if(y > 430 && y < 500){
        canvas.removeEventListener('mousedown', chooseMode);
        canvas.addEventListener('keydown', onKeyDown, false);
        resetAll();
      }else if(y > 550 && y < 625){
        canvas.removeEventListener('mousedown', chooseMode);
        editGame();
      }
    }
}

function editGame(){
    var panelSize = 50;
    topbarSize = 0;
    editGrid = new Array(15);
    for(var i = 0; i < editGrid.length; i++){
        editGrid[i] = new Array(20);
    }
    canvas.width += panelSize;
    canvas.height -= topbarSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = iceColor;
    ctx.fillRect(0, 0, canvas.width-panelSize, canvas.height);
    drawPanel(panelSize);
    canvas.addEventListener('mousedown', pickBlock, false);
}

function drawPanel(panelSize){
    ctx.fillStyle = "yellow";
    ctx.fillRect(canvas.width-panelSize, 0, panelSize, canvas.height);
    /* Draw blocks */
    var pBlock = new PlayerObj(1.1, 20.1, cellSize, cellSize);
    pBlock.drawFn();
    
    var bBlock = new BlockObj(3.1, 20.1, cellSize, cellSize);
    bBlock.drawFn();
    
    var sBlock = new SlideObj(5.1, 20.1, cellSize, cellSize);
    sBlock.drawFn();
    
    var boBlock = new BombObj(7.1, 20.1, cellSize, cellSize);
    boBlock.drawFn();
    
    var fBlock = new FinishObj(9.1, 20.15, cellSize, cellSize);
    fBlock.drawFn();
    ctx.fillStyle = "black";
    ctx.fillText("PLAY", canvas.width - panelSize + 10, 460);
}

// from: https://developer.mozilla.org/en-US/docs/Canvas_tutorial/Drawing_shapes
function roundedRect(ctx,x,y,width,height,radius){
    ctx.beginPath();
    ctx.moveTo(x,y+radius);
    ctx.lineTo(x,y+height-radius);
    ctx.quadraticCurveTo(x,y+height,x+radius,y+height);
    ctx.lineTo(x+width-radius,y+height);
    ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
    ctx.lineTo(x+width,y+radius);
    ctx.quadraticCurveTo(x+width,y,x+width-radius,y);
    ctx.lineTo(x+radius,y);
    ctx.quadraticCurveTo(x,y,x,y+radius);
    ctx.stroke();
}

function pickBlock(evt){
    var x = evt.pageX - canvas.offsetLeft;
    var y = evt.pageY - canvas.offsetTop;
    var panelSize = 50;
    if(x > 800 && x < 840){
        if(y > 40 && y < 95){
            drawPanel(panelSize);
            ctx.fillStyle = "rgba(128,128,128,0.75)";
            ctx.fillRect(canvas.width - panelSize, 40, panelSize, panelSize);
            selected = 'player';
        }else if(y > 120 && y < 175){
            drawPanel(panelSize);
            ctx.fillStyle = "rgba(128,128,128,0.75)";
            ctx.fillRect(canvas.width - panelSize, 120, panelSize, panelSize);
            selected = 'block';
        }else if(y > 210 && y < 255){
            drawPanel(panelSize);
            ctx.fillStyle = "rgba(128,128,128,0.75)";
            ctx.fillRect(canvas.width - panelSize, 210, panelSize, panelSize);
            selected = 'slide';
        }else if(y > 280 && y < 325){
            drawPanel(panelSize);
            ctx.fillStyle = "rgba(128,128,128,0.75)";
            ctx.fillRect(canvas.width - panelSize, 280, panelSize, panelSize);
            selected = 'bomb';
        }else if (y > 360 && y < 405){
            drawPanel(panelSize);
            ctx.fillStyle = "rgba(128,128,128,0.75)";
            ctx.fillRect(canvas.width - panelSize, 360, panelSize, panelSize);
            selected = 'finish';
        }else if (y > 445 && y < 465){
            playEditedGame();
        }
    }
    
    if(x < 800){
        var gridX, gridY;
        if(selected !== null && selected !== undefined){
            gridY = Math.floor(x/cellSize);
            gridX = Math.floor(y/cellSize);
            if(editGrid[gridX][gridY] !== undefined){
                return;
            }
            switch(selected){
                case 'player':{
                    var p = new PlayerObj(gridX, gridY, cellSize, cellSize);
                    p.drawFn();
                    editGrid[gridX][gridY] = types.PLAYER;
                    break;
                }
                case 'block':{
                    var p = new BlockObj(gridX, gridY, cellSize, cellSize);
                    p.drawFn();
                    editGrid[gridX][gridY] = types.BLOCK;
                    break;
                }
                case 'slide':{
                    var p = new SlideObj(gridX, gridY, cellSize, cellSize);
                    p.drawFn();
                    editGrid[gridX][gridY] = types.SLIDE;
                    break;
                }
                case 'bomb':{
                    var p = new BombObj(gridX, gridY, cellSize, cellSize);
                    p.drawFn();
                    editGrid[gridX][gridY] = types.BOMB;
                    break;
                }
                case 'finish':{
                    var p = new FinishObj(gridX, gridY, cellSize, cellSize);
                    p.drawFn();
                    editGrid[gridX][gridY] = types.FINISH;
                    break;
                }
            }
        }
    }
}

function playEditedGame(){
    canvas.removeEventListener('mousedown',pickBlock);
    canvas.width -= 50;
    topbarSize = 50;
    editedLevel = new Array(15);
    for(var i = 0; i < editGrid.length; i++){
        var patternLevel = "";
        for(var j = 0; j < editGrid[i].length; j++){
            if(editGrid[i][j] === undefined){
                patternLevel += types.EMPTY;
            }else{
                patternLevel += editGrid[i][j];
            }
        }
        editedLevel[i] = patternLevel;
    }
    canvas.addEventListener('keydown', onKeyDown, false);
    resetAll();
}


/* This function ends the game and removes all key listeners */
function endGame(){
    ctx.fillStyle = "rgba(128,128,128,0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("You Lose!", canvas.width/2, canvas.height/2);
    ctx.fillText("Press any key to retry", canvas.width/2, canvas.height/2 + 50);
    ctx.restore();
    canvas.removeEventListener('keydown', onKeyDown);
    canvas.addEventListener('keydown', continueGame, false);
}

/* Function to continue the game after death */
function continueGame(event){
    clearInterval(state.upInt);
    clearInterval(state.drawInt);
    canvas.removeEventListener('keydown', continueGame);
    canvas.addEventListener('keydown', onKeyDown, false);
    resetAll();
}

function onKeyDown(event) {
    state.keyPress(event.keyCode);
}


// Create a new state and add level
function resetAll(){
        state = new GameState(10);
        lives = 10;
        if(editedLevel !== undefined && editedLevel !== null){
            state.addLevel(15,20,editedLevel, 'Custom Level');
        }
        /* Empty Level */
        state.addLevel(15, 20, ["10000020000000000000",
                                "00000000000000000000",
                                "00000a00000000600000",
                                "00000000000000000000",
                                "02000a00000000000000",
                                "00000000000000000000",
                                "6u0000000050000000000",
                                "00000200000000000000",
                                "00000000000000000000",
                                "00000000000000000000",
                                "00000000000000000000",
                                "00000000000000000000",
                                "00000000000000000000",
                                "00000000000000000003",
                                "00000000000000000000"],
                                "");
        
        /* Each new element introduced should have 3-5 levels devoted to it.
           1: (Relatively) trivial introduction level
           2: Puzzle using new element
           3: Tricky puzzle using new element
           4(opt): Integrate element with other elements (med difficulty)
           5: Hard integrated puzzle
           
           Elements should be introduced in this order:
           Basic Blocks
           Bombs
           Sliding Blocks
           Direction Changers
           Portals

           Key:
           EMPTY  - 0
           PLAYER - 1
           BLOCK  - 2
           FINISH - 3
           PORTAL - 4 (use matching chars for matching portals (a-z)
           BOMB   - 5
           SLIDE  - 6
           ARROW  - 7 (use the chars u, d, l, and r for arrows)
        */
        // Basic Blocks
        state.addLevel(15, 20, ["00000000000000000000",
                                "02222222222222222220",
                                "02000000000000000020",
                                "02010000000000000020",
                                "02000000000000000020",
                                "02000000000000000020",
                                "02000000000000000020",
                                "02000000000000000020",
                                "02000000000000000320",
                                "02000000000000000020",
                                "02000000000000000020",
                                "02000000000000000020",
                                "02000000000000000020",
                                "02222222222222222220",
                                "00000000000000000000"],
                                "Get to the Igloo. Use Thy Arrow Keys.");
        state.addLevel(15, 20, ["00000000000000000000",
                                "02222222222222222220",
                                "02200000000000000020",
                                "02000000000000000020",
                                "02010000000000200020",
                                "02020000000000000020",
                                "02030000000000000020",
                                "02000000000000000020",
                                "02000000000000000020",
                                "02200000000000000020",
                                "02000000000002000020",
                                "02000000000000000020",
                                "02000000000000000020",
                                "02222222222222222220",
                                "00000000000000000000"],
                                "What? A Puzzle?");
        state.addLevel(15, 20, ["00000000000000000000",
                                "00000000300000000000",
                                "00000000000000200000",
                                "00020000000200000200",
                                "00000000000000000000",
                                "00000200000000000000",
                                "00000000000020000200",
                                "00000000000000000000",
                                "00020000020000000000",
                                "00000020000000000020",
                                "00000000000000000000",
                                "00000000000000000000",
                                "00000000010000020000",
                                "00020000000000000000",
                                "00000000000000000000"],
                                "Watch Your Step");
        // Bombs
        state.addLevel(15, 20, ["00000000006666000000",
                                "00000000555500600000",
                                "00000555555500060000",
                                "00055000005500006000",
                                "00553000000550006000",
                                "00500001000250000000",
                                "05000000000005000000",
                                "05000000000005000000",
                                "05000000000005000000",
                                "05000000000005000000",
                                "05000000000005000000",
                                "00520000000050000000",
                                "00550000002550000000",
                                "00055000005500000000",
                                "00000555550000000000"],
                                "Don't Explode!");
        state.addLevel(15, 20, ["00000000500000000002",
                                "02002500000000200000",
                                "00000000020000000002",
                                "00000000000000000200",
                                "00000000000000000000",
                                "50200000000000000000",
                                "20020000010000000000",
                                "00000000003005000000",
                                "00000000000000002020",
                                "00000005000200000000",
                                "00002000000000000000",
                                "02000000000000020000",
                                "00000000200000500000",
                                "00000005000000000000",
                                "00000000000000000000"],
                                "So Close, Yet So Far");
        state.addLevel(15, 20, ["00000030000200000000", 
                                 "20000000000020000000", 
                                 "00200000000000500000", 
                                 "00000000000000000200", 
                                 "00000005002000000002", 
                                 "20000000000005000000", 
                                 "00000000000000005000", 
                                 "00000000000000000000",
                                 "00000000000200000000", 
                                 "00020000000000210020",
                                 "00050200000050000000",
                                 "02000000002000000000",
                                 "00000000000052000000",
                                 "00000000000000000200",
                                 "00000000000000200000"],
                                 "You Got That Boom Boom Pow.");



        state.addLevel(15, 20, ["22200000000000000000",
                                "020106000a0000000000",
                                "0200d0l0000a00000000",
                                "00r000u0020200000000",
                                "00200020000000000000",
                                "000000060d0200000000",
                                "00002000000000000000",
                                "00000002002000000000",
                                "00000000000000000000",
                                "00002002000000000000",
                                "00000000000000000000",
                                "00002000000000000000",
                                "00000000000000000000",
                                "00000000000000000030",
                                "00000000200000000000"],
                                "The Beginning");
        state.addLevel(15, 20, ["00200000000000000000",
                                "02100a00000000000002",
                                "00000000000000000000",
                                "000000a0600200000000",
                                "00600000000000000000",
                                "0000000000020000000b",
                                "00000000000000000000",
                                "000000025520000000b0",
                                "00000000000000000000",
                                "00002002000000000006",
                                "00000000000000000000",
                                "00002000000000000000",
                                "00000000000000000000",
                                "00000000000000000003",
                                "00000000020000000000"]);
        state.addLevel(15, 20, ["22200000000000000000",
                                "020106000a0000000000",
                                "00000000000a00000000",
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
        state.startGame(0);
}
startScreen();

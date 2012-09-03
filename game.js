
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var EMPTY = 0;
var PLAYER = 1;
var BLOCK = 2;
var FINISH = 3;
var cellSize = 40;
var slideSpeed = 10; //blocks per second

function BaseObject(row, col, width, height){
  this.row = row
  this.col = col;
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
BaseObject.prototype.update = function(state, tdelt) {
  var oldX = this.x;
  var oldY = this.y;
  this.x = oldX + this.dc*slideSpeed*cellSize*tdelt/1000;
  this.y = oldY + this.dr*slideSpeed*cellSize*tdelt/1000;
  var absX = Math.abs(this.x);
  var absY = Math.abs(this.y);
  var xSign = this.x > 0 ? 1 : -1;
  var ySign = this.y > 0 ? 1 : -1;
  col = Math.floor(absX/cellSize)*xSign;
  row = Math.floor(absY/cellSize)*ySign;
  console.log(col + ' ' + this.x);
  this.row = row;
  this.col = col;
  if (col > state.map.cols || col < 0 || row > state.map.rows || row < 0){
    this.x = 0;
    this.y = 0;
    this.dr = 0;
    this.dc = 0;
    this.row = 0;
    this.col = 0;
  }
  if(this instanceof PlayerObj){
    var nextRow = this.row + this.dr;
    var nextCol = this.col + this.dc;
    var nBlock = state.map.grid[nextRow][nextCol];
    if(nBlock !== undefined && nBlock.type === BLOCK){
      nBlock.playerInteract(this);
    }
  }
};


function PlayerObj(row, col, width, height){
  BaseObject.call(this, row, col, width, height);
}
PlayerObj.prototype = new BaseObject();
PlayerObj.prototype.constructor = PlayerObj;
PlayerObj.prototype.type = PLAYER;
PlayerObj.prototype.drawFn = function(){
  ctx.fillStyle = "red";
  ctx.fillRect(this.x, this.y, this.width, this.height);
};

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
BlockObj.prototype.playerInteract = function(player){
  player.dr = 0;
  player.dc = 0;
  player.x = player.col*cellSize;
  player.y = player.row*cellSize;
};


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

function GameState(timerDelay, rows, cols) {
  this.map = new GameMap(rows, cols);
  this.timerDelay = timerDelay;
  this.objTypes = ["players", "blocks"];
  // Initialize an array of player objects
  this.players = new Array();
  // Initialize an array of block objects
  this.blocks = new Array();
  this.addObject = function(object) {
    console.log
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
  this.redrawAll = function(state) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var i = 0; i < state.objTypes.length; i++){
      var objs = state[state.objTypes[i]];
      for(var j = 0; j < objs.length; j++){
        objs[j].drawFn();
      }
    }
  };
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
  this.startGame = function() {
    this.upInt = setInterval(function(){state.updateAll(state)}, state.timerDelay);
    this.drawInt = setInterval(function(){state.redrawAll(state)}, state.timerDelay);
  };
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
//      default:
//        clearInterval(this.upInt);
//        clearInterval(this.drawInt);
//        return;
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



state = new GameState(10, 15, 20);
var obj = new PlayerObj(0, 1, cellSize, cellSize);
var obj2 = new BlockObj(0, 5, cellSize, cellSize);
var obj3 = new BlockObj(0, 0, cellSize, cellSize);
state.addObject(obj);
state.addObject(obj2);
state.addObject(obj3);
canvas.setAttribute('tabindex', '0');
canvas.focus();
canvas.addEventListener('keydown', onKeyDown, false);
state.startGame();




function BaseObject(xpos, ypos, drawFn){
  this.x = xpos;
  this.y = ypos;
  this.dx = 0;
  this.dy = 0;
  if (drawFn === undefined){
    this.drawFn = function() {
      
    }
  }
  else {
    this.drawFn = drawFn;
  }

}

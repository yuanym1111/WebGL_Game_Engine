Mouse	= function(element)

{
   
this.mouseDown = false;
   
this.lastMouseX = null;
   
this.lastMouseY = null;

this.mouseX = null;

this.mouseY = null;
   
this.deltaX = null;
   
this.deltaY = null;

this.moving = false;

this.taskid = null;
   
this.element = element;
 
  
   //Create callback function to bind/unbind mouse event
   
var self	= this;
   
this._onMouseUp		= function(event){ self._onMouseChange(event, true); };
   
this._onMouseMove 	= function(event){ self._onMouseMoving(event, true); };
  
 this._onMouseDown 	= function(event){ self._onMouseChange(event, false); };
 
 this._onMouseOut = function(event){ self._onMouseCanvasOut(event);};
   
  
 // bind keyEvents
	
 element.addEventListener("mouseup", this._onMouseUp, false);
	
element.addEventListener("mousemove", this._onMouseMove, false);
	
element.addEventListener("mousedown",  this._onMouseDown, false);

element.addEventListener("mouseout", this._onMouseOut, false);

}

/**
 * To stop listening of the keyboard events
*/
Mouse.prototype.destroy	= function()
{
	
// unbind keyEvents
	
document.removeEventListener("mouseup", this._onMouseUp, false);
	
document.removeEventListener("mousemove", this._onMouseMove, false);
	
this.element.removeEventListener("mousedown", this._onMouseDown, false);

}


Mouse.prototype.reload	= function()
{
	
// unbind keyEvents
	
document.addEventListener("mouseup", this._onMouseUp, false);
	
document.addEventListener("mousemove", this._onMouseMove, false);
	
this.element.addEventListener("mousedown", this._onMouseDown, false);

}


Mouse.prototype._onMouseChange	= function(event, pressed)
{

//Current we don't care about which button we clicked, later will modify it
       
 this.mouseDown = pressed;
     
   this.lastMouseX = event.clientX;
      
  this.lastMouseY = event.clientY;

}

Mouse.prototype.movingstoped = function(){
	
	this.deltaX = 0; 
    this.deltaY = 0; 
//  console.log("currently delta in setTimeout:" + this.deltaX + "::"+this.deltaY);
}


Mouse.prototype._onMouseMoving	= function(event, pressed){
      
    var self = this;
    
		this.mouseX = event.layerX;
    
    this.mouseY = event.layerY;
		
	 this.moving = true; 
	 
	 if (this.taskid) clearTimeout(this.taskid);
	 
	 this.deltaX = this.mouseX - this.lastMouseX;
     
   this.deltaY = this.mouseY - this.lastMouseY;
		
		this.lastMouseX = this.mouseX;
     
   this.lastMouseY = this.mouseY;
//   console.log("currently delta:" + this.deltaX + "::"+this.deltaY);
   
   this.taskid = setTimeout(function(){self.movingstoped()},200);

}


Mouse.prototype._onMouseCanvasOut = function(event){
	this.mouseX = -1;
	this.mouseY = -1;
}

Mouse.prototype.mouseDX = function() {
  
      return this.deltaX;

}

Mouse.prototype.mouseDY = function() {
     
   return this.deltaY;

}

Mouse.prototype.clicked = function() {
   
     return this.mouseDown;

}

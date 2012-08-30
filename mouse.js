Mouse	= function(element,transformSource)

{
   
this.mouseDown = false;

this.transformSource = transformSource;
   
this.lastMouseX = 0;
   
this.lastMouseY = 0;

this.mouseX = 0;

this.mouseY = 0;
   
this.deltaX = 0;
   
this.deltaY = 0;

this.moving = false;

this.taskid = null;
   
this.element = element;

this.bufferWidth = 0;

this.bufferHeight = 0;
 
  
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


Mouse.prototype.findPos = function(obj){
	
	var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

Mouse.prototype._onMouseMoving	= function(event, pressed){
      
    var self = this;
    
//		this.mouseX = event.layerX;
    
//    this.mouseY = event.layerY;
    
    var pos = this.findPos(this.element);
	
     this.mouseX = event.pageX - pos.x;
     
     this.mouseY = event.pageY - pos.y;
    
	 this.moving = true; 
	 
	 if (this.taskid) clearTimeout(this.taskid);
	 
	 this.deltaX = this.mouseX - this.lastMouseX;
     
     this.deltaY = this.mouseY - this.lastMouseY;
	
     if(this.mouseX != -1 && this.mouseY != -1){
		this.lastMouseX = this.mouseX;
     
        this.lastMouseY = this.mouseY;
     }
//   console.log("currently delta:" + this.deltaX + "::"+this.deltaY);
   
   this.taskid = setTimeout(function(){self.movingstoped();},50);

}

Mouse.prototype.getWorldPickingRay = function(camera,renderEntity){
	
	var xPos = this.getMouseX();
	var yPos = this.getMouseY();
	
	//this.element == canvas
	//gl.viewportWidth
	//gl.viewportHeight
	var w = gl.viewportWidth;
	var h = gl.viewportHeight;
	
	var proj = camera.projection();
	//set near fov camera parameter here, problem with proj matrix
	//To do: fix it later
	var near = 1;
	var fov =45;
	var aspect = gl.viewportWidth / gl.viewportHeight;
	
	var centered_x, centered_y, unit_x, unit_y, near_height, near_width, i, j;
	
	centered_y = gl.viewportHeight - yPos - gl.viewportHeight/2.0;
	centered_x = xPos - gl.viewportWidth/2.0;
	unit_x = centered_x/(gl.viewportWidth/2.0);
	unit_y = centered_y/(gl.viewportHeight/2.0);  
	
	near_height = near * Math.tan( fov * Math.PI / 360.0 );
	near_width = near_height*aspect;
	var dir = Vector.create([ unit_x*near_width, unit_y*near_height, -1.0*near, 0 ]);
	var origin = Vector.create([ 0.0, 0.0, 0.0, 1.0 ]);
	//Assume the viewport take up all the back buffer rendering area
	/*To DO:
	 *  If not, calculate later  */
	/*
	xPos = (2.0*xPos/w - 1.0)/proj.elements[0][0];
	yPos = (-2.0*yPos/h + 1.0)/proj.elements[1][1];
	
	var origin = $V([0.0,0.0,0.0,1.0]);
	var dir = $V([xPos,yPos,1.0,0.0]);
	*/
   /*	Debug Start */
	/*
	var imvMatrix = renderEntity.mvMatrix.inverse();
	var debugvMatrixInv = renderEntity.mvMatrixInv;
	
	if(!imvMatrix){
		return;
	}
	
	origin = imvMatrix.multiply(origin);
	dir = imvMatrix.multiply(dir);
	dir = dir.toUnitVector();
	*/
   /*  Debug End	*/
	/* Algorithm based on 
	 * 
	 * http://eigenclass.blogspot.com.au/2008/10/opengl-es-picking-using-ray-boundingbox.html */
	var R = renderEntity.mvMatrix.minor(1,1,3,3);
	
//	alert(R.inspect());

	var Rt = R.transpose();

//	alert(Rt.inspect());
	
	var tc = renderEntity.mvMatrix.col(4);
	
	var t = Vector.create([ tc.e(1), tc.e(2), tc.e(3) ]);
	
	var tp = Rt.x(t);
	
//	alert(tp.inspect());
	
	var imvPickMatrixInv = Matrix.I(4);
//	alert(imvPickMatrixInv.inspect());
	var i, j;
	for (i=0; i < 3; i++) {
		for (j=0; j < 3; j++) {
			imvPickMatrixInv.elements[i][j] = Rt.elements[i][j];
		}	
		imvPickMatrixInv.elements[i][3] = -1.0 * tp.elements[i];
	}
	
//	alert(mvPickMatrixInv.inspect());
		
	var raydir = imvPickMatrixInv.x(dir);
	
	var ray_start_point = imvPickMatrixInv.x(origin);
	
//	alert(rayp.inspect());
	
//	alert(ray_start_pointp.inspect());

	var anchor = Vector.create([ ray_start_point.e(1), ray_start_point.e(2), ray_start_point.e(3) ]);
	var direction = Vector.create([ raydir.e(1), raydir.e(2), raydir.e(3) ]);
	direction = direction.toUnitVector();
//	var l = Line.create(anchor, direction.toUnitVector());
	
	
	var l = {};
	
	l.dir = direction;
	l.org = anchor;

	return l;
	
	
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

Mouse.prototype.getMouseX = function() {
	  
    if(this.mouseX != -1){
    	return this.mouseX;
    }else{
    	return this.lastMouseX;
    }
}

Mouse.prototype.getMouseY = function() {
   
	 if(this.mouseX != -1){
	    	return this.mouseY;
	    }else{
	    	return this.lastMouseY;
	    }

}

Mouse.prototype.clicked = function() {
   
     return this.mouseDown;

}

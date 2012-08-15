// heightmap data structures, manipulation, and rendering
function Heightmap() {}

Heightmap.prototype = new Mesh();

Heightmap.create = function(scale, offset, x, y, heights, imageFile, normalFile, dx, dy)
{
  var heightmap = new Heightmap();
  heightmap.init(scale, offset, x, y, heights, imageFile, normalFile, dx, dy);
  return heightmap;
};

Heightmap.prototype.init  = function(scale, offset, x, y, heights, imageFile, normalFile, dx, dy) {
	var i,j;
	
	// x and y are the number of VERTICES in those directions
	//Width and Height of the heightmap texture
	if(dx & dy){
	this.dx = dx;
	this.dy = dy;
}else{
	this.dx = 1;
	this.dy = 1;
}
	this.x = x * this.dx;
	this.y = y * this.dy;
	this.mHeightScale = scale;
	this.mHeightOffset = offset;
	this.maxHeight = 255 * scale;
	
	this.vertexBuffer = null;
	this.indexBuffer = null;
//	this.colorBuffer = null;	
	this.effect = null;
	
	/*  Heightmap texture, glsl uSampler  */
	this.texHeight = image.load2D(imageFile, [0, 200, 250, 255]); 
	/*  Heightmap sand texture, glsl uSampler3  */
	this.sand = image.load2D('texture/sand.png', [0, 200, 250, 255]);
	/*  Heightmap grass texture, glsl uSampler4  */
	this.grass = image.load2D('texture/grass.png', [0, 200, 250, 255]);
	/*  Heightmap normal map texture, glsl uSample2 */
	this.normal = image.load2D(normalFile, [0, 200, 250, 255]);
	
	this.verts = [];
//	this.colors = [];
	this.level = [1,2,3];
	this.indices1 = [];
	this.indices2 = [];
	this.indices3 = [];	
	this.indices = [];
	
	
	this.rect = new Rectangle(this.x/2-5,this.x/2-5,this.x/2+5,this.x/2+5);
	
	if(heights && heights.length == x * y) {
		this.heights = heights;
	} else {
		this.heights = [];

		for(i = 0; i < x * y; i++) {
			this.heights.push(0);
		}
		
		return;
	}
	
	this.regenerateVerts(this.mHeightScale);
	this.initBuffers();
    this.initShader();
}

Heightmap.prototype.initBuffers = function(){
	
	 this.vertexBuffer = gl.createBuffer();
     this.indexBuffer = gl.createBuffer();
//  var colorBuffer = this.colorBuffer = gl.createBuffer();
  
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts), gl.STATIC_DRAW);
  this.vertexBuffer.itemSize = 3;
  this.vertexBuffer.numItems = this.verts.length/3;
  
/* 
 *  There is no color buffer
 *  The color will come from texture
 *
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
	colorBuffer.itemSize = 4;
  colorBuffer.numItems = this.colors.length/4;
*/
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
	this.indexBuffer.itemSize = 1;
	this.indexBuffer.numItems = this.indices.length;
  
}

Heightmap.prototype.initShader = function(){
	
	this.effect = new program();
  this.effect.loadFromID("terrain-vs");
  this.effect.loadFromID("terrain-fs");
  this.effect.link();

  this.effect.pos = gl.getAttribLocation(this.effect.program, "position");
//  this.effect.color = gl.getAttribLocation(this.effect.program, "aVertexColor");

  this.effect.samplerHeight = gl.getUniformLocation(this.effect.program, 'heightmap');
  this.effect.samplerSand = gl.getUniformLocation(this.effect.program, 'sand');
  this.effect.samplerGrass = gl.getUniformLocation(this.effect.program, 'grass');
  this.effect.samplerNormal = gl.getUniformLocation(this.effect.program, 'normalmap');

  this.effect.matP = gl.getUniformLocation( this.effect.program, 'projection' );
  this.effect.matMV = gl.getUniformLocation( this.effect.program, 'view' );
	this.effect.width = gl.getUniformLocation( this.effect.program, 'width' );
	this.effect.height = gl.getUniformLocation( this.effect.program, 'height' );
	this.effect.terrainHeight = gl.getUniformLocation( this.effect.program, 'terrainHeight' );
	this.effect.lightDirection = gl.getUniformLocation( this.effect.program, 'lightDirection' );
	this.effect.cameraPos = gl.getUniformLocation( this.effect.program, 'cameraPos' );
}

Heightmap.prototype.set = function(){
	
	//Set the linked uniform here 
	
}


Heightmap.prototype.setWVP = function(wvpMatrix){
	
	gl.uniformMatrix4fv(this.effect.matP, false, wvpMatrix);
}

Heightmap.prototype.setP = function(wvpMatrix){
	
	gl.uniformMatrix4fv(this.effect.matP, false, wvpMatrix);
}


Heightmap.prototype.regenerateVerts = function (scale) {
	var i,j;
	//Later pass parameter to scale width and height dx and dy
	var xOffset = - this.x * 0.5;
	var zOffset = this.y * 0.5;
	
	//Only pass the x,z parameter to vertise buffer,
	//We will calculate the height from the heightmap texture
	this.verts = [];
	for(i = 0; i < this.y/this.dy; i++) {
		for(j = 0; j < this.x/this.dx; j++) {
			this.verts.push(j*this.dx + xOffset);
  		this.verts.push(this.heights[i*this.x/this.dx+j]*scale+this.mHeightOffset);
			this.verts.push(-i*this.dy + zOffset);
		}
	}
	

	for(i = 1; i < this.y/this.dy; i++) {
		for(j = 0; j < this.x/this.dx - 1; j++) {
			this.indices.push(i * (this.x/this.dx) + j);
			this.indices.push(i * (this.x/this.dx) + j + 1);
			this.indices.push((i - 1) * (this.x/this.dx) + j + 1);
			
			this.indices.push(i * (this.x/this.dx) + j);
			this.indices.push((i - 1) * (this.x/this.dx) + j + 1);
			this.indices.push((i - 1) * (this.x/this.dx) + j);
		}
	}
/*	
	this.colors = [];
	for(i = 0; i < this.y; i++) {
		for(j = 0; j < this.x; j++) {
			
			  if(this.heights[i*this.x+j]<0.3*255*this.mHeightScale){
			  	this.colors.push(1);
			    this.colors.push(0);
			    this.colors.push(0);
			    this.colors.push(1.0);			  	
			  }else if(this.heights[i*this.x+j]>0.3*255*this.mHeightScale && this.heights[i*this.x+j]<0.6*255*this.mHeightScale){
			  	this.colors.push(0);
			    this.colors.push(1);
			    this.colors.push(0);
		    	this.colors.push(1.0);	  	
			  }else if(this.heights[i*this.x+j]>0.6*255*this.mHeightScale && this.heights[i*this.x+j]<0.8*255*this.mHeightScale){
			    this.colors.push(0);
			    this.colors.push(0);
			    this.colors.push(1);
			    this.colors.push(1.0);  	
			  }else if(this.heights[i*this.x+j]>0.8*255*this.mHeightScale ){
			    this.colors.push(0.6);
			    this.colors.push(0.6);
			    this.colors.push(0.6);
			    this.colors.push(1.0);
			  }
		}
	}
	*/
	
}

Heightmap.prototype.randomize = function (min, max) {
	var i;
	
	for(i = 0; i < this.x * this.y; i++) {
		this.heights[i] = min + (max - min) * Math.random();
		this.verts[i*3+1] = this.heights[i];
	}
}


Heightmap.prototype.createRandomHeightMap = function(roughness, unitSize, max_size){
	
	
	this.mHeightScale = max_size/255;
	var heighmapgenerate = new terrainGeneration(roughness,this.x,unitSize);
	var i,j;
		for(j = 0; j < this.y; j++) {
		  for(i = 0; i < this.x; i++) {
	       this.heights[ j * this.x + i] = heighmapgenerate[j][i] * max_size;
      }
    }
  this.maxHeight = max_size;
  this.mHeightScale = max_size/255;
	this.regenerateVerts(1.0);
	this.initBuffers();
  this.initShader();
	
		
		
}

Heightmap.prototype.update = function (time) {
	
	
}

Heightmap.prototype.drawGL = function () {
	if(!this.vertexBuffer || !this.indexBuffer) {
		console.log("[ERROR] drawGL: not initialized");
		return;
	}
	
	
	this.effect.apply();
	
	gl.uniform3f(this.effect.cameraPos, camera.pos()[0],
                        camera.pos()[1], camera.pos()[2]);
  gl.uniformMatrix4fv(this.effect.matP, false, camera.proj());
  gl.uniformMatrix4fv(this.effect.matMV, false,camera.view());
  
  gl.uniform1f(this.effect.terrainHeight, this.maxHeight);
  gl.uniform1i(this.effect.width, this.x);
  gl.uniform1i(this.effect.height, this.y);
  gl.uniform3f(this.effect.lightDirection, Math.sin(Math.PI/6),
                        0, Math.sin(Math.PI/6));
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this.texHeight);
  gl.uniform1i(this.effect.samplerHeight, 0);
  
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, this.sand);
  gl.uniform1i(this.effect.samplerSand, 1);
  
   gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, this.grass);
  gl.uniform1i(this.effect.samplerGrass, 2);
  
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, this.normal);
  gl.uniform1i(this.effect.samplerNormal, 3);
	
	gl.enableVertexAttribArray(this.effect.pos);
//	gl.enableVertexAttribArray(this.effect.color);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.vertexAttribPointer(this.effect.pos, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
//	gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
//	gl.vertexAttribPointer(this.effect.color, this.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	 
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

Heightmap.prototype.drawPoints = function() {
	
	
	 this.effect.apply();
	
	 gl.enableVertexAttribArray(this.effect.pos);
   gl.enableVertexAttribArray(this.effect.color);
	
	 gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
   gl.vertexAttribPointer(this.effect.pos, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
   
//   	gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
//	 gl.vertexAttribPointer(this.effect.color, this.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	 
	 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	
   gl.enableVertexAttribArray(this.effect.pos);
   gl.drawArrays(gl.POINTS, 0, this.vertexBuffer.numItems);
	
}

Heightmap.loadFromFile = function (url,success) {
	$.ajax({
		url: url,
		success: function (data) {
			var newHeightmap = new Heightmap(1,0,data.x, data.y, data.heights);
			success.call(newHeightmap);
		},
		error: function (xhr, status, errormsg) {
			error.call(null, status, errormsg)
		},
		dataType: 'jsonp',
		async: false,
		jsonp: false,
		jsonpCallback: 'onJSONPLoad'
	});
}

Heightmap.loadFromData = function(scale,offset,success){
        var base64data = "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";
        var png = new PNG(base64data);

		var heightdata = [];
		var rowindex = 1;
		while(line = png.readLine()){
		   for(var i = 0; i< line.length; i++){
		      heightdata.push(parseInt(line[i].toString(16).substr(4),16));		   
		   }
 //          rowindex++;		   
		}
        var newHeightmap = new Heightmap(scale, offset, png.width, png.height, heightdata);
		success.call(newHeightmap);
}
/*
Heightmap.loadFromCanvas = function(scale, offset,filename, success){
      var imagecanvas = document.createElement("canvas");
	    var ctx = imagecanvas.getContext('2d'); 
      var img = new image();
      var heightdata = [];
      img.onload = function(){
          ctx.drawImage(img,0,0);
          var objImageData = ctx.getImageData(0, 0, img.width, img.height); 

         for(var i = 0; i<objImageData.width*objImageData.height*3;i+=3){
	           heightdata.push(objImageData.data[i]);
	 
	       }
         var newHeightmap = new Heightmap(scale, offset,  objImageData.width, objImageData.height, heightdata);
	       success.call(newHeightmap);
	       imageloaded = true;
	       return;
      }
      img.src = filename;
     
}
*/

Heightmap.loadFromImageData = function(scale, offset,objImageData, imageFile, normalFile,dx, dy,  success){
      
      var heightdata = [];

      for(var i = 0; i<objImageData.data.length;i+=4){
	           heightdata.push(objImageData.data[i]);
	 
	     }
         var newHeightmap = new Heightmap(scale, offset,  objImageData.width, objImageData.height, heightdata, imageFile, normalFile, dx, dy);
	       success.call(newHeightmap);
	  
     
}


Heightmap.prototype.getHeight = function(x,y){
	
	var c = (x + 0.5 * this.x)/this.dx;
	var d = (y - 0.5* this.y)/-this.dy;
	
	//Get the current row and col the position is
	var col = Math.floor(c);
	var row = Math.floor(d);
	
	//Grab the heights of the cell from heightmap
	var A = this.heights[row*this.x/this.dx+col]*this.mHeightScale;
	var B = this.heights[row*this.x/this.dx+col+1]*this.mHeightScale;
	var C = this.heights[(row+1)*this.x/this.dx+col]*this.mHeightScale;
	var D = this.heights[(row+1)*this.x/this.dx+col+1]*this.mHeightScale;
	
	var s = c - col;
	var t = d - row;
	
	//If the position is on upper triangle ABC
	if(t < 1.0 - s){
		  var uy = B - A;
		  var vy = C - A;
		  return A + s*uy + t*vy;
	}else{
	// The position is on lower triangle DCB
	   	var uy = C - D;
		  var vy = B - D;
		  return D + (1.0 - s)*uy + (1.0 - t)*vy;
		
	}
	
}


Heightmap.prototype.destroy = function(){
	
	  gl.deleteBuffer(this.vertexBuffer);
    gl.deleteBuffer(this.indexBuffer);
    gl.deleteBuffer(this.colorBuffer);

    CleanProgram(gl, this.effect.program);
	
}
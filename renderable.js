/**
 *      Render program
 *      @author: Alex
 */

function RenderEntity(transformSource,name){
	
	this.mMatrix = Matrix.I(4);
	this.mvMatrix = Matrix.I(4);
	this.mvMatrixInv = Matrix.I(4);
	this.transformSource = transformSource;
	this.shaderProgram = null;
    this.shaderProgramPick = null;
	this.shaderProgramActive = null;
	this.name = name;
	this.acc = new Float32Array(16);
}

RenderEntity.prototype.resetTransform = function()
{
  this.mMatrix = Matrix.I(4);
};

RenderEntity.prototype.transform = function(matrix)
{
  this.mMatrix = this.mMatrix.x(matrix);
};

RenderEntity.prototype.translate = function(v)
{
  this.mMatrix = this.mMatrix.x(translate(v));
};

RenderEntity.prototype.scale = function(v)
{
  this.mMatrix = this.mMatrix.x(scale(v));
};

RenderEntity.prototype.rotate = function(deg, v)
{
  this.mMatrix = this.mMatrix.x(rotate(deg, v));
};


RenderEntity.prototype.setMatrixUniforms = function(isPick)
{
  if (!this.transformSource) throw Error("Invalid transformSource");
  if (!this.transformSource.vMatrix) throw Error("Invalid VIEW matrix");
  if (!this.transformSource.pMatrix) throw Error("Invalid PROJECTION matrix");

  this.mvMatrix = this.transformSource.vMatrix.x(this.mMatrix);
  this.mvMatrixInv = this.mvMatrix.inverse();
  if (!this.mvMatrix) throw Error("Invalid MODELVIEW matrix");

  if (this.shaderProgramActive.pMatrixUniform)
  {
    this.transformSource.pMatrix.flattenInto(this.acc);
    gl.uniformMatrix4fv(this.shaderProgramActive.pMatrixUniform, false, this.acc);
  }

  if (this.shaderProgramActive.mMatrixUniform)
  {
    this.mMatrix.flattenInto(this.acc);
    gl.uniformMatrix4fv(this.shaderProgramActive.mMatrixUniform, false, this.acc);
  }
  
  if (this.shaderProgramActive.vMatrixUniform)
  {
	  this.transformSource.vMatrix.flattenInto(this.acc);
    gl.uniformMatrix4fv(this.shaderProgramActive.vMatrixUniform, false, this.acc);
  }
  

  if (this.shaderProgramActive.mvMatrixUniform)
  {
    this.mvMatrix.flattenInto(this.acc);
    gl.uniformMatrix4fv(this.shaderProgramActive.mvMatrixUniform, false, this.acc);
  }

  if (this.shaderProgramActive.mvMatrixInvUniform)
  {
    if (!this.mvMatrixInv) this.mvMatrixInv = identity(); //throw Error("Invalid inverse MODELVIEW matrix");
    this.mvMatrixInv.flattenInto(this.acc);
    gl.uniformMatrix4fv(this.shaderProgramActive.mvMatrixInvUniform, false, this.acc);
  }

  if (this.shaderProgramActive.vMatrixInvUniform)
  {
    this.transformSource.vMatrixInv.flattenInto(this.acc);
    gl.uniformMatrix4fv(this.shaderProgramActive.vMatrixInvUniform, false, this.acc);
  }

  if (this.shaderProgramActive.timeUniform)
  {
    gl.uniform1f(this.shaderProgramActive.timeUniform, this.transformSource.rot); // this.transformSource HACK!!!!!!!!!
  }

  if (this.shaderProgramActive.colorUniform && isPick)
  {
    gl.uniform4f(this.shaderProgramActive.colorUniform, ((this.renderIndex>>0)%256)/255.0, ((this.renderIndex>>8)%256)/255.0, ((this.renderIndex>>16)%256)/255.0, 1.0);
  }
}




Renderable.prototype = new RenderEntity();

Renderable.prototype.constructor = Renderable; 

function Renderable(mesh, transformSource, name)
{
  RenderEntity.call(this,transformSource,name);		
  this.mesh = mesh;
  if(typeof name === "undefined" || name.indexOf('heightmap') == -1){
    this.texture1 = null;
    this.texture2 = null;
  }else{
    this.texture1 = mesh.texture1 ? mesh.texture1 : null;
    this.texture2 = mesh.texture2 ? mesh.texture2 : null;
    this.texture3 = mesh.texture3 ? mesh.texture3 : null;
    this.texture4 = mesh.texture4 ? mesh.texture4 : null;
    this.texture5 = mesh.texture5 ? mesh.texture5 : null;
  }
  this.mMatrix = mesh ? mesh.worldMatrix : Matrix.I(4);
//  this.mvMatrix = Matrix.I(4);
//  this.mvMatrixInv = Matrix.I(4);
  this.transformSource = transformSource;
  this.isAdditive = false;
  this.renderIndex = 0;
//  this.name = name;

  this.acc = new Float32Array(16);
}

Renderable.prototype.getBoundingBox = function(){
	
	if(!this.mesh.raypickable){
		return;
	}
	
	this.bBox = new AABBBox();
	
	if(!this.mesh.vertexBuffer){
		return;
	}
	
	
}

Renderable.prototype.shallowCopy = function(name)
{
  var r = new Renderable();
  
  for (i in this)
  {
    r[i] = this[i];
  }

  r.name = name;
  
  return r;
}

Renderable.prototype.render = function(isPick)
{
  if (!this.mesh) return;
  if (!this.mesh.indexBuffer) return;

  if (isPick)
  {
    if (!this.shaderProgramPick) return;
    this.shaderProgramActive = this.shaderProgramPick;
  }
  else
  {  
    if (!this.shaderProgram) return;
    this.shaderProgramActive = this.shaderProgram;
  }

  gl.useProgram(this.shaderProgramActive);

  if ((this.texture1) && (this.shaderProgramActive.samplerUniform1))
  {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture1);
    gl.uniform1i(this.shaderProgramActive.samplerUniform1, 0);
  }

  if ((this.texture2) && (this.shaderProgramActive.samplerUniform2))
  {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.texture2);
    gl.uniform1i(this.shaderProgramActive.samplerUniform2, 1);
  }

  if ((this.texture3) && (this.shaderProgramActive.samplerUniform3))
  {
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.texture3);
    gl.uniform1i(this.shaderProgramActive.samplerUniform3, 2);
  }

  if ((this.texture4) && (this.shaderProgramActive.samplerUniform4))
  {
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this.texture4);
    gl.uniform1i(this.shaderProgramActive.samplerUniform4, 3);
  }

  if ((this.texture5) && (this.shaderProgramActive.samplerUniform5))
  {
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, this.texture5);
    gl.uniform1i(this.shaderProgramActive.samplerUniform5, 4);
  }

  if ((this.texture1) && (this.shaderProgramActive.samplerCubeUniform1))
  {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture1);
    gl.uniform1i(this.shaderProgramActive.samplerCubeUniform1, 0);
  }

  if ((this.texture2) && (this.shaderProgramActive.samplerCubeUniform2))
  {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture2);
    gl.uniform1i(this.shaderProgramActive.samplerCubeUniform2, 1);
  }

  for (var i=0; i<maxVertexAttribs; i++)
  {
    gl.disableVertexAttribArray(i);
  }

  if ((this.mesh.vertexBuffer) && (this.shaderProgramActive.vertexPositionAttribute != -1))
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vertexBuffer);
    gl.vertexAttribPointer(this.shaderProgramActive.vertexPositionAttribute, this.mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.shaderProgramActive.vertexPositionAttribute);
  }

  if ((this.mesh.normalBuffer) && (this.shaderProgramActive.vertexNormalAttribute != -1))
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.normalBuffer);
    gl.vertexAttribPointer(this.shaderProgramActive.vertexNormalAttribute, this.mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.shaderProgramActive.vertexNormalAttribute);
  }

  if ((this.mesh.colorBuffer) && (this.shaderProgramActive.vertexColorAttribute != -1))
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.colorBuffer);
    gl.vertexAttribPointer(this.shaderProgramActive.vertexColorAttribute, this.mesh.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.shaderProgramActive.vertexColorAttribute);
  }

  if ((this.mesh.texCoordBuffer) && (this.shaderProgramActive.textureCoordAttribute != -1))
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.texCoordBuffer);
    gl.vertexAttribPointer(this.shaderProgramActive.textureCoordAttribute, this.mesh.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.shaderProgramActive.textureCoordAttribute);
  } 

  if ((this.mesh.texCoordUVWBuffer) && (this.shaderProgramActive.textureCoord3Attribute != -1))
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.texCoordUVWBuffer);
    gl.vertexAttribPointer(this.shaderProgramActive.textureCoord3Attribute, this.mesh.texCoordUVWBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.shaderProgramActive.textureCoord3Attribute);
  } 

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);

  this.setMatrixUniforms(isPick);

  if (this.isAdditive)
  {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.depthMask(false);
  }

  if (this.mesh.partialRender)
  {
    gl.drawElements(gl.TRIANGLES, this.mesh.partialRenderSize, gl.UNSIGNED_SHORT, 0);
  }
  else
  {
    gl.drawElements(gl.TRIANGLES, this.mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  }

  if (this.isAdditive)
  {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.disable(gl.BLEND);
    gl.depthMask(true);
  }
}

Renderable.prototype.renderOnly = function(isPick)
{
  if (!this.mesh) return;
  if (!this.mesh.indexBuffer) return;

  this.setMatrixUniforms();

  gl.drawElements(gl.TRIANGLES, this.mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}


ModelRenderable.prototype = new RenderEntity();

ModelRenderable.prototype.constructor = ModelRenderable; 

function ModelRenderable(model, transformSource, name)
{
	
  RenderEntity.call(this,transformSource,name);	
  this.model = model;
  this.shaderProgram = null;
  this.shaderProgramPick = null;
  this.shaderProgramActive = null;
  this.mMatrix = model ? model.worldMat : Matrix.I(4);
  this.mvMatrix = Matrix.I(4);
  this.mvMatrixInv = Matrix.I(4);
  this.transformSource = transformSource;
  this.isAdditive = false;
  this.renderIndex = 0;

  this.acc = new Float32Array(16);
}

ModelRenderable.prototype.render = function(isPick){
	
	  if (!this.model) return;
	  if (!this.model.indexBuffer) return;
	  if (!this.model.complete) { return; }
	  if (isPick)
	  {
	    if (!this.shaderProgramPick) return;
	    this.shaderProgramActive = this.shaderProgramPick;
	  }
	  else
	  {  
	    if (!this.shaderProgram) return;
	    this.shaderProgramActive = this.shaderProgram;
	  }

	  gl.useProgram(this.shaderProgramActive);
	  //All model information is bounded at vertexBuffer
	  gl.bindBuffer(gl.ARRAY_BUFFER, this.model.vertexBuffer);
	  
	  for (var i=0; i<maxVertexAttribs; i++)
	  {
	    gl.disableVertexAttribArray(i);
	  }
      //Model vertex information
	  if ((this.model.vertexBuffer) && (this.shaderProgramActive.vertexPositionAttribute != -1))
	  {
//	    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.vertexBuffer);
	    gl.vertexAttribPointer(this.shaderProgramActive.vertexPositionAttribute, this.model.vertexBuffer.vertexItemSize, gl.FLOAT, false, this.model.vertexStride, 0);
	    gl.enableVertexAttribArray(this.shaderProgramActive.vertexPositionAttribute);
	  }
      //Model normal information
	  if ((this.model.vertexBuffer) && (this.shaderProgramActive.vertexNormalAttribute != -1))
	  {
//	    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.vertexBuffer);
	    gl.vertexAttribPointer(this.shaderProgramActive.vertexNormalAttribute, this.model.vertexBuffer.normalItemSize, gl.FLOAT, true, this.model.vertexStride, 20);
	    gl.enableVertexAttribArray(this.shaderProgramActive.vertexNormalAttribute);
	  }

	  if ((this.model.vertexBuffer) && (this.shaderProgramActive.vertexColorAttribute != -1))
	  {
//	    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.vertexBuffer);
	    gl.vertexAttribPointer(this.shaderProgramActive.vertexColorAttribute, this.model.vertexBuffer.colorItemSize, gl.FLOAT, false, this.model.vertexStride, 12);
	    gl.enableVertexAttribArray(this.shaderProgramActive.vertexColorAttribute);
	  }

	  if ((this.model.vertexBuffer) && (this.shaderProgramActive.textureCoordAttribute != -1))
	  {
//	    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.vertexBuffer);
	    gl.vertexAttribPointer(this.shaderProgramActive.textureCoordAttribute, this.model.vertexBuffer.textureItemSize, gl.FLOAT, false, this.model.vertexStride, 12);
	    gl.enableVertexAttribArray(this.shaderProgramActive.textureCoordAttribute);
	  } 

	  if ((this.model.texCoordUVWBuffer) && (this.shaderProgramActive.textureCoord3Attribute != -1))
	  {
//	    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.vertexBuffer);
	    gl.vertexAttribPointer(this.shaderProgramActive.textureCoord3Attribute, this.model.vertexBuffer.textureCoord3ItemSize, gl.FLOAT, false, this.model.vertexStride, 12);
	    gl.enableVertexAttribArray(this.shaderProgramActive.textureCoord3Attribute);
	  } 

	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.model.indexBuffer);

	  this.setMatrixUniforms(isPick);

	  if (this.isAdditive)
	  {
	    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	    gl.enable(gl.BLEND);
	    gl.depthMask(false);
	  }

	  if (this.model.partialRender)
	  {
	    gl.drawElements(gl.TRIANGLES, this.model.partialRenderSize, gl.UNSIGNED_SHORT, 0);
	  }
	  else
	  {
		  var i, j, k,
	        mesh, submesh,
	        indexOffset, indexCount;  
		  var boneSet;
		    for (i in this.model.meshes) {
		        mesh = this.model.meshes[i];
		        
		        gl.activeTexture(gl.TEXTURE0);
		        gl.bindTexture(gl.TEXTURE_2D, mesh.diffuse);
		        gl.uniform1i(this.shaderProgramActive.samplerUniform1, 0);
		        
		        
		        for (j in mesh.submeshes) {
		            submesh = mesh.submeshes[j];
		            gl.drawElements(gl.TRIANGLES, submesh.indexCount, gl.UNSIGNED_SHORT, submesh.indexOffset*2);
		        }
		    }
	  }

	  if (this.isAdditive)
	  {
	    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	    gl.disable(gl.BLEND);
	    gl.depthMask(true);
	  }
     
};

ModelRenderable.prototype.animRender = function(isPick){
	
	  if (!this.model) return;
	  if (!this.model.indexBuffer) return;
	  if (!this.model.complete) { return; }
	  if (isPick)
	  {
	    if (!this.shaderProgramPick) return;
	    this.shaderProgramActive = this.shaderProgramPick;
	  }
	  else
	  {  
	    if (!this.shaderProgram) return;
	    this.shaderProgramActive = this.shaderProgram;
	  }

	  gl.useProgram(this.shaderProgramActive);
	  //All model information is bounded at vertexBuffer
	  gl.bindBuffer(gl.ARRAY_BUFFER, this.model.vertexBuffer);
	  
	  for (var i=0; i<maxVertexAttribs; i++)
	  {
	    gl.disableVertexAttribArray(i);
	  }
    //Model vertex information
	  if ((this.model.vertexBuffer) && (this.shaderProgramActive.vertexPositionAttribute != -1))
	  {
//	    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.vertexBuffer);
	    gl.vertexAttribPointer(this.shaderProgramActive.vertexPositionAttribute, this.model.vertexBuffer.vertexItemSize, gl.FLOAT, false, this.model.vertexStride, 0);
	    gl.enableVertexAttribArray(this.shaderProgramActive.vertexPositionAttribute);
	  }
    //Model normal information
	  if ((this.model.vertexBuffer) && (this.shaderProgramActive.vertexNormalAttribute != -1))
	  {
//	    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.vertexBuffer);
	    gl.vertexAttribPointer(this.shaderProgramActive.vertexNormalAttribute, this.model.vertexBuffer.normalItemSize, gl.FLOAT, true, this.model.vertexStride, 20);
	    gl.enableVertexAttribArray(this.shaderProgramActive.vertexNormalAttribute);
	  }

	  if ((this.model.vertexBuffer) && (this.shaderProgramActive.vertexColorAttribute != -1))
	  {
//	    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.vertexBuffer);
	    gl.vertexAttribPointer(this.shaderProgramActive.vertexColorAttribute, this.model.vertexBuffer.colorItemSize, gl.FLOAT, false, this.model.vertexStride, 12);
	    gl.enableVertexAttribArray(this.shaderProgramActive.vertexColorAttribute);
	  }

	  if ((this.model.vertexBuffer) && (this.shaderProgramActive.textureCoordAttribute != -1))
	  {
//	    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.vertexBuffer);
	    gl.vertexAttribPointer(this.shaderProgramActive.textureCoordAttribute, this.model.vertexBuffer.textureItemSize, gl.FLOAT, false, this.model.vertexStride, 12);
	    gl.enableVertexAttribArray(this.shaderProgramActive.textureCoordAttribute);
	  } 

	  if ((this.model.vertexBuffer) && (this.shaderProgramActive.textureCoord3Attribute != -1))
	  {
//	    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.vertexBuffer);
	    gl.vertexAttribPointer(this.shaderProgramActive.textureCoord3Attribute, this.model.vertexBuffer.textureCoord3ItemSize, gl.FLOAT, false, this.model.vertexStride, 12);
	    gl.enableVertexAttribArray(this.shaderProgramActive.textureCoord3Attribute);
	  } 
	  if ((this.model.vertexBuffer) && (this.shaderProgramActive.weights != -1))
	  {
//	    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.vertexBuffer);
	    gl.vertexAttribPointer(this.shaderProgramActive.weights, 3, gl.FLOAT, false, this.model.vertexStride, 48);
	    gl.enableVertexAttribArray(this.shaderProgramActive.weights);
	  }
	  if ((this.model.vertexBuffer) && (this.shaderProgramActive.bones != -1))
	  {
//	    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.vertexBuffer);
	    gl.vertexAttribPointer(this.shaderProgramActive.bones, 3, gl.FLOAT, false, this.model.vertexStride, 60);
	    gl.enableVertexAttribArray(this.shaderProgramActive.bones);
	  }

	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.model.indexBuffer);

	  this.setMatrixUniforms(isPick);

	  if (this.isAdditive)
	  {
	    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	    gl.enable(gl.BLEND);
	    gl.depthMask(false);
	  }

	  if (this.model.partialRender)
	  {
	    gl.drawElements(gl.TRIANGLES, this.model.partialRenderSize, gl.UNSIGNED_SHORT, 0);
	  }
	  else
	  {
		  var i, j, k,
	        mesh, submesh,
	        indexOffset, indexCount;  
		  var boneSet;
		  
		  if(this.model._dirtyBones) {
	            for(i = 0; i < this.model.bones.length; ++i) {
	                var bone = this.model.bones[i];
	          /*      bone.boneMat.flattenInto(this.acc);
	                this.model.boneMatrices.set(this.acc, i * 16);
	           */
	                
	                /* Use gl-matrix lib for debug purpose */
	                this.model.boneMatrices.set(bone.boneMat, i * 16);
	            }
	        }
		  
		  
		  for (i in this.model.meshes) {
		        mesh = this.model.meshes[i];
		        
		        gl.activeTexture(gl.TEXTURE0);
		        gl.bindTexture(gl.TEXTURE_2D, mesh.diffuse);
		        gl.uniform1i(this.shaderProgramActive.samplerUniform1, 0);
		        
		        
		        for (j in mesh.submeshes) {
		            submesh = mesh.submeshes[j];
		            boneSet = this.model.boneMatrices.subarray(submesh.boneOffset * 16, (submesh.boneOffset + submesh.boneCount) * 16);
	                gl.uniformMatrix4fv(this.shaderProgramActive.boneMat, false, boneSet);
		            gl.drawElements(gl.TRIANGLES, submesh.indexCount, gl.UNSIGNED_SHORT, submesh.indexOffset*2);
		        }
		    }
	  }

	  if (this.isAdditive)
	  {
	    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	    gl.disable(gl.BLEND);
	    gl.depthMask(true);
	  }
   
};




ModelRenderable.prototype.setMatrixUniforms = function(isPick){
	RenderEntity.prototype.setMatrixUniforms.call(this,isPick);
	if (this.shaderProgramActive.lightPos){
	   gl.uniform3f(this.shaderProgramActive.lightPos, 16, -32, 32);
	}
}


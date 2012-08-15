///////////////////////////////////////////////////////////////////////////////
// Mesh
///////////////////////////////////////////////////////////////////////////////

function Mesh()
{
  this.vertexBuffer = null;
  this.normalBuffer = null;
  this.colorBuffer = null;
  this.texCoordBuffer = null;
  this.texCoordUVWBuffer = null;
  this.indexBuffer = null;
  this.canBeRendered = false;
  this.partialRender = false;
  this.partialRenderSize = 0;
  this.worldMatrix = Matrix.I(4);

  this.createVertexBuffer = function(vertices, numItems, isDynamic)
  {
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, (isDynamic==true) ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
    this.vertexBuffer.itemSize = 3;
    this.vertexBuffer.numItems = numItems;
  }

  this.updateVertexBuffer = function(vertices)
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
  }

  this.createNormalBuffer = function(normals, numItems, isDynamic)
  {
    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, (isDynamic==true) ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
    this.normalBuffer.itemSize = 3;
    this.normalBuffer.numItems = numItems;
  }

  this.updateNormalBuffer = function(normals)
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, normals);
  }

  this.createColorBuffer = function(colors, numItems, isDynamic)
  {
    this.colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, (isDynamic==true) ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
    this.colorBuffer.itemSize = 4;
    this.colorBuffer.numItems = numItems;
  }

  this.updateColorBuffer = function(colors)
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, colors);
  }

  this.createTexCoordBuffer = function(texCoords, numItems, isDynamic)
  {
    this.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, (isDynamic==true) ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
    this.texCoordBuffer.itemSize = 2;
    this.texCoordBuffer.numItems = numItems;
  }

  this.updateTexCoordBuffer = function(texCoords)
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, texCoords);
  }

  this.createTexCoordUVWBuffer = function(texCoordsUVW, numItems, isDynamic)
  {
    this.texCoordUVWBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordUVWBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoordsUVW, (isDynamic==true) ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
    this.texCoordUVWBuffer.itemSize = 3;
    this.texCoordUVWBuffer.numItems = numItems;
  }

  this.updateTexCoordUVWBuffer = function(texCoordsUVW)
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordUVWBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, texCoordsUVW);
  }

  this.createIndexBuffer = function(indices, numItems, isDynamic)
  {
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, (isDynamic==true) ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
    this.indexBuffer.itemSize = 1;
    this.indexBuffer.numItems = numItems;
  }

  this.updateIndexBuffer = function(indices)
  {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, indices);
  }
}

Mesh.prototype.parse = function(data)
{
  if (data.vertices)
  {
    this.numVertices = data.vertices.length / 3;
    this.vertices = new Float32Array(this.numVertices * 3);
    for (var i=0; i<this.numVertices * 3; i++) this.vertices[i] = data.vertices[i];
    this.createVertexBuffer(this.vertices, this.numVertices);
  }

  if (data.normals)
  {
    if (this.numVertices * 3 != data.normals.length) throw Error("Invalid normal buffer length");
    this.normals = new Float32Array(this.numVertices * 3);
    for (var i=0; i<this.numVertices * 3; i++) this.normals[i] = data.normals[i];
    this.createNormalBuffer(this.normals, this.numVertices);
  }

  if (data.texCoords)
  {
    if (this.numVertices * 2 != data.texCoords.length) throw Error("Invalid texcoord buffer length");
    this.texCoords = new Float32Array(this.numVertices * 2);
    for (var i=0; i<this.numVertices * 2; i++) this.texCoords[i] = data.texCoords[i];
    this.createTexCoordBuffer(this.texCoords, this.numVertices);
  }

  if (data.indices)
  {
    this.numFaces = data.indices.length / 3;
    this.indices = new Uint16Array(this.numFaces * 3);
    for (var i=0; i<this.numFaces * 3; i++) this.indices[i] = data.indices[i];
    this.createIndexBuffer(this.indices, this.numFaces * 3);
  }

  this.worldMatrix = Matrix.I(4);
  if ((data.worldMatrix) && (data.worldMatrix.length==16))
  {
    for (var j=0; j<4; j++)
      for (var i=0; i<4; i++)
        this.worldMatrix.elements[j][i] = data.worldMatrix[4*i + j];
  }

  if (data.animationData)
  {
    this.animation = new Animation();
    this.animation.parse(data.animationData);
  }
}

Mesh.prototype.destroy = function(){
	if(this.vertexBuffer)
	  gl.deleteBuffer(this.vertexBuffer);
	if(this.indexBuffer)
      gl.deleteBuffer(this.indexBuffer);
	if(this.colorBuffer)
      gl.deleteBuffer(this.colorBuffer);
	if(this.normalBuffer)
	      gl.deleteBuffer(this.normalBuffer);
	if(this.texCoordBuffer)
	      gl.deleteBuffer(this.texCoordBuffer);
	if(this.texCoordUVWBuffer)
	      gl.deleteBuffer(this.texCoordUVWBuffer);
}

///////////////////////////////////////////////////////////////////////////////
// Cylinder
///////////////////////////////////////////////////////////////////////////////

function Cylinder() {}

Cylinder.prototype = new Mesh();

Cylinder.create = function(x,y)
{
  var obj = new Cylinder();
  obj.init(x,y);
  return obj;
}

Cylinder.prototype.init = function(x,y)
{
  if (x<3) throw ("Invalid parameter");
  if (y<2) throw ("Invalid parameter");
  if ((x+1)*(y+1)>0xffff) throw ("Parameter combination results in too big mesh");

  this.x = x;
  this.y = y;

  this.numVertices = (x+1)*(y+1) + 2*(x+2); // side + 2 caps
  this.numFaces = 2*x*y + 2*x;

  this.vertices = new Float32Array(this.numVertices * 3);
  this.normals = new Float32Array(this.numVertices * 3);
  this.colors = new Float32Array(this.numVertices * 4);
  this.texCoords = new Float32Array(this.numVertices * 2);
  this.indices = new Uint16Array(this.numFaces * 3);

  var index = 0;

  for (var j=0; j<=y; j++)
  {
    for (var i=0; i<=x; i++)
    {
      this.vertices[3 * index    ] = Math.sin(2.0 * Math.PI * i / x);
      this.vertices[3 * index + 1] = j/y * 2.0 - 1.0;
      this.vertices[3 * index + 2] = Math.cos(2.0 * Math.PI * i / x);

      this.normals[3 * index    ] = this.vertices[3 * index    ];
      this.normals[3 * index + 1] = 0.0;
      this.normals[3 * index + 2] = this.vertices[3 * index + 2];

      this.colors[4 * index    ] = 1.0;
      this.colors[4 * index + 1] = 1.0;
      this.colors[4 * index + 2] = 1.0;
      this.colors[4 * index + 3] = 1.0;

      this.texCoords[2 * index    ] = i/x;
      this.texCoords[2 * index + 1] = j/y;
      
      index++;
    }
  }

  for (var j=0; j<2; j++)
  {
    this.vertices[3 * index    ] = 0.0;
    this.vertices[3 * index + 1] = j * 2.0 - 1.0;
    this.vertices[3 * index + 2] = 0.0;

    this.normals[3 * index    ] = 0.0;
    this.normals[3 * index + 1] = this.vertices[3 * index + 1];
    this.normals[3 * index + 2] = 0.0;

    this.colors[4 * index    ] = 1.0;
    this.colors[4 * index + 1] = 1.0;
    this.colors[4 * index + 2] = 1.0;
    this.colors[4 * index + 3] = 1.0;

    this.texCoords[2 * index    ] = 0.5;
    this.texCoords[2 * index + 1] = 0.5;
      
    index++;

    for (var i=0; i<=x; i++)
    {
      this.vertices[3 * index    ] = Math.sin(2.0 * Math.PI * i / x);
      this.vertices[3 * index + 1] = j * 2.0 - 1.0;
      this.vertices[3 * index + 2] = Math.cos(2.0 * Math.PI * i / x);

      this.normals[3 * index    ] = 0.0;
      this.normals[3 * index + 1] = this.vertices[3 * index + 1];
      this.normals[3 * index + 2] = 0.0;

      this.colors[4 * index    ] = 1.0;
      this.colors[4 * index + 1] = 1.0;
      this.colors[4 * index + 2] = 1.0;
      this.colors[4 * index + 3] = 1.0;

      this.texCoords[2 * index    ] = this.vertices[3 * index + 0] * 0.5 + 0.5;
      this.texCoords[2 * index + 1] = this.vertices[3 * index + 2] * 0.5 + 0.5;
      
      index++;
    }
  }

  index = 0;

  for (var j=0; j<y; j++)
  {
    for (var i=0; i<x; i++)
    {
      var base = j * (x+1) + i;

      this.indices[3 * index    ] = base;
      this.indices[3 * index + 1] = base + (x + 1);
      this.indices[3 * index + 2] = base + 1;
      this.indices[3 * index + 3] = base + (x + 1);
      this.indices[3 * index + 4] = base + (x + 1) + 1;
      this.indices[3 * index + 5] = base + 1;

      index+=2;
    }
  }

  for (var j=0; j<2; j++)
  {
    for (var i=0; i<x; i++)
    {
      var base = (y+1) * (x+1) + j * (x+2);

      this.indices[3 * index    ] = base;
      this.indices[3 * index + 1] = base + i + 1;
      this.indices[3 * index + 2] = base + i + 2;

      index++;
    }
  }

  this.createVertexBuffer(this.vertices, this.numVertices);
  this.createNormalBuffer(this.normals, this.numVertices);
  this.createColorBuffer(this.colors, this.numVertices);
  this.createTexCoordBuffer(this.texCoords, this.numVertices);
  this.createIndexBuffer(this.indices, this.numFaces * 3);
}

///////////////////////////////////////////////////////////////////////////////
// Sphere
///////////////////////////////////////////////////////////////////////////////

function Sphere() {}

Sphere.prototype = new Mesh();

Sphere.create = function(x,y)
{
  var obj = new Sphere();
  obj.init(x,y);
  return obj;
}

Sphere.prototype.init = function(x,y)
{
  if (x<3) throw ("Invalid parameter");
  if (y<2) throw ("Invalid parameter");
  if ((x+1)*(y+1)>0xffff) throw ("Parameter combination results in too big mesh");
  
  this.x = x;
  this.y = y;

  this.numVertices = (x+1)*(y+1);
  this.numFaces = 2*x*y;

  this.vertices = new Float32Array(this.numVertices * 3);
  this.normals = new Float32Array(this.numVertices * 3);
  this.colors = new Float32Array(this.numVertices * 4);
  this.texCoords = new Float32Array(this.numVertices * 2);
  this.indices = new Uint16Array(this.numFaces * 3);

  var index=0;

  for (var j=0; j<=y; j++)
  {
    for (var i=0; i<=x; i++)
    {
      var phi = i/x * 2.0 * Math.PI;
      var theta = (j/y - 0.5) * Math.PI;

      this.vertices[3 * index    ] = Math.cos(theta) * Math.sin(phi);
      this.vertices[3 * index + 1] = Math.sin(theta);
      this.vertices[3 * index + 2] = Math.cos(theta) * Math.cos(phi);

      this.normals[3 * index    ] = this.vertices[3 * index    ];
      this.normals[3 * index + 1] = this.vertices[3 * index + 1];
      this.normals[3 * index + 2] = this.vertices[3 * index + 2];

      this.colors[4 * index    ] = 1.0;
      this.colors[4 * index + 1] = 1.0;
      this.colors[4 * index + 2] = 1.0;
      this.colors[4 * index + 3] = 1.0;

      this.texCoords[2 * index    ] = i/x;
      this.texCoords[2 * index + 1] = j/y;

      index++;
    }
  }

  index=0;

  for (var j=0; j<y; j++)
  {
    for (var i=0; i<x; i++)
    {
      var base = j*(x+1) + i;

      this.indices[3 * index    ] = base;
      this.indices[3 * index + 1] = base + (x+1);
      this.indices[3 * index + 2] = base + 1;
      this.indices[3 * index + 3] = base + (x+1);
      this.indices[3 * index + 4] = base + (x+1) + 1;
      this.indices[3 * index + 5] = base + 1;
 
      index+=2;
    }
  }

  this.createVertexBuffer(this.vertices, this.numVertices, true); // TODO: HANDLE THIS PROPERLY
  this.createNormalBuffer(this.normals, this.numVertices, true); // TODO: HANDLE THIS PROPERLY
  this.createColorBuffer(this.colors, this.numVertices);
  this.createTexCoordBuffer(this.texCoords, this.numVertices);
  this.createIndexBuffer(this.indices, this.numFaces * 3);
}

///////////////////////////////////////////////////////////////////////////////
// Quad
///////////////////////////////////////////////////////////////////////////////

function Quad() {}

Quad.prototype = new Mesh();

Quad.create = function(x, y, uscale, vscale, bidirectional)
{
  var obj = new Quad();
  obj.init(x, y, uscale, vscale, bidirectional);
  return obj;
}

Quad.prototype.init = function(x, y, uscale, vscale, bidirectional)
{
  if (x<1) throw ("Invalid parameter");
  if (y<1) throw ("Invalid parameter");
  if ((x+1)*(y+1)>0xffff) throw ("Parameter combination results in too big mesh");

  this.x = x;
  this.y = y;

  if (!uscale) uscale=1.0;
  if (!vscale) vscale=1.0;
  var offset = bidirectional ? -0.5 : 0;

  this.numVertices = (x+1)*(y+1);
  this.numFaces = 2*x*y;

  this.vertices = new Float32Array(this.numVertices * 3);
  this.normals = new Float32Array(this.numVertices * 3);
  this.colors = new Float32Array(this.numVertices * 4);
  this.texCoords = new Float32Array(this.numVertices * 2);
  this.indices = new Uint16Array(this.numFaces * 3);

  var index=0;

  for (var j=0; j<=y; j++)
  {
    for (var i=0; i<=x; i++)
    {
      this.vertices[3 * index    ] = i/x * 2.0 - 1.0;
      this.vertices[3 * index + 1] = j/y * 2.0 - 1.0;
      this.vertices[3 * index + 2] = 0;

      this.normals[3 * index    ] = 0.0;
      this.normals[3 * index + 1] = 0.0;
      this.normals[3 * index + 2] = -1.0;

      this.colors[4 * index    ] = 1.0;
      this.colors[4 * index + 1] = 1.0;
      this.colors[4 * index + 2] = 1.0;
      this.colors[4 * index + 3] = 1.0;

      this.texCoords[2 * index    ] = uscale*(i/x+offset);
      this.texCoords[2 * index + 1] = vscale*(j/y+offset);

      index++;
    }
  }

  index = 0;

  for (var j=0; j<y; j++)
  {
    for (var i=0; i<x; i++)
    {
      var base = j*(x+1) + i;

      this.indices[3 * index    ] = base;
      this.indices[3 * index + 1] = base + (x+1);
      this.indices[3 * index + 2] = base + 1;
      this.indices[3 * index + 3] = base + (x+1);
      this.indices[3 * index + 4] = base + (x+1) + 1;
      this.indices[3 * index + 5] = base + 1;

      index+=2;
    }
  }

  this.createVertexBuffer(this.vertices, this.numVertices);
  this.createNormalBuffer(this.normals, this.numVertices);
  this.createColorBuffer(this.colors, this.numVertices);
  this.createTexCoordBuffer(this.texCoords, this.numVertices);
  this.createIndexBuffer(this.indices, this.numFaces * 3);
}

///////////////////////////////////////////////////////////////////////////////
// Torus
///////////////////////////////////////////////////////////////////////////////

function Torus() {}

Torus.prototype = new Mesh();

Torus.create = function(x, y, rinner, router, uscale, vscale)
{
  var obj = new Torus();
  obj.init(x,y, rinner, router, uscale, vscale);
  return obj;
}

Torus.prototype.init = function(x,y, rinner, router, uscale, vscale)
{
  if (x<3) throw ("Invalid parameter");
  if (y<2) throw ("Invalid parameter");
  if ((x+1)*(y+1)>0xffff) throw ("Parameter combination results in too big mesh");

  this.x = x;
  this.y = y;
  this.rInner = rinner;
  this.rOuter = router;
  this.uScale = uscale;
  this.vScale = vscale;

  this.numVertices = (x+1)*(y+1);
  this.numFaces = 2*x*y;

  this.vertices = new Float32Array(this.numVertices * 3);
  this.normals = new Float32Array(this.numVertices * 3);
  this.colors = new Float32Array(this.numVertices * 4);
  this.texCoords = new Float32Array(this.numVertices * 2);
  this.indices = new Uint16Array(this.numFaces * 3);

  var index = 0;

  for (var j=0; j<=y; j++)
  {
    for (var i=0; i<=x; i++)
    {
      var xx = Math.cos(2.0 * Math.PI * i / x) * this.rInner;
      var yy = Math.sin(2.0 * Math.PI * i / x) * this.rInner;
      var zz = 0;

      var ss = Math.sin(2.0 * Math.PI * j / y);
      var cc = Math.cos(2.0 * Math.PI * j / y);

      this.vertices[3 * index    ] = (xx + this.rOuter) * cc;
      this.vertices[3 * index + 1] = yy;
      this.vertices[3 * index + 2] = (xx + this.rOuter) * ss;

      this.normals[3 * index    ] = xx * cc;
      this.normals[3 * index + 1] = yy;
      this.normals[3 * index + 2] = xx * ss;

      this.colors[4 * index    ] = 1.0;
      this.colors[4 * index + 1] = 1.0;
      this.colors[4 * index + 2] = 1.0;
      this.colors[4 * index + 3] = 1.0;

      this.texCoords[2 * index    ] = i/x * this.uScale;
      this.texCoords[2 * index + 1] = j/y * this.vScale;
      
      index++;
    }
  }

  index = 0;

  for (var j=0; j<y; j++)
  {
    for (var i=0; i<x; i++)
    {
      var base = j * (x+1) + i;

      this.indices[3 * index    ] = base;
      this.indices[3 * index + 1] = base + (x + 1);
      this.indices[3 * index + 2] = base + 1;
      this.indices[3 * index + 3] = base + (x + 1);
      this.indices[3 * index + 4] = base + (x + 1) + 1;
      this.indices[3 * index + 5] = base + 1;

      index+=2;
    }
  }

  this.createVertexBuffer(this.vertices, this.numVertices);
  this.createNormalBuffer(this.normals, this.numVertices);
  this.createColorBuffer(this.colors, this.numVertices);
  this.createTexCoordBuffer(this.texCoords, this.numVertices);
  this.createIndexBuffer(this.indices, this.numFaces * 3);
}


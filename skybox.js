/**
 *      Skybox
 *      @author: Alex
 */

function Skybox() {}

Skybox.prototype = new Mesh();

Skybox.create = function()
{
  var obj = new Skybox();
  obj.init();
  return obj;
}

Skybox.prototype.init = function()
{

  this.numVertices = 24;
  this.numFaces = 12;

  this.vertices = new Float32Array([
    -1.0, -1.0, -1.0, // NZ
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    -1.0, -1.0,  1.0, // PZ
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    -1.0, -1.0, -1.0, // NY
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0, -1.0, -1.0,

    -1.0,  1.0, -1.0, // PY
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    -1.0, -1.0, -1.0, // NX
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,

     1.0, -1.0, -1.0, // PX
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,
  ]);

  this.texCoordsUVW = new Float32Array([
    -1.0, -1.0, -1.0, // NZ
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    -1.0, -1.0,  1.0, // PZ
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    -1.0, -1.0, -1.0, // NY
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0, -1.0, -1.0,

    -1.0,  1.0, -1.0, // PY
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    -1.0, -1.0, -1.0, // NX
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,

     1.0, -1.0, -1.0, // PX
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,
  ]);

  this.indices = new Uint16Array([
     0,  1,  2,
     0,  2,  3,

     4,  5,  6,
     4,  6,  7,

     8,  9, 10,
     8, 10, 11,

    12, 13, 14,
    12, 14, 15,

    16, 17, 18,
    16, 18, 19,

    20, 21, 22,
    20, 22, 23
  ]);


  this.createVertexBuffer(this.vertices, this.numVertices);
  this.createTexCoordUVWBuffer(this.texCoordsUVW, this.numVertices);
  this.createIndexBuffer(this.indices, this.numFaces * 3);
}


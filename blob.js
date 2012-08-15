///////////////////////////////////////////////////////////////////////////////
// Blob
///////////////////////////////////////////////////////////////////////////////

function Blob() {}

Blob.prototype = new Sphere();

Blob.prototype.init = function(x,y)
{
  this.__proto__.init(x, y);

  this.vel = new Float32Array(this.numVertices);
  for (var i=0; i<this.numVertices; i++)
  {
    this.vel[i] = 0;
  }
}

Blob.create = function(x,y)
{
  var obj = new Blob();
  obj.init(x,y);
  return obj;
}

Blob.prototype.pinch = function()
{
  for (var k=0; k<5; k++)
  {
  var size=20;
  var indexX = Math.floor(Math.random() * (this.x));
  var indexY = Math.floor(Math.random() * (this.y));

  for (var j=0; j<=size; j++)
  {
    for (var i=0; i<=size; i++)
    {
      var mulX = 2.0*((i/size)-0.5);
      mulX=1-mulX*mulX;
      mulX*=mulX;
      var mulY = 2.0*((j/size)-0.5);
      mulY=1-mulY*mulY;
      mulY*=mulY;
      this.vel[(this.x+1)*((indexY+j)%(this.y+1)) + ((indexX+i)%(this.x+1))] += 0.1*mulX*mulY;
    }
  }
  }
}

Blob.prototype.update = function()
{
  var x;
  var y;
  var z;

  for (var i=0; i<this.numVertices; i++)
  {
    x = this.vertices[3*i  ];
    y = this.vertices[3*i+1];
    z = this.vertices[3*i+2];

    x *= 1 + this.vel[i];
    y *= 1 + this.vel[i];
    z *= 1 + this.vel[i];

    var l = Math.sqrt(x*x + y*y + z*z);

    this.vertices[3*i  ] = x;
    this.vertices[3*i+1] = y;
    this.vertices[3*i+2] = z;

    l += this.vel[i] - 1.0;

    this.vel[i] -= 0.03 * l;
    this.vel[i] *= 0.9999;
  }
/*  for (var j=1; j<this.y; j++)
  {
    for (var i=1; i<this.x; i++)
    {
      this.vel[(this.x+1) * j + i] = (this.vel[(this.x+1) * j + i] + this.vel[(this.x+1) * j + i +1] + this.vel[(this.x+1) * j + i - 1] + this.vel[(this.x+1) * (j+1) + i ] + this.vel[(this.x+1) * (j-1) + i ])/ 5.0;
    }
  }*/

  this.updateVertexBuffer(this.vertices);

  for (var i=0; i<this.numVertices; i++)
  {
    var i1 = 3*((i+1) % this.numVertices);
    var i2 = 3*((i-1) % this.numVertices);
    var i3 = 3*((i+(this.x+1)) % this.numVertices);
    var i4 = 3*((i-(this.x+1)) % this.numVertices);

    var v1 = $V([           this.vertices[i1] - this.vertices[i2] ,  this.vertices[i1+1] - this.vertices[i2+1] , this.vertices[i1+2] - this.vertices[i2+2]     ]);
    var v2 = $V([           this.vertices[i3] - this.vertices[i4] ,  this.vertices[i3+1] - this.vertices[i4+1] , this.vertices[i3+2] - this.vertices[i4+2]     ]);

    v1 = v1.cross(v2).toUnitVector();

    this.normals[3*i  ]=v1.e(1);
    this.normals[3*i+1]=v1.e(2);
    this.normals[3*i+2]=v1.e(3);
  }
  this.updateNormalBuffer(this.normals);
}

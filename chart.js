

///////////////////////////////////////////////////////////////////////////////
// ChartBox
///////////////////////////////////////////////////////////////////////////////

function ChartBox(x)
{
  this.x = x;
  this.values = new Array(x);
  for (var i = 0; i < x; i++)
  {
     this.values[i]=1;
  }

  this.init();
}

ChartBox.prototype = new Mesh();

ChartBox.prototype.updateVertices = function()
{
  // vertex and normal coordinates used for generating chart sides in a loop
  const y = [0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0];
  const z = [1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0];
  const ny = [0.0, 0.0, 0.0, 0.0, -1.0, -1.0, 1.0, 1.0];
  const nz = [1.0, 1.0, -1.0, -1.0, 0.0, 0.0, 0.0, 0.0];

  var index = 0;

  for (var j = 0; j < 8; j++)
  {
    for (var i = 0; i < this.x; i++)
    {
      var frac = i / (this.x - 1);

      this.vertices[index    ] = frac;
      this.vertices[index + 1] = y[j] * this.values[i];
      this.vertices[index + 2] = z[j];

      if (j<6)
      {
        this.normals[index    ] = 0.0;
        this.normals[index + 1] = ny[j];
        this.normals[index + 2] = nz[j];
      }
      else
      {
        // TODO this normal calculation is for smooth surfaces, reconsider flat shading

        var frac = 1/(this.x-1);

        var norx1;
        var nory1;
        var norx2;
        var nory2;
        var l;

        if (i==0) 
        {
          norx1 = 0;
          nory1 = 0;
        }
        else
        {
          norx1 = this.values[i-1] - this.values[i];
          nory1 = frac;
          l = 1 / Math.sqrt(norx1 * norx1 + nory1 * nory1);
          norx1 *= l;
          nory1 *= l;
        }

        if (i==this.x - 1)
        {
          norx2 = 0;
          nory2 = 0;
        }
        else
        {
          norx2 = this.values[i] - this.values[i+1];
          nory2 = frac;
          l = 1 / Math.sqrt(norx2 * norx2 + nory2 * nory2);
          norx2 *= l;
          nory2 *= l;
        }

        var norx = norx1 + norx2;
        var nory = nory1 + nory2;
        var l = 1 / Math.sqrt(norx * norx + nory * nory);
        norx *= l;
        nory *= l;

        this.normals[index    ] = norx;
        this.normals[index + 1] = nory;
        this.normals[index + 2] = 0;
      }

      index += 3;
    }
  }

  for (var i = 0; i < 4; i++)
  {
    this.vertices[index    ] = 0;
    this.vertices[index + 1] = y[i] * this.values[0];
    this.vertices[index + 2] = z[i];

    this.normals[index    ] = -1;
    this.normals[index + 1] = 0;
    this.normals[index + 2] = 0;

    this.vertices[index + 12    ] = 1;
    this.vertices[index + 12 + 1] = y[i] * this.values[this.x - 1];
    this.vertices[index + 12 + 2] = z[i];

    this.normals[index + 12    ] = 1;
    this.normals[index + 12 + 1] = 0;
    this.normals[index + 12 + 2] = 0;

    index += 3;
  }
}

ChartBox.prototype.updateValues = function(values)
{
  this.values = values;
  this.updateVertices();
  this.updateVertexBuffer(this.vertices);
  this.updateNormalBuffer(this.normals);
}

ChartBox.prototype.init = function()
{
  this.numVertices = this.x * 8 + 8;
  this.numFaces = (this.x - 1) * 8 + 4;

  this.vertices = new Float32Array(this.numVertices * 3);
  this.normals = new Float32Array(this.numVertices * 3);
  this.indices = new Uint16Array(this.numFaces * 3);

  this.updateVertices();

  var index = 0;

  for (var j = 0; j < 4; j++)
  {
    for (var i = 0; i < (this.x-1); i++)
    {
      var base = 2 * j * this.x + i;

      this.indices[index    ] = base;
      this.indices[index + 1] = base + this.x;
      this.indices[index + 2] = base + 1;
      this.indices[index + 3] = base + this.x;
      this.indices[index + 4] = base + this.x + 1;
      this.indices[index + 5] = base + 1;

      index += 6;
    }
  }

  for (var i = 0; i < 2; i++)
  {
    var base = 8 * this.x + i * 4;

    this.indices[index    ] = base;
    this.indices[index + 1] = base + 2;
    this.indices[index + 2] = base + 3;
    this.indices[index + 3] = base;
    this.indices[index + 4] = base + 3;
    this.indices[index + 5] = base + 1;

    index += 6;
  }

  this.createVertexBuffer(this.vertices, this.numVertices, true);
  this.createNormalBuffer(this.normals, this.numVertices, true);
  this.createIndexBuffer(this.indices, this.numFaces * 3);
}

///////////////////////////////////////////////////////////////////////////////
// Chart
///////////////////////////////////////////////////////////////////////////////

function Chart(lines, transformSource)
{
  this.lines = lines;
  this.transformSource = transformSource;

  this.chartShader = ShaderProgramFromFile("shaders/fragment/chart.glsl", "shaders/vertex/chart.glsl");
  this.chartShader.colorUniform = gl.getUniformLocation(this.chartShader, "uColor");
  if (!this.chartShader.colorUniform) throw Error("Cannot setup uniform uColor");

  this.chart = new ChartBox(16);
  this.chartObject = new Renderable(this.chart, this.transformSource);
  this.chartObject.shaderProgram = this.chartShader;

  this.values = new Array(this.lines);

  this.updateValues = function(line, values)
  {
    this.values[line] = values.slice(0);
  }

  this.render = function()
  {
    gl.useProgram(this.chartShader);

    for (var i=0; i<this.lines; i++)
    {
      gl.uniform4f(this.chartShader.colorUniform, 0.5 + Math.sin(i) * 0.3, 0.5 + Math.cos(i * 0.5) * 0.3, 0.5 + Math.sin(i * 0.5) * 0.3, 1.0);
      this.chart.updateValues(this.values[i]);
      this.chartObject.resetTransform();
      this.chartObject.scale([8, 1, 0.5]);
      this.chartObject.translate([-0.5, -2, -1.0 * i - 2.0]);
      this.chartObject.render();
    }

  }
}


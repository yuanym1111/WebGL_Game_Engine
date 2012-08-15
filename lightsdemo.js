

function LightsDemo() {}

LightsDemo.prototype = new Demo();

LightsDemo.prototype.createObjects = function()
{
  this.rot = 0;

  this.lightPos = new Array(8);
  this.lightColor = new Array(8);
  this.lightColor[0] = $V([1.0, 1.0, 1.0, 1.0]);
  this.lightColor[1] = $V([1.0, 0.3, 0.3, 1.0]);
  this.lightColor[2] = $V([0.3, 1.0, 0.3, 1.0]);
  this.lightColor[3] = $V([0.3, 0.3, 1.0, 1.0]);
  this.lightColor[4] = $V([1.0, 1.0, 1.0, 1.0]);
  this.lightColor[5] = $V([1.0, 1.0, 0.3, 1.0]);
  this.lightColor[6] = $V([0.3, 1.0, 1.0, 1.0]);
  this.lightColor[7] = $V([1.0, 0.3, 1.0, 1.0]);

  // textures -----------------------------------------------------------------

  this.stoneTexture = new Texture("textures/organic.jpg");

  // shaders ------------------------------------------------------------------

  this.lightShader = ShaderProgramFromFile("shaders/fragment/light.glsl", "shaders/vertex/test.glsl");
  this.lightShader.lightColorUniform = gl.getUniformLocation(this.lightShader, "uLightColor");

  this.diffuseShader = ShaderProgramFromFile("shaders/fragment/lighttest.glsl", "shaders/vertex/wobbler.glsl");
  this.diffuseShader.lightPosUniform = new Array(8);
  this.diffuseShader.lightColorUniform = new Array(8);

  this.diffuseShader.lightPosUniform[0] = gl.getUniformLocation(this.diffuseShader, "uLightPos1");
  this.diffuseShader.lightPosUniform[1] = gl.getUniformLocation(this.diffuseShader, "uLightPos2");
  this.diffuseShader.lightPosUniform[2] = gl.getUniformLocation(this.diffuseShader, "uLightPos3");
  this.diffuseShader.lightPosUniform[3] = gl.getUniformLocation(this.diffuseShader, "uLightPos4");
  this.diffuseShader.lightPosUniform[4] = gl.getUniformLocation(this.diffuseShader, "uLightPos5");
  this.diffuseShader.lightPosUniform[5] = gl.getUniformLocation(this.diffuseShader, "uLightPos6");
  this.diffuseShader.lightPosUniform[6] = gl.getUniformLocation(this.diffuseShader, "uLightPos7");
  this.diffuseShader.lightPosUniform[7] = gl.getUniformLocation(this.diffuseShader, "uLightPos8");

  this.diffuseShader.lightColorUniform[0] = gl.getUniformLocation(this.diffuseShader, "uLightColor1");
  this.diffuseShader.lightColorUniform[1] = gl.getUniformLocation(this.diffuseShader, "uLightColor2");
  this.diffuseShader.lightColorUniform[2] = gl.getUniformLocation(this.diffuseShader, "uLightColor3");
  this.diffuseShader.lightColorUniform[3] = gl.getUniformLocation(this.diffuseShader, "uLightColor4");
  this.diffuseShader.lightColorUniform[4] = gl.getUniformLocation(this.diffuseShader, "uLightColor5");
  this.diffuseShader.lightColorUniform[5] = gl.getUniformLocation(this.diffuseShader, "uLightColor6");
  this.diffuseShader.lightColorUniform[6] = gl.getUniformLocation(this.diffuseShader, "uLightColor7");
  this.diffuseShader.lightColorUniform[7] = gl.getUniformLocation(this.diffuseShader, "uLightColor8");

  // objects ------------------------------------------------------------------

  this.sphereMesh = Sphere.create(128, 128);
  this.sphere = new Renderable(this.sphereMesh, this);
  this.sphere.texture1 = this.stoneTexture;
  this.sphere.shaderProgram = this.diffuseShader;

  this.sphereMesh2 = Sphere.create(3, 2);
  this.sphere2 = new Renderable(this.sphereMesh2, this);
  this.sphere2.shaderProgram = this.lightShader;

  // cameras ------------------------------------------------------------------

  this.camera = new Camera();
}

LightsDemo.prototype.preprocess = function()
{
}

LightsDemo.prototype.update = function(time)
{
  this.rot = time * 0.05;
}

LightsDemo.prototype.render = function()
{
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  this.pMatrix = makePerspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

  this.camera.eye = $V([Math.sin(this.rot*0.01) * 15.0, 5, Math.cos(this.rot*0.01) * 15.0]);

  this.vMatrix = this.camera.lookAt();
  this.vMatrixInv = this.camera.inverseOrientation();

  var index = 0;

  this.lightPos[0] = $V([Math.sin(this.rot * 0.018)*5.0, Math.sin(this.rot * 0.019)*5.0, Math.cos(this.rot * 0.016)*5.0, 1.0]);
  this.lightPos[1] = $V([Math.sin(this.rot * 0.020)*5.0, Math.sin(this.rot * 0.015)*5.0, Math.cos(this.rot * 0.018)*5.0, 1.0]);
  this.lightPos[2] = $V([Math.sin(this.rot * 0.015)*5.0, Math.sin(this.rot * 0.018)*5.0, Math.cos(this.rot * 0.021)*5.0, 1.0]);
  this.lightPos[3] = $V([Math.sin(this.rot * 0.017)*5.0, Math.sin(this.rot * 0.012)*5.0, Math.cos(this.rot * 0.014)*5.0, 1.0]);
  this.lightPos[4] = $V([Math.sin(this.rot * 0.014)*5.0, Math.sin(this.rot * 0.014)*5.0, Math.cos(this.rot * 0.015)*5.0, 1.0]);
  this.lightPos[5] = $V([Math.sin(this.rot * 0.017)*5.0, Math.sin(this.rot * 0.015)*5.0, Math.cos(this.rot * 0.016)*5.0, 1.0]);
  this.lightPos[6] = $V([Math.sin(this.rot * 0.019)*5.0, Math.sin(this.rot * 0.018)*5.0, Math.cos(this.rot * 0.023)*5.0, 1.0]);
  this.lightPos[7] = $V([Math.sin(this.rot * 0.022)*5.0, Math.sin(this.rot * 0.012)*5.0, Math.cos(this.rot * 0.019)*5.0, 1.0]);

  for (var i=0; i<8; i++)
  {
    gl.useProgram(this.lightShader);
    gl.uniform4f(this.lightShader.lightColorUniform, this.lightColor[i].e(1), this.lightColor[i].e(2), this.lightColor[i].e(3), this.lightColor[i].e(4));

    this.sphere2.resetTransform();
    this.sphere2.translate([this.lightPos[i].e(1),this.lightPos[i].e(2),this.lightPos[i].e(3)]);
    this.sphere2.scale([0.1, 0.1, 0.1]);
    this.sphere2.render();

    this.lightPos[i] = this.vMatrix.x(this.lightPos[i]);
  }

  gl.useProgram(this.diffuseShader);
  for (var i=0; i<8; i++)
  {
    gl.uniform3f(this.diffuseShader.lightPosUniform[i], this.lightPos[i].e(1), this.lightPos[i].e(2), this.lightPos[i].e(3));
    gl.uniform4f(this.diffuseShader.lightColorUniform[i], this.lightColor[i].e(1), this.lightColor[i].e(2), this.lightColor[i].e(3), this.lightColor[i].e(4));
  }

  this.sphere.resetTransform();
  this.sphere.scale([3, 3, 3]);
  this.sphere.rotate(this.rot, [1, 1, 1]);
  this.sphere.render();
}

LightsDemo.prototype.postprocess = function()
{
}


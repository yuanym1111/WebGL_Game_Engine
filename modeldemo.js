
function OfficeObject(name, refname, scale, rotate, pos, renderIndex)
{
  this.name = name;
  this.refname = refname;
  this.scale = scale;
  this.rotate = rotate;
  this.pos = pos;
  this.renderIndex = renderIndex;
}

function Consumer(name, id, location, peak)
{
  this.name = name;
  this.id = id;
  this.location = location;
  this.consumption = 0.0;
  this.peak = peak;
}

///////////////////////////////////////////////////////////////////////////////

function ModelDemo() {}

ModelDemo.prototype = new Demo();
/*
ModelDemo.prototype.handleKeyDown = function(event)
{
  var e = event ? event : window.event;
  if (!e) return;

//  alert(e.keyCode);

  switch (e.keyCode)
  {
    case 65: // a
      if (this.distance<50)
        this.distance+=1;
      break;
    case 81: // q
      if (this.distance>5)
        this.distance-=1;
      break;
  }
}
*/

ModelDemo.prototype.handleMouseDown = function(event)
{
  var e = event ? event : window.event;
  if (!e) return;

  this.mouseDown = true;
  this.prevX = e.clientX;
  this.prevY = e.clientY;
}

ModelDemo.prototype.handleMouseUp = function(event)
{
  var e = event ? event : window.event;
  if (!e) return;

  this.mouseDown = false;
}

ModelDemo.prototype.handleMouseMove = function(event)
{
  var e = event ? event : window.event;
  if (!e) return;

  if (this.mouseDown)
  {
    this.rotX += this.prevX - e.clientX;
    this.rotY -= this.prevY - e.clientY;
  }
  if (this.rotY<0) this.rotY = 0;
  if (this.rotY>300) this.rotY = 300;
  this.prevX = e.clientX;
  this.prevY = e.clientY;

  this.mouseX = e.layerX;
  this.mouseY = e.layerY;
}

ModelDemo.prototype.handleMouseOut = function(event)
{
  this.mouseX = -1;
  this.mouseY = -1;
}

ModelDemo.prototype.createObjects = function()
{
  // etc ----------------------------------------------------------------------

  this.distance = 15;  
  this.rotX = 0;
  this.rotY = 120;
//  document.onkeydown = delegateParam(this, this.handleKeyDown);
//  canvas.addEventListener('mousemove', delegateParam(this, this.handleMouseMove), false);
//  canvas.addEventListener('mouseout', delegateParam(this, this.handleMouseOut), false);
//  canvas.onmousedown = delegateParam(this, this.handleMouseDown);
//  canvas.onmouseup = delegateParam(this, this.handleMouseUp);
  this.mouse = new Mouse(canvas);
  // consumers ----------------------------------------------------------------
  //Consumer(name, id, location, peak)
  this.consumers = new Array();
  this.consumers.push(new Consumer("PC01",  1, [ 3.20, 2, -2.80], 35));
  this.consumers.push(new Consumer("PC02",  2, [ 3.20, 2, -0.65], 1523));
  this.consumers.push(new Consumer("PC03",  3, [ 0.65, 2, -2.80], 1405));
  this.consumers.push(new Consumer("PC04",  4, [ 0.65, 2, -0.65], 948));
  this.consumers.push(new Consumer("PC05",  5, [ 7.10, 2, -2.80], 63));
  this.consumers.push(new Consumer("PC06",  6, [ 7.10, 2, -0.65], 26));
  this.consumers.push(new Consumer("PC07",  7, [ 8.35, 2, -2.80], 28));
  this.consumers.push(new Consumer("PC08",  8, [ 8.35, 2, -0.65], 28));
  this.consumers.push(new Consumer("PC09",  9, [ 4.60, 2, -2.80], 35));
  this.consumers.push(new Consumer("PC10", 10, [ 4.60, 2, -0.65], 1523));
  this.consumers.push(new Consumer("PC11", 11, [10.10, 2, -2.80], 1405));
  this.consumers.push(new Consumer("PC12", 12, [10.10, 2, -0.65], 948));
  this.consumers.push(new Consumer("PC13", 13, [13.60, 2, -2.80], 63));
  this.consumers.push(new Consumer("PC14", 14, [13.60, 2, -0.65], 26));
  this.consumers.push(new Consumer("PC15", 15, [16.00, 2, -0.65], 28));
  this.consumers.push(new Consumer("PC16", 16, [18.60, 2, -0.65], 28));
  this.consumers.push(new Consumer("PC Lobby 1", 17, [13.50, 2, -6.00], 348));
  this.consumers.push(new Consumer("PC Lobby 2", 18, [14.75, 2, -6.00], 555));
  this.consumers.push(new Consumer("PC Lobby 3", 19, [13.50, 2, -7.25], 190));
  this.consumers.push(new Consumer("PC Lobby 4", 20, [14.75, 2, -7.25], 28));
  this.consumers.push(new Consumer("Meeting room", 21, [7.20, 2, -7.00], 28));

  this.officeObjects = new Array();

  // textures -----------------------------------------------------------------

  this.skyboxTexture = new CubeMapTexture(
    "cubemaps/jarkko/px.jpg", "cubemaps/jarkko/nx.jpg",
    "cubemaps/jarkko/py.jpg", "cubemaps/jarkko/ny.jpg",
    "cubemaps/jarkko/pz.jpg", "cubemaps/jarkko/nz.jpg");

  this.grassTexture = new Texture("textures/grass512_2.jpg");
  this.parkettiTexture = new Texture("textures/parketti.jpg");
  this.plasticTexture = new Texture("textures/plastic.jpg");
  this.bigDoorTexture = new Texture("textures/bigdoor.jpg");
  this.infoPinTexture = new Texture("textures/consumption_pin.png");

  this.infoTexture = new Texture("textures/consumption_billboard.png");
  gl.bindTexture(gl.TEXTURE_2D, this.infoTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  this.textTexture = gl.createTexture();
  this.updateTexture(this.consumers[0], 0);

  // shaders ------------------------------------------------------------------

  this.diffuseShader = ShaderProgramFromFile("shaders/fragment/diffuse_pos_nor.glsl", "shaders/vertex/basic_pos_nor.glsl");
  this.diffuseTranspShader = ShaderProgramFromFile("shaders/fragment/diffuse_fade_pos_nor.glsl", "shaders/vertex/basic_pos_nor.glsl");
  this.diffuseTranspShader.transpUniform = gl.getUniformLocation(this.diffuseTranspShader, "uTransp");

  this.envmapFadeShader = ShaderProgramFromFile("shaders/fragment/envmap_cube_normal_transp.glsl", "shaders/vertex/basic_pos_nor_tex.glsl");
  this.envmapFadeShader.transpUniform = gl.getUniformLocation(this.envmapFadeShader, "uTransp");

  this.textureShader = ShaderProgramFromFile("shaders/fragment/texmap_pos_nor_tex_building.glsl", "shaders/vertex/basic_pos_nor_tex.glsl");
  this.texture2Shader = ShaderProgramFromFile("shaders/fragment/texmap_pos_tex.glsl", "shaders/vertex/basic_pos_nor_tex.glsl");
  this.infoShader = ShaderProgramFromFile("shaders/fragment/texmap_pos_tex_tex.glsl", "shaders/vertex/billboard.glsl");
  this.infoShader.colorMaskUniform = gl.getUniformLocation(this.infoShader, "uColorMask");
  if (!this.infoShader.colorMaskUniform) throw Error("Cannot setup uniform uColorMask");

  this.cubeMapShader = ShaderProgramFromFile("shaders/fragment/cubemap_pos_tex.glsl", "shaders/vertex/basic_cubemap.glsl");

  this.pickShader = ShaderProgramFromFile("shaders/fragment/pick.glsl", "shaders/vertex/pick.glsl");
  this.pickShader.colorUniform = gl.getUniformLocation(this.pickShader, "uColor");
  if (!this.pickShader.colorUniform) throw Error("Cannot setup uniform uColor");

  this.pickAlphaShader = ShaderProgramFromFile("shaders/fragment/pick_alpha.glsl", "shaders/vertex/pick_alpha.glsl");
  this.pickAlphaShader.colorUniform = gl.getUniformLocation(this.pickAlphaShader, "uColor");
  if (!this.pickAlphaShader.colorUniform) throw Error("Cannot setup uniform uColor");
  
  
  this.objectShader = ShaderProgramFromFile("shaders/fragment/model.glsl", "shaders/vertex/model.glsl");
  
  
  // objects ------------------------------------------------------------------

  this.officeLoaded = false;
  this.office = new Scene(this);
  this.office.loadJSON("scenes/office.json", delegate(this, this.officeLoadedCallback) );

  this.officeSpace = [];

  this.infoMesh = Quad.create(2,2);
  this.info = new Renderable(this.infoMesh, this);
  this.info.isAdditive = true;
  this.info.texture1 = this.info1Texture;
  this.info.texture2 = this.textTexture;
  this.info.shaderProgram = this.infoShader;
  this.info.shaderProgramPick = this.pickAlphaShader;

  this.floorMesh = Quad.create(4,4,40,18);
  this.floor = new Renderable(this.floorMesh, this);
  this.floor.texture1 = this.plasticTexture;
  this.floor.shaderProgram = this.textureShader;

  this.quadMesh = Quad.create(4,4,16,16);
  this.quad = new Renderable(this.quadMesh, this);
  this.quad.texture1 = this.grassTexture;
  this.quad.shaderProgram = this.texture2Shader;

  this.skyboxMesh = Skybox.create(32, 32);
  this.skybox = new Renderable(this.skyboxMesh, this);
  this.skybox.texture1 = this.skyboxTexture;
  this.skybox.shaderProgram = this.cubeMapShader;

  
  this.model1 = new Model();
  
  this.model1.program = this.objectShader;
  
  this.model1.loadmodel("model/vat","modelvs-1","modelps-1");
  
  this.modelRenderer = new ModelRenderable(this.model1,this,'model1');
  this.modelRenderer.shaderProgram = this.objectShader;
  // cameras ------------------------------------------------------------------

  this.camera = new FPSCamera();
  this.camera.isTargetCamera = true;
  this.camera.fov = 90 * Math.PI/180.0;
  
  this.camera.eye = $V([10,10,10.5]);
  this.camera.center = $V([10,1,-4.5]);
  this.camera.buildRUL();
  
  
  this.keyboard = new KeyboardState();
}

ModelDemo.prototype.officeLoadedCallback = function()
{
  for (var i=0; i<this.office.renderables.length; i++)
  {
    if (this.office.renderables[i].mesh.texCoords)
    {
      this.office.renderables[i].shaderProgram = this.textureShader;
    }
    else
    {
      this.office.renderables[i].shaderProgram = this.diffuseShader;
    }
    this.office.renderables[i].shaderProgramPick = this.pickShader;
  }

  var o;

  /////////////////////////////////////////////////////////////////////////////

  o = this.office.renderables.getByName("wall");
  o.resetTransform();
  o.canBeTransparent = true;

  //OfficeObject(name, refname, scale, rotate, pos, renderIndex)
  this.officeObjects.push(new OfficeObject("inner_wall_h_01", "wall", [ 18,1, 1],  0, [ 0.90, 0,  -3.55]));
  this.officeObjects.push(new OfficeObject("inner_wall_h_02", "wall", [ 30,1, 1],  0, [ 4.10, 0,  -3.55]));
  this.officeObjects.push(new OfficeObject("inner_wall_h_03", "wall", [ 56,1, 1],  0, [ 9.20, 0,  -3.55]));
  this.officeObjects.push(new OfficeObject("inner_wall_h_04", "wall", [ 24,1, 1],  0, [14.00, 0,  -3.55]));

  this.officeObjects.push(new OfficeObject("inner_wall_h_05", "wall", [ 16,1, 1],  0, [16.80, 0,  -3.55]));
  this.officeObjects.push(new OfficeObject("inner_wall_h_06", "wall", [  2,1, 1],  0, [18.50, 0,  -3.55]));
  this.officeObjects.push(new OfficeObject("inner_wall_h_07", "wall", [ 14,1, 1],  0, [19.30, 0,  -6.75]));
  this.officeObjects.push(new OfficeObject("inner_wall_h_08", "wall", [ 14,1, 1],  0, [19.30, 0,  -4.45]));

  this.officeObjects.push(new OfficeObject("inner_wall_h_09", "wall", [ 34,1, 1],  0, [ 1.70, 0,  -6.80]));
  this.officeObjects.push(new OfficeObject("inner_wall_h_10", "wall", [  2,1, 1],  0, [ 0.10, 0,  -5.05]));
  this.officeObjects.push(new OfficeObject("inner_wall_h_11", "wall", [ 24,1, 1],  0, [ 2.20, 0,  -5.05]));
  this.officeObjects.push(new OfficeObject("inner_wall_h_12", "wall", [ 44,1, 1],  0, [ 7.15, 0,  -5.05]));

  this.officeObjects.push(new OfficeObject("inner_wall_v_01", "wall", [  1,1,35],  0, [ 3.90, 0,  -1.75]));
  this.officeObjects.push(new OfficeObject("inner_wall_v_02", "wall", [  1,1,35],  0, [ 9.40, 0,  -1.75]));
  this.officeObjects.push(new OfficeObject("inner_wall_v_03", "wall", [  1,1,35],  0, [14.90, 0,  -1.75]));
  this.officeObjects.push(new OfficeObject("inner_wall_v_04", "wall", [  1,1,35],  0, [17.30, 0,  -1.75]));

  this.officeObjects.push(new OfficeObject("inner_wall_v_05", "wall", [  1,1,13],  0, [18.55, 0,  -8.35]));
  this.officeObjects.push(new OfficeObject("inner_wall_v_06", "wall", [  1,1,15],  0, [18.55, 0,  -6.15]));
  this.officeObjects.push(new OfficeObject("inner_wall_v_07", "wall", [  1,1,10],  0, [18.55, 0,  -4.10]));
  this.officeObjects.push(new OfficeObject("inner_wall_v_08", "wall", [  1,1,28],  0, [ 9.40, 0,  -6.40]));

  this.officeObjects.push(new OfficeObject("inner_wall_v_09", "wall", [  1,1,28],  0, [ 4.90, 0,  -6.40]));
  this.officeObjects.push(new OfficeObject("inner_wall_v_10", "wall", [  1,1, 4],  0, [ 9.40, 0,  -8.80]));
  this.officeObjects.push(new OfficeObject("inner_wall_v_11", "wall", [  1,1, 4],  0, [ 4.90, 0,  -8.80]));
  this.officeObjects.push(new OfficeObject("inner_wall_v_12", "wall", [  1,1, 5],  0, [ 3.45, 0,  -5.25]));

  this.officeObjects.push(new OfficeObject("inner_wall_v_13", "wall", [  1,1,10],  0, [ 3.45, 0,  -6.80]));
  this.officeObjects.push(new OfficeObject("inner_wall_v_14", "wall", [  1,1,16.5],  0, [ 1.80, 0,  -5.925]));

  /////////////////////////////////////////////////////////////////////////////

  o = this.office.renderables.getByName("outer_wall_w1");
  o.resetTransform();
  o.canBeTransparent = true;

  this.officeObjects.push(new OfficeObject("outer_wall_h_01", "outer_wall_w1", [  1,1,1],  0, [ 17.25, 0,  0.10]));
  this.officeObjects.push(new OfficeObject("outer_wall_h_02", "outer_wall_w1", [  1,1,1],  0, [ 11.75, 0,  0.10]));
  this.officeObjects.push(new OfficeObject("outer_wall_h_03", "outer_wall_w1", [  1,1,1],  0, [  6.25, 0,  0.10]));

  /////////////////////////////////////////////////////////////////////////////

  o = this.office.renderables.getByName("outer_glass_w1");
  o.isAdditive = true;
  o.texture1 = this.skyboxTexture;
  o.shaderProgram = this.envmapFadeShader;
  o.resetTransform();

  this.officeObjects.push(new OfficeObject("outer_glass_h_01", "outer_glass_w1", [  1,1,1],  0, [ 17.25, 0,  0.10]));
  this.officeObjects.push(new OfficeObject("outer_glass_h_02", "outer_glass_w1", [  1,1,1],  0, [ 11.75, 0,  0.10]));
  this.officeObjects.push(new OfficeObject("outer_glass_h_03", "outer_glass_w1", [  1,1,1],  0, [  6.25, 0,  0.10]));

  /////////////////////////////////////////////////////////////////////////////

  o = this.office.renderables.getByName("outer_wall_w2");
  o.resetTransform();
  o.canBeTransparent = true;

  this.officeObjects.push(new OfficeObject("outer_wall_h_04", "outer_wall_w2", [  1,1,1],  0, [ 1.75, 0,  0.10]));
  this.officeObjects.push(new OfficeObject("outer_wall_v_04", "outer_wall_w2", [  1,1,1], 90, [-0.10, 0, -1.55]));
  this.officeObjects.push(new OfficeObject("outer_wall_v_05", "outer_wall_w2", [4/7,1,1], 90, [-0.10, 0, -8.00]));
  this.officeObjects.push(new OfficeObject("outer_wall_v_06", "outer_wall_w2", [4/7,1,1], 90, [-0.10, 0, -6.00]));

  /////////////////////////////////////////////////////////////////////////////

  o = this.office.renderables.getByName("outer_glass_w2");
  o.isAdditive = true;
  o.texture1 = this.skyboxTexture;
  o.shaderProgram = this.envmapFadeShader;
  o.resetTransform();

  this.officeObjects.push(new OfficeObject("outer_glass_h_04", "outer_glass_w2", [  1,1,1],  0, [ 1.75, 0,  0.10]));
  this.officeObjects.push(new OfficeObject("outer_glass_v_04", "outer_glass_w2", [  1,1,1], 90, [-0.10, 0, -1.75]));
  this.officeObjects.push(new OfficeObject("outer_glass_v_05", "outer_glass_w2", [4/7,1,1], 90, [-0.10, 0, -8.00]));
  this.officeObjects.push(new OfficeObject("outer_glass_v_06", "outer_glass_w2", [4/7,1,1], 90, [-0.10, 0, -6.00]));

  /////////////////////////////////////////////////////////////////////////////

  o = this.office.renderables.getByName("outer_wall");
  o.resetTransform();
  o.canBeTransparent = true;

  this.officeObjects.push(new OfficeObject("outer_wall_v_01", "outer_wall", [1,1,94/2],   0, [20.10, 0, -4.5]));
  this.officeObjects.push(new OfficeObject("outer_wall_v_02", "outer_wall", [1,1, 5/2],   0, [-0.10, 0, -3.55]));
  this.officeObjects.push(new OfficeObject("outer_wall_v_03", "outer_wall", [1,1, 2/2],   0, [-0.10, 0, -4.90]));
  this.officeObjects.push(new OfficeObject("outer_wall_h_01", "outer_wall", [97/2,1,1],  0, [ 4.65, 0, -9.1]));
  this.officeObjects.push(new OfficeObject("outer_wall_h_02", "outer_wall", [15/2,1,1],  0, [19.25, 0, -9.1]));
  this.officeObjects.push(new OfficeObject("outer_wall_h_03", "outer_wall", [5/2,1,1],  0, [10.75, 0, -9.1]));

  /////////////////////////////////////////////////////////////////////////////

  o = this.office.renderables.getByName("door");
  o.texture1 = this.bigDoorTexture;
  o.resetTransform();

  this.officeObjects.push(new OfficeObject("door_h_01", "door", [1,1,1],   0, [ 2.2, 0, -3.55]));
  this.officeObjects.push(new OfficeObject("door_h_02", "door", [1,1,1],   0, [ 6.0, 0, -3.55]));
  this.officeObjects.push(new OfficeObject("door_h_03", "door", [1,1,1],   0, [ 12.4, 0, -3.55]));
  this.officeObjects.push(new OfficeObject("door_h_04", "door", [1,1,1],   0, [ 15.6, 0, -3.55]));
  this.officeObjects.push(new OfficeObject("door_h_05", "door", [1,1,1],   0, [ 18.0, 0, -3.55]));
  this.officeObjects.push(new OfficeObject("door_h_06", "door", [1,1,1],   0, [ 0.6, 0, -5.05]));

  this.officeObjects.push(new OfficeObject("door_v_01", "door", [1,1,1], -90, [ 4.9, 0, -8.20]));
  this.officeObjects.push(new OfficeObject("door_v_02", "door", [1,1,1], -90, [ 9.4, 0, -8.20]));
  this.officeObjects.push(new OfficeObject("door_v_03", "door", [1,1,1], -90, [ 18.55, 0, -7.30]));
  this.officeObjects.push(new OfficeObject("door_v_04", "door", [1,1,1], -90, [ 18.55, 0, -5.00]));
  this.officeObjects.push(new OfficeObject("door_v_05", "door", [1,1,1], -90, [ 3.45, 0, -5.90]));

  /////////////////////////////////////////////////////////////////////////////

  o = this.office.renderables.getByName("door_entrance");
  o.texture1 = this.bigDoorTexture;
  o.resetTransform();

  this.officeObjects.push(new OfficeObject("door_entrance_01", "door_entrance", [1,1,1],   0, [10.0, 0, -9.1]));
  this.officeObjects.push(new OfficeObject("door_entrance_02", "door_entrance", [1,1,1], -90, [-0.1, 0, -4.3]));

  /////////////////////////////////////////////////////////////////////////////

  o = this.office.renderables.getByName("glass_wall");
  o.isAdditive = true;
  o.texture1 = this.skyboxTexture;
  o.shaderProgram = this.envmapFadeShader;
  o.resetTransform();

  this.officeObjects.push(new OfficeObject("glass_wall_h_01", "glass_wall", [1,1,1], 0, [17.875, 0, -9.1]));
  this.officeObjects.push(new OfficeObject("glass_wall_h_02", "glass_wall", [1,1,1], 0, [16.625, 0, -9.1]));
  this.officeObjects.push(new OfficeObject("glass_wall_h_03", "glass_wall", [1,1,1], 0, [15.375, 0, -9.1]));
  this.officeObjects.push(new OfficeObject("glass_wall_h_04", "glass_wall", [1,1,1], 0, [14.125, 0, -9.1]));
  this.officeObjects.push(new OfficeObject("glass_wall_h_05", "glass_wall", [1,1,1], 0, [12.875, 0, -9.1]));
  this.officeObjects.push(new OfficeObject("glass_wall_h_06", "glass_wall", [1,1,1], 0, [11.625, 0, -9.1]));

  /////////////////////////////////////////////////////////////////////////////

  o = this.office.renderables.getByName("desk");
  o.texture1 = this.parkettiTexture;
  o.resetTransform();

  this.officeObjects.push(new OfficeObject("desk_01", "desk", [1,1,1],   0, [ 3.20, 0, -2.80],  1));
  this.officeObjects.push(new OfficeObject("desk_02", "desk", [1,1,1], -90, [ 3.20, 0, -0.65],  2));
  this.officeObjects.push(new OfficeObject("desk_03", "desk", [1,1,1],  90, [ 0.65, 0, -2.80],  3));
  this.officeObjects.push(new OfficeObject("desk_04", "desk", [1,1,1], 180, [ 0.65, 0, -0.65],  4));
  this.officeObjects.push(new OfficeObject("desk_05", "desk", [1,1,1],   0, [ 7.10, 0, -2.80],  5));
  this.officeObjects.push(new OfficeObject("desk_06", "desk", [1,1,1], -90, [ 7.10, 0, -0.65],  6));
  this.officeObjects.push(new OfficeObject("desk_07", "desk", [1,1,1],  90, [ 8.35, 0, -2.80],  7));
  this.officeObjects.push(new OfficeObject("desk_08", "desk", [1,1,1], 180, [ 8.35, 0, -0.65],  8));
  this.officeObjects.push(new OfficeObject("desk_09", "desk", [1,1,1],  90, [ 4.60, 0, -2.80],  9));
  this.officeObjects.push(new OfficeObject("desk_10", "desk", [1,1,1], 180, [ 4.60, 0, -0.65], 10));
  this.officeObjects.push(new OfficeObject("desk_11", "desk", [1,1,1],  90, [10.10, 0, -2.80], 11));
  this.officeObjects.push(new OfficeObject("desk_12", "desk", [1,1,1], 180, [10.10, 0, -0.65], 12));
  this.officeObjects.push(new OfficeObject("desk_13", "desk", [1,1,1],  90, [13.60, 0, -2.80], 13));
  this.officeObjects.push(new OfficeObject("desk_14", "desk", [1,1,1], 180, [13.60, 0, -0.65], 14));
  this.officeObjects.push(new OfficeObject("desk_15", "desk", [1,1,1], -90, [16.00, 0, -0.65], 15));
  this.officeObjects.push(new OfficeObject("desk_16", "desk", [1,1,1], 180, [18.60, 0, -0.65], 16));
  this.officeObjects.push(new OfficeObject("desk_17", "desk", [1,1,1],   0, [13.50, 0, -6.00], 17));
  this.officeObjects.push(new OfficeObject("desk_18", "desk", [1,1,1],  90, [14.75, 0, -6.00], 18));
  this.officeObjects.push(new OfficeObject("desk_19", "desk", [1,1,1], -90, [13.50, 0, -7.25], 19));
  this.officeObjects.push(new OfficeObject("desk_20", "desk", [1,1,1], 180, [14.75, 0, -7.25], 20));

  /////////////////////////////////////////////////////////////////////////////

  o = this.office.renderables.getByName("desk_round");
  o.texture1 = this.parkettiTexture;
  o.resetTransform();

  this.officeObjects.push(new OfficeObject("desk_round_01", "desk_round", [1.5,1,1.5],   0, [ 7.2, 0, -7.0],  21));

  /////////////////////////////////////////////////////////////////////////////

  for (var i=0; i<this.officeObjects.length; i++)
  {
    var oo = this.officeObjects[i];
    var obj = this.office.renderables.getByName(oo.refname);
    var clone = obj.shallowCopy(oo.name);
    clone.translate(oo.pos);
    clone.rotate(oo.rotate, [0,1,0]);
    clone.scale(oo.scale);
    clone.renderIndex = oo.renderIndex;
    this.officeSpace.push(clone);
  }

  /////////////////////////////////////////////////////////////////////////////

  this.officeLoaded = true;
}

ModelDemo.prototype.preprocess = function()
{
}

ModelDemo.prototype.setupTransparency = function(transp)
{
  var v = transp == 100 ? false : true;

  for (var i=0; i<this.officeSpace.length; i++)
  {
    var o = this.officeSpace[i];
    if (o.canBeTransparent)
    {
      o.shaderProgram = this.diffuseTranspShader;
      o.isAdditive = v;
    }
  }
}

ModelDemo.prototype.updateTexture = function(consumer, time)
{
  var text1 = consumer.name;
  var text2 = "Energy: " + (consumer.consumption/1000).toFixed(1) + " kWh";
  var text3 = "Peak: " + consumer.peak + " W";

  var textureCanvas = document.getElementById('textureCanvas')
  var ctx = textureCanvas.getContext('2d');  

  ctx.save();

  ctx.clearRect(0,0,512,512);

  ctx.fillStyle = "#000000";
  ctx.lineWidth = 5;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  var leftOffset = ctx.canvas.width / 2;
  var topOffset = 30;
  ctx.font = "bold 28px Arial";
  ctx.fillText(text1, leftOffset, topOffset);
  ctx.font = "28px Arial";
  ctx.fillText(text2, leftOffset, topOffset + 36);
  ctx.fillText(text3, leftOffset, topOffset + 68);
  ctx.restore();

  gl.bindTexture(gl.TEXTURE_2D, this.textTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

ModelDemo.prototype.update = function(time)
{
  this.rot = time * 0.05;

  for (var i=0; i<this.consumers.length; i++)
  {
    this.consumers[i].consumption += this.consumers[i].peak * 0.04;
  }

  var sceneTime = time * 0.025;

  var transp = parseInt(document.getElementById("webgl-transparency").value);
  transp = (transp / 133);

  gl.useProgram(this.envmapFadeShader);
  gl.uniform1f(this.envmapFadeShader.transpUniform, transp * 0.5);

  gl.useProgram(this.diffuseTranspShader);
  gl.uniform1f(this.diffuseTranspShader.transpUniform, transp);

  if (this.officeLoaded)
  {
    this.setupTransparency(transp * 133);
  }
  this.keycode = 0;
  if(this.keyboard.pressed("w"))
	  this.keycode = 1;
   if(this.keyboard.pressed("s"))
	   this.keycode = 2;
   if(this.keyboard.pressed("a"))
	   this.keycode = 3;
   if(this.keyboard.pressed("d"))
	   this.keycode = 4;
   if(this.keyboard.pressed("q"))
	   this.keycode = 5;
   if(this.keyboard.pressed("e"))
	   this.keycode = 6;      
   if(this.keyboard.pressed("z"))
	   this.keycode = 7;
   if(this.keyboard.pressed("c"))
	   this.keycode = 8;    
   var pitch = this.mouse.mouseDX() / 500;
   var yAngle = this.mouse.mouseDY() / 500;	
   console.log("currently pitch yAngle send to camera:" + pitch + "::"+yAngle);
  var camera = this.camera;
//  camera.eye = $V([Math.sin(time*0.0005) * 100, 100, Math.cos(time*0.0005) * 100 + 35]);
//  this.camera.eye = $V([10 + Math.cos(this.rotY * 0.005) * Math.sin(this.rotX * 0.005) * this.distance, 1 + Math.sin(this.rotY * 0.005) * this.distance, -4.5 + Math.cos(this.rotY * 0.005) * Math.cos(this.rotX * 0.005) * this.distance]);
//  camera.center = $V([10,0,-4.5]);
//  camera.isTargetCamera = true;
//  camera.fov = 90 * Math.PI/180.0;

  
  camera.updateOrientation(this.keycode,pitch,yAngle,time/100000);
}

ModelDemo.prototype.sortBillboards = function()
{
  for (var i=0; i<this.consumers.length; i++)
  {
    var c = this.consumers[i];

    var v = $V([c.location[0],c.location[1],c.location[2],1]);
    v = this.vMatrix.x(v);
    this.consumers[i].v = v.elements;
  }

  for (var i=0; i<this.consumers.length-1; i++)
  {
    for (var j=i; j<this.consumers.length; j++)
    {
      if (this.consumers[i].v[2] > this.consumers[j].v[2])
      {
        var c = this.consumers[i];
        this.consumers[i] = this.consumers[j];
        this.consumers[j] = c;
      }
    }
  }
}

ModelDemo.prototype.render = function(isPick)
{
  if (!isPick)
  {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.rttFramebuffer);
    var v = new Uint8Array(4);
    gl.readPixels(this.mouse.mouseX, 511-this.mouse.mouseY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, v);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.pickedObject = v[0] + (v[1]<<8) + (v[2]<<16);
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var camera = this.camera;

  this.vMatrix = camera.view();
  this.vMatrixInv = camera.inverseOrientation();
  this.pMatrix = camera.projection();

  // Opaque objects

  if (this.officeLoaded)
  {
    for (var i=0; i<this.officeSpace.length; i++)
    {
      if (!this.officeSpace[i].isAdditive)
      this.officeSpace[i].render(isPick);
    }
  }

  this.floor.resetTransform();
  this.floor.translate([20/2,0,-9/2]);
  this.floor.rotate(90,[1,0,0]);
  this.floor.scale([20.2/2,9.2/2,1]);
  this.floor.render(isPick);

  this.quad.resetTransform();
  this.quad.translate([0,-0.05,0]);
  this.quad.rotate(90,[1,0,0]);
  this.quad.scale([120, 120, 12]);
  this.quad.render(isPick);

  this.skybox.resetTransform();
  this.skybox.translate([0,10,0]);
  this.skybox.scale([100,100,100]);
  this.skybox.render(isPick);
  
  this.modelRenderer.resetTransform();
  this.modelRenderer.translate([10,1,1]);
    this.modelRenderer.render(isPick);

  // Transparent objects
  if (!isPick)
  {
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    if (this.officeLoaded)
    {
      for (var i=0; i<this.officeSpace.length; i++)
      {
        if (this.officeSpace[i].isAdditive)
        this.officeSpace[i].render(isPick);
      }
    }

    gl.disable(gl.CULL_FACE);
  }

  // Billboards

  if (isPick)
    this.sortBillboards();

  for (var i=0; i<this.consumers.length; i++)
  {
    if (this.pickedObject == this.consumers[i].id)
    {
      this.info.texture1 = this.infoTexture;
      if (!isPick)
      {
        this.updateTexture(this.consumers[i], 0);
      }
    }
    else
    {
      this.info.texture1 = this.infoPinTexture;
    }
    var color=[1,0.75,0.75];
    if (this.consumers[i].peak<1000) color=[1,1,0.75];
    if (this.consumers[i].peak<100) color=[0.75,1,0.75];
    gl.useProgram(this.infoShader);
    gl.uniform4f(this.infoShader.colorMaskUniform, color[0], color[1], color[2], 1.0);
    this.info.resetTransform();
    this.info.translate(this.consumers[i].location);
    this.info.transform(this.vMatrixInv);
    this.info.translate([0, 1, 0]);
    this.info.scale([1,1,1]);
    this.info.renderIndex= this.consumers[i].id;
    this.info.render(isPick);
  }
  

//  this.model1.render(this.vMatrix,this.pMatrix);
 
}

ModelDemo.prototype.postprocess = function()
{
  document.getElementById("pos_x").innerHTML = this.mouse.mouseX;
  document.getElementById("pos_y").innerHTML = this.mouse.mouseY;
  document.getElementById("picked_obj").innerHTML = this.pickedObject;
}


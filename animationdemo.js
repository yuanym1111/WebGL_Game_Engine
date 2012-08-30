
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

function AnimationDemo() {}

AnimationDemo.prototype = new Demo();


AnimationDemo.prototype.createObjects = function()
{
  // etc ----------------------------------------------------------------------

  this.distance = 15;  
  this.rotX = 0;
  this.rotY = 120;
  this.lastUpdateTime = 0;
  this.lastAnimTime = 0;

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
  this.animatedobjectShader = ShaderProgramFromFile("shaders/fragment/animation.glsl", "shaders/vertex/animation.glsl");
  
  // objects ------------------------------------------------------------------

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
  
  this.model1.loadmodel("model/vat");
  
  this.modelRenderer = new ModelRenderable(this.model1,this,'model1');
  this.modelRenderer.shaderProgram = this.objectShader;
  
  
  this.animationmodel = new SkinnedModel();
  this.animationmodel.loadmodel("model/main_player_lorez");
//  this.animationmodel.skinnedprogram = this.animatedobjectShader;
  
  
  this.anim = new SkinnedAnimation();
  this.anim.loadAnimation("model/run_forward");
  this.anim.evaluate(0, this.animationmodel);
  this.frameId = 0;
  
  
  this.animationrenderer = new ModelRenderable(this.animationmodel, this, 'animModel1');
  this.animationrenderer.shaderProgram = this.animatedobjectShader;
  
  // cameras ------------------------------------------------------------------

  this.camera = new FPSCamera();
  this.camera.isTargetCamera = true;
  this.camera.fov = 90 * Math.PI/180.0;
  
  this.camera.eye = $V([10,5,10.5]);
  this.camera.center = $V([10,1,-4.5]);
  this.camera.buildRUL();
  
  this.vMatrix = this.camera.view();
  this.vMatrixInv = this.camera.inverseOrientation();
  this.pMatrix = this.camera.projection();
  
  
  this.keyboard = new KeyboardState();
  this.mouse = new Mouse(canvas,this);
}


AnimationDemo.prototype.preprocess = function()
{
}

AnimationDemo.prototype.setupTransparency = function(transp)
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


AnimationDemo.prototype.update = function(time)
{
  var delta = 0;
  var pitch = 0, yAngle = 0;
  if (this.lastUpdateTime) {
	  delta = time - this.lastUpdateTime;
  }

  this.lastUpdateTime = time;
	    
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
   
   if(this.mouse.mouseX != -1 && this.mouse.mouseY != -1){
     pitch = this.mouse.mouseDX() / 500;
     yAngle = this.mouse.mouseDY() / 500;	
   }else{
	   if(this.mouse.getMouseX()<10){
		   pitch = - 0.05; 
	   }else if(this.mouse.getMouseX()>canvas.width - 10){
		   pitch =  0.05;
	   }
	   if(this.mouse.getMouseY()<10){
		   yAngle = -0.01;
	   }else if(this.mouse.getMouseY()>canvas.height - 10){
		   yAngle = 0.01;
	   }
   }
//   console.log("currently pitch yAngle send to camera:" + pitch + "::"+yAngle);
  var camera = this.camera;

  
  camera.updateOrientation(this.keycode,pitch,yAngle,delta/10000);
  
  if(this.anim.complete == true){
    this.frameTime = 1000 / this.anim.frameRate;
  
    if(time - this.lastAnimTime > this.frameTime){
      if(this.animationmodel.complete) {
        this.anim.evaluate(this.frameId % this.anim.frameCount, this.animationmodel);
        this.frameId++;
      }
      this.lastAnimTime = time;
    }
  }
  
}


AnimationDemo.prototype.render = function(isPick)
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

  //Update Camera Matrix parameters
  var camera = this.camera;
  this.vMatrix = this.camera.view();
  this.vMatrixInv = this.camera.inverseOrientation();
  this.pMatrix = this.camera.projection();

  
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
  this.skybox.scale([500,500,500]);
  this.skybox.render(isPick);

  this.modelRenderer.resetTransform();
  this.modelRenderer.translate([2,1,1]);
  this.modelRenderer.render(isPick);
  
 
  this.animationrenderer.resetTransform();
  this.animationrenderer.translate([-2,1,1]);
  this.animationrenderer.animRender(isPick);
  
  var ray = new Ray(this.mouse.getWorldPickingRay(camera,this.animationrenderer));
  if(ray.intersectionAABB(this.animationmodel.boundingbox)){
	  
	  console.log("Get animationmodel");
  }
  
  var ray = new Ray(this.mouse.getWorldPickingRay(camera,this.modelRenderer));
  if(ray.intersectionAABB(this.model1.boundingbox)){
	  
	  console.log("Get model1");
  }
  
 
}

AnimationDemo.prototype.postprocess = function()
{
  document.getElementById("pos_x").innerHTML = this.mouse.getMouseX();
  document.getElementById("pos_y").innerHTML = this.mouse.getMouseY();
  document.getElementById("picked_obj").innerHTML = this.pickedObject;
}


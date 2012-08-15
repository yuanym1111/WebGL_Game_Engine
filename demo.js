

function Demo()
{
//  this.init();
}

Demo.prototype.init = function(enablePicking)
{
  this.enablePicking = enablePicking ? true : false;

  if (this.enablePicking)
  {
    this.createFramebuffer();
  } 

  this.createObjects();

  this.frameNum = 0;
  this.fps = 0;

  this.startTime = new Date().getTime();
  this.tick();

  this.fpsSample = 1000;
  setInterval(delegate(this, this.fpsTick), this.fpsSample);
}

Demo.prototype.createFramebuffer = function()
{
  this.rttFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.rttFramebuffer);
  this.rttFramebuffer.width = 1024;
  this.rttFramebuffer.height = 512;

  this.rttTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.rttTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//        gl.generateMipmap(gl.TEXTURE_2D);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.rttFramebuffer.width, this.rttFramebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  var renderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.rttFramebuffer.width, this.rttFramebuffer.height);

  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.rttTexture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
 
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

Demo.prototype.createObjects = function()
{
  throw Error("Call to pure Demo.createObjects");
}

Demo.prototype.tick = function()
{
  requestAnimFrame(delegate(this, this.tick));

  var time = new Date().getTime() - this.startTime;

  try {
    this.preprocess();
    this.update(time);
    if (this.enablePicking)
    {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.rttFramebuffer);
      this.render(true);  // pick render, render to the frame/texture buffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    this.render(false); // normal render
    this.postprocess();
  } 
  catch(e)
  {
    alert(e + "\n\n" + stackTrace(e));
    return;
  }

  gl.flush();
  gl.finish();
  this.frameNum++;
}

Demo.prototype.fpsTick = function()
{
  var fps = this.frameNum / this.fpsSample * 1000.0;
  this.frameNum = 0;
  document.getElementById("fps").innerHTML = fps.toFixed(0);
}

Demo.prototype.preprocess = function()
{
  throw Error("Call to pure Demo.preprocess");
}

Demo.prototype.update = function(time)
{
  throw Error("Call to pure Demo.update");
}

Demo.prototype.render = function(isPick)
{
  throw Error("Call to pure Demo.render");
}

Demo.prototype.postprocess = function()
{
  throw Error("Call to pure Demo.postprocess");
}


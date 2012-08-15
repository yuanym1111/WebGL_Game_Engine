
///////////////////////////////////////////////////////////////////////////////
// Particle
///////////////////////////////////////////////////////////////////////////////

function Particle(x,y,z)
{
  this.x = x;
  this.y = y;
  this.z = z;
  this.vx = (Math.random() - 0.5)*0.01;
  this.vy = (Math.random() - 0.5)*0.01;
  this.vz = (Math.random() - 0.5)*0.01;
  this.attenuation = 0.995;
  this.size = 0.05;
  this.rotfactor = (Math.random() - 0.5) * 2;
  this.sizeattenuation = 1 + (Math.random() -0.1)* 0.01;
  this.age = 0;

}

Particle.prototype.update = function()
{
  this.x += this.vx;
  this.y += this.vy;
  this.z += this.vz;
  this.vx += (Math.random() - 0.5) * 0.002;
  this.vy += (Math.random() - 0.5) * 0.002;
  this.vz += (Math.random() - 0.5) * 0.002;

  this.vx *= this.attenuation;
  this.vy *= this.attenuation;
  this.vz *= this.attenuation;
  this.size *= this.sizeattenuation;

  this.age++;
}

///////////////////////////////////////////////////////////////////////////////
// ParticleSystem
///////////////////////////////////////////////////////////////////////////////

function ParticleSystem(num, shader, transformSource)
{
  this.num = num;
  this.shader = shader;
  this.transformSource = transformSource;

  this.particles = [];

  this.particleMesh = Quad.create(1,1);
  particleTexture = new Texture("textures/particle_small.jpg");

  this.particleObject = new Renderable(this.particleMesh, transformSource);
  this.particleObject.texture1 = particleTexture;

  this.shader.ageUniform = gl.getUniformLocation(this.shader, "age");
  this.particleObject.shaderProgram = this.shader;

  for (var i = 0; i<this.num; i++)
  {
     this.particles.push(new Particle(0,0,0));
     this.particles[i].size=0.001;
  }
}

ParticleSystem.prototype.update = function(index, x,y,z)
{
  for (i = 0; i<this.num; i++)
  {
    this.particles[i].update();
  }
  this.particles[index % this.num] = new Particle(x,y,z);
}

ParticleSystem.prototype.render = function()
{
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.enable(gl.BLEND);
  gl.depthMask(false);

  gl.useProgram(this.particleObject.shaderProgram);
  for (var i = 0; i<this.num; i++)
  {
    this.particleObject.mMatrix = identity();
    this.particleObject.mMatrix = this.particleObject.mMatrix.x(translate([this.particles[i].x, this.particles[i].y, this.particles[i].z]));
    this.particleObject.mMatrix = this.particleObject.mMatrix.x(this.transformSource.vMatrixInv);
    this.particleObject.mMatrix = this.particleObject.mMatrix.x(scale([this.particles[i].size, this.particles[i].size, this.particles[i].size]));
    rotf = this.particles[i].rotfactor * this.transformSource.rot;
    this.particleObject.mMatrix = this.particleObject.mMatrix.x(rotate(rotf, [0,0,1]));

    gl.uniform1f(this.particleObject.shaderProgram.ageUniform, this.particles[i].age/this.num);

    if (i==0)
      this.particleObject.render();
    else
      this.particleObject.renderOnly();
  }    

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.disable(gl.BLEND);
  gl.depthMask(true);
}


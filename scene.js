/**
 *      Scene program
 *      @author: Alex
 */
function IterArray() {}

IterArray.prototype = new Array();

IterArray.prototype.getByName = function(name)
{
  for (var i=0; i<this.length; i++)
  {
    if (this[i].mesh.name == name) return this[i];
  }
}

function Scene(transformSource)
{
  this.transformSource = transformSource;
  this.meshes = new Array();
  this.renderables = new IterArray();
  this.cameras = new Array();
  this.callback = null;
}

Scene.prototype.loadJSON = function(fileName, callback)
{
  this.callback = callback;
  var request = new XMLHttpRequest();
  var scene = this;
  request.open("GET", rootPath + fileName);
  request.onreadystatechange = function()
  {
    if (request.readyState == 4)
    {
      scene.handleLoadJSON.call(scene, JSON.parse(request.responseText));
    }
  }
  request.send();
}

Scene.prototype.handleLoadJSON = function(obj)
{
  for (var memberName in obj)
  {
    var member = obj[memberName];
    if (member.hasOwnProperty("type"))
      if (member.type=="Scene") this.parse(member, memberName);
  }

  if (this.callback) this.callback();
}

Scene.prototype.parse = function(obj, name)
{
  this.name = name;
  for (var memberName in obj)
  {
    var member = obj[memberName];
    if (member.hasOwnProperty("type"))
    {
      switch (member.type)
      {
      case "Mesh":
        var mesh = new Mesh();
        mesh.name = memberName;
        mesh.parse(member);
        this.meshes.push(mesh);
        var renderable = new Renderable(mesh, this.transformSource);
        this.renderables.push(renderable);
        break;
      case "Camera":
        var camera = new Camera();
        camera.name = memberName;
        camera.parse(member);
        this.cameras.push(camera);
        break;
      }
    }
  }
}


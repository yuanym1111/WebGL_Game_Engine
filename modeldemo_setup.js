

var includes = [
  "sylvester.js",
  "glUtils.js", // TODO eliminate this
  "shader.js",
  "loader.js",
  "animation.js",
  "mesh.js",
  "renderable.js",
  "texture.js",
  "camera.js",
  "transform.js",
  "scene.js",
  "program.js",
  "image.js",
  "KeyboardState.js",
  "mouse.js",
  "demo.js",
  "skybox.js",
  "model.js",
  "modeldemo.js"
];

var factory = function()
{
  var demo = new ModelDemo();
  demo.init(true);
}


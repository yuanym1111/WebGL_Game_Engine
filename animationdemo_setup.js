

var includes = [
  "sylvester.js",
  "gl-matrix.js",
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
  "ray.js",
  "skybox.js",
  "model.js",
  "skinnedmodel.js",
  "skinedanimation.js",
  "animationdemo.js"
];

var factory = function()
{
  var demo = new AnimationDemo();
  demo.init(true);
};


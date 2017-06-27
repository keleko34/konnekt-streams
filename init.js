var fs = require('fs');

/* Globals */
global.taskrunner = {};
global.taskrunner.base = process.cwd().replace(/\\/g,"/");
global.taskrunner.node_module = __dirname.replace(/\\/g,"/");
global.taskrunner.global = __dirname.replace(/\\/g,"/")+"/.tasks";
global.taskrunner.config = require(global.taskrunner.global+'/config/config.js');

/* Fetch all tasks */
global.taskrunner.tasks = fs.readdirSync(global.taskrunner.global+"/tasks").reduce(function(Obj,folder){
  Obj[folder] = require(global.taskrunner.global+"/tasks/"+folder+"/"+folder);
  return Obj;
},{});

process.on('unhandledRejection', function (err) {
  console.log('unhandledRejection',err.message,err.stack);
})

/* run default task */
global.taskrunner.tasks.default();
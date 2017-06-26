var fs = require('fs');

module.exports = {
  Tasks: fs.readdirSync(global.taskrunner.global+"/tasks").reduce(function(Obj,file){
	  Obj[file.replace('.js','')] = require(global.taskrunner.global+'/config/tasks/'+file);
    return Obj;
  },{}),
  ignore:[
        "test",
        "bower_components",
        "node_modules",
        ".tasks",
        ".git"
    ]
}
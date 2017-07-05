var base = require('./../../base'),
    fs = require('fs'),
    stream = require('./../../.core/core'),
    replace = require('./../../.core/transforms/replace'),
    append = require('./../../.core/transforms/append-prepend').append;

module.exports = function()
{
  function Command(res)
  {
    console.log('\033[36mStarting to Create Project:\033[37m',res.Title);
    
    var _streamIndex = stream(global.taskrunner.global+"/tasks/init/template/index/*"),
        _streamConfig = stream(global.taskrunner.global+"/tasks/init/template/config/**/*"),
        _streamInit = stream("require('konnekt');\n",true),
        _streamPackage = stream('{\n  \"name\": \"'+res.Title.toLowerCase().replace(/\s/g,'_')+'\",\n  \"version\": \"0.8.6\",\n  \"description\": \"'+res.Description+'\",\n  \"scripts\": {\n    \"init\":\"node init --task init\",\n    \"create\":\"node init --task create\",\n    \"build\":\"node init --task build\",\n    \"server\":\"node init --task server\",\n    \"group\":\"node init --task group\"\n  },\n  \"dependencies\":{\n    \"konnekt\":\"^0.8.6\"\n  }\n}',true),
        _finished = 0,
        _config = global.taskrunner.config.Tasks.init;
    
    _streamIndex.pipe(replace(new RegExp('(\\$title)','g'),res.Title));
    _streamIndex.pipe(replace(new RegExp('(\\$description)','g'),res.Description));
    
    _streamConfig.pipe(replace(new RegExp('(\\$title)','g'),res.Title.toLowerCase().replace(/\s/g,'_')));
    _streamConfig.pipe(replace(new RegExp('(\\$description)','g'),res.Description));
    
    if(res.Helpers) 
    {
      _streamIndex.pipe(replace(new RegExp('(\\$helpers)','g'),'\/*  turns on local front end based routing so a backend nodejs component routing lib is not needed\n        .localRouting(true)*\/\n      \n    \/*  allows overwriting the default hashrouter\n        .addHashRouter(function(e){\n            e.hash = Konnekt.config().base;\n        })*\/'));
      
      _streamConfig.pipe(replace(new RegExp('(\\$helpers)','g'),'\/* The prefix used for local routing for the base directory, .\/ means base dir where index.html is located.\n   , prefix: \'.\/\' *\/'));
    }
    else
    {
      _streamIndex.pipe(replace(new RegExp('(\\$helpers)','g'),''));
      
      _streamConfig.pipe(replace(new RegExp('(\\$helpers)','g'),''));
    }
    
    process.argv = process.argv.concat(['--name',res.Title.toLowerCase().replace(/\s/g,'_'),'--description',res.Description,'--author','<insert name>']);
    global.taskrunner.tasks.create(function(){
      setTimeout(function(){
        stream(global.taskrunner.base+'/components/'+res.Title.toLowerCase().replace(/\s/g,'_')+'/'+res.Title.toLowerCase().replace(/\s/g,'_')+'.html')
        .pipe(append('\r\n<h1>'+res.Title+'</h1>'))
        .write('/');
      },100);
    });
    
    _streamIndex.onEnd(function(){
      _finished += 1;
      if(_finished === 4 && typeof _config.onFinished === 'function') _config.onFinished(res);
    })
    .write('');
    
    _streamConfig.onEnd(function(){
      _finished += 1;
      if(_finished === 4 && typeof _config.onFinished === 'function') _config.onFinished(res);
    })
    .write('');
    
    _streamInit.rename(function(fileNameObject){
      return global.taskrunner.base+'/init.js';
    })
    .onEnd(function(){
      _finished += 1;
      if(_finished === 4 && typeof _config.onFinished === 'function') _config.onFinished(res);
    })
    .write('');
    
    _streamPackage.rename(function(fileNameObject){
      return global.taskrunner.base+'/package.json';
    })
    .onEnd(function(){
      _finished += 1;
      if(_finished === 4 && typeof _config.onFinished === 'function') _config.onFinished(res);
    })
    .write('');
  }
  
  return base
  .task('init')
  .command(Command)
  .call();
}
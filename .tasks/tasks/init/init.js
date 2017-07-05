var base = require('./../../base'),
    stream = require('./../../.core/core'),
    replace = require('./../../.core/transforms/replace');

module.exports = function()
{
  function Command(res)
  {
    console.log('\033[36mStarting to Create Project:\033[37m',res.Title);
    
    var _streamIndex = stream(global.taskrunner.global+"/tasks/init/template/index/*"),
        _streamConfig = stream(global.taskrunner.global+"/tasks/init/template/config/**/*"),
        _streamIndexFinished = 0,
        _streamConfigFinished = 0,
        _config = global.taskrunner.config.Tasks.init;
    
    _streamIndex.pipe(replace(new RegExp('(\\$title)','g'),res.Title));
    _streamIndex.pipe(replace(new RegExp('(\\$description)','g'),res.Description));
    
    _streamConfig.pipe(replace(new RegExp('(\\$title)','g'),res.Title));
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
    
    process.argv = process.argv.concat(['--name',res.Title,'--description',res.Description,'--author','self']);
    global.taskrunner.tasks.create();
    
    _streamIndex.onEnd(function(){
      _streamIndexFinished = 1;
      if(!!_streamConfigFinished && typeof _config.onFinished === 'function') _config.onFinished(res);
    })
    .write('/');
    
    _streamConfig.onEnd(function(){
      _streamConfigFinished = 1;
      if(!!_streamIndexFinished && typeof _config.onFinished === 'function') _config.onFinished(res);
    })
    .write('/');
  }
  
  return base
  .task('init')
  .command(Command)
  .call();
}
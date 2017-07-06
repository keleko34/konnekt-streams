var base = require('./../../base'),
    fs = require('fs'),
    stream = require('./../../.core/core'),
    replace = require('./../../.core/transforms/replace'),
    inject = require('./../../.core/transforms/inject'),
    append = require('./../../.core/transforms/append-prepend').append,
    latest_konnekt_version = '0.8.6';

module.exports = function()
{
  function Command(res)
  {
    if(!res.Initial)
    {
      console.log('\033[36mStarting to Create Project:\033[37m',res.Title);
    
      var _streamIndex = stream(global.taskrunner.global+"/tasks/init/template/index/*"),
          _streamConfig = stream(global.taskrunner.global+"/tasks/init/template/config/**/*"),
          _streamInit = stream("require('konnekt');\n",true),
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
        return '/init.js';
      })
      .onEnd(function(){
        _finished += 1;
        if(_finished === 4 && typeof _config.onFinished === 'function') _config.onFinished(res);
      })
      .write('');

      if(!fs.existsSync(global.taskrunner.base+'/package.json'))
      {
        var _streamPackage = stream('{\n  \"name\": \"'+res.Title.toLowerCase().replace(/\s/g,'_')+'\",\n  \"version\": \"0.0.1\",\n  \"description\": \"'+res.Description+'\",\n  \"main\": \"init.js\",\n  \"scripts\": {\n    \"init\":\"node init --task init\",\n    \"create\":\"node init --task create\",\n    \"build\":\"node init --task build\",\n    \"server\":\"node init --task server\",\n    \"group\":\"node init --task group\"\n  },\n  \"dependencies\":{\n    \"konnekt\":\"^'+latest_konnekt_version+'\"\n  }\n}',true);

          _streamPackage.rename(function(fileNameObject){
            return '/package.json';
          })
          .onEnd(function(){
            _finished += 1;
            if(_finished === 4 && typeof _config.onFinished === 'function') _config.onFinished(res);
          })
          .write('');
      }
      else
      {
        var _streamPackage = stream(global.taskrunner.base+'/package.json');

        var scriptReplace = replace(/("scripts": {)([\s\S]*?)(},)/g,'\"scripts\": {\n    \"init\":\"node init --task init\",\n    \"create\":\"node init --task create\",\n    \"build\":\"node init --task build\",\n    \"server\":\"node init --task server\",\n    \"group\":\"node init --task group\"\n  },')
        .onNotFound(function(searchFor){
          _streamPackage.pipe(inject('"dependencies"','before','\"scripts\": {\n    \"init\":\"node init --task init\",\n    \"create\":\"node init --task create\",\n    \"build\":\"node init --task build\",\n    \"server\":\"node init --task server\",\n    \"group\":\"node init --task group\"\n  },\n  '))
          .onEnd(function(){
            _finished += 1;
            if(_finished === 4 && typeof _config.onFinished === 'function') _config.onFinished(res);
          })
          .write('');
        })
        .onFound(function(searchFor,match){
          _streamPackage.onEnd(function(){
            _finished += 1;
            if(_finished === 4 && typeof _config.onFinished === 'function') _config.onFinished(res);
          })
          .write('');
        });

        _streamPackage.pipe(replace(/("name":)([\s\S]*?)(,)/g,'\"name\": \"'+res.Title.toLowerCase().replace(/\s/g,'_')+'",'))
        .pipe(replace(/("description":)([\s\S]*?)(,)/g,'\"description\": \"'+res.Description+'",'))
        .pipe(scriptReplace);
      }
    }
  }
  
  return base
  .task('init')
  .command(Command)
  .call();
}
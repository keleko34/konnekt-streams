var base = require('./../../base'),
    stream = require('./../../.core/core'),
    replace = require('./../../.core/transforms/replace');

module.exports = function()
{
  function Command(res)
  {
    console.log('\033[36mStarting to Create module:\033[37m',res.Name);
    
    var _streams = stream(global.taskrunner.global+"/tasks/create/template/**/*"),
        _config = global.taskrunner.config.Tasks.create,
        _resKeys = Object.keys(res);
    
    for(var x=0,len=_resKeys.length;x<len;x++)
    {
      _streams.pipe(replace(new RegExp('(\\$'+_resKeys[x]+')','g'),res[_resKeys[x]]));
    }
    
    _streams.onEnd(function(){
      if(typeof _config.onFinished === 'function') _config.onFinished(res);
    })
    .rename(function(fileNameObject){
      var writeTo = fileNameObject.writeTo;
      
      for(var x=0,len=_resKeys.length;x<len;x++)
      {
        writeTo = writeTo.replace(new RegExp('(\\$'+_resKeys[x]+')','g'),res[_resKeys[x]]);
      }
      return writeTo;
    })
    .write('/components/'+res.Name);
  }
  
  return base
  .task('create')
  .command(Command)
  .call();
}
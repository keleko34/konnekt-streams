var base = require('./../../Base'),
    fs = require('fs'),
    stream = require('./../../.core/core');

module.exports = function()
{
    function Command(res)
    {
        var _base = global.taskrunner.config.Tasks.build.base+'/'+res.Name,
            _autoText = "Autogroup (Note this reads the html, any dynamic components won't be grouped)",
            _isAuto = (res.Grouped.indexOf(_autoText) !== -1),
            _list = [];
        
        if(_isAuto)
        {
            /* fetch and read all html files */
            var _components = fs.readdirSync(global.taskrunner.config.Tasks.build.base),
                _html = fs.readFileSync(_base+'/'+res.Name+'.html')
                .match(/(<\/.*?>)/g)
                .map(function(v){
                  return v.replace(/[<\/>]/g,"");
                });
            
          for(var x=0,len=_html.length;x<len;x++)
          {
             if(_components.indexOf(_html[x]) !== -1)
             {
               
             }
          }
        }
        else
        {
            /* create or overwrite json */
            var _stream,
                obj = JSON.stringify({groups:res.Grouped.filter(function(component){
                    return (component !== _autoText);
                })});
            
            _stream = stream(obj,true);
            
            _stream.onEnd(function(){
                console.log('\033[36mFinished Creating Group For \033[37m',res.Name);
            })
            .rename(function(fileNameObject){
              return _base+'/group.json';
            })
            .write('')
        }
    }
    
    return base
    .task('group')
    .command(Command)
    .call();
}
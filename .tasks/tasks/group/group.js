var base = require('./../../Base'),
    stream = require('./../../.core/core');

module.exports = function()
{
    function Command(res)
    {
        var _base = global.taskrunner.config.Tasks.build.base+'/'+res.Name,
            _autoText = "Autogroup (Note this reads the html, any dynamic components won't be grouped)",
            _isAuto = (res.Grouped.indexOf(_autoText) !== -1);
        
        if(_isAuto)
        {
            /* fetch and read all html files */
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
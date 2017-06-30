var base = require('./../../Base'),
    fs = require('fs'),
    stream = require('./../../.core/core');

module.exports = function()
{   
    function getHTMLGroup(name,components,list)
    { 
      var _base = global.taskrunner.base+global.taskrunner.config.Tasks.build.base+'/'+name,
          _html = fs.readFileSync(_base+'/'+name+'.html','utf8')
          .match(/(<\/.*?>)/g);
      
      if(_html)
      {
        _html = _html.map(function(v){
          return v.replace(/[<\/>]/g,"");
        });
        
        for(var x=0,len=_html.length;x<len;x++)
        {
           if(components.indexOf(_html[x]) !== -1)
           {
             if(list.indexOf(_html[x]) === -1)
             {
               list.push(_html[x]);
               list.concat(getHTMLGroup(_html[x],components,list));
             }
           }
        }
      }
      return list;
    }
  
    function writeGroups(name,list)
    {
      var _stream,
          _base = global.taskrunner.base+global.taskrunner.config.Tasks.build.base+'/'+name,
          obj = JSON.stringify({groups:list});
          
          _stream = stream(obj,true);
            
          _stream.onEnd(function(){
              console.log('\033[36mFinished Creating Group For \033[37m',name);
          })
          .rename(function(fileNameObject){
            return global.taskrunner.config.Tasks.build.base+'/'+name+'/group.json';
          })
          .write('');
    }
  
    function Command(res)
    {
        if(res.Auto)
        {
            /* fetch and read all html files */
          var _components = fs.readdirSync(global.taskrunner.base+global.taskrunner.config.Tasks.build.base),
              _list = getHTMLGroup(res.Name,_components,[]);
          
          writeGroups(res.Name,_list);
        }
        else
        {
            writeGroups(res.Name,res.Grouped.filter(function(component){
                return (component !== _autoText);
            }));
        }
    }
    
    return base
    .task('group')
    .command(Command)
    .call();
}
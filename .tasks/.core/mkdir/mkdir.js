var fs = require('fs'),
    path = require('path');

module.exports = function(dir,cb)
{
  function mkdir(path,dir,nex)
  {
    fs.stat(path+'/'+dir,function(e){
      if(e && e.code === 'ENOENT')
      {
        fs.mkdir(path+'/'+dir,(parseInt('0777', 8) & (~process.umask())),nex);
      }
      else
      {
        nex();
      }
    })
  }
  
  mkdir.create = function(dir,cb)
  {
    dir = dir.replace(/\\/g,'/');
    var _localPath = process.cwd().replace(/\\/g,'/').replace(/(\/node_modules.+)/g,''),
        _path = path.parse(dir).dir.replace(_localPath,''),
        _split = _path.split('/').filter(function(v){return (v !== undefined && v.length !== 0)}),
        _current = 0;
    
    if(_split[0] === undefined) _split[0] = '';
    
    function next()
    {
      if(_current === (_split.length-1))
      {
        return cb();
      }
      _current += 1;
      mkdir(_localPath+'/'+_split.slice(0,_current).join('/'),_split[_current],next);
    }
    mkdir(_localPath+'/'+_split.slice(0,_current).join('/'),_split[_current],next);
    return mkdir.create;
  }
  
  return mkdir.create(dir,cb);
}
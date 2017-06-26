var fs = require('fs'),
    path = require('path'),
    mkdir = require('./../mkdir/mkdir'),
    read = require('./../read/read'),
    write = require('./../write/write');

module.exports = function(file,directory)
{
  var _stream = {},
      _parse = path.parse(file),
      _root = process.cwd().replace(/\\/g,'/'),
      _file = _parse.base,
      _ext = _parse.ext,
      _path = file.replace(new RegExp('('+process.cwd()+')|('+_root+')','g'),'').replace(directory,''),
      _write = _path;
  
  function stream(file)
  {
    _stream = read(file);
    return stream;
  }
  
  stream.pipe = function(pipe)
  {
    _stream = _stream.pipe(new pipe());
    return stream;
  }
  
  stream.rename = function(func)
  {
    _write = func({file:_file,ext:_ext,path:_path,writeTo:_write});
    return stream;
  }
  
  stream.write = function(dir,cb)
  {
    mkdir(dir+_write,function(){
      _stream = _stream.pipe(write(dir+_write));
      if(cb) cb(_stream);
    });
    return stream;
  }
  
  stream.stream = function()
  {
    return _stream;
  }
  
  return stream(file);
}
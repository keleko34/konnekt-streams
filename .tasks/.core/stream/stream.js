var fs = require('fs'),
    path = require('path'),
    mkdir = require('./../mkdir/mkdir'),
    read = require('./../read/read'),
    write = require('./../write/write'),
    streamify = require('./../streamify/streamify')

module.exports = function(file,notFile,directory)
{
  var _stream = {},
      _parse = (!notFile ? path.parse(file) : {}),
      _root = process.cwd().replace(/\\/g,'/').replace(/(\/node_modules.+)/g,''),
      _file = _parse.base,
      _ext = _parse.ext,
      _path = (!notFile ? file.replace(new RegExp('('+process.cwd()+')|('+_root+')','g'),'').replace(directory,'') : ''),
      _write = _path;
  
  function stream(file)
  {
    _stream = (!notFile ? read(file) : streamify(file));
    return stream;
  }
  
  stream.pipe = function(pipe)
  {
    _stream = _stream.pipe(new pipe());
    return stream;
  }
  
  stream.res = function(res)
  {
    _stream.pipe(res);
    return stream;
  }
  
  stream.rename = function(func)
  {
    _write = func({file:_file || '',ext:_ext || '',path:_path || '',writeTo:_write || ''});
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
var fs = require('fs'),
    stream = require('./stream/stream');

module.exports = function(src)
{
  var _streams = [],
      _root = process.cwd().replace(/\\/g,'/'),
      _split = [],
      _isMultiFile = false,
      _isMultiDirectory = false,
      _directory = '',
      _directoryRemainder = '';
  
  function parseDirectories(dir)
  {
    var __files = fs.readdirSync(dir),
        __folders = [];
    
    __files = __files.filter(function(file){
      var __statSync = fs.statSync(dir+'/'+file);
      
      if(__statSync.isDirectory()) __folders.push(file);
      
      return (__statSync.isFile() ? (_isMultiFile ? true : (file === _directoryRemainder)) : false);
    });
    
    for(var x=0,len=__folders.length;x<len;x++)
    {
      parseDirectories(dir+'/'+__folders[x]);
    }
    
    parseFiles(dir,__files);
  }
  
  function parseFiles(path,files)
  {
    for(var x=0,len=files.length;x<len;x++)
    {
      _streams.push(stream(path+'/'+files[x],_directory));
    }
  }
  
  function source(src)
  {
    var __files = [];
    
    /* split the url to get the base file structure as well as get special '*' file and '**' directory cases  */
    _split = src.replace(new RegExp('('+process.cwd()+')|('+_root+')','g'),'')
    .split(/(\/\*\*)|(\/\*)/g)
    .filter(function(v){return (v !== undefined && v.length !== 0);})
    
    _isMultiDirectory = (_split.indexOf('/**') !== -1);
    _isMultiFile = (_split.indexOf('/*') !== -1);
    _directory = _split[0];
    
    /* if we are using multiple directory case but afterwards specifying a file name, we must accomadate for this */
    if(_isMultiDirectory && !_isMultiFile) _directoryRemainder = _split[2];
    
    if(_isMultiDirectory)
    {
      parseDirectories(_root+_directory);
    }
    else if(_isMultiFile)
    {
      __files = fs.readdirSync(_root+_directory)
      .filter(function(file){
        return (fs.statSync(_root+_directory+'/'+file).isFile());
      });
      
      parseFiles(_root+_directory,__files);
    }
    else
    {
      _streams.push(stream(_root+_directory));
    }
    
    return source;
  }
  
  source.pipe = function(pipe)
  {
    for(var x=0,len=_streams.length;x<len;x++)
    {
        _streams[x].pipe(pipe);
    }
    return source;
  }
  
  source.rename = function(func)
  {
    for(var x=0,len=_streams.length;x<len;x++)
    {
        _streams[x].rename(func);
    }
    return source;
  }
  
  source.write = function(dir)
  {
    dir = dir.replace(new RegExp('('+process.cwd()+')|('+_root+')','g'),'');
    
    for(var x=0,len=_streams.length;x<len;x++)
    {
        _streams[x].write(_root+dir);
    }
    
    return source;
  }
  
  source.streams = function()
  {
    return _streams.map(function(s){
      return s.stream();
    });
  }
  
  return source(src);
}
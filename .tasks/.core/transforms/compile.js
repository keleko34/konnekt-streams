var stream = require('stream'),
    util = require('util'),
    compiler = require('google-closure-compiler-js').compile;

module.exports = function(options,stream_options)
{
  options = (options ? options : {});
  options.compilationLevel = 'SIMPLE';
  
  var _data = '',
      Transform = stream.Transform;
  
  function compile()
  {
    stream_options = (stream_options ? stream_options : {});
    stream_options.encoding = (stream_options.encoding || 'utf8');
    stream_options.highWaterMark = (stream_options.highWaterMark || 10);
    
    Transform.call(this, stream_options);
  }
  
  compile.prototype._transform = function(chunk,enc,cb)
  {
    _data += chunk.toString();
    cb();
  }
  
  compile.prototype._flush = function(cb)
  {
    options.jsCode = [{src:_data}];
    this.push(compiler(options).compiledCode);
    cb();
  }
  
  util.inherits(compile, stream.Transform);
  
  return compile;
}
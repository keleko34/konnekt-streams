var stream = require('stream'),
    util = require('util');

module.exports = function(str,opt)
{ 
  function streamify(str,options)
  {
    if(!options) options = {};
    options.highWaterMark = (options.highWaterMark || 10);
    options.mode = (options.mode || (parseInt('0777', 8) & (~process.umask())));
    options.flag = (options.flag || 'r');
    options.encoding = (options.encoding || 'utf8');
    
    this.id = options ? options.id : '';
    
    var s = stream.Readable.call(this,options);
    s._read = function noop() {};
    s.push(str);
    s.push(null);
    
    return s;
  }
  
  util.inherits(streamify, stream);
  
  return new streamify(str,opt);
}
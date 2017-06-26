var fs = require('fs'),
    util = require('util');

module.exports = function(file,opt)
{
  function read(file,options)
  {
    if(!options) options = {};
    options.highWaterMark = (options.highWaterMark || 10);
    options.mode = (options.mode || (parseInt('0777', 8) & (~process.umask())));
    options.flag = (options.flag || 'r');
    options.encoding = (options.encoding || 'utf8');
    
    this.id = options ? options.id : '';
    this.byteTotal = fs.statSync(file).size;
    
    return fs.createReadStream.call(this,file,options);
  }
  
  util.inherits(read, fs.createReadStream);
  
  return new read(file,opt);
}
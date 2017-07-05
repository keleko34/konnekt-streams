var stream = require('stream'),
    util = require('util');

module.exports = function(lookFor,replacement,options)
{
  function replace()
  {
    if(!options) options = {};
    options.encoding = (options.encoding || 'utf8');
    options.highWaterMark = (options.highWaterMark || 1024);
    
    this.id = options.id || '';
    this.lookFor = typeof lookFor === 'string' ? (new RegExp('('+lookFor+')','g')) : lookFor;
    this.replacement = replacement;
    this.cache = [];
    
    return stream.Transform.call(this,options);
  }
  
  replace.prototype._transform = function(chunk,enc,cb)
  {
    chunk = chunk.toString();
    
    /* if we have chached data, add it to the beginning of the chunk to be pushed */
    if(this.cache.length !== 0)
    {
      chunk = this.cache.join('')+chunk;
      this.cache = [];
    }
    
    /* if we have a bind, check to make sure it is not cut off mid chunk, if it is then we cache it */
    if(chunk.lastIndexOf('$') !== -1)
    {
      var sub = chunk.substring((chunk.lastIndexOf('$')+1),chunk.length);
      
      if(!sub.match(/[^a-zA-Z0-9.]/g))
      {
        this.cache.push(chunk.substring(chunk.lastIndexOf('$'),chunk.length));
        chunk = chunk.substring(0,chunk.lastIndexOf('$'));
      }
    }
    
    this.push(chunk.replace(this.lookFor,this.replacement));
    cb();
  }
  
  util.inherits(replace, stream.Transform);
  
  return replace;
}
var stream = require('stream'),
    util = require('util');

  function Stream_Appender(prepend,append,stream_options)
  {
    var Transform = stream.Transform;

    function inject()
    {
      stream_options = (stream_options ? stream_options : {});
      stream_options.encoding = (stream_options.encoding || 'utf8');
      stream_options.highWaterMark = (stream_options.highWaterMark || 1024);
      
      Transform.call(this, stream_options);
    }
    util.inherits(inject, Transform);

    inject.prototype._transform = function(chunk,enc,cb)
    {
      this.push((typeof prepend === 'function' ? prepend(chunk.toString()) : chunk.toString()));
      cb();
    }

    inject.prototype._flush = function(cb)
    {
      if(typeof append === 'function') this.push(append());
      cb();
    }

    return inject;
  }

  Stream_Appender.append = function(str,options)
  {
    return Stream_Appender(null,function(){
      return str;
    },options);
  }

  Stream_Appender.prepend = function(str,alter,options)
  {
    var start = false;
    return Stream_Appender(function(chunk){
      if(!start)
      {
        chunk = str+(typeof alter === 'function' ? alter(chunk) : chunk);
        start = true;
      }
      return chunk;
    },null,options);
  }

  Stream_Appender.preappend = function(pre,ap,alter,options)
  {
    var start = false;
    return Stream_Appender(function(chunk){
      if(!start)
      {
        chunk = pre+(typeof alter === 'function' ? alter(chunk) : chunk);
        start = true;
      }
      return chunk;
    },function(){
      return ap;
    },options);
  }
 
 module.exports = Stream_Appender;
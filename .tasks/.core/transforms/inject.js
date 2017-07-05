var stream = require('stream'),
    util = require('util'),
    fs = require('fs');

function content_injector(searchFor,beforeAfter,content,stream_options)
{
  var _data = "",
      _injected = false,
      _found = 0,
      _onFound = function(){},
      _onNotFound = function(){},
      Transform = stream.Transform;

  function inject()
  {
    stream_options = (stream_options ? stream_options : {});
    stream_options.encoding = (stream_options.encoding || 'utf8');
    stream_options.highWaterMark = (stream_options.highWaterMark || 1024);

    Transform.call(this, stream_options);
  }
  
  util.inherits(inject, stream.Transform);

  inject.prototype._transform = function(chunk,enc,cb)
  {
    if(!_injected)
    {
      _data += chunk;
      if(typeof searchFor === 'function')
      {
        if(searchFor(_data) === true)
        {
          if(!_found) _onFound(searchFor);
          _found = 1;
          this.push(_data);
          _injected = true;
        }
      }
      else
      {
        var match = _data.match(searchFor);
        if(match)
        {
          if(!_found) _onFound(searchFor);
          _found = 1;
          var str = (beforeAfter === 'before' ? content+match[0] : match[0]+content);
          _data = _data.replace(searchFor,str);
          this.push(_data);
          _injected = true;
        }
      }
    }
    else
    {
      this.push(chunk.toString());
    }
    cb();
  }
  
  inject.prototype._flush = function(cb)
  {
    if(!_injected) this.push(_data);
    if(!_found) _onNotFound(searchFor);
    cb();
  }
  
  return inject;
}

content_injector.file = function(searchFor,beforeAfter,file)
{
  if(typeof searchFor === 'string') searchFor = (new RegExp("("+searchFor.replace(/[^\w\s\r\n\t]/g,'\\$&')+")"));
  
  return this.string(searchFor,beforeAfter,fs.readFileSync(file));
}

content_injector.string = function(searchFor,beforeAfter,content)
{
  if(typeof searchFor === 'string') searchFor = (new RegExp("("+searchFor.replace(/[^\w\s\r\n\t]/g,'\\$&')+")",g));
  
  return content_injector(searchFor,beforeAfter,content);
}

content_injector.onNotFound = function(func)
{
  _onNotFound = func;
  return content_injector;
}

content_injector.onFound = function(func)
{
  _onFound = func;
  return content_injector;
}

module.exports = content_injector;
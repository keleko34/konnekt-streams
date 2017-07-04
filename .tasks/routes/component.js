var fs = require('fs'),
    queryString = require('querystring'),
    path = require('path'),
    base = process.cwd().replace(/\\/g,"/"),
    componentPath = base+'/components',
    stream = require('../.core/core'),
    inject = require('../.core/transforms/inject'),
    append = require('../.core/transforms/append-prepend').append,
    prepend = require('../.core/transforms/append-prepend').prepend;

function translateEnv(name,env,debug,group)
{
  return (env !== 'dev' ? ('/build/' + env + '/' + name + (group ? '.group' : '')+((debug && env !== 'prod') ? '.js' : '.min.js')) : '/'+name+'.js');
}

function sendError(res,code,message)
{
  res.statusCode = code;
  res.statusMessage = message;
  res.write(message,'utf8',function(){
    res.end();
  });
}

function sendFile(res,path)
{
  stream(path).res(res);
}

function fetchDev(res,path,name,env,edit,debug)
{
  var _html = path.replace('.js','.html'),
      _css = path.replace('.js','.css'),
      _cms = path.replace(name+'.js','cms'),
      _err,
      _cmsJS,
      _cmsHTML,
      _cmsCSS,
      _stream = stream(path),
      _total = (edit ? (debug ? 5 : 3) : 2),
      _current = 0;
  
  function onGet(type,err,data)
  {
    if(!err)
    {
      switch(type)
      {
        case 'html':
          _stream.pipe(append('\r\n'+name+'.prototype.k_html = "'+data.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";\r\n'));
        break;
        case 'css':
          _stream.pipe(append('\r\n'+name+'.prototype.k_css = "'+data.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";\r\n'));
        break;
        case 'cms_min':
          _stream.pipe(append('\r\n'+name+'.prototype.k_cms = (function(){\r\n'+data+'\r\n}());'));
        break;
        case 'cms_js':
          _cmsJS = data;
          if(_cmsHTML)
          {
            _cmsJS = _cmsJS + '\r\n'+name+'.prototype.k_html = "'+_cmsHTML.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";\r\n';
          }
          if(_cmsCSS)
          {
            _cmsJS = _cmsJS + '\r\n'+name+'.prototype.k_html = "'+_cmsCSS.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";\r\n';
          }
          if(_cmsHTML && _cmsCSS)
          {
            _stream.pipe(append('\r\n'+name+'.prototype.k_cms = (function(){\r\n'+_cmsJS+'\r\nreturn '+name+';\r\n}());'));
          }
        break;
        case 'cms_html':
          if(_cmsJS)
          {
            _cmsJS = _cmsJS + '\r\n'+name+'.prototype.k_html = "'+data.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";\r\n';
            _cmsHTML = data;
            if(_cmsCSS)
            {
              _stream.pipe(append('\r\n'+name+'.prototype.k_cms = (function(){\r\n'+_cmsJS+'\r\nreturn '+name+';\r\n}());'));
            }
          }
          else
          {
            _cmsHTML = data;
          }
        break;
        case 'cms_css':
          if(_cmsJS)
          {
            _cmsJS = _cmsJS + '\r\n'+name+'.prototype.k_css = "'+data.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";\r\n';
            _cmsCSS = data;
            if(_cmsHTML)
            {
              _stream.pipe(append('\r\n'+name+'.prototype.k_cms = (function(){\r\n'+_cmsJS+'\r\nreturn '+name+';\r\n}());'));
            }
          }
          else
          {
            _cmsCSS = data;
          }
        break;
      }
    }
    else
    {
      _err = err;
    }
    
    _current += 1;
    if(_current === _total)
    {
      if(_err)
      {
        if(err.code === 'ENOENT')
        {
          sendError(res,404,(err.msg || "No Component found by the name "+name+" for environment "+env));
        }
        else
        {
          console.error(err,err.stack);
          sendError(res,500,"Internal Server error");
        }
      }
      else
      {
        _stream.pipe(prepend('if(typeof window.K_Components === \'undefined\') window.K_Components = {};\r\nK_Components["'+name+'"] = (function(){\r\n'))
        .pipe(append('\r\nreturn '+name+';\r\n}());'))
        .res(res);
      }
    }
  }
  
  if(edit)
  {
    if(debug)
    {
      /* fetch cms js */
      fs.readFile(_cms+'/'+name+'.js','utf8',function(err,data){
        if(err) err.msg = ("No cms component for "+name);
        onGet('cms_js',err,data);
      });
      
      /* fetch cms html */
      fs.readFile(_cms+'/'+name+'.html','utf8',function(err,data){
        if(err) err.msg = ("No cms component for "+name);
        onGet('cms_html',err,data);
      });
      
      /* fetch cms css */
      fs.readFile(_cms+'/'+name+'.css','utf8',function(err,data){
        if(err) err.msg = ("No cms component for "+name);
        onGet('cms_css',err,data);
      });
    }
    else
    {
      /* fetch minified cms */
      fs.readFile(_cms+'/'+name+'.min.js','utf8',function(err,data){
        if(err) err.msg = ("No cms component for "+name);
        onGet('cms_min',err,data);
      });
    }
  }
  
  /* fetch html */
  fs.readFile(_html,'utf8',function(err,data){
    onGet('html',err,data);
  })
  
  /* fetch css */
  fs.readFile(_css,'utf8',function(err,data){
    onGet('css',err,data);
  });
}

function fetch(res,path,name,env,group)
{
  if(group)
  {
    fs.stat(group,function(err){
      if(!err)
      {
        sendFile(res,group);
      }
      else
      {
        fs.stat(path,function(err){
          if(!err)
          {
            sendFile(res,path);
          }
          else
          {
            if(err.code === 'ENOENT')
            {
              sendError(res,404,"No Component found by the name "+name+" for environment "+env);
            }
            else
            {
              console.error(err,err.stack);
              sendError(res,500,"Internal Server error");
            }
          }
        });
      }
    });
  }
  else
  {
    fs.stat(path,function(err){
      if(!err)
      {
        sendFile(res,path);
      }
      else
      {
        if(err.code === 'ENOENT')
        {
          sendError(res,404,"No Component found by the name "+name+" for environment "+env);
        }
        else
        {
          console.error(err,err.stack);
          sendError(res,500,"Internal Server error");
        }
      }
    })
  }
}

module.exports = function(req,res,next)
{
  if(req.url.indexOf('/component') === 0)
  {
    /* Debug code */
    if(req.sessions)
    {
      req.sessions.cms = true;
    }
    else
    {
      req.sessions = {cms:true};
    }
    /* End Debug code */
    
    var _url = req.url,
        _query = queryString.parse(_url.substring((_url.indexOf('?')+1),_url.length)),
        _name = _url.replace('/component/','').replace(/[\/]/g,'').replace(/(\?)(.*?)+/g,''),
        _env = _query.env || 'prod',
        _debug = (_query.debug === 'true'),
        _edit = (_query.edit === 'true'),
        _editAllowed = (req.sessions ? (_env === 'dev' && req.sessions.cms) : false),
        _group = !_query.group,
        
        /* Base component path */
        _base = base+'/components/'+_name,
        
        /* end file url */
        _end = translateEnv(_name,_env,_debug),
        
        /* end of file in relation to a group */
        _groupEnd = translateEnv(_name,_env,_debug,true),
        
        /* Full Path */
        _path = _base + _end,
        
        /* full path to grouped component */
        _pathGroup = _base + _groupEnd,

        /* File Stream */
        _file,
        
        _finished = 0,
        _total = 0;
    
    /* need to check for group first */
    if(_env === 'dev')
    {
      fetchDev(res,_path,_name,_env,(_edit && _editAllowed),_debug);
    }
    else
    {
      fetch(res,_path,_name,_env,(_group ? _pathGroup : undefined));
    }
  }
  else
  {
    next();
  }
}
    
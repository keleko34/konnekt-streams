var base = require('./../../Base'),
    stream = require('./../../.core/core'),
    append = require('./../../.core/transforms/append-prepend').append,
    prepend = require('./../../.core/transforms/append-prepend').prepend,
    compile = require('./../../.core/transforms/compile'),
    fs = require('fs'),
    querystring = require('querystring');

module.exports = function()
{  
    function minify(dest,name)
    {
      var _stream = stream(dest+'/'+name+'.js');
        
      _stream.onEnd(function(){
        console.log('\033[36mFinished Compiling \033[37m',name);
      })
      .pipe(compile())
      .rename(function(fileNameObject){
        return '/'+fileNameObject.file.replace('.js','.min.js');
      })
      .write(dest);
    }
  ,
    function buildGroup(name,base,res)
    {
      console.log(name,base,res);
      /* create a stream from the build file */
      var _groups,
          _finished = 0,
          _stream = stream(read());
      
      /* read the groups file if it exists */
      fs.readFile(base+'/group.json'function(err,data){
        if(!err)
        {
          /* loop build each component and then append its contents to  */
          data = JSON.parse(data);
          _groups = data.groups;
          
          for(var x=0,len=_groups.length;x<len;x++)
          {
            build(component,res,function(path){
              _stream.pipe(append(fs.readFileSync(path)));
              _finished += 1;
              
              if(_finished === _groups.length)
              {
                _stream.onEnd(function(){
                  console.log('\033[36mFinished Compiling \033[37m',name);
                })
                .rename(function(fileNameObject){
                  
                })
                .write();
              }
              
            });
          }
        }
        else
        {
          if(err.code !== 'ENOENT')
          {
            console.error('There was an error getting the groups json file, groups were not compiled');
            process.exit(0);
          }
          else
          {
            console.log('\033[36mFinished Compiling \033[37m',name);
          }
        }
      });
    }
  
  
    function build(name,res)
    {
      console.log('\033[36mCompiling:\033[37m',name,' \033[36mFor channel:\033[37m',res.Channel);
      var _base = global.taskrunner.config.Tasks.build.base,
          _dest = _base+'/'+name+(res.Channel !== 'cms' ? '/build/'+res.Channel : '/cms'),
          _dir = global.taskrunner.base+_base+'/'+name+(res.Channel === 'cms' ? '/cms' : (res.BuildFrom !== 'dev' ? '/build/'+res.BuildFrom : '')),
          _devfiles = ['js'];
      
      if(res.BuildFrom === 'dev')
      { 
        var html = fs.readFileSync(_dir+"/"+name+".html",'utf8'),
            css = fs.readFileSync(_dir+"/"+name+".css",'utf8'),
            _stream = stream(_dir+'/'+name+'.js');
        
        var appendFiles = '\r\n'+name+'.prototype.k_html = "'+html.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";'
                        +'\r\n'+name+'.prototype.k_css = "'+css.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";',
            startClosure = 'if(!K_Components) K_Components = {};\r\nK_Components["'+name+'"] = (function(){\r\n\t',
            endClosure = '\r\n\treturn '+name+';\r\n}());';
        
        _stream.onEnd(function(){
          minify(_dest,name);
        })
        .pipe(append(appendFiles))
        .pipe(prepend(startClosure))
        .pipe(append(endClosure))
        .rename(function(fileNameObject){
          return '/'+fileNameObject.file;
        })
        .write(_dest);
      }
      else if(res.BuildFrom === 'cms')
      {
        var html = fs.readFileSync(_dir+"/"+name+".html",'utf8'),
            css = fs.readFileSync(_dir+"/"+name+".css",'utf8'),
            _stream = stream(_dir+'/'+name+'.js');
        
        var appendFiles = '\r\n'+name+'.prototype.kcms_html = "'+html.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";'
                        +'\r\n'+name+'.prototype.kcms_css = "'+css.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";',
            startClosure = 'if(!KCMS_Components) KCMS_Components = {};\r\nKCMS_Components["'+name+'"] = (function(){\r\n\t',
            endClosure = '\r\n\treturn '+name+';\r\n}());';
        
        _stream.onEnd(function(){
          console.log('\033[36mFinished Compiling \033[37m',name);
        })
        .pipe(append(appendFiles))
        .pipe(prepend(startClosure))
        .pipe(append(endClosure))
        .pipe(compile())
        .rename(function(fileNameObject){
          return '/'+fileNameObject.file.replace('.js','.min.js');
        })
        .write(_dest);
      }
      else
      {
        var _stream = stream(_dir+"/"+(res.Channel !== 'prod' ? '*' : name+'.min.js'));
        
        _stream.onEnd(function(){
          buildGroup(name,_dest,res);
        })
        .rename(function(fileNameObject){
          return '/'+fileNameObject.file;
        })
        .write(_dest);
      }
    }
  
    function Command(res)
    {
      if(res.Names.length === 0) return console.error('No component names were selected, please use `space` to select a component to build');
      
      for(var x=0,len=res.Names.length;x<len;x++)
      {
        build(res.Names[x],res);
      }
    }

    return base
    .task('build')
    .command(Command)
    .call();
}
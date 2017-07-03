var base = require('./../../base'),
    http = require('http'),
    connect = require('connect')(),
    static = require('serve-static'),
    open = require('open'),
    basedir = process.cwd().replace(/\\/g,'/');

module.exports = function()
{
  function Command(res)
  {
    console.info("\033[36mPress ctrl + o to quickly open the default web page in your default browser\033[37m");
    
    for(var x=0,len=global.taskrunner.config.Tasks.server.routes.length;x<len;x++)
    {
      connect.use(global.taskrunner.config.Tasks.server.routes[x]);
    }
    
    connect.use('/',static('.', {'index': ['index.html', 'index.htm']}));
    
    connect.listen((res.Port && res.Port.length !== 0 ? parseInt(res.Port) : 8080));
    
    var stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data',function(key)
    {
        if(key === '\u000f')
        {
            open('http://localhost:'+res.Port);
        }
        else
        {
            if (key === '\u0003')
            {
                process.exit();
            }
            process.stdout.write(key);
        }
    });
  }
  
  return base
  .task('server')
  .command(Command)
  .call();
}
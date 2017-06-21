var konnekt_streams = require('./../konnekt-streams/konnekt-streams'),
    replace = require('./../../konnekt-streams/konnekt-streams/transforms/replace')

process.on('unhandledRejection', function (err) {
  console.log('unhandledRejection',err.message,err.stack);
})

konnekt_streams('/template/**/*')
.pipe(replace(/(\$Name)/g,'test'))
.rename(function(pathObj){
  return (pathObj.writeTo.replace(/(\$Name)/g,'test'));
})
.write('/template-export/test');
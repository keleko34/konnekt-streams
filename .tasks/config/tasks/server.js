var fs = require('fs');

module.exports = {
  commands: {
    Port: {
      cmd: {
        short: "-p",
        long: "--port"
      },
      prompt: {
        type: "input",
        message: "Please enter a port for the server to use"
      },
      action:'end'
    }
  },
  routes:fs.readdirSync(global.taskrunner.global+"/routes")
  .map(function(route){
    return require(global.taskrunner.global+"/routes/"+route);
  })
}
var fs = require('fs')

module.exports = {
  commands:{
    Task:{
      cmd: {
        short: "-t",
        long: "--task"
      },
      prompt:{
        type:'list',
        message:'please select the task You would like to run?',
        choices:function(){
          return Object.keys(global.taskrunner.config.Tasks).filter(function(task){return (task !== 'default')});
        }
      },
      action:'end'
    }
  }
}
module.exports = {
  firstCommand:function(){
    return ((process.argv.indexOf('--postinstall') !== -1 && process.argv.indexOf('--skippostinstall') === -1 && process.env.npm_config_skippostinstall !== 'true') ? 'Initial' : 'Title');
  },
  commands:{
    Initial:{
      cmd:{
        short:'-i',
        long:'--init'
      },
      prompt:{
        type:'confirm',
        message:'Would You like to go ahead and set up a brand new project from this install?'
      },
      action:function(v,values)
      {
        if(v) return 'Title';
        return 'end';
      }
    },
    Title:{
      cmd:{
          short:'-t',
          long:'--title'
      },
      prompt:{
          type:'input',
          message:'What would you like to call this project?'
      },
      action:'Description'
    },
    Description:{
      cmd:{
          short:'-d',
          long:'--description'
      },
      prompt:{
          type:'input',
          message:'What is the purpose of this project?'
      },
      action:'Helpers'
    },
    Helpers:{
      cmd:{
          short:'-h',
          long:'--helpers'
      },
      prompt:{
          type:'confirm',
          message:'Would you like commented out helpers for extra functionality that can be added?'
      },
      action:'end'
    }
  },
  onFinished:function(res){
    console.log('\033[36mFinished Creating Project:\033[37m',res.Title);
  }
}

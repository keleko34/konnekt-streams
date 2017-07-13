var fs = require('fs');

module.exports = {
  firstCommand:'Names',
  commands:{
    Names:{
      prompt:{
        type:'checkbox',
        message:'What is the name of the component you would like to build?',
        choices:function(){
          try{
            var choices = fs.readdirSync(global.taskrunner.base+"/components");
          }
          catch(e)
          {
            console.error('No root components directory exist in: ',global.taskrunner.base+"/components");
            process.exit(0);
          }
          return choices;
        }
      },
      action:'Channel'
    },
    Channel:{
      cmd:{
        short:'-c',
        long:'--channel'
      },
      prompt:{
        type:'list',
        message:'What channel would You like to build?',
        choices:['qa','stage','prod','cms']
      },
      action:function(v,values){
        if(v !== 'cms' && v !== 'qa') return 'BuildFrom';
        if(v === 'cms'){
          values['BuildFrom'] = 'cms';
          return 'end';
        }
        values['BuildFrom'] = 'dev';
        return 'end';
      }
    },
    BuildFrom:{
      cmd:{
        short:'-bf',
        long:'--buildfrom'
      },
      prompt:{
        type:'list',
        message:'Would you like to build from latest dev or previous channel?',
        choices:function(values){
          var channels = ['qa','stage','prod'];
          return (channels !== 'qa' ? ['dev'].concat(channels[(channels.indexOf(values.Channel)-1)]) : ['dev']);
        }
      },
      action:'end'
    }
  },
  base:'/components'
}
var fs = require('fs');

module.exports = {
    commands:{
        Name:{
            cmd:{
                short:'-n',
                long:'--name'
            },
            prompt:{
                type:'list',
                message:'What is the name of the component you want to create a group for?',
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
            action:function(v,values){
                try{
                    if(fs.readFileSync(global.taskrunner.base+"/components/"+values.Name+'/group.json'))
                    {
                        return 'Confirm';
                    }
                    else
                    {
                        return 'Grouped';
                    }
                }
                catch(e)
                {
                    return 'Grouped';
                }
            }
        },
        Confirm:{
            prompt:{
                type:'confirm',
                message:'A group for this component already exists, are you sure you want to overwrite it?'
            },
            action:function(v,values){
                if(v) return 'Grouped';
                return 'Name';
            }
        },
        Grouped:{
            prompt:{
                type:'checkbox',
                message:'Which components would you like to group into this one?',
                choices:function(values){
                    try{
                      var choices = fs.readdirSync(global.taskrunner.base+"/components")
                      .filter(function(v){
                        return (v !== values.Name);
                      })
                      .concat(["Autogroup (Note this reads the html, any dynamic components won't be grouped)"]);
                    }
                    catch(e)
                    {
                      console.error('No root components directory exist in: ',global.taskrunner.base+"/components");
                      process.exit(0);
                    }
                    return choices;
                }
            },
            action:'end'
        }
    }
}
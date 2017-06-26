var base = require('./../../base');

module.exports = function()
{
  console.log('running default')
  function Command(res)
  {
    global.taskrunner.tasks[res.Task]();
  }

  return base
  .task('default')
  .command(Command)
  .call();
}
var log  = function (message){ console.log('--> ' + message); };
var fail = function (message){ throw new Error(message); };

desc('Runs the foounit-server specs');
task('spec', [], function (){
  var foounit = require('foounit').globalize();
  foounit.mount('spec', __dirname + '/spec');
  foounit.getSuite().addFile(__dirname + '/spec/loader_spec');
  foounit.getSuite().addFile(__dirname + '/spec/parser_spec');
  foounit.getSuite().run();
});

namespace('foounit', function (){
  desc('Builds foounit and puts it in yamjs');
  task('refresh', [], function (){
    var foounitHome = process.env.FOOUNIT_HOME;
    if (!foounitHome){ fail('FOOUNIT_HOME is a required environment variable'); }

    var exec = require('child_process').exec;

    log('Building and copying foounit...');

    var refresh = exec('cd $FOOUNIT_HOME && jake build:all && cp -f dist/*.js ' + __dirname + '/lib/templates');
      refresh.stderr.on('data', function (data){
      log(data);
    });

    refresh.on('exit', function (code){
      if (code !== 0){ fail('Could not build and copy foounit'); }
      log('foounit was built and copied successfully');
    });
  });
});


task('default', ['spec'], function (){});

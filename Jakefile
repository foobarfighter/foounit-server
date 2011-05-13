desc('Runs the foounit-server specs');
task('spec', [], function (){
  var foounit = require('foounit').globalize();
  foounit.getSuite().addFile(__dirname + '/spec/loader_spec');
  foounit.getSuite().run();
});

task('default', ['spec'], function (){});

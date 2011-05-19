desc('Runs the foounit-server specs');
task('spec', [], function (){
  var foounit = require('foounit').globalize();
  foounit.mount('spec', __dirname + '/spec');
  foounit.getSuite().addFile(__dirname + '/spec/loader_spec');
  foounit.getSuite().addFile(__dirname + '/spec/parser_spec');
  foounit.getSuite().run();
});

task('default', ['spec'], function (){});

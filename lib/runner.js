var connect = require('connect')
  , services =  require('./services');

/**
 * A runner for the foounit services
 *
 * options.port     - The server port.  Default is 5057
 * options.root     - A root application directory
 * options.status   - The foounit status path
 * options.hostname - The server hostname.  Default is localhost
 * options.template - An ejs suite template file.  Default is provided by foounit.
 * options.mounts   - A mounts object that has the virtual path as the key and the
 *                    the logical path as the value.
 */
var Runner = function (options){
  var pth = require('path');

  var _server
  , _options = options;

  this.run = function (){
    _server = connect(
        connect.logger()
      , connect.favicon(pth.join(__dirname, 'templates/ninja.png'))
      , services.status(_options.status)
      , services.loader(_options.root, _options.template, _options.pattern, _options.mounts, options)
      );
    _server.listen(_options.port, _options.host);
  }
};

if (!module.parent){
  var options = {
    port:     5057
  , root:     '/'
  , status:   '/status'
  , hostname: 'localhost'
  , pattern:  /_spec\.js$/
  , template: __dirname + '/templates/default-suite.html'
  , mounts:   { src: 'src', spec: 'spec' }
  };

  var runner = new Runner(options);
  runner.run();
}

module.exports = Runner;

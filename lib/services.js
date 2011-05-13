var fs = require('fs');

/**
 * Connect service for parsing and loading code dependencies inline
 */
exports.loader = function (root, template, mounts, options){
  var contents = fs.readFileSync(template)
    , loader = new foounit.server.Loader(mounts);;
  
  return function (req, res, next){
    if (req.url.indexOf(root) != 0){ return next(); }
    var parsed = loader.parse(contents);
    res.end(contents);
  };
};

/**
 * Connect service for a foounit heartbeat service
 */
exports.status = function (root, options){
  options = options || {};
  options.root = root;

  return function (req, res, next){
    res.end('foounit status: ' + new Date().getTime());
  };
};

module.exports = foounit;


/**
 * Connect service for parsing and loading code dependencies inline
 */
exports.loader = function (root, template, pattern, mounts, options){
  var Loader = require('./loader').Loader
    , _loader = new Loader(template, pattern, mounts);
  
  return function (req, res, next){
    if (req.url.indexOf(root) != 0){ return next(); }

    var page = _loader.load(req.url.substr(root.length));
    res.end(page);
  };
};

/**
 * Connect service for a foounit status report
 */
exports.status = function (root, options){
  _options = options || {};
  _options.root = root;

  return function (req, res, next){
    if (req.url != _options.root){ next(); }
    res.end('foounit status: ' + new Date().getTime());
  };
};


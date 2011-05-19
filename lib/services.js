/**
 * Connect service for parsing and loading code dependencies inline
 */
exports.loader = function (root, template, mounts, options){
    var loader = new foounit.server.Loader(template, mounts);
  
  return function (req, res, next){
    if (req.url.indexOf(root) != 0){ return next(); }

    var page = loader.load(req.url.substr(root.length));
    res.end(contents);
  };
};

/**
 * Connect service for a foounit status report
 */
exports.status = function (root, options){
  options = options || {};
  options.root = root;

  return function (req, res, next){
    res.end('foounit status: ' + new Date().getTime());
  };
};

module.exports = foounit;

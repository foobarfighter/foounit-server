exports.Parser = function (){
  var _extractFromHtml = function (content){
    var regex = /(<script[^>]+data-foounit[^>]+)/g
      , matches
      , scripts = [];

    while (matches = regex.exec(content)){
      var src = matches[1].match(/src\s*=\s*["']([^"']+)/)[1];
      scripts.push({ scope: 'global', file: src });
    }

    return scripts;
  };

  var _extractFromJs = function (content){
    var regex = /foounit\.(require|load)\(["']([^"']+)/g
      , matches
      , scripts = [];

    while (matches = regex.exec(content)){
      var scope = matches[1] == 'require' ? 'function' : 'global'
        , src   = matches[2] + '.js';
      scripts.push({ scope: scope, file: src });
    }

    return scripts;
  };

  // Ok... this function sucks.  I welcome any code from
  // someone that wants to make it better.
  this.parse = function (content){
    if (!content){ return []; }

    var trimmed = content.toString().replace(/^\s+/, '').replace(/\s+$/, '');

    // Fail fast
    if (!trimmed){ return []; }

    // If the first character looks like a tag we assume HTML
    if (trimmed[0] == '<'){
      return _extractFromHtml(trimmed);
    } else {
      return _extractFromJs(trimmed);
    }
  };
};

var fs = require('fs')
  , fsh = require('fsh')
  , pth = require('path')
  //, process = require('process');

//exports.errors.NotFound.prototype = Error.__proto__;
var pSlice = function (args){
  return Array.prototype.slice.call(args, 0);
};

exports.Loader = function (template, pattern, mounts, options){
  var _parser = new exports.Parser()
    , _template = fs.realpathSync(template)
    , _pattern = pattern
    , _mounts = mounts
    , _deps = {}
    , _contents = {}
    , _options = options || {};

  _options.defaultScope = _options.defaultScope || 'function';
  _mounts.foounit = _mounts.foounit || pth.join(__dirname, 'foounit');

  this.load = function (path){
    this.reset();
    this.debug('Loading template: ' + _template);

    var contents = this.getFile(_template)
      , deps = this.parse(contents).concat(this.findSpecFiles(path));

    this.addDeps('__root__', deps);
    this.build('__root__');

    var depContent = this.output();
    return this.templatize(contents, { path: path, suite: depContent });
  }

  this.addDeps = function (key, deps){
    for (var i = 0; i < deps.length; ++i){
      if (typeof deps[i] != 'string'){ continue; }
      deps[i] = { scope: _options.defaultScope, file: deps[i] }
    }
    _deps[key] = deps;
  }

  this.getDep = function (key){
    return _deps[key];
  }

  this.getDeps = function (){
    return _deps;
  }

  this.debug = function (message){
    process.stderr.write("DEBUG - " + message + "\n");
  }

  this.getFile = function (path){
    this.debug('Reading file: ' + path);
    if (_contents[path]) { return _contents[path]; }

    var contents = fs.readFileSync(path);
    _contents[path] = contents.toString();
    return contents;
  }

  this.build = function (key){
    var deps = _deps[key];
    for (var i = 0; i < deps.length; ++i){
      var file = deps[i].file
        , contents = this.getFile(file)

      this.addDeps(file, this.parse(contents));
      this.build(file);
    }
  }

  this.flatten = function (){
    var flat = [];

    var flatten = function (key){
      var deps = _deps[key];
      for (var i = 0; i < deps.length; ++i){
        flatten(deps[i].file)
        flat.push(deps[i]);
      }
    }

    flatten('__root__');
    return flat;
  }

  this.output = function (){
    var deps = this.flatten()
      , output = '';

    var script = function (dep){
      return "  " + '<script type="text/javascript" src="' + dep.file +
        "?foounit.scope=" + dep.scope +
        '"></script>' + "\n";
    }

    for (var i = 0; i < deps.length; ++i){
      output += script(deps[i]);
    }
    return output;
  }

  this.templatize = function (template, replacements){
    return template.toString().replace(/\{\{(\w+)\}\}/g, function(match, ref){
      return replacements[ref];
    });
  }

  this.reset = function (){
    _deps = {};
    _contents = {};
  }

  this.mount = function (name, value){
    return (arguments.length == 2) ? _mounts[name] = value : _mounts[name];
  }

  this.unmount = function (name){
    delete _mounts[name];
  }

  this.parse = function (content){
    var paths = _parser.parse(content.toString());
    
    for (var i = 0; i < paths.length; ++i){
      paths[i].file = this.realpath(paths[i].file);
    }
    return paths;
  }

  this.findSpecFiles = function (path){
    var fullpath = this.realpath(path);

    if (fsh.isDirectorySync(fullpath)){
      return fsh.findSync(fullpath, _pattern);
    } else if (fsh.isFileSync(fullpath)){
      return [fullpath];
    } else {
      throw new Error('Not Found: "' + path + '".  Looking for fullpath: "' + fullpath + '"');
    }
  }

  this.realpath = function (path){
    var found;
    path = path.replace(':', '');

    for (var k in _mounts){
      if (path.indexOf(k) == 0 && (!found || k.length > found.length)){
        found = k;
      }
    }
    if (!found){ return; }

    path = path.substr(found.length);
    return pth.join(this.mount(found), path);
  }
}

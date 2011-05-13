exports.Loader = function (mounts){
  var _mounts = mounts;

  var _extractScripts = function (content){
    var regex = /(<script[^>]+data-foounit[^>]+)/g
      , matches
      , scripts = [];

    while (matches = regex.exec(content)){
      var src = matches[1].match(/src\s*=\s*["']([^"']+)/)[1];
      scripts.push(src);
    }

    return scripts;
  };

  var _extractRequires = function (content){
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
      return _extractScripts(trimmed);
    } else {
      return _extractRequires(trimmed);
    }
  };
};

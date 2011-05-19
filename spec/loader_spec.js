var Loader = require('../lib/loader').Loader
  , pth    = require('path');

// Imports haveStringsInOrder
require('../spec/spec_helper');

describe('Loader', function (){
  var pfixtures = function (path){
    var fixtures = pth.join(__dirname, '/fixtures');
    return pth.join(fixtures, path);
  }

  var dobj = function (path, scope){
    scope = scope || 'function';
    return { file: pfixtures(path), scope: scope };
  }

  before(function (){
    loader = new Loader(pfixtures('/spec/suite.html'), /_spec.js$/, {
      src:  pfixtures('src'),
      spec: pfixtures('spec')
    });
  });

  after(function (){
    loader.reset();
  });

  describe('.load', function (){
    describe('when the path includes the spec or test mount', function (){
      it('outputs all suite files matching the pattern', function (){
        var content = loader.load('spec/');

        expect(content).to(haveStringsInOrder, [
          'bar.js?foounit.scope=function',
          'bar_spec.js?foounit.scope=function',
          'foo_spec.js?foounit.scope=function',
          'quux/baz_spec.js?foounit.scope=function',
          'quux_spec.js?foounit.scope=function'
        ]);
      });
    });
  });

  describe('.add', function (){
    describe('when the dependency list contains an item that is a string', function (){
      it('converts the item to a dependency object', function (){
        loader.addDeps('__root__', ['foo/bar']);
        expect(loader.getDep('__root__')).to(equal, [{ scope: 'function', file: 'foo/bar'}]);
      });
    });

    describe('when the dependency list contains an item that is NOT a string', function (){
      it('treats the item as if it were already a dependency object', function (){
        loader.addDeps('__root__', [{ scope: 'global', file: 'foo/bar' }]);
        expect(loader.getDep('__root__')).to(equal, [{ scope: 'global', file: 'foo/bar'}]);
      });
    });
  });

  describe('.build', function (){
    before(function (){
      loader.addDeps('__root__', [ pfixtures('spec/bar_spec.js') ]);
    });

    it('recursively builds a list of dependencies by parsing files an parsing their dependencies', function (){
      loader.build('__root__');

      var deps = loader.getDeps();
      expect(Object.keys(deps).length).to(equal, 3);
      expect(deps['__root__']).to(equal, [ dobj('spec/bar_spec.js') ]);
      expect(deps[pfixtures('spec/bar_spec.js')]).to(equal, [ dobj('src/bar.js') ]);
      expect(deps[pfixtures('src/bar.js')]).to(equal, []);
    });
  });

  describe('.flatten', function (){
    before(function (){
      loader.addDeps('__root__', [ pfixtures('spec/bar_spec.js') ]);
      loader.build('__root__');
    });

    it('flattens the hash of dependencies into a sorted array', function (){
      var deps = loader.flatten();
      expect(deps).to(equal, [
        dobj('src/bar.js'),
        dobj('spec/bar_spec.js')
      ]);
    });
  });

  describe('.output', function (){
    before(function (){
      loader.addDeps('__root__', [ pfixtures('spec/bar_spec.js') ]);
      loader.build('__root__');
    });

    it('outputs script tags in the proper order', function (){
      var scripts = loader.output();

      expect(scripts).to(haveStringsInOrder, [
        'bar.js?foounit.scope=function',
        'bar_spec.js?foounit.scope=function'
      ]);
    });
  });

  describe('.templatize', function (){
    it('replaces placeholders with content', function (){
      var content = loader.templatize('x {{y}} z', { y: 'foo' });
      expect(content).to(equal, 'x foo z');
    });
  });

  describe('.findSpecFiles', function (){
    describe('when the path cannot be found', function (){
      it('throws an error', function (){
        expect(function (){
          loader.findSpecFiles('doesnotexist');
        }).to(throwError, /Not Found/);
      });
    });

    describe('when path is a file', function (){
      it('returns the file in a one item array', function (){
        var files = loader.findSpecFiles('spec/bar_spec.js');
        expect(files).to(equal, [pfixtures('spec/bar_spec.js')]);
      });
    });

    describe('when the path is a directory', function (){
      it('returns the files matching the pattern', function (){
        var files = loader.findSpecFiles('spec');
        expect(files).to(equal, [
          pfixtures('spec/bar_spec.js'),
          pfixtures('spec/foo_spec.js'),
          pfixtures('spec/quux/baz_spec.js'),
          pfixtures('spec/quux_spec.js')
        ]);
      });
    });
  });

  describe('.realpath', function (){
    describe('when the path is in the mounts', function (){
      before(function (){
        loader.mount('test',     'foo/bar');
        loader.mount('test/foo', 'baz/qux');
      });

      after(function (){
        loader.unmount('test');
        loader.unmount('test/foo');
      });

      it('returns full file path', function (){
        expect(loader.realpath('test/bing/bong')).to(equal, 'foo/bar/bing/bong');
        expect(loader.realpath('test/foo/bing/bong')).to(equal, 'baz/qux/bing/bong');
      });

      describe('when the path contains ":" characters', function (){
        before(function (){
          loader.mount('bing', 'bong/boom');
        });

        after(function (){
          loader.mount('bing', 'bong/boom');
        });

        it('returns the properly mounted path anyway', function (){
          expect(loader.realpath(':bing/baz')).to(equal, 'bong/boom/baz');
        });
      });
    });

    describe('when the path is NOT in the mounts', function (){
      it('returns undefined', function (){
        expect(loader.mount('blah')).to(beUndefined);
        expect(loader.realpath('blah/foo')).to(beUndefined);
      });
    });
  });

  describe('parse', function (){
    it('returns realpaths to the dependencies in the text', function (){
      var text = 'blah blah foounit.require(":src/baz"); blah blah';
      expect(loader.parse(text)).to(equal, [ dobj('src/baz.js') ]);
    });
  });
});

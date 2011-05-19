var Parser = require('../lib/loader').Parser;

describe('Parser', function (){
  describe('.parse', function (){
    describe('when the code can be parsed as html', function (){
      it('returns the dependent script files', function (){
        var content = '\
          <html><head>                                              \
            <script src=":foo/baz.js" data-foounit="true"></script> \
            <script src="test.js"></script>                         \
            <script src=":foo/bar.js" data-foounit="true"></script> \
          </head></html>                                            \
        ';

        var parser = new Parser();
        files = parser.parse(content);
        expect(files).to(equal, [
          { scope: 'global', file: ':foo/baz.js' },
          { scope: 'global', file: ':foo/bar.js' }
        ]);
      });
    });

    describe('when the code is assumed to be javascript', function (){
      it('parses foounit.require and foounit.load correctly', function (){
        var content = "\
          someFunc();                         \
          foounit.require(':src/bing');    \
          foounit.require(\":src/bong\");  \
          foounit.load(\":src/bang\");  \
          anotherFunc();                      \
        ";

        var parser = new Parser();
        files = parser.parse(content);
        expect(files).to(equal, [
          { scope: 'function', file: ':src/bing.js' },
          { scope: 'function', file: ':src/bong.js' },
          { scope: 'global',   file: ':src/bang.js' }
        ]);
      });
    });

  });
});

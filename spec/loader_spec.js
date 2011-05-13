var Loader = require('../lib/loader').Loader;

describe('Loader', function (){
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

        var loader = new Loader({ foo: 'bing/bong' });
        files = loader.parse(content);
        expect(files).to(equal, [':foo/baz.js', ':foo/bar.js']);
      });
    });

  });
});

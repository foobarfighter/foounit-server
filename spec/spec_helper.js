foounit.addKeyword('haveStringsInOrder', function (){
  this.match = function (actual, expected){
    var next = 0, actual = actual.toString();
   
    for (var i = 0; i < expected.length; ++i){
      var foundAt = actual.indexOf(expected[i], next);
      if (foundAt == -1){
        throw new Error('"' + expected[i] + '" was not found in the proper order');
      } else {
        next = foundAt + expected[i].length;
      }
    }
  }
});

// Test the spec helper inline
describe('haveStringsInOrder', function (){
  var matcher;

  before(function (){
    matcher = new foounit.keywords.haveStringsInOrder();
  });

  describe('.match', function (){
    it('passes when it finds all strings in actual in the proper order', function (){
      var content = "lipsum dolor\nlorem ips\ndolor";
      matcher.match(content, [ 'lip', 'lor', 'dolor' ]);

      expect(function (){
        matcher.match(content, ['lipsum', 'ips', 'ips']);
      }).to(throwError, /"ips" was not found in the proper order/);
    });
  });
});

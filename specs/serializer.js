var serialize   = require('../serializer'),
    parse       = require('../parser'),
    assert      = require('assert');

describe('markstruct/parser', function() {

  var src = [
    '# Title',
    '',
    'Hello world! This is a paragraph',
    'and it still goes',
    '',
    '\tnow a code block',
    '\thah',
    '',
    '* list item',
    '* another one'
  ].join('\n');

  it('should serialize doc into markdown string', function() {
    var doc = parse(src);
    var md = serialize(doc);
    assert.ok(md.match(/<h1>Title/));
    assert.ok(md.match(/<p>Hello world!/));
    assert.ok(md.match(/<pre><code>now a code block/));
    assert.ok(md.match(/<li>list item/));
    assert.ok(md.match(/<li>another one/));
  });

});


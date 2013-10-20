var parse  = require('../parser'),
    assert = require('assert');

describe('markstruct/parser', function() {

  var src = [
    '# Title',
    '',
    'Hello world! This is a paragraph',
    'and it still goes:',
    '',
    '\tnow a code block',
    '\thah',
    '',
    '* list item',
    '* another one'
  ].join('\n');

  it('should parse markdown into doc', function() {
    var doc = parse(src);
    assert.deepEqual(doc[0], 
      { type: 'heading',
        level: 1,
        content: 'Title' });

    assert.deepEqual(doc[1], 
      { type: 'paragraph',
        content: 'Hello world! This is a paragraph\nand it still goes:' });

    assert.deepEqual(doc[2], 
      { type: 'code',
        content: 'now a code block\nhah' });

    assert.deepEqual(doc[3], 
      { type: 'listitem',
        content: 'list item' });

    assert.deepEqual(doc[4], 
      { type: 'listitem',
        content: 'another one' });
  });

});

var markdown = require('markdown').markdown;

function flatten(ast) {
  return ast
    .map(function(n) { return Array.isArray(n) ? n.slice(1) : n })
    .reduce(function(a, b) { return a.concat(b); }, [])
    .join('');
}

function walk(ast) {
  var doc = [];

  ast.slice(1).forEach(function(block) {
    switch(block[0]) {
      case 'header':
        doc.push({
          type: 'heading',
          level: block[1].level,
          content: flatten(block.slice(2))
        });
        break;
      case 'para':
        doc.push({type: 'paragraph', content: flatten(block.slice(1))});
        break;
      case 'bulletlist':
        doc = doc.concat(walk(block));
        break;
      case 'listitem':
        doc.push({type: 'listitem', content: flatten(block.slice(1))});
        break;
      case 'code_block':
        doc.push({type: 'code', content: flatten(block.slice(1))});
        break;
      default:
        doc.push({type: 'paragraph', content: flatten(block.slice(1))});
    }
  });

  return doc;
}

module.exports = function(src) {
  var ast = markdown.parse(src);
  return walk(ast);
}

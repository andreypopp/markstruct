var markdown  = require('markdown').markdown,
    utils     = require('lodash');

function flatten(nodes) {
  var content = '';
  for (var i = 0, length = nodes.length; i < length; i++) {
    content = content + (Array.isArray(nodes[i]) ? nodes[i][1] : nodes[i]);
  }
  return content;
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
        var inline = walkInlineMarkup(block.slice(1));
        doc.push({
          type: 'paragraph',
          content: inline.content,
          annotations: inline.annotations
        });
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

function walkInlineMarkup(nodes) {
  var idx = 0,
      content = flatten(nodes),
      annotations = [];

  while (nodes.length > 0) {
    var node = nodes.shift();
    if (utils.isString(node)) {
      idx = idx + node.length;
    } else {
      switch(node[0]) {
        case 'em':
          annotations.push({type: 'em', range: [idx, idx + node[1].length]});
        default:
          idx = idx + node[1].length;
      }
    }
  }

  return {content: content, annotations: annotations};
}

/**
 * @returns {content: String, annotations: Array<Annotation>}
 */
function parseInlineMarkup(src) {
  var ast = markdown.parse(src);
  if (!ast[1])
    return {content: '', annotations: []};
  return walkInlineMarkup(ast[1].slice(1));
}

module.exports = function(src) {
  var ast = markdown.parse(src);
  return walk(ast);
}

module.exports.parseInlineMarkup = parseInlineMarkup;

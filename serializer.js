var markdown = require('markdown').markdown;

function toAst(doc) {
  var ast = ['markdown'];
  doc.forEach(function(block) {
    switch(block.type) {
      case 'paragraph':
        ast.push(['para', block.content]);
        break;
      case 'heading':
        ast.push(['header', {level: block.level}, block.content]);
        break;
      case 'code':
        ast.push(['code_block', block.content]);
        break;
      case 'listitem':
        ast.push(['listitem', block.content]);
        break;
      default:
        ast.push(['para', block.content || '']);
    }
  });
  return ast;
}

module.exports = function(doc) {
  var ast = toAst(doc);
  return markdown.renderJsonML(markdown.toHTMLTree(ast));
}

module.exports.toMarkdown = function(doc) {
  var ast = toAst(doc);
  return markdown.renderJsonML(ast);
}

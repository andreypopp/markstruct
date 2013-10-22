var keys            = require('./keys'),
    rangy           = require('./rangy/rangy-core');

function extractContentsTillEnd(node) {
  if (!node.firstChild) return '';
  if (node.firstChild.wholeText.length === 0) return '';
  var s = rangy.getSelection(),
      r = s.getRangeAt(0);
  r.setEndAfter(node.firstChild);
  return r.extractContents().firstChild.wholeText;
}

module.exports = {
  extractContentsTillEnd: extractContentsTillEnd
};

var keys            = require('./keys'),
    rangy           = require('./rangy/rangy-core');

function computeLineMetricsPre(node) {
  var offset = rangy.getSelection().getRangeAt(0).startOffset;
  if (!node.firstChild)
    return {line: 1, lineOffset: 0, offset:0, totalLines: 1};

  var text = node.firstChild.wholeText;

  if (text[text.length - 1] !== '\n')
    text = text + '\n';

  var lines = text.split('\n'),
      totalLines = lines.length - 1,
      seenOffset = 0;

  for (var i = 0, len = lines.length; i < len; i++) {
    if (seenOffset + lines[i].length + 1 > offset) {
      break;
    }
    seenOffset = seenOffset + lines[i].length + 1;
  }
  return {
    line: i + 1,
    lineOffset: offset - seenOffset,
    offset: offset,
    totalLines: totalLines
  }
}

function setCursorPosition(node, offset) {
  var s = rangy.getSelection(),
      r = rangy.createRange();
  r.setStart(node, offset);
  r.collapse(true);
  s.setSingleRange(r);
}

function getSelectionOffset() {
  return rangy.getSelection().focusOffset;
}

function extractContentsTillEnd(node) {
  if (!node.firstChild) return '';
  if (node.firstChild.wholeText.length === 0) return '';
  var s = rangy.getSelection(),
      r = s.getRangeAt(0);
  r.setEndAfter(node.firstChild);
  return r.extractContents().firstChild.wholeText;
}

module.exports = {
  computeLineMetricsPre: computeLineMetricsPre,
  setCursorPosition: setCursorPosition,
  getSelectionOffset: getSelectionOffset,
  extractContentsTillEnd: extractContentsTillEnd
};

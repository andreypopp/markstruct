require('rangy-browser/lib/rangy-core');

function rangeHeight(node, start, end) {
  var rng = rangy.createRange();
  rng.setStart(node, start);
  rng.setEnd(node, end);
  return rng.nativeRange.getBoundingClientRect().height;
}

function computeLineMetrics(node) {
  var rng,
      fix = 1,
      cur = getSelection().getRangeAt(0),
      outerRect = node.getBoundingClientRect();

  // TODO: what about ranges which are not collapsed?
  // TODO: what about node with more than a single children?

  if (!node.firstChild)
    return {line: 1, totalLines: 1};

  // compute first line height
  var text = node.firstChild;
  var firstLineHeight = rangeHeight(text, 0, 1);
  var lastLineHeight = rangeHeight(text, 0, text.wholeText.length);
  var currentLineHeight = rangeHeight(text, 0, Math.max(cur.startOffset, 1));

  // compute delta height and offset from start of the line
  var deltaHeight = 1,
      lineOffset = cur.startOffset;

  if (firstLineHeight === currentLineHeight) {
    for (var offset = text.wholeText.length - 1; offset > 0; offset--) {
      var height = rangeHeight(text, 0, offset);
      if (height !== lastLineHeight) {
        deltaHeight = lastLineHeight - height;
        break;
      }
    }
  } else {
    for (var offset = cur.startOffset - 1; offset > 0; offset--) {
      var height = rangeHeight(text, 0, offset);
      if (height !== currentLineHeight) {
        deltaHeight = currentLineHeight - height;
        lineOffset = cur.startOffset - offset;
        break;
      }
    }
  }

  if (cur.startOffset < text.wholeText.length &&
      currentLineHeight != rangeHeight(text, 0, cur.startOffset + 1)) {
    fix = 2;
    lineOffset = 0;
  }

  return {
    line: fix + (currentLineHeight - firstLineHeight) / deltaHeight,
    lineOffset: lineOffset,
    offset: cur.startOffset,
    totalLines: 1 + (lastLineHeight - firstLineHeight) / deltaHeight
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
  return r.extractContents().firstChild.wholeText.trim();
}

module.exports = {
  computeLineMetrics: computeLineMetrics,
  setCursorPosition: setCursorPosition,
  getSelectionOffset: getSelectionOffset,
  extractContentsTillEnd: extractContentsTillEnd
};

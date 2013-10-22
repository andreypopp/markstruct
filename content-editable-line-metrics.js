var rangy = require('./rangy/rangy-core'),
    textNodes = require('./content-editable-text-nodes');

/**
 * Compute relative height of a text range identified by node and offset
 *
 * @param {TextNode} node
 * @param {Number} offset
 */
function rangeHeight(node, offset) {
  var rng = rangy.createRange();
  rng.setStart(node, 0);
  rng.setEnd(node, offset === 0 ? 1 : offset);
  return rng.nativeRange.getBoundingClientRect().bottom;
}

/**
 * Go to the prev position given the current position, return null if there's
 * no place to go
 */
function prev(pos) {
  var node, idx;

  if (pos.idx === 0) {
    if (!pos.node.__prev) return null;
    node = pos.node.__prev;
    idx = pos.node.__prev.__length - 1;
  } else {
    idx = pos.idx - 1;
    node = pos.node;
  }
  pos.node = node;
  pos.idx = idx;
  return pos;
}

/**
 * Go to the prev position given the current position, return null if there's no
 * place to go
 */
function next(pos) {
  var node, idx;

  if (pos.idx >= pos.node.__length - 1) {
    if (!pos.node.__next) return null;
    node = pos.node.__next;
    idx = 0;
  } else {
    idx = pos.idx + 1;
    node = pos.node;
  }
  pos.node = node;
  pos.idx = idx;
  return pos;
}

/**
 * Compute line metrics for a current selection.
 */
module.exports = function(node) {

  if (!node.firstChild)
    return {line: 1, lineOffset: 0, offset:0, totalLines: 1};

  var fix = 1,
      sel = rangy.getSelection(),

      nodes = textNodes(node),
      firstNode = nodes[0],
      lastNode = nodes[nodes.length - 1],
      focusNode = sel.focusNode,
      focusOffset = sel.focusOffset

      length = lastNode.__index + lastNode.wholeText.length,
      start = focusNode.__index + focusOffset;

  // compute relative line heights
  var firstLineHeight = rangeHeight(firstNode, 1);
  var lastLineHeight = rangeHeight(lastNode, lastNode.__length);
  var currentLineHeight = rangeHeight(focusNode, focusOffset);

  // compute delta height and offset from start of the line
  var deltaHeight = 1,
      lineOffset = start;

  if (firstLineHeight === lastLineHeight) {
    return {line: 1, lineOffset: start, offset: start, totalLines: 1};

  } else if (firstLineHeight === currentLineHeight) {
    // go from the end to the start and see the delta height we encounter
    var pos = {node: lastNode, idx: lastNode.__length};
    while (prev(pos)) {
      var height = rangeHeight(pos.node, pos.idx);
      if (height > 0 && height !== lastLineHeight) {
        deltaHeight = lastLineHeight - height;
        break;
      }
    }

  } else {
    // go from the current position to the start and see the delta height we
    // encounter
    var pos = {node: focusNode, idx: focusOffset};
    while (prev(pos)) {
      var height = rangeHeight(pos.node, pos.idx);
      lineOffset = lineOffset - 1;
      if (height > 0 && height !== currentLineHeight) {
        deltaHeight = currentLineHeight - height;
        lineOffset = start - lineOffset;
        break;
      }
    }
  }

  // corner case: check if the next position is the new line and adjust the
  // current position accordingly
  if (start < length - 1) {
    var nextPos = next({node: focusNode, idx: focusOffset});
    if (nextPos && rangeHeight(nextPos.node, nextPos.idx) !== currentLineHeight) {
      fix = 2;
      lineOffset = 0;
    }
  }

  for (var i = 0, len = nodes.length; i < len; i++) {
    delete nodes[i].__next;
    delete nodes[i].__prev;
    delete nodes[i].__length;
    delete nodes[i].__index;
  }

  return {
    line: fix + (currentLineHeight - firstLineHeight) / deltaHeight,
    lineOffset: lineOffset,
    offset: start,
    totalLines: 1 + (lastLineHeight - firstLineHeight) / deltaHeight
  }
}

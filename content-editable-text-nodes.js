/**
 * Return a double linked list of text nodes inside a given node
 *
 * @param {ElementNode} node
 */
module.exports = function(node, includeTokens) {
  if (node.nodeType === Node.TEXT_NODE) {
    node.__index = 0;
    node.__length = node.wholeText.length;
    node.__next = undefined;
    node.__prev = undefined;
    return [node];
  }

  var queue = [node],
      prev = undefined,
      idx = 0,
      totalIdx = 0,
      nodes = [];

  while (queue.length > 0) {
    var node = queue.shift();

    if (node.nodeType === Node.TEXT_NODE) {
      if (prev) {
        prev.__next = node;
        node.__prev = prev;
      } else {
        node.__next = undefined;
        node.__prev = undefined;
      }
      node.__index = idx;
      node.__totalIndex = totalIdx;
      node.__length = node.wholeText.length;
      idx = idx + node.wholeText.length;
      totalIdx = totalIdx + node.wholeText.length;
      nodes.push(node)
      prev = node;
    } else if (includeTokens && node.dataset.token !== undefined) {
      if (prev) {
        prev.__next = node;
        node.__prev = prev;
      } else {
        node.__next = undefined;
        node.__prev = undefined;
      }
      node.__totalIndex = totalIdx;
      node.__length = node.textContent.length
      totalIdx = totalIdx + node.textContent.length;
      nodes.push(node);
      prev = node;
    } else if (node.childNodes && node.childNodes.length > 0) {
      for (var i = node.childNodes.length - 1; i > -1; i--)
        queue.unshift(node.childNodes[i]);
    }
  }

  return nodes;
}

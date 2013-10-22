/**
 * Return a double linked list of text nodes inside a given node
 *
 * @param {ElementNode} node
 */
module.exports = function(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    node.__index = 0;
    node.__length = node.wholeText.length;
    return [node];
  }

  var queue = [node],
      prev = undefined,
      idx = 0,
      nodes = [];

  while (queue.length > 0) {
    var node = queue.shift();

    if (node.nodeType === Node.TEXT_NODE) {
      if (prev) {
        node.__prev = prev;
        prev.__next = node;
      }
      node.__index = idx;
      node.__length = node.wholeText.length;
      idx = idx + node.wholeText.length;
      nodes.push(node)
      prev = node;
    } else if (node.childNodes.length > 0) {
      for (var i = 0, len = node.childNodes.length; i < len; i++)
        queue.push(node.childNodes[i]);
    }
  }

  return nodes;
}

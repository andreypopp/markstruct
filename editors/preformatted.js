var React                       = require('react-tools/build/modules/React'),
    rangy                       = require('../rangy/rangy-core'),
    Focusable                   = require('../focusable'),
    keys                        = require('../keys');

module.exports = React.createClass({
  mixins: [Focusable],

  getContent: function() {
    return this.getDOMNode().textContent;
  },

  getCaretPosition: function() {
    return computeLineMetrics(this.getDOMNode());
  },

  render: function() {
    return this.transferPropsTo(
      React.DOM.pre({
        contentEditable: "true",
        onKeyDown: this.onKeyDown,
        className: "Editor",
        dangerouslySetInnerHTML: {__html: this.props.content}
      }));
  },

  onKeyDown: function(e) {
    if (keys.match(e, keys.ENTER)) {
      e.preventDefault();
      insertNewLine(this.getDOMNode());
    } else if (keys.match(e, keys.TAB)) {
      e.preventDefault();
      insertString(this.getDOMNode(), this.props.tabAs || '  ');
    } else if (this.props.onKeyDown(e)) {
      this.props.onKeyDown(e);
    }
  }
});

function computeLineMetrics(node) {
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

function insertString(node, str) {
  var s = rangy.getSelection(),
      offset = s.getRangeAt(0).startOffset,
      text = node.firstChild;

  var before = text.wholeText.substr(0, offset),
      after = text.wholeText.substr(offset, text.wholeText.length);

  var replacement = document.createTextNode(before + str + after);
  node.replaceChild(replacement, text);

  setCursorPosition(replacement, offset + str.length);
}

function setCursorPosition(node, offset) {
  var s = rangy.getSelection(),
      r = rangy.createRange();
  r.setStart(node, offset);
  r.collapse(true);
  s.setSingleRange(r);
}

function insertNewLine(node) {
  var s = rangy.getSelection(),
      offset = s.getRangeAt(0).startOffset,
      text = node.firstChild;

  var before = text.wholeText.substr(0, offset),
      after = text.wholeText.substr(offset, text.wholeText.length);

  if (after.length === 0) after = '\n';

  var replacement = document.createTextNode(before + '\n' + after);
  node.replaceChild(replacement, text);

  setCursorPosition(replacement, offset + 1);
}

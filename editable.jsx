var React               = require('react-tools/build/modules/React'),
    keys                = require('./keys'),
    utils               = require('./utils');

var EditableMixin = {
  restoreFocus: function() {
    if (this.props.focus) {
      var node = this.getDOMNode();
      node.focus();
      if (this.props.focusOffset > 0)
        utils.setCursorPosition(node.firstChild, this.props.focusOffset);
    }
  },

  componentDidMount: function() {
    this.restoreFocus();
  },

  componentDidUpdate: function() {
    this.restoreFocus();
  },

  value: function() {
    return this.getDOMNode().textContent.trim();
  },

  render: function() {
    return this.transferPropsTo(
      this.component({
        contentEditable: "true",
        onKeyDown: this.onKeyDown || this.props.onKeyDown,
        className: "Editable",
        dangerouslySetInnerHTML: {__html: this.props.block.content}
      }));
  }
};

var Editable = React.createClass({
  mixins: [EditableMixin],
  component: React.DOM.div,

  computeLineMetrics: function() {
    return utils.computeLineMetrics(this.getDOMNode());
  }
});

var EditablePreformatted = React.createClass({
  mixins: [EditableMixin],
  component: React.DOM.pre,

  computeLineMetrics: function() {
    return utils.computeLineMetricsPre(this.getDOMNode());
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

function insertString(node, str) {
  var s = rangy.getSelection(),
      offset = s.getRangeAt(0).startOffset,
      text = node.firstChild;

  var before = text.wholeText.substr(0, offset),
      after = text.wholeText.substr(offset, text.wholeText.length);

  var replacement = document.createTextNode(before + str + after);
  node.replaceChild(replacement, text);

  utils.setCursorPosition(replacement, offset + str.length);
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

  utils.setCursorPosition(replacement, offset + 1);
}

module.exports = {
  Editable: Editable,
  EditablePreformatted: EditablePreformatted,
  EditableMixin: EditableMixin
};

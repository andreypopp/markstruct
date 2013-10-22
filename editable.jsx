var React                       = require('react-tools/build/modules/React'),
    assign                      = require('lodash').assign,
    isString                    = require('lodash').isString,
    Focusable                   = require('./focusable'),
    keys                        = require('./keys'),
    utils                       = require('./utils'),
    contentEditableLineMetrics  = require('./content-editable-line-metrics');

var EditableMixin = assign({}, Focusable, {
  restoreFocus: function() {
    if (this.props.focus) {
      var node = this.getDOMNode();
      node.focus();
      if (this.props.focusOffset > 0)
        utils.setCursorPosition(node.firstChild, this.props.focusOffset);
    }
  },

  value: function() {
    return this.getDOMNode().textContent;
  },

  renderContent: function(content) {
    var text = this.props.block.content,
        annotations = this.props.block.annotations,
        content = [];

    // assume they are sorted by its range
    if (annotations && annotations.length > 0) {
      if (annotations[0].range[0] > 0) {
        content.push(text.substring(0, annotations[0].range[0]));
      }

      annotations.forEach(function(ann) {
        var region = text.substring(ann.range[0], ann.range[1]);
        switch(ann.type) {
          case 'em':
            content.push(<span className="Annotation Emphasis">{region}</span>);
            break;
          default:
            content.push(region);
        }
      });

      var last = annotations[annotations.length - 1].range;

      if (last[1] < text.length)
        content.push(text.substring(last[1], text.length));

    } else {
      content.push(text);
    }
    return content;
  },

  render: function() {
    var component = this.component || React.DOM.div;
    return this.transferPropsTo(
      component({
        contentEditable: "true",
        onKeyDown: this.onKeyDown || this.props.onKeyDown,
        className: "Editable",
      }, this.renderContent()));
  }
});

var Editable = React.createClass({
  mixins: [EditableMixin],
  component: React.DOM.div,

  computeLineMetrics: function() {
    return contentEditableLineMetrics(this.getDOMNode());
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

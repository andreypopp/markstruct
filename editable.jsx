var React               = require('react-tools/build/modules/React'),
    keys                = require('./keys'),
    utils               = require('./utils');

module.exports = React.createClass({

  restoreFocus: function() {
    if (this.props.focus) {
      var node = this.getDOMNode();
      node.focus();
      if (this.props.focusOffset > 0)
        utils.setCursorPosition(node.firstChild, this.props.focusOffset);
    }
  },

  computeLineMetrics: function() {
    return utils.computeLineMetrics(this.getDOMNode());
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

  onKeyDown: function(e) {
    if (this.props.preformatted && keys.match(e, keys.ENTER)) {
      e.preventDefault();
      var s = rangy.getSelection(),
          offset = s.getRangeAt(0).startOffset,
          node = this.getDOMNode().firstChild,
          text = node.wholeText;

      var before = text.substr(0, offset),
          after = text.substr(offset, text.length);

      var replacement = document.createTextNode(before + '\n' + after);
      node.parentNode.replaceChild(replacement, node);
      // TODO: how to set cursor on a new line?
      var rng = rangy.createRange();
      rng.setStartAfter(replacement);
      rng.setEndAfter(replacement);
      s.setSingleRange(rng);
    }
    if (this.props.onKeyDown(e))
      this.props.onKeyDown(e);
  },

  render: function() {
    var component = this.props.preformatted ? React.DOM.pre : React.DOM.div;
    return this.transferPropsTo(
      component({
        contentEditable: "true",
        onKeyDown: this.onKeyDown,
        onCompositionStart: this.onCompositionStart,
        className: "Editable",
        dangerouslySetInnerHTML: {__html: this.props.block.content + '\n'}
      }));
  }
});

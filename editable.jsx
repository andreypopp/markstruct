var React               = require('react-tools/build/modules/React'),
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

  render: function() {
    return this.transferPropsTo(
      <div contentEditable="true"
        onCompositionStart={this.onCompositionStart}
        className="Editable"
        dangerouslySetInnerHTML={{__html: this.props.block.content}} />
    );
  }
});

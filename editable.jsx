var React               = require('react-tools/build/modules/React'),
    showdown            = require('showdown'),
    utils               = require('./utils');


function renderMarkdown(markdown) {
  var html = new showdown.converter().makeHtml(markdown);
  return html.replace(/^<p>/, '').replace(/<\/p>$/, '');
}

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
    var content = (this.props.focus || !this.props.renderMarkdown) ?
      this.props.block.content :
      renderMarkdown(this.props.block.content);
    return this.transferPropsTo(
      <div contentEditable="true"
        onCompositionStart={this.onCompositionStart}
        className="Editable"
        dangerouslySetInnerHTML={{__html: content}} />
    );
  }
});

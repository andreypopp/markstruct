var React               = require('react-tools/build/modules/React'),
    BlockMixin          = require('../block-mixin'),
    keys                = require('../keys');

module.exports = React.createClass({
  mixins: [BlockMixin],

  onKeyDown: function(e) {
    if (e.keyCode === keys.BACKSPACE) {
      this.props.editor.remove(this.props.block);
      e.preventDefault();
    }
  },

  restoreFocus: function() {
    if (this.props.focus)
      this.refs.image.getDOMNode().focus();
  },

  componentDidMount: function() {
    this.restoreFocus();
  },

  componentDidUpdate: function() {
    this.restoreFocus();
  },

  render: function() {
    var className = "Block Image" + (this.props.focus ? " Focused" : "");
    return (
      <div className={className}>
        <img 
          ref="image"
          tabIndex="0"
          onBlur={this.props.editor.updateFocus.bind(null, null)}
          onFocus={this.props.editor.updateFocus.bind(null, this.props.block)}
          onKeyDown={this.handleOnKeyDown}
          src={this.props.block.content} />
      </div>
    );
  }
});


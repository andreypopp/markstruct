var React               = require('react-tools/build/modules/React'),
    TextBlockMixin      = require('../text-block-mixin'),
    keys                = require('../keys');

module.exports = React.createClass({
  mixins: [TextBlockMixin],

  onInput: function() {
    var content = this.props.block.content;
    if (content !== '***')
      this.changeBlock({type: 'paragraph'})
  },

  onKeyDown: function(e) {
    if (e.keyCode === keys.BACKSPACE) {
      this.props.editor.remove(this.props.block);
      e.preventDefault();
    }
  },

  render: function() {
    var className = "Block Line" + (this.props.focus ? " Focused" : "");
    return <div tabindex="1" className={className}>{this.renderEditable()}</div>;
  }
});

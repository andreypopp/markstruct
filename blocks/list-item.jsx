var React               = require('react-tools/build/modules/React'),
    BlockMixin          = require('../block-mixin'),
    keys                = require('../keys'),
    getSelectionOffset  = require('../utils').getSelectionOffset;

module.exports = React.createClass({
  mixins: [BlockMixin],
  renderMarkdown: true,

  insertAfterType: 'listitem',

  onKeyDown: function(e) {
    if (e.keyCode === keys.BACKSPACE && getSelectionOffset() === 0) {
      this.changeBlock({type: 'paragraph'})
      e.preventDefault();
    }
  },

  render: function() {
    var className = "Block ListItem" + (this.props.focus ? " Focused" : "");
    return <div className={className}>{this.renderEditable()}</div>;
  }
});

var React               = require('react-tools/build/modules/React'),
    BlockMixin          = require('../block-mixin'),
    keys                = require('../keys'),
    getSelectionOffset  = require('../utils').getSelectionOffset;

module.exports = React.createClass({
  mixins: [BlockMixin],

  onKeyDown: function(e) {
    if (e.shiftKey && e.keyCode === keys.KEY3 && getSelectionOffset() === 0) {
      if (this.props.block.level < 6) {
        this.changeBlock({level: this.props.block.level + 1})
        e.preventDefault();
      }
    } else if (e.keyCode === keys.BACKSPACE && getSelectionOffset() === 0) {
      if (this.props.block.level === 1)
        this.changeBlock({type: 'paragraph', level: undefined})
      else
        this.changeBlock({level: this.props.block.level - 1});
      e.preventDefault();
    }
  },

  render: function() {
    var className = "Block Heading Heading" + this.props.block.level + (this.props.focus ? " Focused" : "");
    return <div className={className}>{this.renderEditable()}</div>;
  }
});


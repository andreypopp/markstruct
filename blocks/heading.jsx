var React               = require('react-tools/build/modules/React'),
    TextBlockMixin      = require('../text-block-mixin'),
    keys                = require('../keys'),
    getSelectionOffset  = require('../utils').getSelectionOffset;

module.exports = React.createClass({
  mixins: [TextBlockMixin],

  onInput: function() {
    var content = this.props.block.content;
    if (content.match(/^(#+)/)) {
      var level = content.match(/^(#+)/)[0].length;
      this.changeBlock({
        type: 'heading',
        content: content.slice(level),
        level: this.props.block.level + level
      });
    }
  },

  onDegrade: function() {
    if (this.props.block.level === 1)
      this.changeBlock({type: 'paragraph', level: undefined})
    else
      this.changeBlock({level: this.props.block.level - 1});
  },

  onKeyDown: function(e) {
    if (keys.match(e, keys.KEY3, {shiftKey: true}) && getSelectionOffset() === 0) {
      this.changeBlock({
        type: 'heading',
        content: this.props.block.content,
        level: this.props.block.level + 1
      });
      e.preventDefault();
    }
  },

  render: function() {
    var className = "Block Heading Heading" +
      this.props.block.level +
      (this.props.focus ? " Focused" : "");
    return <div className={className}>{this.renderEditable()}</div>;
  }
});


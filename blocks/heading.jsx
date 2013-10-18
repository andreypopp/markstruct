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
      console.log(level, content, content.slice(level));
      this.changeBlock({
        type: 'heading',
        content: content.slice(level),
        level: this.props.block.level + level
      });
    }
  },

  onKeyDown: function(e) {
    if (e.keyCode === keys.BACKSPACE && getSelectionOffset() === 0) {
      if (this.props.block.level === 1)
        this.changeBlock({type: 'paragraph', level: undefined})
      else
        this.changeBlock({level: this.props.block.level - 1});
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


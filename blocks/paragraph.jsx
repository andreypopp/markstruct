var React               = require('react-tools/build/modules/React'),
    TextBlockMixin      = require('../text-block-mixin'),
    keys                = require('../keys'),
    getSelectionOffset  = require('../utils').getSelectionOffset;

module.exports = React.createClass({
  mixins: [TextBlockMixin],

  renderMarkdown: true,

  onInput: function() {
    var content = this.props.block.content;
    if (content.match(/^\*\*\*$/)) {
      this.changeBlock({
        type: 'line'
      });
    } else if (content.match(/^(#+)/)) {
      var level = content.match(/^(#+)/)[0].length;
      this.changeBlock({
        type: 'heading',
        content: content.slice(level),
        level: level
      });
    } else if (content.match(/^\* /)) {
      this.changeBlock({
        type: 'listitem',
        content: this.props.block.content.slice(2)
      });
    } else if (content.match(/^!\[\]\(([^\)]+)\)$/)) {
      var match = content.match(/^!\[\]\(([^\)]+)\)$/);
      this.changeBlock({
        type: 'image',
        content: match[1]
      });
    }
  },

  onKeyDown: function(e) {
    if (e.keyCode === keys.BACKSPACE && getSelectionOffset() === 0) {
      this.props.editor.mergeWithPrevious(this.props.block);
      e.preventDefault();
    }
  },

  render: function() {
    var className = "Block Paragraph" + (this.props.focus ? " Focused" : "");
    return <div className={className}>{this.renderEditable()}</div>;
  }
});

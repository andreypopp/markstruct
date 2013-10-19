var React               = require('react-tools/build/modules/React'),
    TextBlockMixin      = require('../text-block-mixin');

module.exports = React.createClass({
  mixins: [TextBlockMixin],

  onInput: function() {
    var content = this.props.block.content;
    if (content.match(/^---$/)) {
      this.updateBlock({
        type: 'line'
      });
    } else if (content.match(/^```/)) {
      this.updateBlock({
        type: 'code',
        content: content.slice(3)
      });
    } else if (content.match(/^(#+)/)) {
      var level = content.match(/^(#+)/)[1].length;
      this.updateBlock({
        type: 'heading',
        content: content.slice(level),
        level: level
      });
    } else if (content.match(/^\*/)) {
      this.updateBlock({
        type: 'listitem',
        content: this.props.block.content.slice(1)
      });
    } else if (content.match(/^!\[\]\(([^\)]+)\)$/)) {
      var match = content.match(/^!\[\]\(([^\)]+)\)$/);
      this.updateBlock({
        type: 'image',
        content: match[1]
      });
    }
  },

  onDegrade: function() {
    this.props.editor.mergeWithPrevious(this.props.block);
  },

  render: function() {
    var className = "Block Paragraph" + (this.props.focus ? " Focused" : "");
    return <div className={className}>{this.renderEditable()}</div>;
  }
});

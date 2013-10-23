var React               = require('react-tools/build/modules/React'),
    Editor              = require('../editors/rich'),
    TextBlockMixin      = require('../text-block-mixin');

module.exports = React.createClass({
  mixins: [TextBlockMixin],
  editorComponent: Editor,

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
    } else if (content.match(/^(#+)\s/)) {
      var level = content.match(/^(#+)\s/)[1].length;
      this.updateBlock({
        type: 'heading',
        content: content.slice(level + 1),
        level: level
      });
    } else if (content.match(/^\*\s/)) {
      this.updateBlock({
        type: 'listitem',
        content: this.props.block.content.slice(2)
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
    return <div className={className}>{this.renderEditor()}</div>;
  }
});

var React               = require('react-tools/build/modules/React'),
    assign              = require('lodash').assign,
    block               = require('../block'),
    Editor              = require('../editors/rich'),
    TextBlockMixin      = require('../text-block-mixin');

module.exports = React.createClass({
  mixins: [TextBlockMixin],
  editorComponent: Editor,

  tryUpgrade: function(content) {
    content = content.replace(/&nbsp;/g, ' ');
    if (content.match(/^---$/)) {
      this.updateBlock({
        type: 'line'
      });
      return true;
    } else if (content.match(/^```/)) {
      this.updateBlock({
        type: 'code',
        content: content.slice(3),
        annotations: []
      });
      return true;
    } else if (content.match(/^(#+)\s/)) {
      var level = content.match(/^(#+)\s/)[1].length;
      this.updateBlock({
        type: 'heading',
        content: content.slice(level + 1),
        level: level,
        annotations: []
      });
      return true;
    } else if (content.match(/^\*\s/)) {
      this.updateBlock({
        type: 'listitem',
        content: content.slice(2),
        annotations: []
      });
      return true;
    } else if (content.match(/^!\[\]\(([^\)]+)\)$/)) {
      var match = content.match(/^!\[\]\(([^\)]+)\)$/);
      this.updateBlock({
        type: 'image',
        content: match[1]
      });
      return true;
    }
    return false;
  },

  onDegrade: function() {
    this.props.editor.mergeWithPrevious(this.props.block);
  },

  render: function() {
    var className = "Block Paragraph" + (this.props.focus ? " Focused" : "");
    return <div className={className}>{this.renderEditor()}</div>;
  }
});

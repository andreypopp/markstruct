var React               = require('react-tools/build/modules/React'),
    rangy               = require('../rangy/rangy-core'),
    Editor              = require('../editors/rich'),
    TextBlockMixin      = require('../text-block-mixin'),
    keys                = require('../keys');

module.exports = React.createClass({
  mixins: [TextBlockMixin],
  editorComponent: Editor,

  tryUpgrade: function(content) {
    if (content.match(/^(#+)/)) {
      var level = content.match(/^(#+)/)[0].length;
      this.updateBlock({
        type: 'heading',
        content: content.slice(level),
        level: this.props.block.level + level
      });
    }
  },

  onDegrade: function() {
    if (this.props.block.level === 1)
      this.updateBlock({type: 'paragraph', level: undefined})
    else
      this.updateBlock({level: this.props.block.level - 1});
  },

  onKeyDown: function(e) {
    var offset = rangy.getSelection().focusOffset;
    if (keys.match(e, keys.KEY3, {shiftKey: true}) && offset === 0) {
      this.updateBlock({
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
    return <div className={className}>{this.renderEditor()}</div>;
  }
});


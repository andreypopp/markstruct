var React               = require('react-tools/build/modules/React'),
    BlockMixin          = require('../block-mixin'),
    keys                = require('../keys'),
    getSelectionOffset  = require('../utils').getSelectionOffset;

module.exports = React.createClass({
  mixins: [BlockMixin],

  renderMarkdown: true,

  onKeyDown: function(e) {
    if (e.shiftKey && e.keyCode === keys.KEY3 && getSelectionOffset() === 0) {
      this.changeBlock({type: 'heading', level: 1});
      e.preventDefault();
    } else if (e.keyCode === keys.SPACE && getSelectionOffset() === 1 && this.props.block.content[0] === '*') {
      this.changeBlock({type: 'listitem', content: this.props.block.content.slice(1)});
      e.preventDefault();
    } else if (e.shiftKey && e.keyCode === keys.KEY8 && getSelectionOffset() === 2 && this.props.block.content === '**') {
      this.changeBlock({type: 'line', content: '***'});
      e.preventDefault();
    } else if (e.keyCode === keys.BACKSPACE && getSelectionOffset() === 0) {
      this.props.editor.mergeWithPrevious(this.props.block);
      e.preventDefault();
    }
  },

  render: function() {
    var className = "Block Paragraph" + (this.props.focus ? " Focused" : "");
    return <div className={className}>{this.renderEditable()}</div>;
  }
});

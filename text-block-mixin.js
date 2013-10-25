var assign                  = require('lodash').assign,
    BlockMixin              = require('./block-mixin'),
    rangy                   = require('./rangy/rangy-core'),
    block                   = require('./block'),
    keys                    = require('./keys');

function isDegradeEvent(e) {
  var s = rangy.getSelection(),
      isFirst = s.focusNode.parentNode.firstChild === s.focusNode;
  return isFirst && s.focusOffset === 0 && e.keyCode === keys.BACKSPACE && s.isCollapsed;
}

module.exports = assign({}, BlockMixin, {

  insertAfterWithContent: function() {
    var editor = this.refs.editor,
        idx = editor.getCaretOffset(),
        content = editor.getContent();

    var blocks = block.split(this.props.block, idx);

    assign(this.props.block, blocks.original);
    this.props.editor.insertAfter(
      this.props.block,
      assign({type: this.insertAfterType || 'paragraph'}, blocks.splitted));
  },

  handleKeyCommon: function(e) {
    if (isDegradeEvent(e)) {
      if (this.onDegrade)
        this.onDegrade()
      else
        this.updateBlock({type: 'paragraph'});
      return true;
    } else if (e.keyCode === keys.BACKSPACE) {
      // do nothing, just prevent BlockMixin's handling of BACKSPACE
      return false;
    } else if (keys.match(e, keys.ARROW_UP)) {
      var caret = this.refs.editor.getCaretPosition();
      if (caret.line === 1) {
        this.props.editor.focusBefore(this.props.block);
        return true;
      }
    } else if (keys.match(e, keys.ARROW_DOWN)) {
      var caret = this.refs.editor.getCaretPosition();
      if (caret.line === caret.totalLines) {
        this.props.editor.focusAfter(this.props.block);
        return true;
      }
    } else if (keys.match(e, keys.ENTER)) {
      this.insertAfterWithContent();
      return true;
    } else {
      return BlockMixin.handleKeyCommon.call(this, e);
    }
  },

  onUpdate: function(update) {
    assign(this.props.block, update);
    return false;
  },

  renderEditor: function(props) {
    var defaultProps = {
      content: this.props.block.content,
      annotations: this.props.block.annotations,
      focus: this.props.focus,
      focusOffset: this.props.focusOffset,

      onKeyDown: this.onKeyDown,
      onUpdate: this.onUpdate,
      onMarkupUpdate: this.tryUpgrade,
      onCaretOffsetUpdate: this.props.editor.updatePosition.bind(
          null, this.props.block),
      ref: "editor"
    };
    return this.editorComponent(assign({}, defaultProps, props));
  }
});

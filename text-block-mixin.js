var assign                  = require('lodash').assign,
    BlockMixin              = require('./block-mixin'),
    rangy                   = require('./rangy/rangy-core'),
    keys                    = require('./keys');

function isDegradeEvent(e) {
  var s = rangy.getSelection(),
      isFirst = s.focusNode.parentNode.firstChild === s.focusNode;
  return isFirst && s.focusOffset === 0 && e.keyCode === keys.BACKSPACE && s.isCollapsed;
}

module.exports = assign({}, BlockMixin, {

  insertAfterWithContent: function() {
    var editor = this.refs.editor,
        caret = editor.getCaretPosition(),
        content = editor.getContent();

    this.props.block.content = content.substring(0, caret.offset);
    this.props.editor.insertAfter(this.props.block, {
      type: this.insertAfterType || 'paragraph',
      content: content.substring(caret.offset, content.length)
    });
  },

  onUpdate: function(update) {
    this.props.block.annotations = update.annotations;
    this.props.block.content = update.content;
    if (this.tryUpgrade)
      return this.tryUpgrade(update.markdown);
  },

  onCaretOffsetUpdate: function(offset) {
    this.props.editor.updatePosition(this.props.block, offset);
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

  renderEditor: function(props) {
    var defaultProps = {
      content: this.props.block.content,
      annotations: this.props.block.annotations,
      focus: this.props.focus,
      focusOffset: this.props.focusOffset,

      onKeyDown: this.onKeyDown,
      onUpdate: this.onUpdate,
      onCaretOffsetUpdate: this.onCaretOffsetUpdate,

      ref: "editor"
    };
    return this.editorComponent(assign({}, defaultProps, props));
  }
});

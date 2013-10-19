    keys                = require('./keys');

module.exports = {

  updateBlock: function(changes) {
    this.props.editor.updateBlock(this.props.block, changes);
  },

  componentDidMount: function() {
    if (this.onInput) this.onInput();
  },

  componentDidUpdate: function() {
    if (this.onInput) this.onInput();
  },

  handleOnKeyDown: function(e) {
    if (this.onKeyDownCommon(e))
      e.preventDefault()
    else if (this.onKeyDown)
      this.onKeyDown(e);
  },

  insertAfterBlock: function() {
    this.props.editor.insertAfter(this.props.block, {
      type: this.insertAfterType || 'paragraph',
      content: ''
    });
  },

  onKeyDownCommon: function(e) {
    if (keys.match(e, keys.ARROW_UP, {altKey: true})) {
      this.props.editor.focusBefore(this.props.block);
      return true;
    } else if (keys.match(e, keys.ARROW_DOWN, {altKey: true})) {
      this.props.editor.focusAfter(this.props.block);
      return true;
    } else if (keys.match(e, keys.ARROW_UP, {shiftKey: true})) {
      this.props.editor.moveUp(this.props.block);
      return true;
    } else if (keys.match(e, keys.ARROW_DOWN, {shiftKey: true})) {
      this.props.editor.moveDown(this.props.block);
      return true;
    } else if (keys.match(e, keys.ARROW_UP)) {
      this.props.editor.focusBefore(this.props.block);
      return true;
    } else if (keys.match(e, keys.ARROW_DOWN)) {
      this.props.editor.focusAfter(this.props.block);
      return true;
    } else if (keys.match(e, keys.BACKSPACE)) {
      this.props.editor.remove(this.props.block);
      return true;
    } else if (keys.match(e, keys.ENTER, {metaKey: true})) {
      this.insertAfterBlock();
      return true;
    } else if (keys.match(e, keys.ENTER, {ctrlKey: true})) {
      this.insertAfterBlock();
      return true;
    } else if (keys.match(e, keys.ENTER)) {
      this.insertAfterBlock();
      return true;
    }
    return false;
  }
};

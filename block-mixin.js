var utils               = require('lodash'),
    keys                = require('./keys');

module.exports = {

  changeBlock: function(changes) {
    utils.assign(this.props.block, changes);
    this.props.editor.forceUpdate();
  },

  updateFocusPosition: function(e) {
    this.props.editor.updateFocus(this.props.block, 0);
  },

  updateContent: function() {
    this.props.block.content = this.refs.editable.value();
  },

  handleOnInput: function() {
    this.updateContent();
    if (this.onInput) this.onInput();
  },

  handleOnKeyDown: function(e) {
    if (this.onKeyDownCommon(e))
      e.preventDefault()
    else if (this.onKeyDown)
      this.onKeyDown(e);
  },

  onKeyDownCommon: function(e) {
    if (e.altKey && e.keyCode === keys.ARROW_UP) {
      this.props.editor.focusBefore(this.props.block);
      return true;
    } else if (e.altKey && e.keyCode === keys.ARROW_DOWN) {
      this.props.editor.focusAfter(this.props.block);
      return true;
    } else if (e.shiftKey && e.keyCode === keys.ARROW_UP) {
      this.props.editor.moveUp(this.props.block);
      return true;
    } else if (e.shiftKey && e.keyCode === keys.ARROW_DOWN) {
      this.props.editor.moveDown(this.props.block);
      return true;
    } else if (e.keyCode === keys.ARROW_UP) {
      this.props.editor.focusBefore(this.props.block);
      return true;
    } else if (e.keyCode === keys.ARROW_DOWN) {
      this.props.editor.focusAfter(this.props.block);
      return true;
    } else if (e.keyCode === keys.ENTER) {
      this.props.editor.insertAfter(this.props.block, {
        type: this.insertAfterType || 'paragraph',
        content: ''
      });
      return true;
    }
    return false;
  }
};

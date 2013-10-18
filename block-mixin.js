var utils               = require('lodash'),
    Editable            = require('./editable.jsx'),
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
    if (this.commonKeyDownHanlder(e))
      e.preventDefault()
    else if (this.onKeyDown)
      this.onKeyDown(e);
  },

  commonKeyDownHanlder: function(e) {
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
      lineInfo = this.refs.editable.computeLineMetrics();
      if (lineInfo.line === 1) {
        this.props.editor.focusBefore(this.props.block);
        return true;
      }
    } else if (e.keyCode === keys.ARROW_DOWN) {
      lineInfo = this.refs.editable.computeLineMetrics();
      if (lineInfo.line === lineInfo.totalLines) {
        this.props.editor.focusAfter(this.props.block);
        return true;
      }
    } else if (e.keyCode === keys.ENTER) {
      var contents;
      if (this.refs.editable.value().length > 0) {
        var s = rangy.getSelection(),
            r = s.getRangeAt(0);
        r.setEndAfter(this.refs.editable.getDOMNode().firstChild);
        contents = r.extractContents().firstChild.wholeText.trim();
        this.updateContent();
      } else {
        contents = '';
      }
      this.props.editor.insertAfter(this.props.block, contents);
      return true;
    }
    return false;
  },

  renderEditable: function() {
    return Editable({
      onSelect: this.updateFocusPosition,
      block: this.props.block,
      focus: this.props.focus,
      focusOffset: this.props.focusOffset,
      renderMarkdown: this.renderMarkdown,
      onBlur: this.props.editor.updateFocus.bind(null, null),
      onFocus: this.props.editor.updateFocus.bind(null, this.props.block),
      onKeyDown: this.handleOnKeyDown,
      onInput: this.handleOnInput,
      ref: "editable"})
  }
};

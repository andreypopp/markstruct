var utils                   = require('lodash'),
    Editable                = require('./editable.jsx'),
    BlockMixin              = require('./block-mixin'),
    extractContentsTillEnd  = require('./utils').extractContentsTillEnd,
    keys                    = require('./keys');

module.exports = utils.assign({}, BlockMixin, {
  
  onKeyDownCommon: function(e) {
    if (keys.match(e, keys.ARROW_UP)) {
      if (this.refs.editable.computeLineMetrics().line === 1) {
        this.props.editor.focusBefore(this.props.block);
        return true;
      }
    } else if (keys.match(e, keys.ARROW_DOWN)) {
      var lineInfo = this.refs.editable.computeLineMetrics();
      if (lineInfo.line === lineInfo.totalLines) {
        this.props.editor.focusAfter(this.props.block);
        return true;
      }
    } else if (keys.match(e, keys.ENTER)) {
      var content = extractContentsTillEnd(this.refs.editable.getDOMNode());
      this.updateContent();
      this.props.editor.insertAfter(this.props.block, {
        type: this.insertAfterType || 'paragraph',
        content: content
      });
      return true;
    } else {
      return BlockMixin.onKeyDownCommon.call(this, e);
    }
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
});

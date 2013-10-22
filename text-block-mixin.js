var assign                  = require('lodash').assign,
    editable                = require('./editable.jsx'),
    BlockMixin              = require('./block-mixin'),
    utils                   = require('./utils'),
    rangy                   = require('./rangy/rangy-core'),
    keys                    = require('./keys');

function isDegradeEvent(e) {
  var s = rangy.getSelection();
  return s.focusOffset === 0 && e.keyCode === keys.BACKSPACE && s.isCollapsed;
}

module.exports = assign({}, BlockMixin, {

  insertAfterWithContent: function() {
    var content = utils.extractContentsTillEnd(this.refs.editable.getDOMNode());
    this.updateContent();
    this.props.editor.insertAfter(this.props.block, {
      type: this.insertAfterType || 'paragraph',
      content: content
    });
  },

  updateContent: function() {
    this.props.block.content = this.refs.editable.value();
  },

  handleOnInput: function() {
    this.updateContent();
    if (this.onInput) this.onInput();
  },
  
  onKeyDownCommon: function(e) {
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
      this.insertAfterWithContent();
      return true;
    } else {
      return BlockMixin.onKeyDownCommon.call(this, e);
    }
  },

  onKeyUp: function() {
  },

  renderEditable: function(props) {
    var defaultProps = {
      block: this.props.block,
      focus: this.props.focus,
      focusOffset: this.props.focusOffset,
      renderMarkdown: this.renderMarkdown,
      onFocus: this.props.editor.updateFocus.bind(null, this.props.block),
      onKeyDown: this.handleOnKeyDown,
      onKeyUp: this.onKeyUp,
      onInput: this.handleOnInput,
      ref: "editable"
    };
    var editableComponent = this.editableComponent || editable.Editable;
    return editableComponent(assign({}, defaultProps, props));
  }
});

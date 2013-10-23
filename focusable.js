module.exports = {
  restoreFocus: function() {
    if (this.props.focus) {
      this.getDOMNode().focus();
      if (this.restoreFocusOffset)
        this.restoreFocusOffset();
    }
  },

  componentDidMount: function() {
    this.restoreFocus();
  },

  componentDidUpdate: function() {
    this.restoreFocus();
  }
};

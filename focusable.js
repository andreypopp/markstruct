module.exports = {
  restoreFocus: function() {
    if (this.props.focus)
      this.getDOMNode().focus();
  },

  componentDidMount: function() {
    this.restoreFocus();
  },

  componentDidUpdate: function() {
    this.restoreFocus();
  }
};

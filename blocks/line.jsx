var React               = require('react-tools/build/modules/React'),
    BlockMixin          = require('../block-mixin'),
    Focusable           = require('../focusable'),
    keys                = require('../keys');

var Line = React.createClass({
  mixins: [Focusable],
  render: function() {
    return this.transferPropsTo(React.DOM.div({tabIndex: "0"}, "***"));
  }
});

module.exports = React.createClass({
  mixins: [BlockMixin],

  render: function() {
    var className = "Block Line" + (this.props.focus ? " Focused" : "");
    return (
      <div className={className}>
        <Line
          focus={this.props.focus}
          onFocus={this.props.editor.updateFocus.bind(null, this.props.block)}
          onKeyDown={this.handleOnKeyDown}
          />
      </div>
    );
  }
});

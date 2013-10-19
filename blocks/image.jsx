var React               = require('react-tools/build/modules/React'),
    BlockMixin          = require('../block-mixin'),
    Focusable           = require('../focusable'),
    keys                = require('../keys');

var Image = React.createClass({
  mixins: [Focusable],
  render: function() {
    return this.transferPropsTo(React.DOM.img({tabIndex: "0"}));
  }
});

module.exports = React.createClass({
  mixins: [BlockMixin],

  render: function() {
    var className = "Block Image" + (this.props.focus ? " Focused" : "");
    return (
      <div className={className}>
        <Image
          focus={this.props.focus}
          onBlur={this.props.editor.updateFocus.bind(null, null)}
          onFocus={this.props.editor.updateFocus.bind(null, this.props.block)}
          onKeyDown={this.handleOnKeyDown}
          src={this.props.block.content} />
      </div>
    );
  }
});


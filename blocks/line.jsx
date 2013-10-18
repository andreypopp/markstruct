var React               = require('react-tools/build/modules/React'),
    BlockMixin          = require('../block-mixin'),
    keys                = require('../keys');

module.exports = React.createClass({
  mixins: [BlockMixin],

  render: function() {
    var className = "Block Line" + (this.props.focus ? " Focused" : "");
    return <div tabindex="1" className={className}>{this.renderEditable()}</div>;
  }
});

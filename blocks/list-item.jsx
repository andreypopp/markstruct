var React               = require('react-tools/build/modules/React'),
    TextBlockMixin      = require('../text-block-mixin'),
    keys                = require('../keys'),
    getSelectionOffset  = require('../utils').getSelectionOffset;

module.exports = React.createClass({
  mixins: [TextBlockMixin],
  insertAfterType: 'listitem',

  render: function() {
    var className = "Block ListItem" + (this.props.focus ? " Focused" : "");
    return <div className={className}>{this.renderEditable()}</div>;
  }
});

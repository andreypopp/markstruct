var React               = require('react-tools/build/modules/React'),
    utils               = require('../utils'),
    editable            = require('../editable.jsx'),
    TextBlockMixin      = require('../text-block-mixin');

module.exports = React.createClass({
  mixins: [TextBlockMixin],
  editableComponent: editable.EditablePreformatted,

  render: function() {
    var className = "Block Code" + (this.props.focus ? " Focused" : "");
    return (
      <div className={className}>
        {this.renderEditable({preformatted: true})}
      </div>
    );
  }
});


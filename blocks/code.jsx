var React               = require('react-tools/build/modules/React'),
    keys                = require('../keys'),
    getSelectionOffset  = require('../utils').getSelectionOffset,
    editable            = require('../editable.jsx'),
    TextBlockMixin      = require('../text-block-mixin');

module.exports = React.createClass({
  mixins: [TextBlockMixin],
  ignoreEnter: true,
  editableComponent: editable.EditablePreformatted,

  onKeyDown: function(e) {
    if (e.keyCode === keys.BACKSPACE && getSelectionOffset() === 0) {
      this.changeBlock({type: 'paragraph', level: undefined})
      e.preventDefault();
    }
  },

  render: function() {
    var className = "Block Code" + (this.props.focus ? " Focused" : "");
    return (
      <div className={className}>
        {this.renderEditable({preformatted: true})}
      </div>
    );
  }
});


var React               = require('react-tools/build/modules/React'),
    TextBlockMixin      = require('../text-block-mixin'),
    Editor              = require('../editors/rich'),
    keys                = require('../keys');

module.exports = React.createClass({
  mixins: [TextBlockMixin],
  editorComponent: Editor,
  insertAfterType: 'listitem',

  render: function() {
    var className = "Block ListItem" + (this.props.focus ? " Focused" : "");
    return <div className={className}>{this.renderEditor()}</div>;
  }
});

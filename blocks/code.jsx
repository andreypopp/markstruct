var React               = require('react-tools/build/modules/React'),
    Editor              = require('../editors/preformatted'),
    TextBlockMixin      = require('../text-block-mixin');

module.exports = React.createClass({
  mixins: [TextBlockMixin],
  editorComponent: Editor,

  render: function() {
    var className = "Block Code" + (this.props.focus ? " Focused" : "");
    return (
      <div className={className}>
        {this.renderEditor({preformatted: true})}
      </div>
    );
  }
});


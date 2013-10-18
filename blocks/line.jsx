var React               = require('react-tools/build/modules/React'),
    TextBlockMixin      = require('../text-block-mixin'),
    keys                = require('../keys');

module.exports = React.createClass({
  mixins: [TextBlockMixin],

  onInput: function() {
    var content = this.props.block.content;
    if (content !== '***')
      this.changeBlock({type: 'paragraph'})
  },
  render: function() {
    var className = "Block Line" + (this.props.focus ? " Focused" : "");
    return <div tabindex="1" className={className}>{this.renderEditable()}</div>;
  }
});

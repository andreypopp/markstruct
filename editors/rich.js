var React                       = require('react-tools/build/modules/React'),
    contentEditableLineMetrics  = require('../content-editable-line-metrics'),
    textNodes                   = require('../content-editable-text-nodes'),
    Focusable                   = require('../focusable');

var Annotation = React.createClass({
  render: function() {
    return React.DOM.span({
      className: "Annotation " + this.props.type,
      'data-annotation-type': this.props.type,
      dangerouslySetInnerHTML: {__html: this.props.content}
    });
  }
});

module.exports = React.createClass({
  mixins: [Focusable],

  getContent: function() {
    return this.getDOMNode().textContent;
  },

  getAnnotations: function() {
    var nodes = textNodes(this.getDOMNode()),
        annotations = [];

    for (var i = 0, length = nodes.length; i < length; i++) {
      var annotationType = nodes[i].parentNode.dataset.annotationType;
      if (annotationType)
        annotations.push({
          type: annotationType,
          range: [nodes[i].__index, nodes[i].__index + nodes[i].__length]
        });
    }

    return annotations;
  },

  getCaretPosition: function() {
    return contentEditableLineMetrics(this.getDOMNode());
  },

  renderAnnotatedContent: function(content) {
    var text = this.props.content,
        annotations = this.props.annotations,
        content = [];

    // assume they are sorted by its range
    if (annotations && annotations.length > 0) {
      if (annotations[0].range[0] > 0) {
        content.push(text.substring(0, annotations[0].range[0]));
      }

      annotations.forEach(function(ann, idx) {
        var region = text.substring(ann.range[0], ann.range[1]);
        content.push(Annotation({type: ann.type, content: region, key: idx}));
      });

      var last = annotations[annotations.length - 1].range;

      if (last[1] < text.length)
        content.push(text.substring(last[1], text.length));

    } else {
      content.push(text);
    }
    return content;
  },

  render: function() {
    var content = this.renderAnnotatedContent();
    return this.transferPropsTo(
      React.DOM.div({
        contentEditable: "true",
        className: "Editable",
      }, content));
  }
});

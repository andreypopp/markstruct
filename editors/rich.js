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
      var node = nodes[i],
          annotationType = nodes[i].parentNode.dataset.annotationType;

      if (annotationType && node.__length > 0)
        annotations.push({
          type: annotationType,
          range: [node.__index, node.__index + node.__length]
        });
    }

    return annotations;
  },

  getCaretPosition: function() {
    return contentEditableLineMetrics(this.getDOMNode());
  },

  renderAnnotatedContent: function(content) {
    var text = this.props.content.trim(),
        annotations = this.props.annotations,
        nodes = [];

    // assume they are sorted by its range
    if (annotations && annotations.length > 0) {
      if (annotations[0].range[0] > 0) {
        nodes.push(text.substring(0, annotations[0].range[0]));
      }

      for (var i = 0, length = annotations.length; i < length; i++) {
        var annotation = annotations[i];
        nodes.push(Annotation({
          type: annotation.type,
          content: text.substring.apply(text, annotation.range),
          key: i
        }));
      }

      var last = annotations[annotations.length - 1].range;

      if (last[1] < text.length)
        nodes.push(text.substring(last[1], text.length));

    } else {
      nodes.push(text);
    }
    return nodes;
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

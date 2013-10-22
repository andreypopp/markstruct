var React                       = require('react-tools/build/modules/React'),
    contentEditableLineMetrics  = require('../content-editable-line-metrics'),
    textNodes                   = require('../content-editable-text-nodes'),
    Focusable                   = require('../focusable');

function generateAnnotationMarkup(annotation) {
  return '<span ' +
    'data-annotation-type="' + annotation.type + '"' +
    'class="Annotation ' + annotation.type + '">' +
    annotation.content +
    '</span>';
}

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

      console.log(node, annotationType, node.__index);

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
        nodes.push(generateAnnotationMarkup({
          type: annotation.type,
          content: text.substring.apply(text, annotation.range)
        }));
      }

      var last = annotations[annotations.length - 1].range;

      if (last[1] < text.length)
        nodes.push(text.substring(last[1], text.length));

    } else {
      nodes.push(text);
    }
    return nodes.join('');
  },

  render: function() {
    var content = this.renderAnnotatedContent();
    return this.transferPropsTo(
      React.DOM.div({
        contentEditable: "true",
        className: "Editable",
        dangerouslySetInnerHTML: {__html: content}
      }));
  }
});

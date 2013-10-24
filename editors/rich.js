var React                       = require('react-tools/build/modules/React'),
    parseInlineMarkup           = require('../parser').parseInlineMarkup,
    rangy                       = require('../rangy/rangy-core'),
    contentEditableLineMetrics  = require('../content-editable-line-metrics'),
    textNodes                   = require('../content-editable-text-nodes'),
    keys                        = require('../keys'),
    Focusable                   = require('../focusable');

function generateAnnotationMarkup(annotation) {
  switch (annotation.type) {
    case 'em':
      return '<span ' +
        'data-annotation-type="' + annotation.type + '"' +
        'class="Annotation ' + annotation.type + '">' +
        '<span class="token" data-token>*</span>' +
        annotation.content +
        '<span class="token" data-token>*</span>' +
        '</span>';
    case 'strong':
      return '<span ' +
        'data-annotation-type="' + annotation.type + '"' +
        'class="Annotation ' + annotation.type + '">' +
        '<span class="token" data-token>*</span>' +
        '<span class="token" data-token>*</span>' +
        annotation.content +
        '<span class="token" data-token>*</span>' +
        '<span class="token" data-token>*</span>' +
        '</span>';
  }
}

function genTextMarkup(text) {
  return text
    .replace(/\s/g, '&nbsp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = React.createClass({
  mixins: [Focusable],

  getContent: function(withMarkup) {
    var content = '';

    for (var i = 0, length = this.tokens.length; i < length; i++) {
      var token = this.tokens[i];
      if (token.dataset && token.dataset.token !== undefined) {
        if (withMarkup)
          content = content + token.textContent;
      } else {
        content = content + token.textContent;
      }
    }

    return content;
  },

  getAnnotations: function() {
    var annotations = [];

    for (var i = 0, length = this.tokens.length; i < length; i++) {
      var token = this.tokens[i];

      if (token.dataset && token.dataset.token !== undefined)
        continue;

      if (!token.parentNode)
        continue;

      var annotationType = token.parentNode.dataset.annotationType;

      if (annotationType && token.__length > 0)
        annotations.push({
          type: annotationType,
          range: [token.__index, token.__index + token.__length]
        });
    }

    return annotations;
  },

  getCaretPosition: function() {
    return contentEditableLineMetrics(this.getDOMNode());
  },

  renderAnnotatedContent: function(content) {
    var text = (this.state.content || this.props.content).trim(),
        annotations = this.state.annotations || this.props.annotations,
        nodes = [];

    // assume they are sorted by its range
    if (annotations && annotations.length > 0) {
      if (annotations[0].range[0] > 0) {
        nodes.push(genTextMarkup(text.substring(0, annotations[0].range[0])));
      }

      var prev = undefined;

      for (var i = 0, length = annotations.length; i < length; i++) {
        var annotation = annotations[i];
        if (prev && annotation.range[0] - prev.range[1] > 1) {
          nodes.push(genTextMarkup(text.substring(prev.range[1], annotation.range[0])));
        }
        nodes.push(generateAnnotationMarkup({
          type: annotation.type,
          content: text.substring.apply(text, annotation.range)
        }));
        prev = annotation;
      }

      var last = annotations[annotations.length - 1].range;

      if (last[1] < text.length)
        nodes.push(genTextMarkup(text.substring(last[1], text.length)));

    } else {
      nodes.push(genTextMarkup(text));
    }
    return nodes.join('');
  },

  getInitialState: function() {
    return {
      content: this.props.content,
      annotations: this.props.annotations,
      focusOffset: this.props.focusOffset
    }
  },

  startObserving: function() {
    this.observer = new MutationObserver(function(ch) {
      this.tokens = this.getTokens();
      this.parse();
    }.bind(this));
    this.observer.observe(this.getDOMNode(), {
      characterData: true,
      childList: true,
      subtree: true
    });
  },

  stopObserving: function() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  },

  componentWillReceiveProps: function(props) {
    this.state.content = props.content;
    this.state.annotations = props.annotations;
    this.state.focusOffset = props.focusOffset;
  },

  componentDidMount: function(node) {
    this.tokens = this.getTokens();
    this.startObserving();
  },

  componentWillUnmount: function() {
    this.stopObserving();
  },

  componentWillUpdate: function() {
    this.stopObserving();
  },

  componentDidUpdate: function(_props, _state, node) {
    this.tokens = this.getTokens();
    this.startObserving();
    this.restoreFocusOffset();
  },

  getTokens: function() {
    return textNodes(this.getDOMNode(), true);
  },

  parse: function() {
    var content = this.getContent(true);
    var update = parseInlineMarkup(content);

    if (this.props.onUpdate)
      this.props.onUpdate(update);

    this.updateFocusOffset();
    this.setState(update);
  },

  onSelect: function(e) {
    this.updateFocusOffset();

    if (this.props.onSelect)
      this.props.onSelect(e, this.state.focusOffset);
  },

  updateFocusOffset: function() {
    this.tokens = this.getTokens();

    var selection = rangy.getSelection(),
        node = selection.focusNode,
        offset = selection.focusOffset;

    if (node.parentNode.dataset.token !== undefined) {
      node = node.parentNode;
    }

    var focusOffset = node.__totalIndex + offset;
    this.state.focusOffset = focusOffset;
    console.log(this.state.focusOffset);
  },

  restoreFocusOffset: function() {
    this.tokens = this.getTokens();

    var offset = this.state.focusOffset || 0;
    for (var i = 0, length = this.tokens.length; i < length; i++) {
      var token = this.tokens[i];
      if (offset > token.__totalIndex
          && offset <= token.__totalIndex + token.__length) {
        var rng = rangy.createRange();
        rng.setStart(token, offset - token.__totalIndex);
        rng.collapse(true);
        rangy.getSelection().setSingleRange(rng);
        break;
      }
    }
  },

  render: function() {
    var content = this.renderAnnotatedContent();
    return this.transferPropsTo(
      React.DOM.div({
        contentEditable: "true",
        className: "Editor",
        onSelect: this.onSelect,
        dangerouslySetInnerHTML: {__html: content}
      }));
  }
});

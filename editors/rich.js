var React                       = require('react-tools/build/modules/React'),
    parseInlineMarkup           = require('../parser').parseInlineMarkup,
    contentEditableLineMetrics  = require('../content-editable-line-metrics'),
    textNodes                   = require('../content-editable-text-nodes'),
    keys                        = require('../keys'),
    Focusable                   = require('../focusable');

function genAnnotationMarkup(annotation) {
  switch (annotation.type) {
    case 'em':
      return '<span ' + genAnnotationAttrs(annotation) + '>' +
        genTokenMarkup('*') +
        annotation.content +
        genTokenMarkup('*') +
        '</span>';
    case 'strong':
      return '<span ' + genAnnotationAttrs(annotation) + '>' +
        genTokenMarkup('*') +
        genTokenMarkup('*') +
        annotation.content +
        genTokenMarkup('*') +
        genTokenMarkup('*') +
        '</span>';
    case 'inlinecode':
      return '<span ' + genAnnotationAttrs(annotation) + '>' +
        genTokenMarkup('`') +
        annotation.content +
        genTokenMarkup('`') +
        '</span>';
  }
}

function genAnnotationAttrs(annotation) {
  return 'data-annotation-type="' + annotation.type + '"' +
    ' class="Annotation ' + annotation.type + '"';
}

function genTokenMarkup(token) {
  return '<span class="token" data-token>' + token + '</span>';
}

function genTextMarkup(text) {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = React.createClass({
  mixins: [Focusable],

  getContent: function(withMarkup) {
    var content = '';
    var tokens = this.getTokens();

    for (var i = 0, length = tokens.length; i < length; i++) {
      var token = tokens[i];
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
    var tokens = this.getTokens();

    for (var i = 0, length = tokens.length; i < length; i++) {
      var token = tokens[i];

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
    var text = this.state.content,
        annotations = this.state.annotations,
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
        nodes.push(genAnnotationMarkup({
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
      if (this.ignoreNext) {
        this.ignoreNext = false;
        return;
      }
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

  fixDOM: function() {
    var node = this.getDOMNode();
    if (node.lastChild && node.lastChild.__fix)
      return;
    var fix = document.createElement('span');
    fix.__fix = true;
    node.appendChild(fix);
  },

  componentWillReceiveProps: function(props) {
    this.state.content = props.content;
    this.state.annotations = props.annotations;
    this.state.focusOffset = props.focusOffset;
  },

  componentDidMount: function(node) {
    this.startObserving();
  },

  componentWillUnmount: function() {
    this.stopObserving();
  },

  componentWillUpdate: function() {
    this.stopObserving();
  },

  componentDidUpdate: function() {
    this.fixDOM();
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
    var tokens = this.getTokens();

    var selection = document.getSelection(),
        node = selection.focusNode,
        offset = selection.focusOffset;

    if (node.parentNode.dataset.token !== undefined) {
      node = node.parentNode;
    }

    var focusOffset = node.__totalIndex + offset;
    this.state.focusOffset = focusOffset;
  },

  restoreFocusOffset: function() {
    var tokens = this.getTokens(),
        offset = this.state.focusOffset || 0;

    for (var i = 0, length = tokens.length; i < length; i++) {
      var token = tokens[i];
      if (offset >= token.__totalIndex
          && offset < token.__totalIndex + token.__length) {
        offset = offset - token.__totalIndex;
        var rng = document.createRange();
        rng.setStart(token, offset);
        rng.collapse(true);
        var selection = document.getSelection();
        selection.removeAllRanges();
        selection.addRange(rng);
        return;
      }
    }

    // no node found, this was probably a whitespace node
    var node = this.getDOMNode(),
        token = node.lastChild;

    if (token) {
      var rng = document.createRange();
      rng.setStart(token, token.__length - 1);
      rng.collapse(true);
    } else {
      var rng = document.createRange();
      rng.setStart(node, 0)
      rng.collapse(true);
    }
    var selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(rng);
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

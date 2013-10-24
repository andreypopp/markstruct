var React                       = require('react-tools/build/modules/React'),
    parseInlineMarkup           = require('../parser').parseInlineMarkup,
    contentEditableLineMetrics  = require('../content-editable-line-metrics'),
    textNodes                   = require('../content-editable-text-nodes'),
    keys                        = require('../keys'),
    Focusable                   = require('../focusable');

function genAnnotationMarkup(annotation) {
  var inner;
  switch (annotation.type) {
    case 'em':
      inner = genTokenMarkup('*') +
        annotation.content +
        genTokenMarkup('*');
      break;
    case 'strong':
      inner = genTokenMarkup('*') +
        genTokenMarkup('*') +
        annotation.content +
        genTokenMarkup('*') +
        genTokenMarkup('*');
      break;
    case 'inlinecode':
      inner = genTokenMarkup('`') +
        annotation.content +
        genTokenMarkup('`');
      break;
    default:
      console.error('unknown annotation type');
  }
  return '<span' +
    ' data-annotation-type="' + annotation.type + '"' +
    ' class="Annotation ' + annotation.type + '">' + inner + '</span>';
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

DOMObserver = {
  startObserving: function() {
    this.observer = new MutationObserver(this.onDOMChanges);
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

  componentDidMount: function() {
    this.startObserving();
  },

  componentDidUpdate: function() {
    this.startObserving();
  },

  componentWillUnmount: function() {
    this.stopObserving();
  },

  componentWillUpdate: function() {
    this.stopObserving();
  }
}

module.exports = React.createClass({
  mixins: [Focusable, DOMObserver],

  getTokens: function() {
    return textNodes(this.getDOMNode(), true);
  },

  getCaretPosition: function() {
    return contentEditableLineMetrics(this.getDOMNode());
  },

  getCaretOffset: function() {
    var tokens = this.getTokens();

    var selection = document.getSelection(),
        node = selection.focusNode,
        offset = selection.focusOffset;

    if (!node)
      return;

    if (node.parentNode.dataset.token !== undefined) {
      node = node.parentNode;
    }

    return node.__totalIndex + offset;
  },

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
        if (prev && annotation.range[0] - prev.range[1] >= 1) {
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

  componentWillReceiveProps: function(props) {
    if (props.content)
      this.state.content = props.content;
    if (props.annotations)
      this.state.annotations = props.annotations;
    if (props.focusOffset)
      this.state.focusOffset = props.focusOffset;
  },

  componentDidUpdate: function() {
    this.restoreFocusOffset();
  },

  onDOMChanges: function() {
    this.parse();
  },

  parse: function() {
    var content = this.getContent(true);
    var update = parseInlineMarkup(content);

    if (this.props.onUpdate)
      this.props.onUpdate(update);

    this.setState({
      content: update.content,
      annotations: update.annotations,
      focusOffset: this.getCaretOffset()
    });
  },

  onSelect: function(e) {
    this.state.focusOffset = this.getCaretOffset();

    if (this.props.onSelect)
      this.props.onSelect(e, this.state.focusOffset);
  },

  restoreFocusOffset: function() {
    var tokens = this.getTokens(),
        offset = this.state.focusOffset || 0;

    for (var i = 0, length = tokens.length; i < length; i++) {
      var token = tokens[i];
      if (offset >= token.__totalIndex
          && offset <= token.__totalIndex + token.__length) {
        offset = offset - token.__totalIndex;
        setSingleRange(token, offset);
        return;
      }
    }

    // no node found, this was probably a whitespace node
    var node = this.getDOMNode(),
        token = tokens[tokens.length - 1];

    if (token) {
      setSingleRange(token, token.__length);
    } else {
      setSingleRange(node, 0);
    }
  },

  onKeyDown: function(e) {
    if (e.keyCode === 32) {
      var node = this.getDOMNode(),
          selection = document.getSelection(),
          tokens = this.getTokens(),
          lastToken = tokens[tokens.length - 1],
          token = selection.focusNode;

      while (token !== node && tokens.indexOf(token) === -1)
        token = token.parentNode;

      if (token === node) {
        e.preventDefault();
        document.execCommand('insertText', false, '&nbsp;');
      } else if (token.__totalIndex + selection.focusOffset === 
          lastToken.__totalIndex + lastToken.__length) {
        e.preventDefault();
        document.execCommand('insertText', false, '&nbsp;');
      }
    }
    if (this.props.onKeyDown)
      this.props.onKeyDown(e);
  },

  render: function() {
    var content = this.renderAnnotatedContent();
    return this.transferPropsTo(
      React.DOM.div({
        contentEditable: "true",
        className: "Editor",
        onSelect: this.onSelect,
        onKeyDown: this.onKeyDown,
        dangerouslySetInnerHTML: {__html: content}
      }));
  }
});

function setSingleRange(node, offset) {
  var rng = document.createRange();
  rng.setStart(node, offset);
  rng.collapse(true);
  var selection = document.getSelection();
  selection.removeAllRanges();
  selection.addRange(rng);
}

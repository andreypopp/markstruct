var React                       = require('react-tools/build/modules/React'),
    parseInlineMarkup           = require('../parser').parseInlineMarkup,
    rangy                       = require('../rangy/rangy-core'),
    contentEditableLineMetrics  = require('../content-editable-line-metrics'),
    textNodes                   = require('../content-editable-text-nodes'),
    keys                        = require('../keys'),
    Focusable                   = require('../focusable');

function generateAnnotationMarkup(annotation) {
  return '<span ' +
    'data-annotation-type="' + annotation.type + '"' +
    'class="Annotation ' + annotation.type + '">' +
    '<span class="token" data-token>*</span>' +
    annotation.content +
    '<span class="token" data-token>*</span>' +
    '</span>';
}

function genTextMarkup(text) {
  return text;
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

  componentWillReceiveProps: function(props) {
    this.state.content = props.content;
    this.state.annotations = props.annotations;
    this.state.focusOffset = props.focusOffset;
  },

  componentDidMount: function(node) {
    this.tokens = this.getTokens();
    this.observer = new MutationObserver(function() {
      this.tokens = this.getTokens();
      this.parse();
    }.bind(this));
    this.observer.observe(node, {childList: true, subtree: true});
  },

  componentWillUnmount: function() {
    this.observer.disconnect();
    this.observer = undefined;
  },

  componentDidUpdate: function() {
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

    this.setState(update);
  },

  onKeyUp: function(e) {
    if (keys.match(e, keys.KEY8, {shiftKey: true})) {
      this.parse()
    }

    if (this.props.onKeyUp)
      this.props.onKeyUp(e);
  },

  onInput: function(e) {
    var update = {
      annotations: this.getAnnotations(),
      content: this.getContent()
    }

    if (this.props.onUpdate)
      this.props.onUpdate(update);

    if (this.props.onInput)
      this.props.onInput(e);
  },

  onKeyDown: function(e) {
    var selection = rangy.getSelection(),
        node = selection.focusNode;

    if (node.parentNode.dataset.token === undefined ||
         [8, 37, 38, 39, 40].indexOf(e.keyCode) > -1 ||
         !selection.isCollapsed) {

      if (e.keyCode === 8)
        this.state.focusOffset = this.state.focusOffset - 1;

      if (this.props.onKeyDown)
        this.props.onKeyDown(e);
      return;
    }


    var emptyChar = String.fromCharCode(0);

    node = node.parentNode;

    var next = node.__next;
    if (!next) {
      next = document.createTextNode(emptyChar);
      this.getDOMNode().appendChild(next);
    }

    if (next.textContent[0] !== emptyChar)
      next.textContent = emptyChar + next.textContent;

    var rng = rangy.createRange();
    rng.setStart(next, 0);
    rng.setEnd(next, 1);

    selection.setSingleRange(rng);

    if (this.props.onKeyDown)
      this.props.onKeyDown(e);
  },

  onSelect: function(e) {
    var selection = rangy.getSelection(),
        node = selection.focusNode,
        offset = selection.focusOffset;

    if (node.parentNode.dataset.token !== undefined) {
      node = node.parentNode;
    }

    var focusOffset = node.__totalIndex + offset;
    this.state.focusOffset = focusOffset;

    if (this.props.onSelect)
      this.props.onSelect(e, focusOffset);
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
        onKeyUp: this.onKeyUp,
        onInput: this.onInput,
        onKeyDown: this.onKeyDown,
        onSelect: this.onSelect,
        dangerouslySetInnerHTML: {__html: content}
      }));
  }
});

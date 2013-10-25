"use strict";

var React                       = require('react-tools/build/modules/React'),
    parseInlineMarkup           = require('../parser').parseInlineMarkup,
    contentEditableLineMetrics  = require('../content-editable-line-metrics'),
    textNodes                   = require('../content-editable-text-nodes'),
    keys                        = require('../keys'),
    DOMObserver                 = require('../dom-observer'),
    Focusable                   = require('../focusable');

function isToken(node) {
  return node.dataset && node.dataset.token !== undefined;
}

function closestTextLeft(node) {
  while (node.previousSibling) {
    node = nde.previousSibling
    if (!isToken(node)) return node;
  }
}

function closestTextRight(node) {
  while (node.nextSibling) {
    node = node.nextSibling;
    if (!isToken(node)) return node;
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

  getCaretOffset: function(withMarkup) {
    var tokens = this.getTokens(),
        selection = document.getSelection(),
        node = selection.focusNode,
        offset = selection.focusOffset;

    if (!node)
      return;

    if (isToken(node.parentNode))
      node = node.parentNode;

    if (withMarkup) {
      return node.__totalIndex + offset;
    } else {
      if (isToken(node)) {
        var text = closestTextLeft(node);
        if (text)
          return text.__index + text.__length;
        var text = closestTextRight(node);
        if (text)
          return text.__index;
        return 0;
      } else {
        return node.__index + offset;
      }
    }

  },

  restoreCaretOffset: function() {
    var tokens = this.getTokens(),
        offset = this.state.focusOffset || 0;

    for (var i = 0, length = tokens.length; i < length; i++) {
      var token = tokens[i];
      if (offset >= token.__totalIndex &&
          offset <= token.__totalIndex + token.__length) {
        offset = offset - token.__totalIndex;
        setSingleRange(token, offset);
        return;
      }
    }

    // no node found, this was probably a whitespace node
    var node = this.getDOMNode(),
        lastToken = tokens[tokens.length - 1];

    if (lastToken) {
      setSingleRange(lastToken, lastToken.__length);
    } else {
      setSingleRange(node, 0);
    }
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

  componentDidUpdate: function() {
    if (this.props.focus)
      this.restoreCaretOffset();
  },

  componentDidMount: function() {
    this.parse();
  },

  onDOMChanges: function() {
    this.parse();
  },

  parse: function() {
    var content = this.getContent(true);
    var update = parseInlineMarkup(content);

    var updated = this.props.onUpdate && this.props.onUpdate({
      content: update.content,
      annotations: update.annotations,
      markdown: content,
      focusOffset: this.getCaretOffset(true)
    });

    if (!updated)
      this.setState({
        content: update.content,
        annotations: update.annotations,
        focusOffset: this.getCaretOffset(true)
      });
  },

  onSelect: function(e) {
    this.state.focusOffset = this.getCaretOffset(true);

    if (this.props.onSelect)
      this.props.onSelect(e)

    if (this.props.onCaretOffsetUpdate)
      this.props.onCaretOffsetUpdate(this.state.focusOffset)
  },

  onKeyDown: function(e) {
    if (e.keyCode === keys.SPACE) {
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

  renderAnnotatedContent: function(content) {
    var text = this.state.content,
        annotations = this.state.annotations,
        nodes = [];

    // assume they are sorted by its range
    if (annotations && annotations.length > 0) {

      // part before the first annotation
      if (annotations[0].range[0] > 0) {
        nodes.push(genText(text.substring(0, annotations[0].range[0])));
      }

      var prev;

      for (var i = 0, length = annotations.length; i < length; i++) {
        var annotation = annotations[i];

        // part before the prev and the current annotation
        if (prev && annotation.range[0] - prev.range[1] >= 1) {
          nodes.push(genText(text.substring(prev.range[1], annotation.range[0])));
        }

        // annotation itself
        nodes.push(genAnnotation({
          type: annotation.type,
          content: text.substring.apply(text, annotation.range)
        }));

        prev = annotation;
      }


      // part after the last annotation
      var last = annotations[annotations.length - 1].range;
      if (last[1] < text.length) {
        nodes.push(genText(text.substring(last[1], text.length)));
      }

    } else {
      nodes.push(genText(text));
    }
    return nodes.join('');
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

function genAnnotation(annotation) {
  var inner;
  switch (annotation.type) {
    case 'em':
      inner = genToken('*') +
        annotation.content +
        genToken('*');
      break;
    case 'strong':
      inner = genToken('*') +
        genToken('*') +
        annotation.content +
        genToken('*') +
        genToken('*');
      break;
    case 'inlinecode':
      inner = genToken('`') +
        annotation.content +
        genToken('`');
      break;
    default:
      console.error('unknown annotation type');
  }
  return '<span' +
    ' data-annotation-type="' + annotation.type + '"' +
    ' class="Annotation ' + annotation.type + '">' + inner + '</span>';
}

function genToken(token) {
  return '<span class="token" data-token>' + token + '</span>';
}

function genText(text) {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

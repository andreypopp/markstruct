var React               = require('react-tools/build/modules/React'),
    showdown            = require('showdown'),
    utils               = require('lodash'),
    computeLineMetrics  = require('./utils').computeLineMetrics;

function getRangy() {
  require('rangy-browser/lib/rangy-core');
  rangy.init();
  return rangy;
}

function getSelectionOffset() {
  return getSelection().focusOffset;
}

function renderMarkdown(markdown) {
  var html = new showdown.converter().makeHtml(markdown);
  return html.replace(/^<p>/, '').replace(/<\/p>$/, '');
}

var ENTER = 13;
var BACKSPACE = 8;
var KEY3 = 51;
var KEY8 = 56;
var ARROW_UP = 38;
var ARROW_DOWN = 40;
var SPACE = 32;

var Editable = React.createClass({

  onInput: function() {
    var blockType, value = this.value();
  },

  restoreFocus: function() {
    if (this.props.focus) {
      var node = this.getDOMNode();
      node.focus();
      if (this.props.focusOffset > 0) {
        var s = rangy.getSelection(),
            r = rangy.createRange();
        r.setStart(node.firstChild, this.props.focusOffset);
        r.collapse(true);
        s.setSingleRange(r);
      }
    }
  },

  computeLineMetrics: function() {
    return computeLineMetrics(this.getDOMNode());
  },

  componentDidMount: function() {
    this.restoreFocus();
  },

  componentDidUpdate: function() {
    this.restoreFocus();
  },

  value: function() {
    return this.getDOMNode().textContent.trim();
  },

  render: function() {
    var content = (this.props.focus || !this.props.renderMarkdown) ?
      this.props.block.content :
      renderMarkdown(this.props.block.content);
    return this.transferPropsTo(
      <div contentEditable="true"
        onCompositionStart={this.onCompositionStart}
        className="Editable"
        dangerouslySetInnerHTML={{__html: content}} />
    );
  }
});

var BlockMixin = {
  changeBlock: function(changes) {
    utils.assign(this.props.block, changes);
    this.props.editor.forceUpdate();
  },

  updateContent: function() {
    this.props.block.content = this.refs.editable.value();
  },

  updateFocusPosition: function(e) {
    this.props.editor.updateFocus(this.props.block, 0);
  },

  renderEditable: function() {
    return Editable({
      onSelect: this.updateFocusPosition,
      block: this.props.block,
      focus: this.props.focus,
      focusOffset: this.props.focusOffset,
      renderMarkdown: this.renderMarkdown,
      onKeyDown: this.onKeyDown,
      onBlur: this.props.editor.updateFocus.bind(null, null),
      onFocus: this.props.editor.updateFocus.bind(null, this.props.block),
      onInput: this.updateContent,
      ref: "editable"})
  },

  handleOnKeyDown: function(e) {
    if (e.altKey && e.keyCode === ARROW_UP) {
      this.props.editor.focusBefore(this.props.block);
      return true;
    } else if (e.altKey && e.keyCode === ARROW_DOWN) {
      this.props.editor.focusAfter(this.props.block);
      return true;
    } else if (e.shiftKey && e.keyCode === ARROW_UP) {
      this.props.editor.moveUp(this.props.block);
      return true;
    } else if (e.shiftKey && e.keyCode === ARROW_DOWN) {
      this.props.editor.moveDown(this.props.block);
      return true;
    } else if (e.keyCode === ARROW_UP) {
      lineInfo = this.refs.editable.computeLineMetrics();
      if (lineInfo.line === 1) {
        this.props.editor.focusBefore(this.props.block);
        return true;
      }
    } else if (e.keyCode === ARROW_DOWN) {
      lineInfo = this.refs.editable.computeLineMetrics();
      if (lineInfo.line === lineInfo.totalLines) {
        this.props.editor.focusAfter(this.props.block);
        return true;
      }
    } else if (e.keyCode === ENTER) {
      var contents;
      if (this.refs.editable.value().length > 0) {
        var s = rangy.getSelection(),
            r = s.getRangeAt(0);
        r.setEndAfter(this.refs.editable.getDOMNode().firstChild);
        contents = r.extractContents().firstChild.wholeText.trim();
        this.updateContent();
      } else {
        contents = '';
      }
      this.props.editor.insertAfter(this.props.block, contents);
      return true;
    }
    return false;
  }
}

var Paragraph = React.createClass({
  mixins: [BlockMixin],

  renderMarkdown: true,

  onKeyDown: function(e) {
    if (this.handleOnKeyDown(e)) {
      e.preventDefault();
    } else if (e.shiftKey && e.keyCode === KEY3 && getSelectionOffset() === 0) {
      this.changeBlock({type: 'heading', level: 1});
      e.preventDefault();
    } else if (e.keyCode === SPACE && getSelectionOffset() === 1 && this.props.block.content[0] === '*') {
      this.changeBlock({type: 'listitem', content: this.props.block.content.slice(1)});
      e.preventDefault();
    } else if (e.shiftKey && e.keyCode === KEY8 && getSelectionOffset() === 2 && this.props.block.content === '**') {
      this.changeBlock({type: 'line', content: '***'});
      e.preventDefault();
    } else if (e.keyCode === BACKSPACE && getSelectionOffset() === 0) {
      this.props.editor.mergeWithPrevious(this.props.block);
      e.preventDefault();
    }
  },

  render: function() {
    var className = "Block Paragraph" + (this.props.focus ? " Focused" : "");
    return <div className={className}>{this.renderEditable()}</div>;
  }
});

var Line = React.createClass({
  mixins: [BlockMixin],

  onKeyDown: function(e) {
    if (this.handleOnKeyDown(e)) {
      e.preventDefault();
    }
  },

  render: function() {
    var className = "Block Line" + (this.props.focus ? " Focused" : "");
    return <div tabindex="1" className={className}>{this.renderEditable()}</div>;
  }
});

var ListItem = React.createClass({
  mixins: [BlockMixin],
  renderMarkdown: true,

  onKeyDown: function(e) {
    if (this.handleOnKeyDown(e)) {
      e.preventDefault();
    } else if (e.keyCode === BACKSPACE && getSelectionOffset() === 0) {
      this.changeBlock({type: 'paragraph', level: undefined})
      e.preventDefault();
    }
  },

  render: function() {
    var className = "Block ListItem" + (this.props.focus ? " Focused" : "");
    return <div className={className}>{this.renderEditable()}</div>;
  }
});

var Heading = React.createClass({
  mixins: [BlockMixin],

  onKeyDown: function(e) {
    if (this.handleOnKeyDown(e)) {
      e.preventDefault();
    } else if (e.shiftKey && e.keyCode === KEY3 && getSelectionOffset() === 0) {
      if (this.props.block.level < 6) {
        this.changeBlock({level: this.props.block.level + 1})
        e.preventDefault();
      }
    } else if (e.keyCode === BACKSPACE && getSelectionOffset() === 0) {
      if (this.props.block.level === 1)
        this.changeBlock({type: 'paragraph', level: undefined})
      else
        this.changeBlock({level: this.props.block.level - 1});
      e.preventDefault();
    }
  },

  render: function() {
    var className = "Block Heading Heading" + this.props.block.level + (this.props.focus ? " Focused" : "");
    return <div className={className}>{this.renderEditable()}</div>;
  }
});

var EditorAPI = {
  updateFocus: function(block, offset) {
    var needUpdate = this.state.focus.block !== block;
    this.state.focus.block = block;
    this.state.focus.offset = offset || 0;
    if (needUpdate) this.forceUpdate();
  },

  mergeWithPrevious: function(block) {
    var idx = this.props.doc.blocks.indexOf(block);
    if (idx > 0) {
      var prev = this.props.doc.blocks[idx - 1]
      this.state.focus.block = prev;
      this.state.focus.offset = prev.content.length + (prev.content.length === 0 ? 0 : 1);
      this.props.doc.blocks.splice(idx, 1);
      prev.content = prev.content + (prev.content.length === 0 ? '' : ' ') + block.content;
      this.forceUpdate();
    }
  },

  insertAfter: function(block, content) {
    var idx = this.props.doc.blocks.indexOf(block);
    if (idx > -1) {
      var block = {
        type: block.type === 'listitem' ? 'listitem' : 'paragraph',
        content: content
      };
      this.state.focus.block = block;
      this.props.doc.blocks.splice(idx + 1, 0, block);
      this.forceUpdate();
    }
  },

  focusAfter: function(block) {
    var idx = this.props.doc.blocks.indexOf(block);
    if (idx > -1 && idx < this.props.doc.blocks.length - 1) {
      var next = this.props.doc.blocks[idx + 1];
      this.state.focus.block = next;
      this.state.focus.offset = 0;
      this.forceUpdate();
    }
  },

  focusBefore: function(block) {
    var idx = this.props.doc.blocks.indexOf(block);
    if (idx > 0) {
      var next = this.props.doc.blocks[idx - 1];
      this.state.focus.block = next;
      this.state.focus.offset = next.content.length;
      this.forceUpdate();
    }
  },

  moveUp: function(block) {
    var idx = this.props.doc.blocks.indexOf(block);
    if (idx > 0) {
      this.props.doc.blocks.splice(idx, 1);
      this.props.doc.blocks.splice(idx - 1, 0, block);
      this.forceUpdate();
    }
  },

  moveDown: function(block) {
    var idx = this.props.doc.blocks.indexOf(block);
    if (idx > -1 && idx < this.props.doc.blocks.length - 1) {
      this.props.doc.blocks.splice(idx, 1);
      this.props.doc.blocks.splice(idx + 1, 0, block);
      this.forceUpdate();
    }
  },
};

var Editor = React.createClass({
  mixins: [EditorAPI],

  getInitialState: function() {
    this.props.doc.blocks.forEach(function(block, idx) {
      block.idx = idx;
    });
    return {focus: {}};
  },

  renderBlock: function(block) {
    var props = {
      block: block,
      key: block.idx,
      editor: this,
      focus: this.state.focus.block === block,
      focusOffset: this.state.focus.offset || 0
    };
    switch (block.type) {
      case 'heading':
        return Heading(props);
      case 'listitem':
        return ListItem(props);
      case 'line':
        return Line(props);
      default:
        return Paragraph(props);
    }
  },

  render: function() {
    return (
      <div className="Editor">
        {this.props.doc.blocks.map(this.renderBlock)}
      </div>
    );
  }
});

module.exports = Editor;

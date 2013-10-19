var React               = require('react-tools/build/modules/React'),
    assign              = require('lodash').assign,
    rangy               = require('rangy-browser/lib/rangy-core.js'),
    Paragraph           = require('./blocks/paragraph.jsx'),
    Heading             = require('./blocks/heading.jsx'),
    ListItem            = require('./blocks/list-item.jsx'),
    Line                = require('./blocks/line.jsx'),
    Image               = require('./blocks/image.jsx');
    Code                = require('./blocks/code.jsx');

var EditorAPI = {
  updateFocus: function(block, offset) {
    var needUpdate = this.state.focus.block !== block;
    this.state.focus.block = block;
    this.state.focus.offset = offset || 0;
    if (needUpdate) this.forceUpdate();
  },

  updateBlock: function(block, changes) {
    block = assign(block, changes);
    var idx = this.props.doc.blocks.indexOf(block);
    if (idx > -1) {
      this.forceUpdate();
    } else {
      this.props.doc.blocks.splice(0, 0, block);
      this.state.focus.block = block;
      this.forceUpdate();
    }
  },

  remove: function(block) {
    var idx = this.props.doc.blocks.indexOf(block);
    if (idx > -1) {
      this.props.doc.blocks.splice(idx, 1);
      this.state.focus.block = this.props.doc.blocks[Math.max(idx - 1, 0)];
      this.forceUpdate();
    }
  },

  mergeWithPrevious: function(block) {
    var idx = this.props.doc.blocks.indexOf(block);
    if (idx > 0) {
      var prev = this.props.doc.blocks[idx - 1];
      var needSuffix = prev.content.length > 0 && block.content.length > 0;
      this.state.focus.block = prev;
      this.state.focus.offset = prev.content.length + 
        (needSuffix ? 1 : 0);
      this.props.doc.blocks.splice(idx, 1);
      prev.content = prev.content + 
        (needSuffix ? ' ' : '') + 
        block.content;
      this.forceUpdate();
    } else if (idx === 0) {
      this.remove(block);
    }
  },

  insertAfter: function(block, newBlock) {
    newBlock = newBlock || {type: 'paragraph', content: ''};
    if (block) {
      var idx = this.props.doc.blocks.indexOf(block);
      if (idx > -1) {
        this.state.focus.block = newBlock;
        this.props.doc.blocks.splice(idx + 1, 0, newBlock);
        this.forceUpdate();
      }
    } else {
      this.state.focus.block = newBlock;
      this.props.doc.blocks.splice(0, 0, newBlock);
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

var BlockPanel = React.createClass({
  remove: function() {
    this.props.editor.remove(this.props.block);
  },
  insertAfter: function() {
    this.props.editor.insertAfter(this.props.block);
  },
  render: function() {
    return (
      <div className="BlockPanel">
        <a className="Button" onClick={this.insertAfter}>
          insert</a>
        <a className="Button" onClick={this.remove}>
          remove</a>
      </div>
    );
  }
});

var BlockWrapper = React.createClass({
  render: function() {
    var blockComponent = this.transferPropsTo(this.props.component()),
        className = "BlockWrapper" + (this.props.focus ? " Focused" : "");
    return (
      <div className={className}>
        {blockComponent}
        <BlockPanel block={this.props.block} editor={this.props.editor} />
      </div>
    );
  }
});

var Editor = React.createClass({
  mixins: [EditorAPI],

  blocks: {
    heading: Heading,
    listitem: ListItem,
    line: Line,
    paragraph: Paragraph,
    image: Image,
    code: Code
  },

  getInitialState: function() {
    return {focus: {}};
  },

  renderBlock: function(block, key) {
    var props = {
      block: block,
      key: key,
      editor: this,
      focus: this.state.focus.block === block,
      focusOffset: this.state.focus.offset || 0,
      component: this.blocks[block.type] || Paragraph
    };
    return BlockWrapper(props);
  },

  render: function() {
    var blocks;
    if (this.props.doc.blocks.length > 0) {
      blocks = this.props.doc.blocks;
    } else {
      blocks = [{type: 'paragraph', content: ''}];
      this.state.focus.block = blocks[0];
    }
    return <div className="Editor">{blocks.map(this.renderBlock)}</div>;
  }
});

module.exports = Editor;

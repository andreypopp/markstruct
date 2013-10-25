var React               = require('react-tools/build/modules/React'),
    assign              = require('lodash').assign,
    Paragraph           = require('./blocks/paragraph.jsx'),
    Heading             = require('./blocks/heading.jsx'),
    ListItem            = require('./blocks/list-item.jsx'),
    Line                = require('./blocks/line.jsx'),
    mergeBlocks         = require('./block').merge,
    Image               = require('./blocks/image.jsx');
    Code                = require('./blocks/code.jsx');

var EditorAPI = {
  updatePosition: function(block, offset) {
    if (block !== this.state.focus.block)
      this.setState({focus: {block: block, offset: offset}})
    else
      this.state.focus.offset = offset;
  },

  updateBlock: function(block, changes) {
    block = assign(block, changes);
    var idx = this.props.doc.indexOf(block);
    if (idx > -1) {
      this.forceUpdate();
    } else {
      this.props.doc.splice(0, 0, block);
      this.state.focus.block = block;
      this.forceUpdate();
    }
  },

  remove: function(block) {
    var idx = this.props.doc.indexOf(block);
    if (idx > -1) {
      this.props.doc.splice(idx, 1);
      this.state.focus.block = this.props.doc[Math.max(idx - 1, 0)];
      this.forceUpdate();
    }
  },

  mergeWithPrevious: function(block) {
    var idx = this.props.doc.indexOf(block);
    if (idx > 0) {
      var prev = this.props.doc[idx - 1];
      var merged = mergeBlocks(prev, block, true);
      this.props.doc.splice(idx, 1);
      this.props.doc.splice(idx - 1, 1, merged);
      this.state.focus.block = merged;
      this.state.focus.offset = 0;
      this.forceUpdate();
    } else if (idx === 0) {
      this.remove(block);
    }
  },

  insertAfter: function(block, newBlock) {
    newBlock = newBlock || {type: 'paragraph', content: '', annotations: []};
    if (block) {
      var idx = this.props.doc.indexOf(block);
      if (idx > -1) {
        this.state.focus.block = newBlock;
        this.state.focus.offset = 0;
        this.props.doc.splice(idx + 1, 0, newBlock);
        this.forceUpdate();
      }
    } else {
      this.state.focus.block = newBlock;
      this.state.focus.offset = 0;
      this.props.doc.splice(0, 0, newBlock);
      this.forceUpdate();
    }
  },

  focusAfter: function(block) {
    var idx = this.props.doc.indexOf(block);
    if (idx > -1 && idx < this.props.doc.length - 1) {
      var next = this.props.doc[idx + 1];
      this.state.focus.block = next;
      this.state.focus.offset = 0;
      this.forceUpdate();
    }
  },

  focusBefore: function(block) {
    var idx = this.props.doc.indexOf(block);
    if (idx > 0) {
      var next = this.props.doc[idx - 1];
      this.state.focus.block = next;
      this.state.focus.offset = 0;
      this.forceUpdate();
    }
  },

  moveUp: function(block) {
    var idx = this.props.doc.indexOf(block);
    if (idx > 0) {
      this.props.doc.splice(idx, 1);
      this.props.doc.splice(idx - 1, 0, block);
      this.forceUpdate();
    }
  },

  moveDown: function(block) {
    var idx = this.props.doc.indexOf(block);
    if (idx > -1 && idx < this.props.doc.length - 1) {
      this.props.doc.splice(idx, 1);
      this.props.doc.splice(idx + 1, 0, block);
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
        <div className="Buttons">
          <a className="Button" onClick={this.insertAfter}>
            insert</a>
          <a className="Button" onClick={this.remove}>
            remove</a>
        </div>
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
    var focus = this.state.focus.block === block;
    var props = {
      block: block,
      key: key,
      editor: this,
      focus: focus,
      focusOffset: focus ? this.state.focus.offset : 0,
      component: this.blocks[block.type] || Paragraph
    };
    return BlockWrapper(props);
  },

  render: function() {
    if (this.props.doc.length > 0) {
      var blocks = this.props.doc;
    } else {
      var blocks = [{type: 'paragraph', content: ''}];
      this.state.focus.block = blocks[0];
    }
    return <div className="Markstruct">{blocks.map(this.renderBlock)}</div>;
  }
});

module.exports = Editor;

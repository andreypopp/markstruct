require('./styles.styl');

var React     = require('react-tools/build/modules/React'),
    ReactApp  = require('react-app'),
    Editor    = require('../editors/rich');

var doc = {
  content: 'Hello world',
  annotations: [{type: 'strong', range: [6, 11]}],
  focusOffset: 0
};

var EditorWithStats = React.createClass({
  getInitialState: function() {
    return {line: 1, lineOffset: 0, offset: 0, totalLines: 1};
  },

  updateCaretPosition: function(e, offset) {
    var caret = this.refs.editor.getCaretPosition();
    doc.focusOffset = offset;
  },

  updateDoc: function(updated) {
    doc.content = updated.content;
    doc.annotations = updated.annotations;
  },

  render: function() {
    return (
      <div>
        <div className="EditorWithStats">
          <Editor ref="editor"
            focusOffset={doc.focusOffset}
            focus
            onUpdate={this.updateDoc}
            onSelect={this.updateCaretPosition}
            content={this.props.doc.content}
            annotations={this.props.doc.annotations} />
        </div>
        <div className="stats">
          line: {this.state.line}
          offset: {this.state.offset}
          lineOffset: {this.state.lineOffset}
          totalLines: {this.state.totalLines}
        </div>
      </div>
    );
  }
});

module.exports = ReactApp.createApp({
  routes: {
    '*': ReactApp.createPage({

      render: function() {
        return (
          <html>
            <head>
              <title>Markstruct demo</title>
            </head>
            <body>
              <div className="MarkdownEditor">
                <EditorWithStats doc={doc} />
              </div>
            </body>
          </html>
        );
      }
    })
  }
});

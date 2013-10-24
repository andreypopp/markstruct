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
  render: function() {
    return (
      <div className="EditorWithStats">
        <Editor ref="editor"
          focusOffset={doc.focusOffset}
          focus
          onUpdate={this.updateDoc}
          onSelect={this.updateCaretPosition}
          content={this.props.doc.content}
          annotations={this.props.doc.annotations} />
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

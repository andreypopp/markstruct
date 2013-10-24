require('./styles.styl');

var React     = require('react-tools/build/modules/React'),
    ReactApp  = require('react-app'),
    Editor    = require('../editors/rich');

var doc = {
  content: 'Hello world',
  annotations: [{type: 'strong', range: [6, 11]}]
};

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
                <Editor content={doc.content} annotations={doc.annotations} />
              </div>
            </body>
          </html>
        );
      }
    })
  }
});

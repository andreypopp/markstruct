require('./styles.styl');

var React     = require('react-tools/build/modules/React'),
    ReactApp  = require('react-app'),
    Editor    = require('./editor.jsx');

var doc = {
  blocks: [
    {type: 'heading', level: 1, content: 'This is a title'},
    {type: 'paragraph', content: 'Hello, world'},
  ]
}

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
              <Editor doc={doc} />
            </body>
          </html>
        );
      }
    })
  }
});

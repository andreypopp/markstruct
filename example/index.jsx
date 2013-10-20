require('./styles.styl');

var React     = require('react-tools/build/modules/React'),
    ReactApp  = require('react-app'),
    Editor    = require('../index.jsx');

var doc = [
    {type: 'heading', level: 1, content: 'markstruct'},
    {type: 'image', content: 'http://donmorris.com/public/images/posts/markdown.png'},
    {type: 'listitem', content: 'Structured editor for markdown.'},
    {type: 'line', content: '***'},
    {type: 'code', content: '% npm install markstruct'},
    {type: 'listitem', content: 'Structured editor for markdown.'},
    {type: 'listitem', content: 'Structured editor for markdown.'},
    {type: 'heading', level: 2, content: 'Motivation'},
    {type: 'paragraph', content: 'Phasellus pellentesque sed nisi nec lobortis. Suspendisse vestibulum pellentesque viverra. *Aliquam* erat volutpat. Proin laoreet, erat laoreet dignissim varius, metus ipsum pretium lorem, a aliquet risus ipsum in ante. Ut tempus augue et orci semper, eget lacinia orci fermentum. Proin iaculis, ipsum non eleifend rutrum, arcu lacus rhoncus dui, ac faucibus justo tellus eget tortor. Nulla imperdiet nisi in elementum malesuada. Ut ullamcorper augue turpis, ac scelerisque est scelerisque non. Proin eu libero est.'}
];

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

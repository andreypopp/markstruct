require('./styles.styl');

var React     = require('react-tools/build/modules/React'),
    ReactApp  = require('react-app'),
    serialize = require('../serializer'),
    parse     = require('../parser'),
    Editor    = require('../index.jsx');

var doc = [
  { type: 'heading', level: 1, content: 'markstruct' },
  { type: 'paragraph',
    content: 'Block-based structured editor for markdown.',
    annotations: [{type: 'em', range: [0, 11]}, {type: 'em', range: [15, 20]}] },
  { type: 'paragraph', content: 'It features:' },
  { type: 'listitem',
    content: 'Multiple block types (paragraphs, headings, code blocks, images, horizontal\nlines...)',
    annotations: [{type: 'em', range: [78, 80]}]},
  { type: 'listitem',
    content: 'Multiple block types (paragraphs, headings, code blocks, images, horizontal\nlines...)',
    annotations: [{type: 'em', range: [76, 80]}]},
  { type: 'listitem',
    content: 'Refactorings by moving blocks around (use Shift+Arrow keys)' },
  { type: 'listitem',
    content: 'Natural navigaton between blocks with arrow keys' },
  { type: 'heading', level: 2, content: 'Quickstart' },
  { type: 'paragraph', content: 'Install via npm:' },
  { type: 'code', content: '% npm install markstruct' },
  { type: 'paragraph',
    content: 'It is implemented as a React component:' },
  { type: 'code',
    content: 'var React = require(\'react-core\'),\n    Markstruct = require(\'markstruct\'),\n    parse = require(\'markstruct/parser\');\n\nvar doc = parse([\n  \'# Hello, world!\',\n  \'This is my first markdown document.\'\n].join(\'\\n\'));\n\nvar App = React.createClass({\n  render: function() {\n    return React.DOM.div({className: "App"}, Markstruct({doc: doc}));\n  }\n});' },
  { type: 'paragraph',
    content: 'There will be a build soon which allow you to use markstruct standalone or with\na library of your choice.' },
  { type: 'heading', level: 2, content: 'Development' },
  { type: 'paragraph',
    content: 'Clone, change directory, install depenendencies and run development server:' },
  { type: 'code',
    content: '% git clone https://github.com/andreypopp/markstruct.git\n% cd markstruct\n% make install run' },
  { type: 'paragraph',
    content: 'On code modifications everything will be rebuilt.' } ]

function replaceDoc(newDoc) {
  while (doc.length > 0)
    doc.shift();
  newDoc.forEach(function(block) { doc.push(block); });
}

function updatePage() {
  var runtime = require('react-app/runtime/browser');
  runtime.app.page.forceUpdate();
}

window.onload = function() {
  document.body.ondragover = function () { return false; };
  document.body.ondragend = function () { return false; };
  document.body.ondrop = function(e) {
    var files = e.dataTransfer.files;
    [].forEach.call(files, function(file) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var text = e.target.result;
        var newDoc = parse(text);
        replaceDoc(newDoc);
        updatePage();
      }
      reader.readAsText(file);  
    });
    return false;
  };
}

var Tools = React.createClass({

  markdownData: function() {
    return 'data:text/html;base64,' + btoa(serialize(doc));
  },

  startNewDoc: function() {
    replaceDoc([]);
    updatePage();
  },

  updateHref: function() {
    this.refs.open.getDOMNode().href = this.markdownData();
  },

  render: function() {
    return (
      <div className="Tools">
        <a
          target="_blank"
          onClick={this.startNewDoc}
          className="button">New document</a>
        <a
          onFocus={this.updateHref}
          onMouseEnter={this.updateHref}
          target="_blank"
          href={this.markdownData()}
          ref="open"
          className="button">Open as HTML</a>
        <div className="note">
          * You can also drop a markdown file on a editor to
          start edit it
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
              <Tools />
              <Editor doc={doc} />
            </body>
          </html>
        );
      }
    })
  }
});

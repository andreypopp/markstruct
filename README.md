# markstruct

Block-based structured editor for markdown.

It features:

* Multiple block types (paragraphs, headings, code blocks, images, horizontal
  lines...)
* Refactorings by moving blocks around (use Shift+Arrow keys)
* Natural navigaton between blocks with arrow keys

## Quickstart

Install via npm:

    % npm install markstruct

It is implemented as a React component:

    var React = require('react-core'),
        Markstruct = require('markstruct'),
        parse = require('markstruct/parser');

    var doc = parse([
      '# Hello, world!',
      'This is my first markdown document.'
    ].join('\n'));

    var App = React.createClass({
      render: function() {
        return React.DOM.div({className: "App"}, Markstruct({doc: doc}));
      }
    });

There will be a build soon which allow you to use markstruct standalone or with
a library of your choice.

## Development

Clone, change directory, install depenendencies and run development server:

    % git clone https://github.com/andreypopp/markstruct.git
    % cd markstruct
    % make install run

On code *modifications* everything will be rebuilt.

var assign = require('lodash').assign;

var defaultMods = {
  altKey: false,
  shiftKey: false,
  ctrlKey: false,
  metaKey: false
}

module.exports = {
  match: function(e, code, mods) {
    var p = assign({keyCode: code}, defaultMods, mods);
    return Object.keys(p).every(function(k) {
      return p[k] === e[k];
    });
  },

  SPACE: 32,
  ENTER: 13,
  BACKSPACE: 8,
  KEY3: 51,
  KEY8: 56,
  ARROW_UP: 38,
  ARROW_DOWN: 40,
  SPACE: 32,
  TAB: 9
};

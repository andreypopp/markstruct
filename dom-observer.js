"use strict";

module.exports = {
  startObserving: function() {
    var options = this.DOMObserverOptions || {
      characterData: true,
      childList: true,
      subtree: true
    };
    this.observer = new MutationObserver(this.onDOMChanges);
    this.observer.observe(this.getDOMNode(), options);
  },

  stopObserving: function() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  },

  componentDidMount: function() {
    this.startObserving();
  },

  componentDidUpdate: function() {
    this.startObserving();
  },

  componentWillUnmount: function() {
    this.stopObserving();
  },

  componentWillUpdate: function() {
    this.stopObserving();
  }
}

module.exports = {

  split: function(block, idx) {
    var original = {annotations: []},
        splitted = {annotations: []};

    original.content = block.content.substring(0, idx);
    splitted.content = block.content.substring(idx);

    if (block.annotations) {
      block.annotations.forEach(function(a) {
        if (a.range[1] < idx) {
          original.annotations.push(a)
        } else if (a.range[0] >= idx) {
          splitted.annotations.push({
            type: a.type,
            range: [a.range[0] - idx, a.range[1] - idx]
          });
        } else {
          original.annotations.push({
            type: a.type,
            range: [a.range[0], idx]
          });
          if (a.range[1] - idx > 0)
            splitted.annotations.push({
              type: a.type,
              range: [0, a.range[1] - idx]
            });
        }
      });
    }

    return {original: original, splitted: splitted};
  },

  merge: function(a, b, insertSpace) {
    var needSuffix = insertSpace && a.content.length > 0,
        offset = needSuffix ? a.content.length + 1 : a.content.length,
        merged = {
          content: a.content + (needSuffix ? ' ' : '') + b.content,
          annotations: a.annotations ? a.annotations.slice(0) : []
        };

    if (b.annotations) {
      b.annotations.forEach(function(a) {
        merged.annotations.push({
          type: a.type,
          range: [a.range[0] + offset, a.range[1] + offset]
        });
      });
    }

    return merged;
  }
};

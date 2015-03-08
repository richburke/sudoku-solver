
var colors = require('colors');

var NEWLINE = '\n';
var CURSOR = '> ';


Array.prototype.contains = function(elem) {
  return(this.indexOf(elem) > -1);
};

Array.prototype.intersect = function(array) {
  // this is naive--could use some optimization
  var result = [];
  for ( var i = 0; i < this.length; i++ ) {
    if ( array.contains(this[i]) && !result.contains(this[i]) )
      result.push( this[i] );
  }
  return result;
};

var cellContainer = function(that, _my) {
  _my.cells = [];
  _my.potentials = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  that.add = function(cell) {
    _my.cells.push(cell);
    return this;
  };
  that.get = function(i) {
    return _my.cells[i];
  };
  that.getCells = function() {
    return _my.cells;
  };
  that.getUnresolvedCells = function() {
    return _my.cells.filter(function(cell) {
      return !cell.isKnown();
    });
  };
  that.getPotentials = function() {
    return _my.potentials;
  };
  that.removePotentials = function() {
    var self = this;
    _my.cells.forEach(function(cell) {
      if (cell.isKnown()) {
        self.removePotential(cell.getValue());
      }
    });
  };
  that.removePotential = function(v) {
    var i = _my.potentials.indexOf(v);

    if (i === -1) return this;
    _my.potentials.splice(i, 1);
    return this;
  };

  return that;
};

var board = function() {
  var _my = {};
  var that = cellContainer({}, _my);

  _my.blocks = [];
  _my.columns = [];
  _my.rows = [];

  that.initialize = function() {
    var x, r, c, i, obj;

    for (x = 0; x < 9; x++ ) {
      _my.columns.push(column());
      _my.rows.push(row().initialize({index: x}));
      _my.blocks.push(block());
    }

    this.assignBlockRowsAndColumns();

    i = 0;
    for (r=1; r <= 9; r++) {
      for (c=1; c <= 9; c++) {
        obj = cell();
        obj.initialize({row: r, column: c});

        this.getColumn(c - 1).add(obj);
        this.getRow(r - 1).add(obj);
        this.getBlock(r - 1, c - 1).add(obj);
        this.add(obj);

        i++;
      }
    }

    return this;
  };
  that.load = function(data) {
    var self = this;

    var len = _my.cells.length;
    _my.cells.forEach(function(v, i) {
      self.get(i).setValue(data[i]);
    });

    return this;
  };
  that.analyze = function() {
    var tot = 0;
    var values_set = 0;

    this.getCells().forEach(function(obj) {
      obj.reset();
      tot += obj.isKnown() ? 1 : 0;
    });
    console.log('Total known: ' + tot);

    this.getRows().forEach(function(obj) {
      obj.removePotentials();
    });
    this.getColumns().forEach(function(obj) {
      obj.removePotentials();
    });
    this.getBlocks().forEach(function(obj) {
      obj.removePotentials();
    });

    this.getUnresolvedCells().forEach(function(obj) {
      obj.removePotentials();

      if (obj.getPotentials().length == 1) {
        obj.applyPotential();
        values_set++;
      }
    });

    //this.getBlocks().forEach(function(container) {
    //  container.getUnresolvedCells().forEach(function(cell) {
    //
    //  });
    //});
    //
    //this.getColumns().forEach(function(container) {
    //  container.getUnresolvedCells().forEach(function(cell) {
    //
    //  });
    //});
    //
    //this.getRows().forEach(function(container) {
    //  container.getUnresolvedCells().forEach(function(cell) {
    //
    //  });
    //});

    //this.getBlocks().forEach(function(block) {
    //  block.getCells().forEach(function(cell) {
    //    if (cell.isKnown()) {
    //      console.log('This I know ' + cell.getValue());
    //    }
    //  });
    //  // Gather all the other values of the block
    //  // Remove them from the potentials of the cell
    //  // Gather all the other values of the row
    //  // Remove them from the potentials of the cell
    //  // Gather all the other values of the column
    //  // Remove them from the potentials of the cell
    //  // If we only have one potential, set it as its value
    //  // Set the flag indicating values set
    //});

    return values_set;
  };
  that.isComplete = function() {
    var i;
    for (i=0; i < _my.cells.length; i++) {
      if (!_my.cells[i].isKnown()) {
        return false;
      }
    }
    return true;
  };
  that.add = function(cell) {
    _my.cells.push(cell);
    return this;
  };
  that.get = function(i) {
    return _my.cells[i];
  };
  that.getCell = function(row, col) {
    return _my.cells[row * 9 + col];
  };
  that.getRow = function(i) {
    return _my.rows[i];
  };
  that.getColumn = function(i) {
    return _my.columns[i];
  };
  that.getBlock = function(r, c) {
    if (r < 3) {
      if (c < 3) {
        return _my.blocks[0];
      }
      if (c < 6) {
        return _my.blocks[3];
      }
      if (c < 9) {
        return _my.blocks[6];
      }
    }
    if (r < 6) {
      if (c < 3) {
        return _my.blocks[1];
      }
      if (c < 6) {
        return _my.blocks[4];
      }
      if (c < 9) {
        return _my.blocks[7];
      }
    }
    if (r < 9) {
      if (c < 3) {
        return _my.blocks[2];
      }
      if (c < 6) {
        return _my.blocks[5];
      }
      if (c < 9) {
        return _my.blocks[8];
      }
    }
  };
  that.getRows = function() {
    return _my.rows;
  };
  that.getColumns = function() {
    return _my.columns;
  };
  that.getBlocks = function() {
    return _my.blocks;
  };
  that.assignBlockRowsAndColumns = function() {
    _my.blocks[0].assignRows([0, 1, 2]);
    _my.blocks[0].assignColumns([0, 1, 2]);

    _my.blocks[1].assignRows([3, 4, 5]);
    _my.blocks[1].assignColumns([0, 1, 2]);

    _my.blocks[2].assignRows([6, 7, 8]);
    _my.blocks[2].assignColumns([0, 1, 2]);

    _my.blocks[3].assignRows([0, 1, 2]);
    _my.blocks[3].assignColumns([3, 4, 5]);

    _my.blocks[4].assignRows([3, 4, 5]);
    _my.blocks[4].assignColumns([3, 4, 5]);

    _my.blocks[5].assignRows([6, 7, 8]);
    _my.blocks[5].assignColumns([3, 4, 5]);

    _my.blocks[6].assignRows([0, 1, 2]);
    _my.blocks[6].assignColumns([6, 7, 8]);

    _my.blocks[7].assignRows([3, 4, 5]);
    _my.blocks[7].assignColumns([6, 7, 8]);

    _my.blocks[8].assignRows([6, 7, 8]);
    _my.blocks[8].assignColumns([6, 7, 8]);
  };
  that.render = function() {
    var s = "+ + + + + + + + + + + + +" + NEWLINE;

    s += this.getRow(0).render();
    s += this.getRow(1).render();
    s += this.getRow(2).render();
    s += "+ ----- + ----- + ----- +" + NEWLINE;
    s += this.getRow(3).render();
    s += this.getRow(4).render();
    s += this.getRow(5).render();
    s += "+ ----- + ----- + ----- +" + NEWLINE;
    s += this.getRow(6).render();
    s += this.getRow(7).render();
    s += this.getRow(8).render();

    s += "+ + + + + + + + + + + + +" + NEWLINE;

    return s;
  };
  that.toString = function() {
    var s = '';

    _my.rows.forEach(function(row) {
      s += row.toString();
      s += '\n';
    });

    return s;
  };

  return that;
};

var block = function() {
  var _my = {};
  var that = {};
  that = cellContainer(that, _my);

  _my.rows = [];
  _my.columns = [];

  that.determinePotentials = function() {

  };
  that.assignRows = function(a) {
    _my.rows = a;
  };
  that.assignColumns = function(a) {
    _my.columns = a;
  };

  return that;
};

var row = function() {
  var _my = {};
  var that = cellContainer({}, _my);

  _my.index = null;

  that.initialize = function(p) {
    _my.index = p.index;
    return this;
  };
  that.determinePotentials = function() {

  };
  that.render = function() {
    var row = "+ ";
    var cells = this.getCells();
    var len = cells.length;

    cells.forEach(function(cell, i) {
      row += cell.render() + " ";
      if ((i + 1) % 3 == 0 && i != cells.length - 1) {
        row += "| ";
      }
    });

    row += "+" + NEWLINE;
    return row;
  };
  that.toString = function() {
    var s = '';

    _my.cells.forEach(function(cell) {
      s += cell.getValue() == null ? 0 : cell.getValue();
      s += '|';
    });

    return s;
  };

  return that;
};

var column = function() {
  var _my = {};
  var that = cellContainer({}, _my);

  _my.index = null;

  that.initialize = function(p) {
    _my.index = p.index;
    return this;
  };
  that.determinePotentials = function() {

  };

  return that;
};

var cell = function() {
  var _my, that;

  _my = {
    location: {row: 0, column: 0},
    value: null,
    potentials: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    just_set: false
  };

  that = {};

  that.initialize = function(loc) {
    _my.location = loc;
  };
  that.isKnown = function() {
    return _my.value ? true : false;
  };
  that.reset = function() {
    _my.just_set = false;
  };
  that.getValue = function() {
    return _my.value;
  };
  that.setValue = function(v) {
    _my.value = v;
    _my.just_set = true;

    return this;
  };
  that.getPotentials = function() {
    return _my.potentials;
  };
  that.removePotentials = function() {
    var a = this.getPotentials().intersect(this.getRow().getPotentials());
    a = a.intersect(this.getColumn().getPotentials());
    _my.potentials = a.intersect(this.getBlock().getPotentials());

    return this;
  };
  that.applyPotential = function() {
    if (this.getPotentials().length == 1) {
      this.setValue(_my.potentials[0]);
    }
    return this;
  };
  that.getRow = function() {
    return _A_.board.getRow(_my.location.row - 1);
  };
  that.getColumn = function() {
    return _A_.board.getColumn(_my.location.column - 1);
  };
  that.getBlock = function() {
    return _A_.board.getBlock(_my.location.row - 1, _my.location.column - 1);
  };
  that.render = function() {
    if (_my.value === null) {
      return " ";
    }
    if (_my.just_set) {
      return colors.bgBlack.yellow(_my.value);
    }
    return _my.value;
  };

  return that;
};

var _A_ = (function() {
  var _my, that;

  _my = {
    status: ''
  };

  that = {};
  that.board = null;
  that.initialize = function() {
    this.board = board().initialize();
  };
  
  return that;
})();

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(data) {
  if (data === 'exit\n') {
    process.exit();
  }
  if (data === 'redraw\n') {
    process.stdout.write(_A_.board.render().inverse);
    process.stdout.write(NEWLINE + CURSOR);
    return;
  }
  if (data === 'step\n') {
    _A_.board.analyze();

    process.stdout.write(_A_.board.render().inverse);
    process.stdout.write(NEWLINE + CURSOR);
    return;
  }
  if (data === 'run\n') {
    while (!_A_.board.isComplete()) {
      // If there were no solutions found but the game isn't complete.
      if (_A_.board.analyze() < 1) {
        // We were unsuccessful.
        break;
      }

      process.stdout.write(_A_.board.render().inverse);
      process.stdout.write(NEWLINE + CURSOR);
    }

    return;
  }
  if (data === 'potentials\n') {
    process.stdout.write(_A_.board.getCell(0, 5).getPotentials().toString());
    process.stdout.write(NEWLINE + CURSOR);
    process.stdout.write(_A_.board.getCell(0, 5).getValue().toString());
    process.stdout.write(NEWLINE + CURSOR);
    return;
  }
  process.stdout.write(data);
});

/**
 * translate number->color 3
 * translate color->number blue
 *
 * red = 1
 * orange = 2
 * yellow = 3
 * lightgreen = 4
 * darkgreen = 5
 * lightblue = 6
 * darkblue = 7
 * rose = 8
 * purple = 9
 */

  /*
  value
  possibilities
  just_solved
   */
var board_state = [
  null, null, null, null, null, 4, null, null, null,
  null, 5, 4, null, 1, null, 2, 7, null,
  null, 6, null, 7, 9, null, 4, 3, 5,

  null, 2, null, 9, null, null, null, 1, 4,
  null, null, 1, null, 6, null, 3, null, null,
  4, 7, null, null, null, 1, null, 8, null,

  3, 8, 5, null, 7, 6, null, 4, null,
  null, 4, 9, null, 2, null, 1, 6, null,
  null, null, null, 3, null, null, null, null, null
];

_A_.initialize();
_A_.board.load(board_state);

process.stdout.write(_A_.board.render().inverse);

process.stdout.write(NEWLINE + CURSOR);
//process.stdout.write();

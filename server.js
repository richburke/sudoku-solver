
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//var events = require('./events');

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
        console.log('removing potential ' + cell.getValue());
        self.removePotential(cell.getValue());
      }
    });

    console.log(_my.potentials);
  };
  that.removePotential = function(v) {
    var i = _my.potentials.indexOf(v);

    if (i === -1) return this;
    _my.potentials = _my.potentials.splice(i, 1);
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

  that.initialize = function(data) {
    var x, a, r, c, i, obj, len;
    var self = this;
    //this.on('set_value', function() {console.log('value');});

    for (x = 0; x < 9; x++ ) {
      _my.columns.push(column());
      _my.rows.push(row());
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

    a = data.split(',');
    len = _my.cells.length;
    _my.cells.forEach(function(v, i) {
      self.get(i).setValue(a[i] == '' ? null : parseInt(a[i])/*, (i == len - 1)*/);
    });
  };
  that.analyze = function() {
    var value_set = false;

    var tot = 0;
    this.getCells().forEach(function(obj) {
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
        value_set = true;
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

    if (value_set) {
      if (this.isComplete()) {
        console.log('Successful!')
      }
      else {
        this.analyze();
      }
    }
    else {
      console.log('Unsuccessful.');

      console.log(this.toString());
    }
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
  var that = {};
  that = cellContainer(that, _my);

  that.determinePotentials = function() {

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
  var that = {};
  that = cellContainer(that, _my);

  that.determinePotentials = function() {

  };

  return that;
};

var cell = function() {
  var _my, that;

  _my = {
    location: {row: 0, column: 0},
    value: null,
    potentials: [1, 2, 3, 4, 5, 6, 7, 8, 9]
  };

  that = {};

  that.initialize = function(loc) {
    _my.location = loc;
  };
  that.isKnown = function() {
    return _my.value ? true : false;
  };
  that.getValue = function() {
    return _my.value;
  };
  that.setValue = function(v/*, trigger*/) {
    _my.value = v;

    //if (trigger) {
    //  $A.board.analyze();
    //}

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
      console.log('set value ' + this.getValue());
    }
    return this;
  };
  that.getRow = function() {
    return $A.board.getRow(_my.location.row - 1);
  };
  that.getColumn = function() {
    return $A.board.getColumn(_my.location.column - 1);
  };
  that.getBlock = function() {
    return $A.board.getBlock(_my.location.row - 1, _my.location.column - 1);
  };

  return that;
};

var $A = function() {
  var _my, that;

  _my = {
    status: ''
  };

  that = {};
  that.board = null;

  return that;
};
//$A.board = board();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//$A.board.initialize(',9,1,3,2,,,8,,,,7,9,,,9,,5,,,5,8,,7,,6,3,5,,,1,,,2,,,1,,,,6,,,,7,,,9,,,9,,,6,9,8,,6,,2,7,,,3,,2,,,8,6,,,,7,,,9,1,8,3,');
//$A.board.analyze();
//

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket) {
  console.log('a user connected');

  socket.on('solve', function(data){
    console.log('data: ' + data);
  });

//  socket.on('disconnect', function() {
//    console.log('user disconnected');
  });
//});

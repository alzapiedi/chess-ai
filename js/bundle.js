/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/js/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Display = __webpack_require__(1),
	    AI = __webpack_require__(7);
	
	var Game = function () {
	  var $el = $('#game');
	  this.display = new Display($el);
	  this.turn = "white";
	  this.display.setupGrid();
	  this.display.render();
	  this.board = this.display.board;
	  this.cpuPlayer = new AI(this.board, "black");
	  this.display.setListeners(this);
	  this.states = [this.board.clone()];
	}
	
	Game.prototype.chooseMove = function () {
	  this.display.selectPos(this.setStart.bind(this));
	}
	
	Game.prototype.validStart = function (pos) {
	  var board = this.board;
	  return (board.isOccupied(pos) && board.piece(pos).color == this.turn);
	}
	
	Game.prototype.setStart = function (pos) {
	  if (this.validStart(pos)) {
	    this.startPos = pos;
	    this.display.select(pos);
	    var piece = this.board.piece(pos);
	    if (piece.toString() === "king") {
	      piece.moves().forEach(function (move) {
	        if (!piece.moveThroughCheck(move)) {
	          this.display.select(move);
	        }
	      }.bind(this));
	    } else {
	      piece.moves().forEach(function (move) {
	        if (!piece.moveIntoCheck(move)) {
	          this.display.select(move);
	        }
	      }.bind(this));
	    }
	    this.chooseEnd();
	  } else if (!this.board.isOccupied(pos)) {
	    this.chooseMove();
	    this.display.flashError("No piece there");
	  } else {
	    this.chooseMove();
	    this.display.flashError("Wrong color piece");
	  }
	}
	
	Game.prototype.switchTurns = function () {
	  this.turn = this.turn === "white" ? "black" : "white";
	  if (this.board.checkmate(this.turn)) {
	    this.gameOver();
	  } else {
	    var info = this.turn === "white" ? "Your turn" : "Computer's turn"; 
	    if (this.turn === "white" && this.board.inCheck(this.turn)) {
	      info += " (CHECK)";
	    }
	    this.display.info(info);
	    var cpuMove
	    if (this.turn === "black") {
	      this.display.unselect();
	      this.display.render();
	      setTimeout(function () {
	        cpuMove = this.cpuPlayer.getMove();
	        this.board.move(cpuMove[0], cpuMove[1]);
	        this.switchTurns();
	        this.display.render();
	      }.bind(this), 500);
	    }
	  }
	}
	
	Game.prototype.gameOver = function () {
	  var winner = this.turn === "white" ? "Black" : "White";
	  this.display.info("Checkmate. " + winner + " wins!");
	}
	
	Game.prototype.chooseEnd = function () {
	  this.display.selectPos(this.setEnd.bind(this));
	}
	
	Game.prototype.setEnd = function (pos) {
	  var board = this.board;
	  var piece = board.piece(this.startPos);
	  if (piece.validMove(pos)) {
	    this.display.unselect();
	    this.display.render();
	    board.move(this.startPos, pos);
	    this.states.push(board.clone());
	    this.switchTurns();
	    this.chooseMove();
	  } else if (!this.board.inCheck(piece.color) && piece.moveIntoCheck(pos)) {
	    this.display.flashError("Cannot move into check");
	    this.display.unselect();
	    this.chooseMove();
	  } else if (this.board.inCheck(piece.color) && piece.moveIntoCheck(pos)) {
	    this.display.flashError("You are in check");
	    this.display.unselect();
	    this.chooseMove();
	  } else {
	    this.display.flashError("Illegal move");
	    this.display.unselect();
	    this.chooseMove();
	  }
	}
	
	Game.prototype.undoMove = function () {
	  if (this.states.length === 1) {
	    this.display.flashError("No moves made");
	  } else {
	    this.states.pop();
	    this.board = this.states[this.states.length - 1].clone();
	    this.switchTurns();
	    this.display.setBoard(this.board);
	    this.display.render();
	    this.chooseMove();
	  }
	}
	
	Game.prototype.newGame = function () {
	  this.display.clearListener();
	  delete this;
	  var g = new Game();
	  g.chooseMove();
	}
	
	
	
	document.addEventListener('DOMContentLoaded', function () {
	  var g = new Game();
	  window.g = g;
	  g.chooseMove();
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Board = __webpack_require__(2),
	    Utils = __webpack_require__(4);
	
	var Display = function ($el) {
	  this.$el = $el;
	  this.board = new Board();
	  this.board.populate();
	  this.info("Your turn");
	}
	
	Display.prototype.setupGrid = function () {
	  this.$el.append("<ul>");
	  var $ul = $("<ul>").addClass("chess-grid group");
	  var color = "black";
	  for (var i = 0; i < 64; i++) {
	    var pos = [parseInt(i / 8), i % 8];
	    if (i % 8 === 0) { color = color === "white" ? "black" : "white"; }
	    $("<li>").addClass("square "+color).data("pos", pos).appendTo($ul);
	    color = color === "white" ? "black" : "white";
	  }
	  this.$el.html($ul);
	}
	
	Display.prototype.setBoard = function (board) {
	  this.board = board;
	}
	
	Display.prototype.select = function (pos) {
	  $('li').each(function (i, el) {
	    if (Utils.arrayEquals($(el).data("pos"), pos)) {
	      $(el).addClass("selected");
	    }
	  });
	}
	
	Display.prototype.unselect = function () {
	  $('li').each(function (i, el) {
	    $(el).removeClass("selected");
	  });
	}
	
	Display.prototype.render = function () {
	  var pos, square;
	  var pieces = this.board.pieces();
	  $('li').each(function (i, el) {
	    square = $(el).attr("class").split(" ").slice(0,2).join(" ");
	    $(el).removeClass();
	    $(el).addClass(square);
	    pieces.forEach(function (piece) {
	      if (Utils.arrayEquals($(el).data("pos"), piece.pos)) {
	        $(el).addClass(piece.toString() + "-" + piece.color).addClass("piece");
	      }
	    })
	  });
	}
	
	Display.prototype.selectPos = function (callback) {
	  this.selectListener = $('.chess-grid').on('click', function (e) {
	    $('#errors').html("");
	    var pos = $(e.target).data("pos");
	    pos && this.selectListener.off('click') && callback(pos);
	  }.bind(this));
	}
	
	Display.prototype.setListeners = function (game) {
	    this.newGameListener = $('#new-game').on('click', function () {
	    game.newGame();
	  });
	}
	
	Display.prototype.clearListener = function () {
	  this.selectListener && this.selectListener.off('click');
	  this.undoListener && this.undoListener.off('click');
	  this.newGameListener && this.newGameListener.off('click');
	}
	
	Display.prototype.flashError = function (error) {
	  $div = $(document.getElementById('errors'));
	  $div.html(error);
	  setTimeout(function() {
	    $div.html("");
	  }, 1500);
	}
	
	Display.prototype.info = function (info) {
	  $div = $(document.getElementById('info'));
	  $div.html(info);
	}
	
	module.exports = Display;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Pieces = __webpack_require__(3),
	    Utils = __webpack_require__(4);
	
	var Board = function () {
	  this.grid = [];
	  this.cloned = false;
	  this.whitePieces = [];
	  this.blackPieces = [];
	  for (var i = 0; i < 8; i++) {
	    this.grid.push([null,null,null,null,null,null,null,null]);
	  }
	}
	
	Board.prototype.checkmate = function (color) {
	  var pieces = this.pieces(color);
	  var moves;
	  for (var i = 0; i < pieces.length; i++) {
	    moves = pieces[i].moves();
	    for (var j = 0; j < moves.length; j++) {
	      if (!pieces[i].moveIntoCheck(moves[j])) {
	        return false;
	      }
	    }
	  }
	  return true;
	}
	
	Board.prototype.setPiece = function (piece) {
	  var pos = piece.pos;
	  this.grid[pos[0]][pos[1]] = piece;
	}
	
	Board.prototype.isOccupied = function (pos) {
	  if (!this.inBounds) { return false; }
	  return !(this.grid[pos[0]][pos[1]] === null);
	}
	
	Board.prototype.pieces = function (color) {
	  if (!color) { return this.whitePieces.concat(this.blackPieces); }
	  if (color === "white") {
	    return this.whitePieces;
	  } else if (color === "black") {
	    return this.blackPieces;
	  }
	}
	
	Board.prototype.piece = function (pos) {
	  return this.grid[pos[0]][pos[1]];
	}
	
	Board.prototype.findKing = function (color) {
	  var pos;
	  this.pieces(color).forEach(function (piece) {
	    if (piece.toString() === "king") {
	      pos = piece.pos;
	    }
	  });
	  return pos;
	}
	
	
	Board.prototype.inCheck = function (color) {
	  var otherColor = color === "white" ? "black" : "white";
	  var moves;
	  var pieces = this.pieces(otherColor);
	  var kingPos = this.findKing(color);
	  for (var i = 0; i < pieces.length; i++) {
	    moves = pieces[i].moves();
	    for (var j = 0; j < moves.length; j++) {
	      if (Utils.arrayEquals(moves[j], kingPos)) {
	        return true;
	      }
	    }
	  }
	  return false;
	}
	
	Board.prototype.removePiece = function (piece) {
	  var idx;
	  if (piece.color === "white") {
	    idx = this.whitePieces.indexOf(piece);
	    this.whitePieces.splice(idx,1);
	  } else {
	    idx = this.blackPieces.indexOf(piece);
	    this.blackPieces.splice(idx,1);
	  }
	}
	
	Board.prototype.move = function (startPos, endPos) {
	  var piece = this.piece(startPos);
	  var captured = false;
	  piece.moved = true;
	  if (piece.toString() === "pawn" && Math.abs(endPos[1] - startPos[1]) === 1 && !this.isOccupied(endPos)) {
	    if (piece.color === "white") {
	      var pos = [endPos[0] + 1, endPos[1]];
	      this.grid[pos[0]][pos[1]] = null;
	    } else {
	      var pos = [endPos[0] - 1, endPos[1]];
	      this.grid[pos[0]][pos[1]] = null;
	    }
	  }
	  if (piece.toString() === "king" && endPos[1] - startPos[1] === 2) {
	    var rook = this.piece([startPos[0], 7]);
	    rook.setPos([startPos[0], 5]);
	    this.grid[startPos[0]][5] = rook;
	  }
	  if (piece.toString() === "king" && endPos[1] - startPos[1] === -2) {
	    var rook = this.piece([startPos[0], 0])
	    rook.setPos([startPos[0], 3]);
	    this.grid[startPos[0]][3] = rook;
	  }
	  if (this.isOccupied(endPos)) {
	    this.removePiece(this.piece(endPos));
	  }
	  piece.setPos(endPos);
	  this.grid[endPos[0]][endPos[1]] = piece;
	  this.grid[startPos[0]][startPos[1]] = null;
	  if (piece.toString() === "pawn" && Math.abs(endPos[0] - startPos[0]) === 2) {
	    piece.setPassant();
	  }
	}
	
	Board.prototype.inBounds = function (pos) {
	  return pos[0] >= 0 && pos[1] >= 0 && pos[0] < 8 && pos[1] < 8;
	}
	
	Board.prototype.clone = function () {
	  var passants = [];
	  this.pieces().forEach(function (piece) {
	    if (piece.toString() === "pawn" && piece.passant) {
	      passants.push(piece.pos);
	    }
	  });
	  var pieces = this.pieces().map(function (piece) {
	    return piece.getAttr();
	  });
	  var clonedBoard = new Board();
	  pieces.forEach(function (pieceObj) {
	    if (pieceObj.type === "pawn") {
	      new Pieces.Pawn({color: pieceObj.color, pos: pieceObj.pos, board: clonedBoard});
	    } else if (pieceObj.type === "bishop") {
	      new Pieces.Bishop({color: pieceObj.color, pos: pieceObj.pos, board: clonedBoard});
	    } else if (pieceObj.type === "rook") {
	      new Pieces.Rook({color: pieceObj.color, pos: pieceObj.pos, board: clonedBoard});
	    } else if (pieceObj.type === "knight") {
	      new Pieces.Knight({color: pieceObj.color, pos: pieceObj.pos, board: clonedBoard});
	    } else if (pieceObj.type === "queen") {
	      new Pieces.Queen({color: pieceObj.color, pos: pieceObj.pos, board: clonedBoard});
	    } else if (pieceObj.type === "king") {
	      new Pieces.King({color: pieceObj.color, pos: pieceObj.pos, board: clonedBoard});
	    }
	  });
	  passants.forEach(function (pos) {
	    clonedBoard.piece(pos).setPassant();
	  });
	  return clonedBoard;
	}
	
	Board.prototype.populate = function () {
	  new Pieces.Pawn({color: "black", board: this, pos: [1,0]});
	  new Pieces.Pawn({color: "black", board: this, pos: [1,1]});
	  new Pieces.Pawn({color: "black", board: this, pos: [1,2]});
	  new Pieces.Pawn({color: "black", board: this, pos: [1,3]});
	  new Pieces.Pawn({color: "black", board: this, pos: [1,4]});
	  new Pieces.Pawn({color: "black", board: this, pos: [1,5]});
	  new Pieces.Pawn({color: "black", board: this, pos: [1,6]});
	  new Pieces.Pawn({color: "black", board: this, pos: [1,7]});
	  new Pieces.Pawn({color: "white", board: this, pos: [6,0]});
	  new Pieces.Pawn({color: "white", board: this, pos: [6,1]});
	  new Pieces.Pawn({color: "white", board: this, pos: [6,2]});
	  new Pieces.Pawn({color: "white", board: this, pos: [6,3]});
	  new Pieces.Pawn({color: "white", board: this, pos: [6,4]});
	  new Pieces.Pawn({color: "white", board: this, pos: [6,5]});
	  new Pieces.Pawn({color: "white", board: this, pos: [6,6]});
	  new Pieces.Pawn({color: "white", board: this, pos: [6,7]});
	  new Pieces.Bishop({color: "white", board: this, pos: [7,2]});
	  new Pieces.Bishop({color: "white", board: this, pos: [7,5]});
	  new Pieces.Bishop({color: "black", board: this, pos: [0,2]});
	  new Pieces.Bishop({color: "black", board: this, pos: [0,5]});
	  new Pieces.Knight({color: "white", board: this, pos: [7,1]});
	  new Pieces.Knight({color: "white", board: this, pos: [7,6]});
	  new Pieces.Knight({color: "black", board: this, pos: [0,1]});
	  new Pieces.Knight({color: "black", board: this, pos: [0,6]});
	  new Pieces.Rook({color: "white", board: this, pos: [7,0]});
	  new Pieces.Rook({color: "white", board: this, pos: [7,7]});
	  new Pieces.Rook({color: "black", board: this, pos: [0,7]});
	  new Pieces.Rook({color: "black", board: this, pos: [0,0]});
	  new Pieces.Queen({color: "white", board: this, pos: [7,3]});
	  new Pieces.Queen({color: "black", board: this, pos: [0,3]});
	  new Pieces.King({color: "black", board: this, pos: [0,4]});
	  new Pieces.King({color: "white", board: this, pos: [7,4]});
	}
	
	module.exports = Board;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var Utils = __webpack_require__(4),
	    Sliding = __webpack_require__(5),
	    Stepping = __webpack_require__(6);
	
	var Piece = function (attrs) {
	  this.color = attrs.color;
	  this.board = attrs.board;
	  this.pos = attrs.pos;
	  this.enemy_color = this.color === "white" ? "black" : "white";
	}
	
	Piece.CARDINALS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
	Piece.DIAGONALS = [[-1, -1], [-1, 1], [1, 1], [1, -1]];
	
	Piece.prototype.setPos = function (pos) {
	  this.pos = pos;
	}
	
	Piece.prototype.getAttr = function () {
	  return {color: this.color, pos: this.pos, type: this.toString()};
	}
	
	Piece.prototype.validMove = function (pos) {
	  var moves = this.moves();
	  for (var i = 0; i < moves.length; i++) {
	    if (Utils.arrayEquals(moves[i], pos) && !this.moveIntoCheck(pos)) {
	      return true;
	    }
	  }
	  return false;
	}
	
	Piece.prototype.moveIntoCheck = function (endPos) {
	  var color = this.color;
	  var testBoard = this.board.clone();
	  testBoard.cloned = true;
	  testBoard.move(this.pos, endPos);
	  return testBoard.inCheck(color);
	}
	
	var Pawn = function (attrs) {
	  this.color = attrs.color;
	  this.board = attrs.board;
	  if (this.color === "white") {
	    this.board.whitePieces.push(this);
	  } else {
	    this.board.blackPieces.push(this);
	  }
	  this.pos = attrs.pos;
	  this.value = 10;
	  this.passant = false;
	  this.moves = Stepping.moves.bind(this);
	  this.board.setPiece(this);
	}
	
	Utils.inherits(Pawn, Piece);
	Pawn.prototype.getMoveDirs = function () {
	  var deltas = [];
	  var startingRank = this.color === "white" ? 6 : 1;
	  var direction = this.color === "white" ? -1 : 1;
	  var oneStepForward = [this.pos[0] + direction, this.pos[1]];
	  if (!this.board.isOccupied(oneStepForward)) {
	    deltas.push([direction, 0]);
	    if (this.pos[0] === startingRank && !this.board.isOccupied([this.pos[0] + direction*2, this.pos[1]])) {
	      deltas.push([direction * 2, 0]);
	    }
	  }
	  var left = [this.pos[0] + direction, this.pos[1] - 1];
	  var right = [this.pos[0] + direction, this.pos[1] + 1];
	  var b = this.board;
	  if ((b.inBounds(left) && b.isOccupied(left) && b.piece(left).color !== this.color)) {
	    deltas.push([direction, -1]);
	  }
	  if ((b.inBounds(right) && b.isOccupied(right) && b.piece(right).color !== this.color)) {
	    deltas.push([direction, 1]);
	  }
	  if (this.passantAdjacent()) {
	    deltas.push([direction, this.passantAdjacent()]);
	  }
	  return deltas;
	}
	
	Pawn.prototype.setPassant = function () {
	  this.passant = this.pawnLeft() || this.pawnRight();
	}
	
	Pawn.prototype.toString = function () {
	  return "pawn";
	}
	
	Pawn.prototype.pawnLeft = function () {
	  var posLeft = [this.pos[0], this.pos[1] - 1];
	  if (this.board.inBounds(posLeft) && this.board.isOccupied(posLeft) && this.board.piece(posLeft).color !== this.color && this.board.piece(posLeft).toString() === "pawn") {
	    return true;
	  }
	  return false;
	}
	
	Pawn.prototype.pawnRight = function () {
	  var posRight = [this.pos[0], this.pos[1] + 1];
	  if (this.board.inBounds(posRight) && this.board.isOccupied(posRight) && this.board.piece(posRight).color !== this.color && this.board.piece(posRight).toString() === "pawn") {
	    return true;
	  }
	  return false;
	}
	
	Pawn.prototype.passantAdjacent = function () {
	  var posLeft = [this.pos[0], this.pos[1] - 1];
	  var posRight = [this.pos[0], this.pos[1] + 1];
	  if (this.pawnLeft() && this.board.piece(posLeft).passant) {
	    return -1;
	  } else if (this.pawnRight() && this.board.piece(posRight).passant) {
	    return 1;
	  }
	  return false;
	}
	
	var Bishop = function (attrs) {
	  this.color = attrs.color;
	  this.board = attrs.board;
	  if (this.color === "white") {
	    this.board.whitePieces.push(this);
	  } else {
	    this.board.blackPieces.push(this);
	  }
	  this.pos = attrs.pos;
	  this.value = 30;
	  this.moves = Sliding.moves.bind(this);
	  this.board.setPiece(this);
	}
	Utils.inherits(Bishop, Piece);
	Bishop.prototype.getMoveDirs = function () {
	  return Piece.DIAGONALS;
	}
	Bishop.prototype.toString = function () {
	  return "bishop";
	}
	
	var Knight = function (attrs) {
	  this.color = attrs.color;
	  this.board = attrs.board;
	  if (this.color === "white") {
	    this.board.whitePieces.push(this);
	  } else {
	    this.board.blackPieces.push(this);
	  }
	  this.pos = attrs.pos;
	  this.value = 30;
	  this.moves = Stepping.moves.bind(this);
	  this.board.setPiece(this);
	}
	Utils.inherits(Knight, Piece);
	Knight.prototype.getMoveDirs = function () {
	  return [[2,1], [-2,1], [-2,-1], [2,-1], [1,2], [1,-2], [-1,2], [-1,-2]];
	}
	
	Knight.prototype.toString = function () {
	  return "knight";
	}
	
	var Rook = function (attrs) {
	  this.color = attrs.color;
	  this.board = attrs.board;
	  if (this.color === "white") {
	    this.board.whitePieces.push(this);
	  } else {
	    this.board.blackPieces.push(this);
	  }
	  this.pos = attrs.pos;
	  this.moves = Sliding.moves.bind(this);
	  this.board.setPiece(this);
	  this.moved = false;
	  this.value = 50;
	}
	Utils.inherits(Rook, Piece);
	Rook.prototype.getMoveDirs = function () {
	  return Piece.CARDINALS;
	}
	
	Rook.prototype.toString = function () {
	  return "rook";
	}
	
	var Queen = function (attrs) {
	  this.color = attrs.color;
	  this.board = attrs.board;
	  if (this.color === "white") {
	    this.board.whitePieces.push(this);
	  } else {
	    this.board.blackPieces.push(this);
	  }
	  this.pos = attrs.pos;
	  this.value = 90;
	  this.moves = Sliding.moves.bind(this);
	  this.board.setPiece(this);
	}
	Utils.inherits(Queen, Piece);
	Queen.prototype.getMoveDirs = function () {
	  return Piece.CARDINALS.concat(Piece.DIAGONALS);
	}
	Queen.prototype.toString = function () {
	  return "queen";
	}
	
	var King = function (attrs) {
	  this.color = attrs.color;
	  this.board = attrs.board;
	  if (this.color === "white") {
	    this.board.whitePieces.push(this);
	  } else {
	    this.board.blackPieces.push(this);
	  }
	  this.pos = attrs.pos;
	  this.moves = Stepping.moves.bind(this);
	  this.board.setPiece(this);
	  this.moved = false;
	  this.value = 10000;
	}
	Utils.inherits(King, Piece);
	King.prototype.getMoveDirs = function () {
	  var deltas = Piece.CARDINALS.concat(Piece.DIAGONALS);
	  var clearLeft = (!this.board.isOccupied([this.pos[0], this.pos[1] - 1]) &&
	                    !this.board.isOccupied([this.pos[0], this.pos[1] - 2]) &&
	                    !this.board.isOccupied([this.pos[0], this.pos[1] - 3]));
	  var clearRight = (!this.board.isOccupied([this.pos[0], this.pos[1] + 1]) &&
	                    !this.board.isOccupied([this.pos[0], this.pos[1] + 2]));
	  var castleLeft = clearLeft &&
	                    !this.moved &&
	                    this.board.piece([this.pos[0], 0]) &&
	                    this.board.piece([this.pos[0], 0]).toString() === "rook" &&
	                    !this.board.piece([this.pos[0], 0]).moved;
	  var castleRight = clearRight &&
	                    !this.moved &&
	                    this.board.piece([this.pos[0], 7]) &&
	                    this.board.piece([this.pos[0], 7]).toString() === "rook" &&
	                    !this.board.piece([this.pos[0], 7]).moved;
	
	  if (castleLeft) {
	    deltas.push([0, -2]);
	  }
	  if (castleRight) {
	    deltas.push([0, 2]);
	  }
	  return deltas;
	
	}
	King.prototype.validMove = function (pos) {
	  var moves = this.moves();
	  for (var i = 0; i < moves.length; i++) {
	    if (Utils.arrayEquals(moves[i], pos) && !this.moveThroughCheck(pos)) {
	      return true;
	    }
	  }
	  return false;
	}
	
	King.prototype.moveThroughCheck = function (move) {
	  if (Math.abs(this.pos[1] - move[1]) === 2) {
	    var dir = this.pos[1] - move[1] === 1 ? -1 : 1;
	    return this.moveIntoCheck(move) || this.moveIntoCheck([this.pos[0], this.pos[1] + dir]);
	  } else {
	    return this.moveIntoCheck(move);
	  }
	
	}
	King.prototype.toString = function () {
	  return "king";
	}
	
	module.exports = {
	  Piece: Piece,
	  Pawn: Pawn,
	  Bishop: Bishop,
	  Knight: Knight,
	  Rook: Rook,
	  Queen: Queen,
	  King: King
	}


/***/ },
/* 4 */
/***/ function(module, exports) {

	var Utils = {};
	
	Utils.inherits = function (subclass, parentClass) {
	  var Surrogate = function () {};
	  Surrogate.prototype = parentClass.prototype;
	  subclass.prototype = new Surrogate();
	  subclass.prototype.constructor = subclass;
	}
	
	Utils.arrayEquals = function (arr1, arr2) {
	  if (!arr1 || !arr2) {
	    return false;
	  }
	  return arr1[0] === arr2[0] && arr1[1] === arr2[1];
	}
	
	Utils.arrayReduce = function (arr) {
	  sum = 0;
	  for (var i = 0; i < arr.length; i++) {
	    sum += arr[i];
	  }
	  return sum;
	}
	
	
	module.exports = Utils;


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = {
	  moves: function () {
	    var moves = [];
	    var move;
	    var board = this.board;
	    var dirs = this.getMoveDirs();
	    for (var i = 0; i < dirs.length; i++) {
	      for (var d = 1; d < 8; d++) {
	        move = [this.pos[0] + (dirs[i][0] * d), this.pos[1] + (dirs[i][1] * d)];
	        if (!this.board.inBounds(move)) {
	          break;
	        } else if (this.board.inBounds(move) && !this.board.isOccupied(move)) {
	          moves.push(move);
	        } else if (this.board.isOccupied(move) && this.board.piece(move).color !== this.color) {
	          moves.push(move);
	          break;
	        } else {
	          break;
	        }
	      }
	    }
	    return moves;
	  }
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = {
	  moves: function () {
	    var moves = [];
	    var board = this.board
	    var dirs = this.getMoveDirs();
	    for (var i = 0; i < dirs.length; i++) {
	      var move = [this.pos[0] + dirs[i][0], this.pos[1] + dirs[i][1]];
	      if (!board.inBounds(move)) {
	        continue;
	      } else if (board.isOccupied(move) && board.piece(move).color !== this.color) {
	        moves.push(move);
	      } else if (!board.isOccupied(move)) {
	        moves.push(move)
	      }
	    }
	    return moves;
	  }
	}


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var BoardNode = __webpack_require__(8),
	    Utils = __webpack_require__(4);
	
	// Problems:
	// 1. With queen in danger prefers to put you in check than move it.
	// 2. Takes too long
	
	
	var AI = function (board, color) {
	  this.board = board;
	  this.color = color;
	  this.enemyColor = this.color === "white" ? "black" : "white";
	  this.moveNumber = 0;
	  this.iterations = 0;
	}
	
	AI.prototype.getMove = function () {
	  this.moveNumber += 2;
	  this.iterations = 0;
	  if (this.moveNumber < 5) { return this.getOpeningMove(); }
	  this.moveTree = new BoardNode(this.board, this.color, null, -11000, 11000, 11000);
	  this.currentTurn = this.color;
	  var depth = 3;
	  var totalMoves = this.getAllMoves(this.board.pieces(this.color));
	  if (!this.board.inCheck(this.color)) {
	    if (totalMoves <= 100) {
	      depth = 3;
	    } else if (totalMoves < 18) {
	      depth = 4;
	    } else if (totalMoves < 10) {
	      depth = 5;
	    }
	  }
	  this.buildMoveTree(this.moveTree, depth);
	  // this.alphaBeta(this.moveTree, depth, -11000, 11000, false);
	  var best = this.findBestMove();
	  delete this.bestNode;
	  return best;
	}
	
	AI.prototype.getOpeningMove = function () {
	  if (this.moveNumber === 2) {
	    return [[1,4],[2,4]];
	  }
	  if (this.moveNumber === 4 && this.board.piece([1,3]).validMove([3,3])) {
	    return [[1,3],[3,3]];
	  } else if (this.moveNumber === 4 && this.board.piece([2,4]).validMove([3,3])) {
	    return [[2,4],[3,3]];
	  } else {
	    return [[0,6],[2,5]];
	  }
	}
	
	AI.prototype.buildMoveTree = function (boardNode, depth) {
	  this.iterations += 1;
	  if (depth === 0) { return; }
	  var curColor = boardNode.currentTurn;
	  var nextColor = curColor === "white" ? "black" : "white";
	  var moves = this.getAllMoves(boardNode.board.pieces(curColor));
	  var testboard, move, childNode;
	  for (var i = 0; i < moves.length; i++) {
	    move = moves[i];
	    testboard = boardNode.board.clone();
	    testboard.depth = depth;
	    testboard.move(move.startPos, move.endPos);
	    childNode = boardNode.addChild(testboard, nextColor, move);
	
	///////////// BRUTE FORCE GAME TREE ///////////////
	    this.buildMoveTree(childNode, depth - 1);
	    this.assignNodeValue(childNode);
	///////////////////////////////////////////////////
	
	  //   if (depth === 1) {
	  //     childNode.boardValue = childNode.score();
	  //   }
	  //
	  //   if (nextColor === "white" && childNode.boardValue < boardNode.b) {
	  //     boardNode.b = childNode.boardValue;
	  //     boardNode.boardValue = boardNode.b;
	  //   } else if (nextColor === "black" && childNode.boardValue > boardNode.a) {
	  //     boardNode.a = childNode.boardValue;
	  //     boardNode.boardValue = boardNode.a;
	  //   }
	  //
	  //   if (childNode.boardValue >= boardNode.a && childNode.boardValue <= boardNode.b) {
	  //     this.buildMoveTree(childNode, depth - 1);
	  //   } else {
	  //     continue;
	  //   }
	  // }
	  // if (boardNode.currentTurn === "black") {
	  //   boardNode.parent && (boardNode.parent.a = boardNode.b);
	  // } else {
	  //   boardNode.parent && (boardNode.parent.b = boardNode.a);
	  // }
	  }
	}
	
	AI.prototype.alphaBeta = function (node, depth, a, b, max) {
	  this.iterations += 1;
	  if (depth === 0) {
	    node.boardValue = node.score();
	    return node.boardValue;
	  }
	  if (max) {
	    var val = -11000;
	    var child;
	    var children = node.generateChildren();
	    for (var i = 0; i < children.length; i++) {
	      child = children[i];
	      node.boardValue = Math.max(val, this.alphaBeta(child, depth - 1, node.a, node.b, false));
	      node.a = Math.max(node.a, child.boardValue);
	      if (node.a > node.b) {
	        break;
	      }
	    }
	    node.parent && (node.parent.b = node.a);
	    return node.boardValue;
	  } else {
	    var val = 11000;
	    var child;
	    var children = node.generateChildren();
	    for (var i = 0; i < children.length; i++) {
	      child = children[i];
	      child.boardValue = Math.min(val, this.alphaBeta(child, depth - 1, node.a, node.b, true));
	      node.b = Math.min(node.b, child.boardValue);
	      if (node.a > node.b) {
	        break;
	      }
	    }
	    node.parent && (node.parent.a = node.b);
	    return node.boardValue;
	  }
	}
	
	AI.prototype.assignNodeValue = function (node) {
	  if (node.children.length > 0) {
	    var childValues = node.children.map(function (childNode) {
	      return childNode.boardValue;
	    });
	      if (node.currentTurn === "white") {
	      node.boardValue = Math.max.apply(null, childValues);
	    } else {
	      node.boardValue = Math.min.apply(null, childValues);
	    }
	  } else {
	    node.boardValue = node.score();
	  }
	}
	
	AI.prototype.switchTurns = function () {
	  this.currentTurn = this.currentTurn === this.color ? this.enemyColor : this.color;
	}
	
	AI.prototype.findBestMove = function () {
	  console.log(this.iterations);
	  var c = this.moveTree.children;
	  var bestNode;
	  for (var j = 0; j < c.length; j++) {
	    if (!bestNode || c[j].boardValue < bestNode.boardValue) {
	      bestNode = c[j];
	    }
	  }
	  return [bestNode.move.startPos, bestNode.move.endPos];
	}
	
	AI.prototype.getAllMoves = function (pieces) {   //  Returns all possible moves [startPos, endPos] for a set of pieces
	  var allMoves = [];
	  var piece, move, moves;
	  for (var i = 0; i < pieces.length; i++) {
	    piece = pieces[i];
	    moves = piece.moves();
	    for (var j = 0; j < moves.length; j++) {
	      move = moves[j];
	      if (!piece.moveIntoCheck(move)) {
	        allMoves.push({piece: piece, startPos: piece.pos, endPos: move});
	      }
	    }
	  }
	  return allMoves;
	}
	
	
	module.exports = AI;
	window.AI = AI;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var Utils = __webpack_require__(4);
	
	var BoardNode = function (board, color, parent, a, b, v) {
	  this.board = board;
	  this.currentTurn = color;
	  this.children = [];
	  this.boardValue = v;
	  this.parent = parent;
	  this.a = a;
	  this.b = b;
	}
	
	BoardNode.prototype.score = function () {
	  var whitePieces = this.board.pieces("white");
	  var blackPieces = this.board.pieces("black");
	  var whiteScoreArr = whitePieces.map(function (piece) {
	    return piece.value;
	  });
	  var blackScoreArr = blackPieces.map(function (piece) {
	    return piece.value;
	  });
	  var whiteScore = Utils.arrayReduce(whiteScoreArr);
	  var blackScore = Utils.arrayReduce(blackScoreArr);
	  return whiteScore - blackScore;
	}
	
	BoardNode.prototype.addChild = function (board, color, move) {
	  var bv = color === "white" ? this.b : this.a
	  var childNode = new BoardNode(board, color, this, this.a, this.b, bv);
	  childNode.move = move;
	  this.children.push(childNode);
	  return childNode;
	}
	
	BoardNode.prototype.generateChildren = function () {
	  var curColor = this.currentTurn;
	  var nextColor = curColor === "white" ? "black" : "white";
	  var moves = this.getAllMoves(this.board.pieces(curColor));
	  var testboard, move, childNode;
	  for (var i = 0; i < moves.length; i++) {
	    move = moves[i];
	    testboard = this.board.clone();
	    testboard.move(move.startPos, move.endPos);
	    childNode = this.addChild(testboard, nextColor, move);
	  }
	  return this.children;
	}
	
	BoardNode.prototype.getAllMoves = function (pieces) {   //  Returns all possible moves [startPos, endPos] for a set of pieces
	  var allMoves = [];
	  var piece, move, moves;
	  for (var i = 0; i < pieces.length; i++) {
	    piece = pieces[i];
	    moves = piece.moves();
	    for (var j = 0; j < moves.length; j++) {
	      move = moves[j];
	      if (!piece.moveIntoCheck(move)) {
	        allMoves.push({piece: piece, startPos: piece.pos, endPos: move});
	      }
	    }
	  }
	  return allMoves;
	}
	
	module.exports = BoardNode;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map
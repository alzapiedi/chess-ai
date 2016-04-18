var Utils = require('./utils'),
    Sliding = require('./sliding'),
    Stepping = require('./stepping');

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
  this.value = 80;
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
  this.value = 100;
}
Utils.inherits(King, Piece);
King.prototype.getMoveDirs = function () {
  var deltas = Piece.CARDINALS.concat(Piece.DIAGONALS);
  // var check = this.board.inCheck(this.color);
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

var Utils = require('./utils');

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

BoardNode.prototype.isInCheck = function () {
  return this.board.inCheck(this.currentTurn);
}

BoardNode.prototype.addChild = function (board, color, move, order) {
  var bv = color === "white" ? this.b : this.a;
  var childNode = new BoardNode(board, color, this, this.a, this.b, bv);
  childNode.move = move;
  childNode.order = order;
  this.children.push(childNode);
  return childNode;
}

BoardNode.prototype.generateChildren = function () {  // For a given board node, generates and returns
  var curColor = this.currentTurn;                       // a child node for every possible move
  var nextColor = curColor === "white" ? "black" : "white";
  var moves = this.getAllMoves(this.board.pieces(curColor));
  var testboard, move, childNode;
  for (var i = 0; i < moves.length; i++) {
    move = moves[i];
    testboard = this.board.clone();
    var order = 0;
    if (testboard.isOccupied(move.endPos)) {
      order = testboard.piece(move.endPos).value;
    }
    testboard.move(move.startPos, move.endPos);
    childNode = this.addChild(testboard, nextColor, move, order);
  }
  this.children.sort(function (a, b) {
    return b.order - a.order;
  });
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

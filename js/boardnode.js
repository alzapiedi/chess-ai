var Utils = require('./utils');

var BoardNode = function (board, color, parent) {
  this.board = board;
  this.currentTurn = color;
  this.children = [];
  this.boardValue = this.score();
  this.parent = parent;
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
  var childNode = new BoardNode(board, color, this);
  childNode.move = move;
  this.children.push(childNode);
  return childNode;
}

module.exports = BoardNode;

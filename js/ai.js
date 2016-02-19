var BoardNode = require('./boardnode'),
    Utils = require('./utils');

// Problems:
// 1. With queen in danger prefers to put you in check than move it.
// 2. Takes too long


var AI = function (board, color) {
  this.board = board;
  this.color = color;
  this.enemyColor = this.color === "white" ? "black" : "white";
  this.moveNumber = 0;
  this.iterations = 0;
  this.totalGenerated = 0;
}

AI.prototype.setDepth = function () {
  var cap = this.capturablePieces();
  var moves = this.moveTree.getAllMoves(this.board.pieces(this.color));
  if (moves.length < 30) {
    if (cap.length === 0) {
      this.depth = 3;
    } else {
      var allPawns = true;
      for (var i = 0; i < cap.length; i++) {
        if (cap[i].toString() !== "pawn") {
          allPawns = false;
        }
      }
      this.depth = allPawns ? 3 : 4;
    }
  } else { this.depth = 3; }
  console.log("Depth: " + this.depth + "  Moves: " + moves.length);
}

AI.prototype.getMove = function () {
  this.moveNumber += 2;
  this.iterations = 0;
  this.pruned = 0;
  if (this.moveNumber < 5) { return this.getOpeningMove(); }
  this.moveTree = new BoardNode(this.board, this.color, null, -11000, 11000, 11000);
  this.moveTree.boardValue = this.moveTree.score();
  this.setDepth();
  this.alphaBeta(this.moveTree, this.depth, -11000, 11000, false);
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

AI.prototype.alphaBeta = function (node, depth, a, b, max) {
  node.a = a;
  node.b = b;
  this.iterations += 1;
  if (depth === 0) {
    node.boardValue = node.score();
    return node.boardValue;
  }
  if (max) {
    node.boardValue = -11000;
    var child;
    var children = node.generateChildren();
    for (var i = 0; i < children.length; i++) {
      child = children[i];
      node.boardValue = Math.max(node.boardValue, this.alphaBeta(child, depth - 1, node.a, node.b, false));
      node.a = Math.max(node.a, child.boardValue);
      if (node.a > node.b) {
        this.pruned +=1;
        break;
       }
    }
    node.parent && (node.parent.b = Math.min(node.parent.b, node.a));
    return node.boardValue;
  } else {
    node.boardValue = 11000;
    var child;
    var children = node.generateChildren();
    for (var i = 0; i < children.length; i++) {
      child = children[i];
      node.boardValue = Math.min(node.boardValue, this.alphaBeta(child, depth - 1, node.a, node.b, true));
      node.b = Math.min(node.b, child.boardValue);
      if (node.a > node.b) {
        this.pruned +=1;
        break;
      }
    }
    node.parent && (node.parent.a = Math.max(node.parent.a, node.b));
    return node.boardValue;
  }
}

AI.prototype.findBestMove = function () {
  var c = this.moveTree.children;
  var bestNode;
  for (var j = 0; j < c.length; j++) {
    if (!bestNode || c[j].boardValue < bestNode.boardValue) {
      bestNode = c[j];
    }
  }
  return [bestNode.move.startPos, bestNode.move.endPos];
}

AI.prototype.capturablePieces = function () {  // Returns enemy pieces that can be attacked, sorted by rank
  var capturable = [];
  var blackPieces = this.moveTree.board.pieces("black");
  var allMoves = this.moveTree.getAllMoves(blackPieces);
  var whitePieces = this.moveTree.board.pieces("white");
  for (var i = 0; i < allMoves.length; i++) {
    pos = allMoves[i].endPos;
    for (var j = 0; j < whitePieces.length; j++) {
      testPiece = whitePieces[j];
      if (Utils.arrayEquals(pos, testPiece.pos)) {
        capturable.push(testPiece);
      }
    }
  }
  return this.sortPiecesByPriority(capturable);
}

AI.prototype.sortPiecesByPriority = function (pieces) {
  var sorted = false;
  var first, second;
  while (!sorted) {
    sorted = true;
    for (var i = 0; i < pieces.length - 1; i++) {
      first = pieces[i];
      second = pieces[i+1];
      if (first.value < second.value) {
        pieces[i+1] = first;
        pieces[i] = second;
        sorted = false;
      }
    }
  }
  return pieces;
}


module.exports = AI;
window.AI = AI;

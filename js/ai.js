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
  // this.buildMoveTree(this.moveTree, depth);
  this.alphaBeta(this.moveTree, depth, -11000, 11000, false);
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
    // this.buildMoveTree(childNode, depth - 1);
    // this.assignNodeValue(childNode);
///////////////////////////////////////////////////

    if (depth === 1) {
      childNode.boardValue = childNode.score();
    }

    if (nextColor === "white" && childNode.boardValue < boardNode.b) {
      boardNode.b = childNode.boardValue;
      boardNode.boardValue = boardNode.b;
    } else if (nextColor === "black" && childNode.boardValue > boardNode.a) {
      boardNode.a = childNode.boardValue;
      boardNode.boardValue = boardNode.a;
    }

    if (childNode.boardValue >= boardNode.a && childNode.boardValue <= boardNode.b) {
      this.buildMoveTree(childNode, depth - 1);
    } else {
      continue;
    }
  }
  if (boardNode.currentTurn === "black") {
    boardNode.parent && (boardNode.parent.a = boardNode.b);
  } else {
    boardNode.parent && (boardNode.parent.b = boardNode.a);
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

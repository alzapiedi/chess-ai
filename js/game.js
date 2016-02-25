var Display = require('./display'),
    AI = require('./ai');

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
  this.display.render();
  this.turn = this.turn === "white" ? "black" : "white";
  if (this.board.checkmate(this.turn)) {
    this.gameOver();
  } else {
    var info = this.turn === "white" ? "Your turn" : "Computer's turn";
    if (this.turn === "white" && this.board.inCheck(this.turn)) {
      info += " (CHECK)";
    }
    this.display.info(info);
    if (this.turn === "black") {
      this.display.clearListener();
      this.display.unselect();
      this.display.render();
      setTimeout(function () {
        var cpuMove = this.cpuPlayer.getMove();
        this.board.move(cpuMove[0], cpuMove[1]);
        this.states.push(this.board.clone());
        this.switchTurns();
      }.bind(this), 50);
    } else {
      this.chooseMove();
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
    this.states.pop();
    this.cpuPlayer.moveNumber -= 2;
    this.board = this.states[this.states.length - 1].clone();
    this.turn = "white";
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

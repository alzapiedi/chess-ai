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

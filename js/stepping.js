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

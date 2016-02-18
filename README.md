# Chess AI
This is a JavaScript chess implementation that renders the board and pieces using jQuery and CSS.
The AI player recursively builds a move tree to a specified depth and applies the minimax algorithm
to find the optimal path. A leaf board state is valued by the sum of all its pieces and then passed back
up to the parent node.  The depth is currently set to 3, with a branching factor of ~35 this tree consists
of approximately 40,000 nodes and the AI returns its move in a maximum of 15 seconds.

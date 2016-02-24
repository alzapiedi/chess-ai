# [Chess AI](http://www.nickalzapiedi.com/chess-ai)
This is a JavaScript chess implementation that renders the board and pieces using jQuery and CSS.

## Algorithm
The AI player recursively builds ands prunes a move tree to a specified depth using the minimax decision algorithm and Alpha-beta pruning algorithm.  

## Move Ordering
At each node the children are generated and sorted by value of pieces captured. This is to increase the probability that a good move is found early in the depth first search, which allows the pruning algorithm to ignore the greatest amount of branches.  

## Board Evaluation
A leaf board state is valued by the sum of all its pieces and then passed back up to the parent node where the alpha, beta and node value will be updated if necessary.

# [Chess AI](http://www.nickalzapiedi.com/chess-ai)
This is a JavaScript chess implementation that renders the board and pieces using jQuery and CSS.

# Algorithms
The AI player recursively builds ands prunes a move tree to a specified depth using the minimax decision algorithm and Alpha-beta pruning algorithm.

## Minimax
The [Minimax] (http://en.wikipedia.org/wiki/Minimax) algorithm works by considering the most likely behavior of the opponent when deciding a move to make. This is crucial because as the AI searches the tree to a depth of 3 it is very likely to find board positions that are highly favorable at the bottom of the tree. However it cannot be assumed that following that path from the current state will lead to that exact ending state, because this is making assumptions about the moves your opponent will make. The AI will always assume that the opponent will act in their best interest.

## Alpha-beta
The [Alpha-beta] (https://en.wikipedia.org/wiki/Alpha-beta_pruning) pruning algorithm works by passing information about each node up to its parent as it traverses the game tree, starting from the bottom and the left (depth first). Each node is assigned an alpha and a beta value, where alpha is the maximum lower bound and beta is the minimum upper bound. As the tree is traversed there will be many nodes where the value is found to be outside of this range. This indicates that a previously calculated move is guaranteed to be a better move, and it will not calculate the current node or any of its children.

## Move Ordering
At each node the children are generated and sorted by value of pieces captured. This is to increase the probability that a narrow range of alpha and beta is established early in the depth first search, which allows the pruning algorithm to ignore the greatest amount of branches.  

## Board Evaluation
A leaf board state is valued by the sum of all its pieces and then passed back up to the parent node where the alpha, beta and node value will be updated if necessary.

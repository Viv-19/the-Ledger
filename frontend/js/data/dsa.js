export const DSA_TOPICS = [
    ['Arrays & Hashing', [['Two Sum','E'],['Contains Duplicate','E'],['Valid Anagram','E'],['Majority Element','E'],['Group Anagrams','M'],['Top K Frequent Elements','M'],['Product of Array Except Self','M'],['Longest Consecutive Sequence','M'],['Encode and Decode Strings','M'],['Subarray Sum Equals K','M'],['Sort Colors','M'],['Set Matrix Zeroes','M']]],
    ['Two Pointers', [['Valid Palindrome','E'],['Remove Duplicates from Sorted Array','E'],['Move Zeroes','E'],['Two Sum II','M'],['3Sum','M'],['4Sum','M'],['Container With Most Water','M'],['Trapping Rain Water','H']]],
    ['Sliding Window', [['Best Time to Buy and Sell Stock','E'],['Longest Substring Without Repeating Characters','M'],['Longest Repeating Character Replacement','M'],['Permutation in String','M'],['Fruit Into Baskets','M'],['Minimum Window Substring','H'],['Sliding Window Maximum','H']]],
    ['Stack', [['Valid Parentheses','E'],['Next Greater Element I','E'],['Min Stack','M'],['Evaluate Reverse Polish Notation','M'],['Generate Parentheses','M'],['Daily Temperatures','M'],['Car Fleet','M'],['Asteroid Collision','M'],['Largest Rectangle in Histogram','H']]],
    ['Binary Search', [['Binary Search','E'],['Search a 2D Matrix','M'],['Koko Eating Bananas','M'],['Find Minimum in Rotated Sorted Array','M'],['Search in Rotated Sorted Array','M'],['Time Based Key-Value Store','M'],['Split Array Largest Sum','H'],['Median of Two Sorted Arrays','H']]],
    ['Linked List', [['Reverse Linked List','E'],['Merge Two Sorted Lists','E'],['Linked List Cycle','E'],['Reorder List','M'],['Remove Nth Node From End of List','M'],['Copy List with Random Pointer','M'],['Add Two Numbers','M'],['LRU Cache','M'],['Merge k Sorted Lists','H'],['Reverse Nodes in k-Group','H']]],
    ['Trees', [['Invert Binary Tree','E'],['Maximum Depth of Binary Tree','E'],['Diameter of Binary Tree','E'],['Balanced Binary Tree','E'],['Same Tree','E'],['Subtree of Another Tree','E'],['Lowest Common Ancestor of a BST','M'],['Binary Tree Level Order Traversal','M'],['Binary Tree Right Side View','M'],['Count Good Nodes in Binary Tree','M'],['Validate Binary Search Tree','M'],['Kth Smallest Element in a BST','M'],['Construct Binary Tree from Preorder and Inorder','M'],['Binary Tree Maximum Path Sum','H'],['Serialize and Deserialize Binary Tree','H']]],
    ['Tries', [['Implement Trie (Prefix Tree)','M'],['Design Add and Search Words Data Structure','M'],['Word Search II','H']]],
    ['Heap / Priority Queue', [['Kth Largest Element in a Stream','E'],['Last Stone Weight','E'],['K Closest Points to Origin','M'],['Kth Largest Element in an Array','M'],['Task Scheduler','M'],['Design Twitter','M'],['Find Median from Data Stream','H']]],
    ['Backtracking', [['Subsets','M'],['Combination Sum','M'],['Permutations','M'],['Subsets II','M'],['Combination Sum II','M'],['Word Search','M'],['Palindrome Partitioning','M'],['Letter Combinations of a Phone Number','M'],['N-Queens','H']]],
    ['Graphs', [['Number of Islands','M'],['Clone Graph','M'],['Max Area of Island','M'],['Pacific Atlantic Water Flow','M'],['Surrounded Regions','M'],['Rotting Oranges','M'],['Course Schedule','M'],['Course Schedule II','M'],['Redundant Connection','M'],['Number of Connected Components','M'],['Graph Valid Tree','M'],['Word Ladder','H']]],
    ['Advanced Graphs', [['Network Delay Time','M'],['Cheapest Flights Within K Stops','M'],['Min Cost to Connect All Points','M'],['Reconstruct Itinerary','H'],['Swim in Rising Water','H'],['Alien Dictionary','H']]],
    ['1-D DP', [['Climbing Stairs','E'],['Min Cost Climbing Stairs','E'],['House Robber','M'],['House Robber II','M'],['Longest Palindromic Substring','M'],['Palindromic Substrings','M'],['Decode Ways','M'],['Coin Change','M'],['Maximum Product Subarray','M'],['Word Break','M'],['Longest Increasing Subsequence','M'],['Partition Equal Subset Sum','M']]],
    ['2-D DP', [['Unique Paths','M'],['Longest Common Subsequence','M'],['Best Time to Buy/Sell Stock with Cooldown','M'],['Coin Change II','M'],['Target Sum','M'],['Interleaving String','M'],['Edit Distance','M'],['Distinct Subsequences','H'],['Longest Increasing Path in a Matrix','H'],['Regular Expression Matching','H']]],
    ['Greedy', [['Maximum Subarray','M'],['Jump Game','M'],['Jump Game II','M'],['Gas Station','M'],['Hand of Straights','M'],['Merge Triplets to Form Target Triplet','M'],['Partition Labels','M'],['Valid Parenthesis String','M']]],
    ['Intervals', [['Meeting Rooms','E'],['Insert Interval','M'],['Merge Intervals','M'],['Non-overlapping Intervals','M'],['Meeting Rooms II','M'],['Minimum Interval to Include Each Query','H']]],
    ['Bit Manipulation', [['Single Number','E'],['Number of 1 Bits','E'],['Counting Bits','E'],['Reverse Bits','E'],['Missing Number','E'],['Sum of Two Integers','M'],['Reverse Integer','M']]],
    ['Math & Geometry', [['Happy Number','E'],['Plus One','E'],['Rotate Image','M'],['Spiral Matrix','M'],['Pow(x, n)','M'],['Multiply Strings','M'],['Detect Squares','M']]],
];

export const DSA = [];
DSA_TOPICS.forEach((t, ti) => {
    t[1].forEach((p, pi) => {
        DSA.push({ id: `d${ti}_${pi}`, topic: t[0], name: p[0], diff: p[1] });
    });
});

export const DSA_TARGET = 500;
export const REV_INTERVALS = [1, 3, 7, 21, 45];

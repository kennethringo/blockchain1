App folder

index.js: controls all post, get requests sent to server. Ie “mine” or get “mine transactions”. Shows endpoints in server.
miner.js: functions for miner. Mine transactions, clear own transactionPool and broadcast this.
p2p-server.js: set up server ports, listen for connections, connect to peers, deals with messages sent and received to/from other nodes (message types are chains or transactions etc)

Blockchain folder

index.js: adds new blocks to the chain, checks if incoming chain is valid and longer than current chain, replaces the old chain if yes to both.
index.test.js: tests index class, chain validation (a valid chain checks against new chain), tests that chain validation is working.
block.js: functions to create genesis block, mining blocks, getting hashes for blocks, dynamic difficulty settings (difficulty up if mining too fast, down if too slow)
block.test.js: tests the block class, makes sure hashes match difficulty with leading zeros, makes sure difficulty adjusts properly

Wallet folder

index.js: has methods to sign transactions using private key, create a new transaction/update existing transaction. Also calculate balance method (goes to most recent transaction and adds/subtracts this from balance). These methods make use of owner’s public key.
index.test.js: ensures balance calculation is correct (before and after sending/receiving money). Also ensures that balance is calculated from most recent transaction.
transaction.js: allows user to create new transactions, update existing transactions, create outputs to be stored in transaction objects and allows user to sign off on transactions. It also allows miners to receive rewards. Further allows to validate transactions based on private key and the data hash.
transaction.test.js: tests the creation of transactions (or that nothing happens if amount too high). Also tests whether transactions have been tampered with using verifyTransaction method. Also tests updating transactions works as expected. Tests sending reward to miner.
transaction-pool.js: defines methods to update or add new transactions to the transaction pool. Also checks that each transaction is valid and has valid signatures. Can also clear transaction pool.
transaction-pool.test.js: tests that adding transactions and updating transactions in pool works correctly. Also shows difference between valid/invalid transactions in the pool. Note: transactions added to the actual transaction pool will be valid. Invalid transactions are added to copy of the transaction pool for comparison.

Helper files:

chain-util.js: generates private and public key pairs for users. gives transactions unique IDs. creates hashes from data. verifies signatures on transactions.
config.js: file to set default difficulty, mine rates, initial wallet balances and reward amounts.
dev-test.js: tests things like dynamic difficulty, mine block method and wallet creation.

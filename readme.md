# abstract

[Wallet.exglos.com](https://wallet.exglos.com) is a web wallet for Ethereum that enables anyone to interact with the blockchain using just a modern browser. It requires no installation, setup, or special permissions — simply open the page and get started.

Designed with a blockchain-native philosophy, it does not mimic legacy apps or pretend to be familiar. Instead, it embraces Web3 as a new paradigm, fostering a fresh perspective on digital interactions and empowering users to engage with blockchain technology in a new consciousness.

---

## requirements

Any browser that supports ES11 (ECMAScript 2020), for example, Google Chrome 67+ or Mozilla Firefox 68+.

---

## private keys

Web3 is fundamentally about ownership. The owner who controls the private key controls the assets. This ownership comes with responsibility; it is solely the owner's choice and responsibility to keep (or not to keep) their private keys secure, utilizing proper backups and other best practices.

- The wallet does not offer a way to back up or restore private keys, empowering owners to make their own decisions regarding their assets.
- The wallet does not send private keys, ensuring that no one else has access to them.
- The wallet does not save private keys, so if the page is reloaded, owners will have to re-enter their keys.

---

## usage

### enter

To access the wallet, enter the private key in an acceptable format:
1. Mnemonic. BIP-39 mnemonic (seed phrase) is a human-readable phrase consisting of 12 to 24 words.
Example:
```
bounce jelly speak filter emotion habit faculty again this dynamic trend gorilla
```
2. Mnemonic and wallet number. A mnemonic followed by a space and the number of the wallet, which starts from 1.
Example:
```
bounce jelly speak filter emotion habit faculty again this dynamic trend gorilla 2
```
3. Mnemonic and path. A mnemonic followed by a space and a BIP-32 derivation path.
Example:
```
bounce jelly speak filter emotion habit faculty again this dynamic trend gorilla m/44'/60'/0'/0/1
```
4. Exglos password.
Example:
```
testv4KgEjnSfv0MbUYNUc7tXacm93d88e
```

---

### transfers

The wallet enables the transfer of Ether, ERC-20 tokens, and other assets using an ERC-20 compatible transfer interface.

ENS names can be used instead of Ethereum addresses throughout the wallet.

---

### exglos contract

The wallet provides an interface to interact with the exglos contract, allowing users to purchase EXG tokens and manage dividends.

---

### plus

Searching for ways to connect with other dApps and contracts, the wallet has now discovered how to interact with contracts directly. This requires an understanding of contract logic and opens up limitless possibilities. Users can enter the function ABI to specify interactions by providing the necessary arguments.
Examples:
```
function transferFrom(address from, address to, uint256 value)
```
```
deposit() payable
```
```
approve(address,uint)
```

Note: number arguments are whole numbers, without decimals.

---

### tx parameters

#### nonce
The nonce is the incrementing number of transactions for the address. Transactions are recorded sequentially based on the nonce, starting at 0. To replace a pending transaction, use the same nonce as the pending transaction. To submit a new transaction after the pending one, increment the nonce by one. 

#### gas
Gas is a network fee.

fee = amount of gas × (base price + priority price)

The amount of gas spent displays the resources (computation and storage) used to process the transaction. The same transaction may consume a different amount of gas depending on previous transactions. To set a maximum amount of gas allowed to be spent, there is a **gas limit**.

The base price is calculated for each block, and the higher the network load, the higher the base price. Every transaction included in the block pays this price. The priority fee is the tip to incentivize the network to include this transaction first. To set the maximum priority price, use the **priority gas price**, and to set the overall maximum price, use the **max gas price**.

---

## deep links

URL query parameters can modify wallet behavior or prefill input fields.

### password generation
- `passwordRandom`: any string to increase password randomness.
- `passwordLength`: desired number of symbols.

Example: [wallet.exglos.com?passwordRandom=qwerty123&passwordLength=20](https://wallet.exglos.com?passwordRandom=qwerty123&passwordLength=20)

### sending ether
- `etherAddress`: the recipient's address or ENS.
- `etherValue`: the amount of ether to send, in Ether.

Example: [wallet.exglos.com?etherAddress=0xFE4D2B57408D2EFdB86F959E076B17eB92ebC8fc&etherValue=0.001](https://wallet.exglos.com?etherAddress=0xFE4D2B57408D2EFdB86F959E076B17eB92ebC8fc&etherValue=0.001)

### sending tokens
- `tokenContract`: the contract address of the token.
- `tokenAddress`: the recipient's address or ENS name.
- `tokenValue`: the amount of tokens to send with decimals.

Example: [wallet.exglos.com?tokenContract=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&tokenAddress=0xFE4D2B57408D2EFdB86F959E076B17eB92ebC8fc&tokenValue=0.001](https://wallet.exglos.com?tokenContract=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&tokenAddress=0xFE4D2B57408D2EFdB86F959E076B17eB92ebC8fc&tokenValue=0.001)

### interaction with exglos smart contract
- `exglosValue`: the value to buy, specified in Ether.

Example: [wallet.exglos.com?exglosValue=0.001](https://wallet.exglos.com?exglosValue=0.001)

### other functions
- `plusContract`: the contract address to interact with.
- `plusFunction`: the function ABI.
- `plusArg0`, `plusArg1`,... : the values to pass to function arguments.
- `plusValue`: the value to send for payable functions, specified in Ether.

Example withdrawing 0.001 WETH:
[wallet.exglos.com?plusContract=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&plusFunction=withdraw(uint)&plusArg0=1000000000000000](https://wallet.exglos.com?plusContract=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&plusFunction=withdraw(uint)&plusArg0=1000000000000000)

---

## changelog

version 2.0.0:
- Refactored using ES11 syntax for improved maintainability.
- Introduced exglos wallet plus for direct smart contract interaction via ABI.
- Added options for optimizing gas limits and prices.

---

## roadmap

- Explore integrations with other dApps.
- Implement transaction history feature.
- Gather user feedback for improvements.

---

## bug bounty

We invite security researchers to identify vulnerabilities within [wallet.exglos.com](https://wallet.exglos.com). For each confirmed issue found, you can earn a reward of up to 20% of exglos.eth.

--- 

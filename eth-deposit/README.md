**Introduction:**

In this tutorial, we will guide you through the process of depositing Ether from Ethereum Layer 1 (L1) to an Arbitrum Layer 2 (L2) network using the Arbitrum SDK. We will walk you through the provided code and explain its functionality step by step.

**Prerequisites:**

- Basic understanding of Ethereum and Arbitrum
- Node.js installed on your machine
- Access to an Ethereum wallet with some Ether

**Step 1: Set up the project**

1. Create a new directory for your project and navigate into it:

   ```
   bashCopy code
   mkdir eth-deposit-tutorial
   cd eth-deposit-tutorial
   ```

2. Initialize a new Node.js project:

   ```
   csharpCopy code
   npm init -y
   ```

3. Install the required packages:

   ```
   bashCopy code
   npm install ethers @arbitrum/sdk dotenv arb-shared-dependencies
   ```

4. Create a `.env` file in your project directory and add the following environment variables:

   ```
   makefileCopy code
   DEVNET_PRIVKEY=YOUR_WALLET_PRIVATE_KEY
   L1RPC=YOUR_L1_RPC_URL
   L2RPC=YOUR_L2_RPC_URL
   ```

   Replace `YOUR_WALLET_PRIVATE_KEY`, `YOUR_L1_RPC_URL`, and `YOUR_L2_RPC_URL` with the respective values.

**Step 2: Understand the deposit script**

Create a new file named `eth-deposit.js` in your project directory and paste the provided code into it. Now, let's examine the code step by step:

1. Import required packages and modules:

   ```
   javascriptCopy code
   const { utils, providers, Wallet } = require('ethers')
   const {
     EthBridger,
     getL2Network,
     EthDepositStatus,
     addDefaultLocalNetwork,
   } = require('@arbitrum/sdk')
   const { parseEther } = utils
   const { arbLog, requireEnvVariables } = require('arb-shared-dependencies')
   require('dotenv').config()
   requireEnvVariables(['DEVNET_PRIVKEY', 'L1RPC', 'L2RPC'])
   ```

   - Import the ethers library for interacting with Ethereum.
   - Import necessary functions and classes from the Arbitrum SDK.
   - Import the dotenv package to load environment variables from a `.env` file.
   - Import arb-shared-dependencies for logging and checking environment variables.

2. Load environment variables:

   ```
   javascriptCopy code
   const walletPrivateKey = process.env.DEVNET_PRIVKEY
   
   const l1Provider = new providers.JsonRpcProvider(process.env.L1RPC)
   const l2Provider = new providers.JsonRpcProvider(process.env.L2RPC)
   ```

   - Ensure the required environment variables (DEVNET_PRIVKEY, L1RPC, and L2RPC) are present in the system.
   - Set up L1 and L2 providers using the L1RPC and L2RPC environment variables.

3. Set up wallets:

   ```
   javascriptCopy code
   const l1Wallet = new Wallet(walletPrivateKey, l1Provider)
   const l2Wallet = new Wallet(walletPrivateKey, l2Provider)
   ```

   - Instantiate L1 and L2 wallets using the private key from the DEVNET_PRIVKEY environment variable.
   - Connect the L1 and L2 wallets to their respective Ethereum JSON-RPC providers.



4. Set the amount of Ether to be deposited to L2:

```
javascriptCopy code
const ethToL2DepositAmount = parseEther('0.0001')
```

- Define a variable `ethToL2DepositAmount` and set it to the desired amount of Ether to be deposited to L2 (in wei) using the `parseEther` function.

5. Main function:

```
javascriptCopy code
const main = async () => {
  await arbLog('Deposit Eth via Arbitrum SDK')
...
}
```

- Define an asynchronous main function that handles the deposit process.

6. Add the default local network configuration:

```
javascriptCopy code
addDefaultLocalNetwork()
```

- Add the default local network configuration to the SDK to allow the script to run on a local node.

7. Get the L2 network information and create an EthBridger instance:

```
javascriptCopy code
const l2Network = await getL2Network(l2Provider)
const ethBridger = new EthBridger(l2Network)
```

- Use the `getL2Network` function with the L2 provider to retrieve the L2 network information.
- Create an EthBridger instance using the L2 network information. EthBridger provides convenience methods for transferring ETH between L1 and L2.

8. Check and log the initial L2 wallet balance:

```
javascriptCopy code
const l2WalletInitialEthBalance = await l2Wallet.getBalance()
```

- Retrieve the initial balance of the L2 wallet using the `getBalance` method and store it in the `l2WalletInitialEthBalance` variable.

9. Deposit Ether from L1 to L2:

```
javascriptCopy code
const depositTx = await ethBridger.deposit({
  amount: ethToL2DepositAmount,
  l1Signer: l1Wallet,
  l2Provider: l2Provider,
})

const depositRec = await depositTx.wait()
console.warn('deposit L1 receipt is:', depositRec.transactionHash)
```

- Call the `deposit` method of the EthBridger instance, providing the deposit amount, L1 signer, and L2 provider as arguments. This method will handle transferring the Ether from L1 to L2.
- Wait for the deposit transaction to be confirmed on L1 using the `wait` method and log the transaction hash.

10. Wait for the L2 side of the transaction to be executed:

```
javascriptCopy code
console.warn('Now we wait for L2 side of the transaction to be executed ⏳')
const l2Result = await depositRec.waitForL2(l2Provider)
```

- Use the `waitForL2` method to wait for the L2 side of the transaction to be executed, meaning the Ether has been credited to the L2 wallet.

11. Check if the L2 message was successful or failed:

```
javascriptCopy code
l2Result.complete
  ? console.log(
      `L2 message successful: status: ${
        EthDepositStatus[await l2Result.message.status()]
      }`
    )
  : console.log(
      `L2 message failed: status ${
        EthDepositStatus[await l2Result.message.status()]
      }`
    )
```

- Check the `complete` property of the `l2Result` object to determine if the L2 message was successful or failed. Log the status of the message accordingly.

12. Check and log the updated L2 wallet balance:

```
javascriptCopy code
const l2WalletUpdatedEthBalance = await l2Wallet.getBalance()
console.log(
  `L2 wallet balance updated from ${l2WalletInitialEthBalance.toString()} to ${l2WalletUpdatedEthBalance.toString()}`
)
```

- Retrieve the updated balance of the L2 wallet using the `getBalance` method and store it in the `l2WalletUpdatedEthBalance` variable.
- Log the initial and updated L2 wallet balances to show the successful deposit of Ether from L1 to L2.

13. Execute the main function:

```
javascriptCopy code
main().catch(console.error)
```

- Call the main function and catch any errors, logging them to the console.

1. Import required modules:

   ```
   javascriptCopy code
   const { utils, providers, Wallet } = require('ethers')
   const {
     EthBridger,
     getL2Network,
     addDefaultLocalNetwork,
     L2ToL1Message,
   } = require('@arbitrum/sdk')
   const { parseEther } = utils
   const { arbLog, requireEnvVariables } = require('arb-shared-dependencies')
   require('dotenv').config()
   requireEnvVariables(['DEVNET_PRIVKEY', 'L2RPC', 'L1RPC'])
   ```

   - Import the necessary modules and functions from the `ethers`, `@arbitrum/sdk`, and `arb-shared-dependencies` packages.

2. Set up wallets and providers:

   ```
   javascriptCopy code
   const walletPrivateKey = process.env.DEVNET_PRIVKEY
   const l2Provider = new providers.JsonRpcProvider(process.env.L2RPC)
   const l2Wallet = new Wallet(walletPrivateKey, l2Provider)
   ```

   - Read the private key from the environment variable `DEVNET_PRIVKEY`.
   - Instantiate an L2 provider using the JSON RPC endpoint from the `L2RPC` environment variable.
   - Create an L2 wallet using the private key and the L2 provider.

3. Set the amount to be withdrawn from L2 (in wei):

   ```
   javascriptCopy code
   const ethFromL2WithdrawAmount = parseEther('0.000001')
   ```

   - Define a variable `ethFromL2WithdrawAmount` and set it to the desired amount of Ether to be withdrawn from L2 (in wei) using the `parseEther` function.

4. Define the main function:

   ```
   javascriptCopy code
   const main = async () => {
     await arbLog('Withdraw Eth via Arbitrum SDK')
   ...
   }
   ```

   - Define an asynchronous main function that handles the withdrawal process.

5. Add the default local network configuration:

   ```
   javascriptCopy code
   addDefaultLocalNetwork()
   ```

   - Add the default local network configuration to the SDK to allow the script to run on a local node.

6. Get the L2 network information and create an EthBridger instance:

   ```
   javascriptCopy code
   const l2Network = await getL2Network(l2Provider)
   const ethBridger = new EthBridger(l2Network)
   ```

   - Use the `getL2Network` function with the L2 provider to retrieve the L2 network information.
   - Create an EthBridger instance using the L2 network information. EthBridger provides convenience methods for transferring ETH between L1 and L2.

7. Check the L2 wallet's initial ETH balance:

   ```
   javascriptCopy code
   const l2WalletInitialEthBalance = await l2Wallet.getBalance()
   ```

   - Retrieve the initial balance of the L2 wallet using the `getBalance` method and store it in the `l2WalletInitialEthBalance` variable.

8. Ensure there's enough ETH to withdraw:

   ```
   javascriptCopy code
   if (l2WalletInitialEthBalance.lt(ethFromL2WithdrawAmount)) {
     console.log(
       `Oops - not enough ether; fund your account L2 wallet currently ${l2Wallet.address} with at least 0.000001 ether`
     )
     process.exit(1)
   }
   console.log('Wallet properly funded: initiating withdrawal now')
   ```

   - Compare the initial balance with the desired withdrawal amount. If there's not enough ETH in the wallet
   - , log a message and exit the process.
     - If the wallet is properly funded, log a message indicating the withdrawal process will now be initiated.

9. Initiate the withdrawal of ETH from L2 to L1:

   ```
   javascriptCopy code
   const withdrawTx = await ethBridger.withdraw({
     amount: ethFromL2WithdrawAmount,
     l2Signer: l2Wallet,
     destinationAddress: l2Wallet.address,
   })
   const withdrawRec = await withdrawTx.wait()
   ```

   - Use the `withdraw` method of the EthBridger instance to initiate the withdrawal. Pass in the withdrawal amount, the L2 signer (wallet), and the destination address (L1 wallet).
   - Wait for the transaction to be confirmed and store the receipt in the `withdrawRec` variable.

10. Log the transaction hash and withdrawal event data:

```
javascriptCopy code
console.log(`Ether withdrawal initiated! 🥳 ${withdrawRec.transactionHash}`)

const withdrawEventsData = await withdrawRec.getL2ToL1Events()
console.log('Withdrawal data:', withdrawEventsData)
console.log(
  `To claim funds (after dispute period), see outbox-execute repo 🫡`
)
```

- Log the transaction hash to indicate the withdrawal has been initiated.
- Retrieve the L2-to-L1 events from the withdrawal receipt using the `getL2ToL1Events` method and log the event data.
- Log a message indicating that the funds can be claimed after the dispute period by following the instructions in the `outbox-execute` repository.

11. Execute the main function:

```
javascriptCopy code
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
```

- Call the main function and catch any errors, logging them to the console.
# 1.Setting up the environment

## Installing Node.js

### Linux

Copy and paste these commands in a terminal:

```shell
sudo apt update
sudo apt install curl git
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### MacOS

Make sure you have `git` installed. 

There are multiple ways of installing Node.js on MacOS. We will be using [Node Version Manager (nvm)](http://github.com/creationix/nvm). Copy and paste these commands in a terminal:

```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
nvm install 18
nvm use 18
nvm alias default 18
npm install npm --global # Upgrade npm to the latest version
```



## Upgrading your Node.js installation

If your version of Node.js is older and [not supported by Hardhat](https://hardhat.org/hardhat-runner/docs/reference/stability-guarantees#node.js-versions-support) follow the instructions below to upgrade.

### Linux

1. Run `sudo apt remove nodejs` in a terminal to remove Node.js.
2. Find the version of Node.js that you want to install [here](https://github.com/nodesource/distributions#debinstall) and follow the instructions.
3. Run `sudo apt update && sudo apt install nodejs` in a terminal to install Node.js again.

### MacOS

You can change your Node.js version using [nvm](http://github.com/creationix/nvm). To upgrade to Node.js `18.x` run these in a terminal:

```markup
nvm install 18
nvm use 18
nvm alias default 18
npm install npm --global # Upgrade npm to the latest version
```



# 2.Setting up the environment

We'll install Hardhat using the Node.js package manager (`npm`), which is both a package manager and an online repository for JavaScript code.

You can use other package managers with Node.js, but we suggest you use npm 7 or higher to follow this guide. You should already have it if you followed the previous section's steps.

Open a new terminal and run these commands to create a new folder:

```shell
mkdir hardhat-tutorial
cd hardhat-tutorial
```

npm 7+

```markup
npm init
```

Now we can install Hardhat:

npm 7+

```markup
npm install --save-dev hardhat
```

In the same directory where you installed Hardhat run:

```markup
npx hardhat
```

Select `Create an empty hardhat.config.js` with your keyboard and hit enter.

```markup
$ npx hardhat
888    888                      888 888               888
888    888                      888 888               888
888    888                      888 888               888
8888888888  8888b.  888d888 .d88888 88888b.   8888b.  888888
888    888     "88b 888P"  d88" 888 888 "88b     "88b 888
888    888 .d888888 888    888  888 888  888 .d888888 888
888    888 888  888 888    Y88b 888 888  888 888  888 Y88b.
888    888 "Y888888 888     "Y88888 888  888 "Y888888  "Y888

👷 Welcome to Hardhat v2.9.9 👷‍

? What do you want to do? …
  Create a JavaScript project
  Create a TypeScript project
❯ Create an empty hardhat.config.js
  Quit
```

When Hardhat is run, it searches for the closest `hardhat.config.js` file starting from the current working directory. This file normally lives in the root of your project and an empty `hardhat.config.js` is enough for Hardhat to work. The entirety of your setup is contained in this file.

## Hardhat's architecture

### Plugins

Hardhat is unopinionated in terms of what tools you end up using, but it does come with some built-in defaults. All of which can be overridden. Most of the time the way to use a given tool is by consuming a plugin that integrates it into Hardhat.

In this tutorial we are going to use our recommended plugin, [`@nomicfoundation/hardhat-toolbox`](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-toolbox), which has everything you need for developing smart contracts.

To install it, run this in your project directory:

npm 7+

```markup
npm install --save-dev @nomicfoundation/hardhat-toolbox
```

Add the highlighted line to your `hardhat.config.js` so that it looks like this:

```js
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
};
```





# 3. Writing and compiling smart contracts

We're going to create a simple smart contract that implements a token that can be transferred. Token contracts are most frequently used to exchange or store value. We won't go in depth into the Solidity code of the contract on this tutorial, but there's some logic we implemented that you should know:

- There is a fixed total supply of tokens that can't be changed.
- The entire supply is assigned to the address that deploys the contract.
- Anyone can receive tokens.
- Anyone with at least one token can transfer tokens.
- The token is non-divisible. You can transfer 1, 2, 3 or 37 tokens but not 2.5.

TIP

You might have heard about ERC-20, which is a token standard in Ethereum. Tokens such as DAI and USDC implement the ERC-20 standard which allows them all to be compatible with any software that can deal with ERC-20 tokens. For the sake of simplicity, the token we're going to build does *not* implement the ERC-20 standard.

## Writing smart contracts

Start by creating a new directory called `contracts` and create a file inside the directory called `Token.sol`.

Paste the code below into the file and take a minute to read the code. It's simple and it's full of comments explaining the basics of Solidity.

TIP

To get syntax highlighting and editing assistance for Solidity in Visual Studio Code, try [Hardhat for Visual Studio Code](https://hardhat.org/hardhat-vscode).

```solidity
//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.9;


// This is the main building block for smart contracts.
contract Token {
    // Some string type variables to identify the token.
    string public name = "My Hardhat Token";
    string public symbol = "MHT";

    // The fixed amount of tokens, stored in an unsigned integer type variable.
    uint256 public totalSupply = 1000000;

    // An address type variable is used to store ethereum accounts.
    address public owner;

    // A mapping is a key/value map. Here we store each account's balance.
    mapping(address => uint256) balances;

    // The Transfer event helps off-chain applications understand
    // what happens within your contract.
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    /**
     * Contract initialization.
     */
    constructor() {
        // The totalSupply is assigned to the transaction sender, which is the
        // account that is deploying the contract.
        balances[msg.sender] = totalSupply;
        owner = msg.sender;
    }

    /**
     * A function to transfer tokens.
     *
     * The `external` modifier makes a function *only* callable from *outside*
     * the contract.
     */
    function transfer(address to, uint256 amount) external {
        // Check if the transaction sender has enough tokens.
        // If `require`'s first argument evaluates to `false` then the
        // transaction will revert.
        require(balances[msg.sender] >= amount, "Not enough tokens");

        // Transfer the amount.
        balances[msg.sender] -= amount;
        balances[to] += amount;

        // Notify off-chain applications of the transfer.
        emit Transfer(msg.sender, to, amount);
    }

    /**
     * Read only function to retrieve the token balance of a given account.
     *
     * The `view` modifier indicates that it doesn't modify the contract's
     * state, which allows us to call it without executing a transaction.
     */
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
}
```

TIP

`*.sol` is used for Solidity files. We recommend matching the file name to the contract it contains, which is a common practice.

## Compiling contracts

To compile the contract run `npx hardhat compile` in your terminal. The `compile` task is one of the built-in tasks.

```markup
$ npx hardhat compile
Compiling 1 file with 0.8.9
Compilation finished successfully
```

The contract has been successfully compiled and it's ready to be used.



# 4.Testing contracts

Writing automated tests when building smart contracts is of crucial importance, as your user's money is what's at stake.

To test our contract, we are going to use Hardhat Network, a local Ethereum network designed for development. It comes built-in with Hardhat, and it's used as the default network. You don't need to setup anything to use it.

In our tests we're going to use [ethers.js](https://docs.ethers.io/v5/) to interact with the Ethereum contract we built in the previous section, and we'll use [Mocha](https://mochajs.org/) as our test runner.

## Writing tests

Create a new directory called `test` inside our project root directory and create a new file in there called `Token.js`.

Let's start with the code below. We'll explain it next, but for now paste this into `Token.js`:

```js
const { expect } = require("chai");

describe("Token contract", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");

    const hardhatToken = await Token.deploy();

    const ownerBalance = await hardhatToken.balanceOf(owner.address);
    expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
  });
});
```

In your terminal run `npx hardhat test`. You should see the following output:

```markup
$ npx hardhat test

  Token contract
    ✓ Deployment should assign the total supply of tokens to the owner (654ms)


  1 passing (663ms)
```

This means the test passed. Let's now explain each line:

```js
const [owner] = await ethers.getSigners();
```

A `Signer` in ethers.js is an object that represents an Ethereum account. It's used to send transactions to contracts and other accounts. Here we're getting a list of the accounts in the node we're connected to, which in this case is Hardhat Network, and we're only keeping the first one.

The `ethers` variable is available in the global scope. If you like your code always being explicit, you can add this line at the top:

```js
const { ethers } = require("hardhat");
```

TIP

To learn more about `Signer`, you can look at the [Signers documentation](https://docs.ethers.io/v5/api/signer/).

```js
const Token = await ethers.getContractFactory("Token");
```

A `ContractFactory` in ethers.js is an abstraction used to deploy new smart contracts, so `Token` here is a factory for instances of our token contract.

```js
const hardhatToken = await Token.deploy();
```

Calling `deploy()` on a `ContractFactory` will start the deployment, and return a `Promise` that resolves to a `Contract`. This is the object that has a method for each of your smart contract functions.

```js
const ownerBalance = await hardhatToken.balanceOf(owner.address);
```

Once the contract is deployed, we can call our contract methods on `hardhatToken`. Here we get the balance of the owner account by calling the contract's `balanceOf()` method.

Recall that the account that deploys the token gets its entire supply. By default, `ContractFactory` and `Contract` instances are connected to the first signer. This means that the account in the `owner` variable executed the deployment, and `balanceOf()` should return the entire supply amount.

```js
expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
```

Here we're again using our `Contract` instance to call a smart contract function in our Solidity code. `totalSupply()` returns the token's supply amount and we're checking that it's equal to `ownerBalance`, as it should be.

To do this we're using [Chai](https://www.chaijs.com/) which is a popular JavaScript assertion library. These asserting functions are called "matchers", and the ones we're using here come from the [`@nomicfoundation/hardhat-chai-matchers`](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-chai-matchers) plugin, which extends Chai with many matchers useful to test smart contracts.

### Using a different account

If you need to test your code by sending a transaction from an account (or `Signer` in ethers.js terminology) other than the default one, you can use the `connect()` method on your ethers.js `Contract` object to connect it to a different account, like this:

```js
const { expect } = require("chai");

describe("Token contract", function () {
  // ...previous test...

  it("Should transfer tokens between accounts", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");

    const hardhatToken = await Token.deploy();

    // Transfer 50 tokens from owner to addr1
    await hardhatToken.transfer(addr1.address, 50);
    expect(await hardhatToken.balanceOf(addr1.address)).to.equal(50);

    // Transfer 50 tokens from addr1 to addr2
    await hardhatToken.connect(addr1).transfer(addr2.address, 50);
    expect(await hardhatToken.balanceOf(addr2.address)).to.equal(50);
  });
});
```

### Reusing common test setups with fixtures

The two tests that we wrote begin with their setup, which in this case means deploying the token contract. In more complex projects, this setup could involve multiple deployments and other transactions. Doing that in every test means a lot of code duplication. Plus, executing many transactions at the beginning of each test can make the test suite much slower.

You can avoid code duplication and improve the performance of your test suite by using **fixtures**. A fixture is a setup function that is run only the first time it's invoked. On subsequent invocations, instead of re-running it, Hardhat will reset the state of the network to what it was at the point after the fixture was initially executed.

```js
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Token contract", function () {
  async function deployTokenFixture() {
    const Token = await ethers.getContractFactory("Token");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const hardhatToken = await Token.deploy();

    await hardhatToken.deployed();

    // Fixtures can return anything you consider useful for your tests
    return { Token, hardhatToken, owner, addr1, addr2 };
  }

  it("Should assign the total supply of tokens to the owner", async function () {
    const { hardhatToken, owner } = await loadFixture(deployTokenFixture);

    const ownerBalance = await hardhatToken.balanceOf(owner.address);
    expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
  });

  it("Should transfer tokens between accounts", async function () {
    const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );

    // Transfer 50 tokens from owner to addr1
    await expect(
      hardhatToken.transfer(addr1.address, 50)
    ).to.changeTokenBalances(hardhatToken, [owner, addr1], [-50, 50]);

    // Transfer 50 tokens from addr1 to addr2
    // We use .connect(signer) to send a transaction from another account
    await expect(
      hardhatToken.connect(addr1).transfer(addr2.address, 50)
    ).to.changeTokenBalances(hardhatToken, [addr1, addr2], [-50, 50]);
  });
});
```

Here we wrote a `deployTokenFixture` function that does the necessary setup and returns every value we use later in the tests. Then in each test, we use `loadFixture` to run the fixture and get those values. `loadFixture` will run the setup the first time, and quickly return to that state in the other tests.

### Full coverage

Now that we've covered the basics that you'll need for testing your contracts, here's a full test suite for the token with a lot of additional information about Mocha and how to structure your tests. We recommend reading it thoroughly.

```js
// This is an example test file. Hardhat will run every *.js file in `test/`,
// so feel free to add new ones.

// Hardhat tests are normally written with Mocha and Chai.

// We import Chai to use its asserting functions here.
const { expect } = require("chai");

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage of Hardhat Network's snapshot functionality.
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// `describe` is a Mocha function that allows you to organize your tests.
// Having your tests organized makes debugging them easier. All Mocha
// functions are available in the global scope.
//
// `describe` receives the name of a section of your test suite, and a
// callback. The callback must define the tests of that section. This callback
// can't be an async function.
describe("Token contract", function () {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployTokenFixture() {
    // Get the ContractFactory and Signers here.
    const Token = await ethers.getContractFactory("Token");
    const [owner, addr1, addr2] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // its deployed() method, which happens once its transaction has been
    // mined.
    const hardhatToken = await Token.deploy();

    await hardhatToken.deployed();

    // Fixtures can return anything you consider useful for your tests
    return { Token, hardhatToken, owner, addr1, addr2 };
  }

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define each
    // of your tests. It receives the test name, and a callback function.
    //
    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // We use loadFixture to setup our environment, and then assert that
      // things went well
      const { hardhatToken, owner } = await loadFixture(deployTokenFixture);

      // `expect` receives a value and wraps it in an assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be
      // equal to our Signer's owner.
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const { hardhatToken, owner } = await loadFixture(deployTokenFixture);
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );
      // Transfer 50 tokens from owner to addr1
      await expect(
        hardhatToken.transfer(addr1.address, 50)
      ).to.changeTokenBalances(hardhatToken, [owner, addr1], [-50, 50]);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await expect(
        hardhatToken.connect(addr1).transfer(addr2.address, 50)
      ).to.changeTokenBalances(hardhatToken, [addr1, addr2], [-50, 50]);
    });

    it("Should emit Transfer events", async function () {
      const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      // Transfer 50 tokens from owner to addr1
      await expect(hardhatToken.transfer(addr1.address, 50))
        .to.emit(hardhatToken, "Transfer")
        .withArgs(owner.address, addr1.address, 50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await expect(hardhatToken.connect(addr1).transfer(addr2.address, 50))
        .to.emit(hardhatToken, "Transfer")
        .withArgs(addr1.address, addr2.address, 50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { hardhatToken, owner, addr1 } = await loadFixture(
        deployTokenFixture
      );
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner.
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("Not enough tokens");

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });
});
```

This is what the output of `npx hardhat test` should look like against the full test suite:

```markup
$ npx hardhat test

  Token contract
    Deployment
      ✓ Should set the right owner
      ✓ Should assign the total supply of tokens to the owner
    Transactions
      ✓ Should transfer tokens between accounts (199ms)
      ✓ Should fail if sender doesn’t have enough tokens
      ✓ Should update balances after transfers (111ms)


  5 passing (1s)
```

Keep in mind that when you run `npx hardhat test`, your contracts will be automatically compiled if they've changed since the last time you ran your tests.



# 5. Debugging with Hardhat Network

Hardhat comes built-in with Hardhat Network, a local Ethereum network designed for development. It allows you to deploy your contracts, run your tests and debug your code, all within the confines of your local machine. It's the default network Hardhat that connects to, so you don't need to set up anything for it to work. Just run your tests.

## Solidity `console.log`

When running your contracts and tests on Hardhat Network you can print logging messages and contract variables calling `console.log()` from your Solidity code. To use it you have to import `hardhat/console.sol` in your contract code.

This is what it looks like:

```solidity
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract Token {
  //...
}
```

Then you can just add some `console.log` calls to the `transfer()` function as if you were using it in JavaScript:

```solidity
function transfer(address to, uint256 amount) external {
    require(balances[msg.sender] >= amount, "Not enough tokens");

    console.log(
        "Transferring from %s to %s %s tokens",
        msg.sender,
        to,
        amount
    );

    balances[msg.sender] -= amount;
    balances[to] += amount;

    emit Transfer(msg.sender, to, amount);
}
```

The logging output will show when you run your tests:

```markup
$ npx hardhat test

  Token contract
    Deployment
      ✓ Should set the right owner
      ✓ Should assign the total supply of tokens to the owner
    Transactions
Transferring from 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 to 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 50 tokens
Transferring from 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 to 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc 50 tokens
      ✓ Should transfer tokens between accounts (373ms)
      ✓ Should fail if sender doesn’t have enough tokens
Transferring from 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 to 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 50 tokens
Transferring from 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 to 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc 50 tokens
      ✓ Should update balances after transfers (187ms)


  5 passing (2s)
```

Check out the [documentation](https://hardhat.org/hardhat-network#console.log) to learn more about this feature.



# 6. Deploying to a live network(Layer1)

Once you're ready to share your dApp with other people, you may want to deploy it to a live network. This way others can access an instance that's not running locally on your system.

The "mainnet" Ethereum network deals with real money, but there are separate "testnet" networks that do not. These testnets provide shared staging environments that do a good job of mimicking the real world scenario without putting real money at stake, and [Ethereum has several](https://ethereum.org/en/developers/docs/networks/#ethereum-testnets), like *Sepolia* and *Goerli*. We recommend you deploy your contracts to the *Sepolia* testnet.

At the software level, deploying to a testnet is the same as deploying to mainnet. The only difference is which network you connect to. Let's look into what the code to deploy your contracts using ethers.js would look like.

The main concepts used are `Signer`, `ContractFactory` and `Contract` which we explained back in the [testing](https://hardhat.org/tutorial/testing-contracts) section. There's nothing new that needs to be done when compared to testing, given that when you're testing your contracts you're *actually* making a deployment to your development network. This makes the code very similar, or even the same.

Let's create a new directory `scripts` inside the project root's directory, and paste the following into a `deploy.js` file in that directory:

```js
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();

  console.log("Token address:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

To tell Hardhat to connect to a specific Ethereum network, you can use the `--network` parameter when running any task, like this:

```markup
npx hardhat run scripts/deploy.js --network <network-name>
```

With our current configuration, running it without the `--network` parameter would cause the code to run against an embedded instance of Hardhat Network. In this scenario, the deployment actually gets lost when Hardhat finishes running, but it's still useful to test that our deployment code works:

```markup
$ npx hardhat run scripts/deploy.js
Deploying contracts with the account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account balance: 10000000000000000000000
Token address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## Deploying to remote networks

To deploy to a remote network such as mainnet or any testnet, you need to add a `network` entry to your `hardhat.config.js` file. We’ll use Sepolia for this example, but you can add any network similarly:

Infura

Alchemy

```js
require("@nomicfoundation/hardhat-toolbox");

// Go to https://infura.io, sign up, create a new API key
// in its dashboard, and replace "KEY" with it
const INFURA_API_KEY = "KEY";

// Replace this private key with your Sepolia account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts
const SEPOLIA_PRIVATE_KEY = "YOUR SEPOLIA PRIVATE KEY";

module.exports = {
  solidity: "0.8.9",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    }
  }
};
```

We're using [Infura](https://infura.io/) or [Alchemy](https://alchemy.com/), but pointing `url` to any Ethereum node or gateway. Go grab your API key and come back.

To deploy on Sepolia you need to send some Sepolia ether to the address that's going to be making the deployment. You can get testnet ether from a faucet, a service that distributes testing-ETH for free. Here is one for Sepolia:

- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)

You'll have to change Metamask's network to Sepolia before transacting.

TIP

You can learn more about other testnets and find links to their faucets on the [ethereum.org site](https://ethereum.org/en/developers/docs/networks/#ethereum-testnets).

Finally, run:

```markup
npx hardhat run scripts/deploy.js --network sepolia
```

If everything went well, you should see the deployed contract address.





# 7. Arbitrum

Arbitrum is a Layer 2 scaling solution for Ethereum that aims to improve the blockchain's scalability, speed, and reduce gas fees. It leverages a technique called Optimistic Rollups, which bundles multiple transactions into a single proof, enabling a significant increase in the number of transactions that can be processed per second. The core idea behind Arbitrum is to move the majority of computation off-chain, which reduces the burden on the Ethereum mainnet.



## Get Arbitrum Goerli Testnet Tokens

An Arbitrum faucet is a crypto faucet for the Arbitrum network. Executing transactions on a blockchain network generally requires gas fees. To avoid unnecessary costs, developers usually use testnets to try their projects in a safe and secure environment. For example, for the Arbitrum network, the main testnet is called the ”Arbitrum Goerli testnet”. However, developers still need to pay for transactions on a testnet using the network’s native currency. Fortunately, it is possible to get free tokens for most testnets through crypto faucets! 

Faucets are generally web-based applications allowing anyone to get a fixed amount of testnet tokens. Although some faucets are different, most only require a single input in the form of a Web3 wallet address. Once inputted, all it takes is a click of a button, and the user will receive testnet tokens in return. From there, these tokens can be used to pay for transactions, meaning developers can avoid committing real tokens during the development stages of their projects. 

In conclusion, an Arbitrum faucet provides the functionality above for the Arbitrum Goerli testnet!

### Step 1: Download and Set Up an Arbitrum-Compatible Crypto Wallet 

This first step will show you how to acquire an Arbitrum-compatible Web3 wallet. Specifically, we will use MetaMask to illustrate how to get testnet tokens using the Arbitrum Goerli faucet. However, you can use any wallet you prefer. Just know that by opting for another alternative, the initial two steps might occasionally differ.

*Note: If you already have a Web3 wallet, skip this step and move straight to the next section.*

To kick things off, visit ”metamask.io” and hit ”Download” at the bottom left of the page: 

![img](https://lh6.googleusercontent.com/dC6Oau8rX-n7xxRSK9aqP-Y6a9gQSeGJZZl6U9oD-yljbAt56p0vCVLfy-N3FDhzwgNxzyXOU4sIH0ClPgDtCn6Fv8DLL3bfF0FFe6kE02OTiKU5j4yI0IWsjgY5UNQVWB2UJ8hK_us-NvP0aRwzkLU)

From there, add MetaMask as an extension for your browser: 

![img](https://lh5.googleusercontent.com/EwlfAd1iJCKnwexlBvBg1E_irKrulkYaBhB_HZt2BVTeXsi-7D0qw908KJrxHTvAnyjqopL_f8uXPd7bnQBsfP5-I_mUbIS1XHk_BfgEfpmCJ5gK5NVsdAPCsdKMszPdOnFowyLwxJhPWc4FflbCFUk)

As soon as you add MetaMask as a browser extension, you will be redirected to the page down below. Continue by clicking on ”Create a new wallet” and follow the instructions to set up a new account: 

![img](https://lh4.googleusercontent.com/lvA0xU_HLDpS42ZOWLsC9mElPLq8ZSufxwCr7OsQ4ElCUsavLM9Kea1iLCsTeSrxqowDb-6-hsVeyKOr1kTDCPRS7AeqT6irMa_sN3yezUQb4pFzBM-_7KeE1uSyGr-rkMjJcxyN88TTB6XM5fQXLNo)

Once you create your account, you should find yourself with something looking similar to this: 

![img](https://lh6.googleusercontent.com/fbUxOcA91fwr_YJquTI_wIeeqyxV4mpserJEXLS-XpTOp-Als0TDsfbkrIETRQAHq_A4LLbIFMEY28Id_w87fm1RDW4PXWVAKu8E3gdW2cmJBkBkcp-WhZ-kRoSnLMjbh3AUWjwpstKCKo0ih0ZMGTo)

### Step 2: Add the Arbitrum Goerli Testnet 

With a MetaMask wallet at your disposal, the next step is to add the Arbitrum Goerli testnet to your account. To do so, start by visiting ”*https://goerli.arbiscan.io/*”, scroll down to the bottom of the page, and click on ”Add Arbitrum One Testnet Network”: 

![img](https://lh3.googleusercontent.com/rgrVhp3vWRnfTokMCGktCYdrttCYFe9QnPAY5FSDVOVdBl4Z4HbakjGuA-WbFvBnL8h6wWh97VD2mPjnw7ktiNkOYxvsF6fCW6Gc6if74q_t_xwT19cZR8Dz092g_PbXbVP599XA9YpRzSk2rZo4B2Y)

Doing so will prompt your MetaMask wallet, allowing you to add the Arbitrum Goerli testnet with the click of a button: 

![img](https://lh4.googleusercontent.com/-ML2nANkE0qJXvXtt0GrRdh1iYO4Vr_4ve_TB-b46vqx5-TFEzGBYpMaGNODLO32rmnOdGiO-KWoZ-XJwxljhvmEI9a3bs7gLOakWk1VHOyy07G5MpY929mDIu_cqYiPm9PaoH00PMfEptAPr0iel-o)

Once you click on ”Approve”, you will be asked to switch networks. Go ahead and click on ”Switch network”: 

![img](https://lh3.googleusercontent.com/HzoiPgcokvSN1GOwR4TfC3ddUYho68rJH_nBKOrYnk-h4z9uftmf9xINzeZv0RtTQaxQm2CPcQQUWKI_sPvvU6vH_70-tX1T75vPI7QitoT66-FKm1muakbJUR-PkI8EEt9fbTt-2cyNqVM5USfVmdE)

Clicking on this button will automatically add and switch to the Arbitrum Goerli testnet: 

![img](https://lh3.googleusercontent.com/CdB0xXabuOdJOjqAlnHscg7EURi_n7k9zU2Y3SemsUBrydx_mnDJ7iVz56_LqeWApPzzXrqjtjAUWZ9WWzxWV5mPBAL-BevzjEvwn5q4oii9jP-hlwGtDSPJbyLC1sfvEfSih-y5EOqnq-_KCKvYFAQ)

From here, the final step is to use the best Arbitrum Goerli faucet to acquire some testnet tokens! 

### Step 3: Get Arbitrum Goerli Testnet Tokens Using the Crypto Faucet 

For the final step of the tutorial, start by opening your Web3 wallet and copying the address:

![img](https://lh4.googleusercontent.com/YRsDHY2IfPyLp7cVNTL2ptL03Yy93pfshUtjuNEtpOOcrWEXPRlysgW_5xDs-ItwdvDhbN4KXYHrEdffSfATIE6pfpOmctRBIJ5zIEoudTVgKQzr2dIyh_oLDYNPQ8XWC-_gQiv2HRB9RTZ5smY7Kks)

Clicking on this link https://faucet.triangleplatform.com/arbitrum/goerli takes you to the following page, where you need to insert your wallet address and hit the request button: 

![Arbitrum Faucet Landing Page with Input Fields](https://moralis.io/wp-content/uploads/2023/02/Arbitrum-Faucet-Landing-Page-with-Input-Fields-1024x255.png)

As soon as the transaction finalizes, you should have received 0.001 ETH in your wallet: 



# 8. Deploying to a live network(Layer2)

Same as Layer1, to deploy to a remote layer2 network, you need to add a `network` entry to your `hardhat.config.js` file. 

```
require("@nomicfoundation/hardhat-toolbox");
const DEVNET_PRIVKEY= "YOUR ARBITRUM PRIVATE KEY";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    l2: {
      url: `https://goerli-rollup.arbitrum.io/rpc`,
      accounts: [DEVNET_PRIVKEY]
    }
  }
};
```

Finally, run

```shell
npx hardhat run scripts/deploy.js
```


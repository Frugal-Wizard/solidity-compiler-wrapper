# README

## What is this?

This is a just a wrapper for [solc-js](https://github.com/ethereum/solc-js) meant to simplify its use in build tasks and provide some functionality usually expected when handling Solidity projects.

## What extra functionality does it provide?

* Handles importing Solidity files from node_modules.
* Strongly typed compilation results.

## Should I use this?

Currently it's not to be considered stable and it's pretty much ad-hoc code extracted from reused code in the building process of several Solidity projects.

So, use at your own discretion and don't rely on its interface staying backward compatible.

## How do I use this?

```typescript
import compileSolidity from '@frugal-wizard/solidity-compiler-wrapper';

const compiled = compileSolidity('path/to/contracts', 'Contract.sol', { optimizer: { enabled: true } });

// ethers

const contract = new ethers.Contract(address, compiled['Contract'].abi, signerOrProvider);

const contractFactory = ethers.ContractFactory.fromSolidity(compiled['Contract'], signer);

// web3

const contract = new web3.eth.Contract(compiled['Contract'].abi);

contract.deploy(compiled['Contract'].evm.bytecode.object);
```

## How do I use the CLI command?

```
wsolc <contractsDir>

compile solitidy files

Positionals:
  contractsDir  Contracts folder

Options:
  --help           Show help                                           [boolean]
  --version        Show version number                                 [boolean]
  --outputDir      Output folder                       [default: <contractsDir>]
  --saveInputJson  Save input JSON                                     [boolean]
  --optimize       Enable optimizer                                    [boolean]
  --prettyJson     Output prettified JSON                              [boolean]
  --viaIR          Change compilation pipeline to go through the Yul
                   intermediate representation                         [boolean]
  --evmVersion     Version of the EVM to compile for
       [choices: "homestead", "tangerineWhistle", "spuriousDragon", "byzantium",
        "constantinople", "petersburg", "istanbul", "berlin", "london", "paris",
                                                                     "shanghai"]
```

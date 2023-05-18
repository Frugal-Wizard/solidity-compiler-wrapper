import { readFileSync } from 'fs';
import { EVMVersion } from '../src/solidity-compiler';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const solc: { compile(input: string): string } = require('solc');

export function getExpectedCompileResult({
    optimize, viaIR, evmVersion
}: {
    optimize?: boolean;
    viaIR?: boolean;
    evmVersion?: EVMVersion | `${EVMVersion}`;
}) {
    return JSON.parse(solc.compile(JSON.stringify({
        language: 'Solidity',
        sources: {
            ['Test.sol']: {
                content: readFileSync(join(__dirname, 'contracts', 'Test.sol')).toString()
            }
        },
        settings: {
            optimizer: { enabled: optimize },
            viaIR,
            evmVersion,
            outputSelection: {
                '*': {
                    '*': [ 'abi', 'evm.bytecode' ]
                }
            }
        }
    }))).contracts['Test.sol'];
}

import { expect } from 'chai';
import { join } from 'path';
import compileSolidity, { JSON_INPUT } from '../src/solidity-compiler';
import { EVMVersion } from '../dist/solidity-compiler';
import { getExpectedCompileResult } from './solc';

describe('compileSolidity', function() {
    for (const optimize of [ undefined, false, true ]) describe(`optimize = ${optimize}`, function() {
        for (const viaIR of [ undefined, false, true ]) describe(`viaIR = ${viaIR}`, function() {
            for (const evmVersion of [ undefined, EVMVersion.PARIS, EVMVersion.SHANGHAI ]) describe(`evmVersion = ${evmVersion}`, function() {
                it('should return same result as solc', function() {
                    const expectedResult = getExpectedCompileResult({ optimize, viaIR, evmVersion });
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [JSON_INPUT]: ignore, ...result } = compileSolidity(join(__dirname, 'contracts'), 'Test.sol', { optimizer: { enabled: optimize }, viaIR, evmVersion });
                    expect(result).to.be.deep.equal(expectedResult);
                });
            });
        });
    });
});

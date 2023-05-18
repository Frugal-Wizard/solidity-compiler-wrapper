import { execFileSync } from 'child_process';
import { join } from 'path';
import { rimrafSync } from 'rimraf';
import { getExpectedCompileResult } from './solc';
import { readFileSync } from 'fs';
import { expect } from 'chai';
import { EVMVersion } from '../dist/solidity-compiler';

const wsolc = join(__dirname, '..', 'dist', 'wsolc.js');
const contractsDir = join(__dirname, 'contracts');
const artifactsDir = join(__dirname, 'artifacts');

describe('wsolc', function() {
    beforeEach(function() {
        rimrafSync(artifactsDir);
    });

    after(function() {
        rimrafSync(artifactsDir);
    });

    for (const optimize of [ false, true ]) describe(`optimize = ${optimize}`, function() {
        for (const viaIR of [ false, true ]) describe(`viaIR = ${viaIR}`, function() {
            for (const evmVersion of [ undefined, EVMVersion.PARIS, EVMVersion.SHANGHAI ]) describe(`evmVersion = ${evmVersion}`, function() {
                it('should produce same result as solc', function() {
                    const expectedResult = getExpectedCompileResult({ optimize, viaIR, evmVersion });
                    execFileSync(wsolc, [
                        contractsDir,
                        '--outputDir',
                        artifactsDir,
                        ...(optimize ? ['--optimize'] : []),
                        ...(viaIR ? ['--viaIR'] : []),
                        ...(evmVersion ? ['--evmVersion', evmVersion] : []),
                    ]);
                    const result = JSON.parse(readFileSync(join(artifactsDir, 'Test.json')).toString());
                    expect(result).to.be.deep.equal(expectedResult);
                });
            });
        });
    });
});

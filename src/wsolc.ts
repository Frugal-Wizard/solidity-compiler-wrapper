#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import solc, { JSON_INPUT } from './solidity-compiler';
import glob from 'glob';
import { mkdirSync, writeFileSync } from 'fs';
import { basename, dirname, join } from 'path';

yargs(hideBin(process.argv))
    .command('$0 <contractsDir>', 'compile solitidy files', yargs => {
        yargs
            .positional('contractsDir', {
                describe: 'Contracts folder',
            })
            .options({
                outputDir: {
                    describe: 'Output folder',
                    defaultDescription: '<contractsDir>',
                },
                saveInputJson: {
                    describe: 'Save input JSON',
                    type: 'boolean',
                },
                optimize: {
                    describe: 'Enable optimizer',
                    type: 'boolean',
                },
                prettyJson: {
                    describe: 'Output prettified JSON',
                    type: 'boolean',
                },
            });
    }, (argv) => {
        const {
            contractsDir,
            outputDir = contractsDir,
            saveInputJson = false,
            optimize = false,
            prettyJson = false,
        } = argv as unknown as {
            contractsDir: string;
            outputDir?: string;
            saveInputJson?: boolean;
            optimize?: boolean;
            prettyJson?: boolean;
        };
        for (const contractFile of glob.sync('**/*.sol', { cwd: contractsDir })) {
            console.log(`Compiling ${join(contractsDir, contractFile)}...`);
            const outputFile = join(outputDir, dirname(contractFile), basename(contractFile, '.sol'));
            mkdirSync(dirname(outputFile), { recursive: true });
            const output = solc(contractsDir, contractFile, { optimizer: { enabled: optimize } });
            writeFileSync(
                `${outputFile}.json`,
                JSON.stringify(output, null, prettyJson ? 2 : undefined)
            );
            if (saveInputJson) {
                writeFileSync(
                    `${outputFile}.input.json`,
                    JSON.stringify(output[JSON_INPUT], null, prettyJson ? 2 : undefined)
                );
            }
        }
    }).parseSync();

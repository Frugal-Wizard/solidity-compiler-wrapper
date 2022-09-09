import solc from 'solc';
import { resolve, join } from 'path';
import { readFileSync } from 'fs';
import { createRequire } from 'module';

export interface CompilerSettings {
    optimizer?: {
        enabled?: boolean;
        runs?: number;
        details?: {
            peephole?: boolean;
            inliner?: boolean;
            jumpdestRemover?: boolean;
            orderLiterals?: boolean;
            deduplicate?: boolean;
            cse?: boolean;
            constantOptimizer?: boolean;
            yul?: boolean;
            yulDetails?: {
                stackAllocation?: boolean;
                optimizerSteps?: string;
            };
        };
    };
    viaIR?: boolean;
    evmVersion?: 'homestead' | 'tangerineWhistle' | 'spuriousDragon' | 'byzantium' | 'constantinople' | 'petersburg' | 'istanbul' | 'berlin';
}

export interface CompiledContracts {
    [contract: string]: {
        abi: ABISpecification[];
        evm: {
            bytecode: {
                object: string;
                linkReferences: {
                    [file: string]: {
                        [library: string]: {
                            start: number;
                            length: number;
                        }[];
                    };
                };
            };
        };
    }
}

export type ABISpecification
    = ABIFunctionSpecification
    | ABIConstructorSpecification
    | ABIReceiveFunctionSpecification
    | ABIFallbackFunctionSpecification
    | ABIEventSpecification
    | ABIErrorSpecification;

export type ABIStateMutability = 'pure' | 'view' | 'nonpayable' | 'payable';

export interface ABIFunctionSpecification {
    type: 'function';
    name: string;
    inputs: ABIInputOutputSpecification[];
    outputs: ABIInputOutputSpecification[];
    stateMutability: ABIStateMutability;
}

export interface ABIConstructorSpecification {
    type: 'constructor';
    inputs: ABIInputOutputSpecification[];
    stateMutability: ABIStateMutability;
}

export interface ABIReceiveFunctionSpecification {
    type: 'receive';
}

export interface ABIFallbackFunctionSpecification {
    type: 'fallback';
    stateMutability: ABIStateMutability;
}

export interface ABIEventSpecification {
    type: 'event';
    name: string;
    inputs: ABIEventInputSpecification[];
    anonymous: boolean;
}

export interface ABIErrorSpecification {
    type: 'error';
    name: string;
    inputs: ABIInputOutputSpecification[];
}

export interface ABIInputOutputSpecification {
    name: string;
    type: string;
    internalType: string;
    components?: ABIInputOutputSpecification[];
}

export interface ABIEventInputSpecification extends ABIInputOutputSpecification {
    indexed: boolean;
}

interface CompilerOutput {
    contracts: { [file: string]: CompiledContracts };
    errors: {
        severity: string;
        formattedMessage: string;
    }[];
}

export function compileSolidity(basepath: string, sourcefile: string): CompiledContracts;
export function compileSolidity(basepath: string, sourcefile: string, settings: CompilerSettings): CompiledContracts;
export function compileSolidity(basepath: string, sourcefile: string, contents: Buffer): CompiledContracts;
export function compileSolidity(basepath: string, sourcefile: string, contents: Buffer, settings: CompilerSettings): CompiledContracts;
export function compileSolidity(basepath: string, sourcefile: string, contentsOrSettings?: Buffer | CompilerSettings, settings?: CompilerSettings): CompiledContracts {
    let contents: Buffer | undefined;
    if (contentsOrSettings) {
        if (contentsOrSettings instanceof Buffer) {
            contents = contentsOrSettings;
        } else {
            settings = contentsOrSettings;
        }
    }
    if (!contents) contents = readFileSync(resolve(basepath, sourcefile));
    if (!settings) settings = {};
    const require = createRequire(resolve(basepath, sourcefile));
    const output: CompilerOutput = JSON.parse(solc.compile(JSON.stringify({
        language: 'Solidity',
        sources: {
            [sourcefile]: {
                content: contents.toString()
            }
        },
        settings: {
            ...settings,
            outputSelection: {
                '*': {
                    '*': [ 'abi', 'evm.bytecode' ]
                }
            }
        }
    }), {
        import(path) {
            let sourcefile: string;
            try {
                sourcefile = require.resolve(path);
            } catch {
                sourcefile = resolve(basepath, path);
            }
            return {
                contents: readFileSync(sourcefile).toString()
            };
        }
    }));
    if (output.errors) {
        let fail = false;
        for (const error of output.errors) {
            switch (error.severity) {
                case 'error': {
                    fail = true;
                    console.error(error.formattedMessage);
                    break;
                }
                default: {
                    console.log(error.formattedMessage);
                    break;
                }
            }
        }
        if (fail) {
            throw new Error(`solc: failed to compile ${join(basepath, sourcefile)}`);
        }
    }
    return output.contracts[sourcefile];
}

export default compileSolidity;

declare module 'solc' {
    export function compile(input: string, options: { import: (path: string) => { contents: string } }): string;
}

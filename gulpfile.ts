import { series } from 'gulp';
import del from 'del';
import { spawn } from 'child_process';

export async function clean() {
    await del([ 'dist/**' ]);
}

export function compileTypescript() {
    return spawn('npx tsc -p src', { shell: true, stdio: 'inherit' });
}

export default function build(done: () => void) {
    void series(clean, compileTypescript)(done);
}

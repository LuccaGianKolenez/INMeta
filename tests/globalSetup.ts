import { spawn } from 'node:child_process';
export default async () => {
  await new Promise<void>((resolve, reject) => {
    const p = spawn('npm', ['run', 'migrate'], { stdio: 'inherit', shell: true });
    p.on('exit', (code) => code === 0 ? resolve() : reject(new Error('migrate failed')));
  });
};
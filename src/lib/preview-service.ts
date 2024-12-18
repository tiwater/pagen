import { ChildProcess, spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

export class PreviewService {
  private devServer: ChildProcess | null = null;
  private templatePath: string;
  private isStarting: boolean = false;
  private startPromise: Promise<void> | null = null;
  
  constructor() {
    this.templatePath = path.join(process.cwd(), 'preview');
  }

  async start() {
    if (this.devServer) {
      return;
    }

    if (this.isStarting) {
      return this.startPromise;
    }

    this.isStarting = true;
    this.startPromise = new Promise<void>(async (resolve, reject) => {
      try {
        // Ensure app directory exists
        const appDir = path.join(this.templatePath, 'app');
        await fs.promises.mkdir(appDir, { recursive: true });

        // Start Next.js dev server
        this.devServer = spawn('pnpm', ['next', 'dev'], {
          cwd: this.templatePath,
          stdio: 'pipe'
        });

        // Wait for server to be ready
        let output = '';
        
        await new Promise<void>((resolveServer, rejectServer) => {
          const onData = (data: Buffer) => {
            output += data.toString();
            if (output.includes('Local:')) {
              const match = output.match(/http:\/\/localhost:(\d+)/);
              if (match) {
                this.port = parseInt(match[1], 10);
                cleanup();
                resolveServer();
              }
            }
          };

          const onError = (err: Error) => {
            cleanup();
            rejectServer(err);
          };

          const cleanup = () => {
            if (this.devServer) {
              this.devServer.stdout?.removeListener('data', onData);
              this.devServer.removeListener('error', onError);
            }
          };

          this.devServer?.stdout?.on('data', onData);
          this.devServer?.on('error', onError);

          // Timeout after 30 seconds
          setTimeout(() => {
            cleanup();
            rejectServer(new Error('Timeout waiting for Next.js server to start'));
          }, 30000);
        });

        resolve();
      } catch (error) {
        reject(error);
      } finally {
        this.isStarting = false;
      }
    });

    return this.startPromise;
  }

  async createPreview(id: string, code: string) {
    // Ensure server is running
    await this.start();

    // Create preview directory
    const previewDir = path.join(this.templatePath, 'app', 'p', id);
    await fs.promises.mkdir(previewDir, { recursive: true });

    // Write component code
    const pagePath = path.join(previewDir, 'page.tsx');
    await fs.promises.writeFile(pagePath, code);

    // Return the URL for this preview
    return `/p/${id}`;
  }

  async proxyRequest(pathname: string) {
    // Ensure server is running
    await this.start();
    
    const url = `http://localhost:${this.port}${pathname}`;
    const response = await fetch(url);
    return response;
  }

  async cleanup() {
    if (this.devServer) {
      this.devServer.kill();
      this.devServer = null;
    }
    this.isStarting = false;
    this.startPromise = null;
  }

  private port: number = 3000;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ProgressOptions {
  onStep?: (message: string) => void;
  onComplete?: (result: string) => void;
  onError?: (error: any) => void;
}

export class ProgressLogger {
  private options: ProgressOptions;

  constructor(options: ProgressOptions = {}) {
    this.options = options;
  }

  start(prompt: string) {
    const message = `🚀 Starting cashflow analysis: "${prompt}"`;
    console.log(message);
    this.options.onStep?.(message);
  }

  step(message: string) {
    const logMessage = `📊 ${message}`;
    console.log(logMessage);
    this.options.onStep?.(logMessage);
  }

  complete(result: string) {
    const message = "✅ Analysis complete";
    console.log(message);
    this.options.onComplete?.(result);
  }

  error(error: any) {
    const message = `❌ Analysis failed: ${error.message || error}`;
    console.error(message, error);
    this.options.onError?.(error);
  }

  toolCall(toolName: string, args: any) {
    const message = `🔧 Using tool: ${toolName}`;
    console.log(message, args);
    this.options.onStep?.(message);
  }

  toolResult(toolName: string, result: any) {
    const message = `📈 Tool ${toolName} completed`;
    console.log(message);
    this.options.onStep?.(message);
  }
}

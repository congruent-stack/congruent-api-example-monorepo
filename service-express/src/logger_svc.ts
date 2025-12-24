export class LoggerService {
  public log(message: string): void {
    console.log(`[LOG]: ${message}`);
  }
}
export abstract class AppError extends Error {
  constructor(public readonly message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

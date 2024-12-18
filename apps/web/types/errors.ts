export class PreviewServerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PreviewServerError'
  }
}

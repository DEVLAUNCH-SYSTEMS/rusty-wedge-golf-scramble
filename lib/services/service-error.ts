export class ServiceError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
  }
}

export const PUBLIC_ERROR_MESSAGE =
  "Unable to complete your request. Please try again or contact the organizers.";

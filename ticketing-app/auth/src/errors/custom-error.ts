export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message); //for logging purposes
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors(): {
    message: string;
    field?: string;
  }[];
}

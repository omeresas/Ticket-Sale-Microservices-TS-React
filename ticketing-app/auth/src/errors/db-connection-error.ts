import { CustomError } from "./custom-error";

export class DbConnectionError extends CustomError {
  reason = "Error conneting to database";
  statusCode = 500;

  constructor() {
    super("Database Connection Error");

    Object.setPrototypeOf(this, DbConnectionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}

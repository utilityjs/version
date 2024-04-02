/**
 * Class representing a user-defined exception.
 * It extends the built-in Error class.
 */
export default class UserError extends Error {
  /**
   * Create a UserError.
   * @param {string} message - The error message.
   */
  constructor(message: string) {
    super(message); // Call the parent Error class constructor.
    this.name = "UserError"; // Set the error name to 'UserError'.
  }
}

// Mock email service for testing
export class EmailService {
  static lastEmailSentAt: { [key: string]: Date } = {};

  static async sendVerificationEmail(email: string, code: string): Promise<void> {
    // In tests, we don't actually send emails
    // We just track when they were "sent"
    this.lastEmailSentAt[email] = new Date();
  }

  static getLastEmailSentAt(email: string): Date | null {
    return this.lastEmailSentAt[email] || null;
  }

  static reset() {
    this.lastEmailSentAt = {};
  }
}

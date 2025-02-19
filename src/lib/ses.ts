import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const params = {
    Source: process.env.SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: html,
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export function generateVerificationEmailHtml(firstName: string, otp: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000; margin: 0;">Welcome to Promptaat!</h1>
      </div>
      
      <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #000; margin-top: 0;">Verify Your Email</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.5;">Hi ${firstName},</p>
        <p style="color: #666; font-size: 16px; line-height: 1.5;">Thank you for signing up! Please use the following verification code to complete your registration:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0; text-align: center;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000;">${otp}</span>
        </div>
        
        <p style="color: #666; font-size: 14px;">This code will expire in 30 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this verification, you can safely ignore this email.</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
        <p>&copy; ${new Date().getFullYear()} Promptaat. All rights reserved.</p>
      </div>
    </div>
  `;
}

export function generatePasswordResetEmailHtml(firstName: string, otp: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000; margin: 0;">Reset Your Password</h1>
      </div>
      
      <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #000; margin-top: 0;">Password Reset Code</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.5;">Hi ${firstName},</p>
        <p style="color: #666; font-size: 16px; line-height: 1.5;">We received a request to reset your password. Use this code to complete the password reset:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0; text-align: center;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000;">${otp}</span>
        </div>
        
        <p style="color: #666; font-size: 14px;">This code will expire in 30 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this password reset, please contact support immediately.</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
        <p>&copy; ${new Date().getFullYear()} Promptaat. All rights reserved.</p>
      </div>
    </div>
  `;
}

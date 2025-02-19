import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/ses';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: email,
      subject: 'Test Email from Promptaat',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Test Email</h1>
          <p>This is a test email from Promptaat to verify SES integration.</p>
          <p>If you received this email, the SES setup is working correctly!</p>
        </div>
      `,
    });

    if (!result.success) {
      throw new Error('Failed to send email');
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

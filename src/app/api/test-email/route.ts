import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';

export async function GET(req: Request) {
  try {
    const testResult = await sendVerificationEmail(
      'ahmed@promptaat.com', // Replace with your verified email
      'Ahmed',
      '123456'
    );

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      result: testResult
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}

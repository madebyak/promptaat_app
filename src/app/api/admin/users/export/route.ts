import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stringify } from 'csv-stringify/sync';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { userIds } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid user IDs' },
        { status: 400 }
      );
    }

    // Fetch users with their current membership status
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      include: {
        memberships: {
          where: {
            status: 'active',
            endDate: { gt: new Date() }
          },
          orderBy: { endDate: 'desc' },
          take: 1
        }
      }
    });

    // Transform data for CSV
    const data = users.map(user => ({
      'First Name': user.firstName,
      'Last Name': user.lastName,
      'Email': user.email,
      'Country': user.country || 'N/A',
      'Status': user.emailVerified ? 'Verified' : 'Unverified',
      'Membership': user.memberships[0] ? `Pro (${user.memberships[0].planName})` : 'Free',
      'Membership End Date': user.memberships[0]?.endDate ? new Date(user.memberships[0].endDate).toLocaleDateString() : 'N/A',
      'Registration Date': new Date(user.createdAt).toLocaleDateString()
    }));

    // Generate CSV
    const csv = stringify(data, {
      header: true,
      columns: [
        'First Name',
        'Last Name',
        'Email',
        'Country',
        'Status',
        'Membership',
        'Membership End Date',
        'Registration Date'
      ]
    });

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=users-export.csv'
      }
    });
  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export users' },
      { status: 500 }
    );
  }
}

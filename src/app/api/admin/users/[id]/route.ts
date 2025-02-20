import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/users/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET request for user ID:', params.id);
    
    const session = await getServerSession(authOptions);
    console.log('Session data:', {
      user: session?.user,
      role: session?.user?.role
    });
    
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Check admin role - handle both string and object cases
    const userRole = session.user.role;
    if (userRole !== 'admin') {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
    }

    const userId = parseInt(params.id);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Fetch user with all required data in a single query
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        country: true,
        emailVerified: true,
        createdAt: true,
        memberships: {
          where: {
            status: 'active',
            endDate: { gt: new Date() }
          },
          select: {
            status: true,
            planName: true,
            endDate: true
          },
          orderBy: { endDate: 'desc' },
          take: 1
        },
        activities: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          select: {
            timestamp: true,
            loginCount: true,
            lastActive: true
          }
        },
        emailLogs: {
          orderBy: { sentAt: 'desc' },
          take: 10,
          select: {
            id: true,
            type: true,
            sentAt: true,
            status: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format
    const responseData = {
      success: true,
      data: {
        ...user,
        membership: user.memberships[0] || null,
        activity: user.activities[0] ? {
          lastLogin: user.activities[0].timestamp,
          totalLogins: user.activities[0].loginCount,
          lastActive: user.activities[0].lastActive
        } : null,
        emailLogs: user.emailLogs
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in GET /api/admin/users/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete all related data in a transaction
    await prisma.$transaction([
      // Delete user activities
      prisma.userActivity.deleteMany({
        where: { userId }
      }),
      // Delete email logs
      prisma.emailLog.deleteMany({
        where: { userId }
      }),
      // Delete memberships
      prisma.proMembership.deleteMany({
        where: { userId }
      }),
      // Delete the user
      prisma.user.delete({
        where: { id: userId }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

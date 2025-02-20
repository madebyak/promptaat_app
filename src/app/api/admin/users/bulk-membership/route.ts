import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { userIds, action, planName } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid user IDs' },
        { status: 400 }
      );
    }

    if (action === 'add' && !planName) {
      return NextResponse.json(
        { success: false, error: 'Plan name is required for adding membership' },
        { status: 400 }
      );
    }

    // Calculate dates
    const now = new Date();
    let endDate = new Date();
    if (planName === '1_month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (planName === '3_months') {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (planName === '12_months') {
      endDate.setMonth(endDate.getMonth() + 12);
    }

    if (action === 'add') {
      // First, expire any existing active memberships
      await prisma.proMembership.updateMany({
        where: {
          userId: { in: userIds },
          status: 'active',
          endDate: { gt: now }
        },
        data: {
          status: 'expired',
          endDate: now
        }
      });

      // Then create new memberships
      await prisma.proMembership.createMany({
        data: userIds.map(userId => ({
          userId,
          planName,
          startDate: now,
          endDate,
          status: 'active'
        }))
      });
    } else if (action === 'remove') {
      // Expire all active memberships
      await prisma.proMembership.updateMany({
        where: {
          userId: { in: userIds },
          status: 'active',
          endDate: { gt: now }
        },
        data: {
          status: 'expired',
          endDate: now
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in bulk membership:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process bulk membership action' },
      { status: 500 }
    );
  }
}

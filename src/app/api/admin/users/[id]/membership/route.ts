import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const membershipSchema = z.object({
  planName: z.enum(['1_month', '3_months', '12_months'])
});

// Helper to calculate end date based on plan
function calculateEndDate(planName: string): Date {
  const now = new Date();
  switch (planName) {
    case '1_month':
      return new Date(now.setMonth(now.getMonth() + 1));
    case '3_months':
      return new Date(now.setMonth(now.getMonth() + 3));
    case '12_months':
      return new Date(now.setMonth(now.getMonth() + 12));
    default:
      throw new Error('Invalid plan name');
  }
}

// POST /api/admin/users/[id]/membership
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 });
    }

    const body = await req.json();
    const validatedData = membershipSchema.parse(body);

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deactivate any current active memberships
      await tx.proMembership.updateMany({
        where: {
          userId,
          status: 'active',
          endDate: { gt: new Date() }
        },
        data: {
          status: 'expired',
          endDate: new Date()
        }
      });

      // Create new membership
      const startDate = new Date();
      const endDate = calculateEndDate(validatedData.planName);

      const newMembership = await tx.proMembership.create({
        data: {
          userId,
          planName: validatedData.planName,
          status: 'active',
          startDate,
          endDate
        }
      });

      // Get updated user data
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: {
          memberships: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      return user;
    });

    if (!result) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Transform user data for response
    const currentMembership = result.memberships[0];
    const transformedUser = {
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      country: result.country,
      emailVerified: result.emailVerified,
      createdAt: result.createdAt,
      membership: currentMembership ? {
        id: currentMembership.id,
        status: currentMembership.status,
        planName: currentMembership.planName,
        startDate: currentMembership.startDate,
        endDate: currentMembership.endDate
      } : null,
      membershipHistory: result.memberships.map(m => ({
        id: m.id,
        planName: m.planName,
        status: m.status,
        startDate: m.startDate,
        endDate: m.endDate
      }))
    };

    return NextResponse.json({
      success: true,
      data: transformedUser
    });
  } catch (error) {
    console.error('Error updating membership:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update membership' },
      { status: 500 }
    );
  }
}

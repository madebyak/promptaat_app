import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/users/stats
async function getStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

  const [
    total,
    proUsers,
    verifiedUsers,
    countriesDistribution,
    recentSignups
  ] = await Promise.all([
    // Total users
    prisma.user.count(),
    
    // Pro users
    prisma.user.count({
      where: {
        memberships: {
          some: {
            status: 'active',
            endDate: { gt: new Date() }
          }
        }
      }
    }),
    
    // Verified users
    prisma.user.count({
      where: { emailVerified: true }
    }),
    
    // Countries distribution
    prisma.user.groupBy({
      by: ['country'],
      _count: true,
      where: {
        country: { not: null }
      }
    }),
    
    // Recent signups (last 30 days)
    prisma.user.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
  ]);

  // Transform countries distribution
  const countries = countriesDistribution.reduce((acc, curr) => {
    if (curr.country) {
      acc[curr.country] = curr._count;
    }
    return acc;
  }, {} as Record<string, number>);

  // Transform recent signups
  const signups = recentSignups.map(day => ({
    date: day.createdAt.toISOString(),
    count: day._count
  }));

  return {
    total,
    proUsers,
    freeUsers: total - proUsers,
    verifiedUsers,
    countriesDistribution: countries,
    recentSignups: signups
  };
}

// GET /api/admin/users
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || '';
    const membership = searchParams.get('membership') || 'all';
    const verificationStatus = searchParams.get('verificationStatus') || 'all';
    const country = searchParams.get('country') || 'all';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const sort = searchParams.get('sort') || 'newest';
    const includeStats = searchParams.get('includeStats') === 'true';

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (membership !== 'all') {
      where.memberships = membership === 'pro' ? {
        some: {
          status: 'active',
          endDate: { gt: new Date() }
        }
      } : {
        none: {
          status: 'active',
          endDate: { gt: new Date() }
        }
      };
    }

    if (verificationStatus !== 'all') {
      where.emailVerified = verificationStatus === 'verified';
    }

    if (country !== 'all') {
      where.country = country;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Build orderBy
    let orderBy: any = {};
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'name':
        orderBy = { firstName: 'asc' };
        break;
      case 'name-desc':
        orderBy = { firstName: 'desc' };
        break;
      default: // newest
        orderBy = { createdAt: 'desc' };
    }

    const [users, total, stats] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      }),
      prisma.user.count({ where }),
      includeStats ? getStats() : null
    ]);

    // Get unique countries for filters
    const countries = await prisma.user.findMany({
      where: {
        country: { not: null }
      },
      select: {
        country: true
      },
      distinct: ['country']
    });

    // Transform users for response
    const transformedUsers = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      country: user.country,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      membership: user.memberships[0] ? {
        status: user.memberships[0].status,
        planName: user.memberships[0].planName,
        endDate: user.memberships[0].endDate
      } : null
    }));

    return NextResponse.json({
      success: true,
      data: {
        users: transformedUsers,
        total,
        page,
        pageSize,
        stats,
        countries: countries.map(c => c.country).filter(Boolean)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

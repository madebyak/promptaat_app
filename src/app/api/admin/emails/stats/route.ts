import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total counts
    const [total, sent, failed] = await Promise.all([
      prisma.emailLog.count(),
      prisma.emailLog.count({ where: { status: 'sent' } }),
      prisma.emailLog.count({ where: { status: 'failed' } }),
    ]);

    // Get daily stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await prisma.emailLog.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Get stats by email type
    const typeStats = await prisma.emailLog.groupBy({
      by: ['type'],
      _count: true,
      orderBy: {
        _count: 'desc',
      },
    });

    return NextResponse.json({
      total,
      sent,
      failed,
      dailyStats: dailyStats.map(stat => ({
        date: stat.createdAt,
        count: stat._count,
      })),
      typeStats: typeStats.map(stat => ({
        type: stat.type,
        count: stat._count,
      })),
    });
  } catch (error) {
    console.error('Error fetching email stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

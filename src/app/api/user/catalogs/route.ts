import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const catalogs = await prisma.userCatalog.findMany({
      where: {
        userId: parseInt(session.user.id),
      },
      include: {
        _count: {
          select: {
            prompts: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(catalogs);
  } catch (error) {
    console.error('Error fetching catalogs:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { name } = await req.json();

    const catalog = await prisma.userCatalog.create({
      data: {
        name,
        userId: parseInt(session.user.id),
      },
    });

    return NextResponse.json(catalog);
  } catch (error) {
    console.error('Error creating catalog:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

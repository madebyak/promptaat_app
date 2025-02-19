import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { catalogId: string } }
) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const catalog = await prisma.userCatalog.findFirst({
      where: {
        id: parseInt(params.catalogId),
        userId: parseInt(session.user.id),
      },
      include: {
        prompts: {
          include: {
            prompt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!catalog) {
      return new NextResponse('Catalog not found', { status: 404 });
    }

    return NextResponse.json(catalog.prompts);
  } catch (error) {
    console.error('Error fetching saved prompts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { catalogId: string } }
) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { promptId } = await req.json();

    // Verify the catalog belongs to the user
    const catalog = await prisma.userCatalog.findFirst({
      where: {
        id: parseInt(params.catalogId),
        userId: parseInt(session.user.id),
      },
    });

    if (!catalog) {
      return new NextResponse('Catalog not found', { status: 404 });
    }

    const savedPrompt = await prisma.savedPrompt.create({
      data: {
        catalogId: parseInt(params.catalogId),
        promptId: parseInt(promptId),
      },
      include: {
        prompt: true,
      },
    });

    return NextResponse.json(savedPrompt);
  } catch (error) {
    console.error('Error saving prompt:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { catalogId: string } }
) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { promptId } = await req.json();

    // Verify the catalog belongs to the user
    const catalog = await prisma.userCatalog.findFirst({
      where: {
        id: parseInt(params.catalogId),
        userId: parseInt(session.user.id),
      },
    });

    if (!catalog) {
      return new NextResponse('Catalog not found', { status: 404 });
    }

    await prisma.savedPrompt.delete({
      where: {
        catalogId_promptId: {
          catalogId: parseInt(params.catalogId),
          promptId: parseInt(promptId),
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error removing saved prompt:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

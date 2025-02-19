import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const prompt = await prisma.prompt.update({
      where: {
        id: parseInt(params.id)
      },
      data: {
        usesCounter: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ success: true, usesCount: prompt.usesCounter })
  } catch (error) {
    console.error('Error incrementing uses count:', error)
    return NextResponse.json(
      { error: 'Failed to increment uses count' },
      { status: 500 }
    )
  }
}

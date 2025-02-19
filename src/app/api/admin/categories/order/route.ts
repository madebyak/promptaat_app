import { NextRequest, NextResponse } from 'next/server';
import { validateAndUpdateOrder } from '@/lib/category';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for order update
const orderUpdateSchema = z.array(
  z.object({
    id: z.number(),
    order: z.number().min(1)
  })
);

// PATCH /api/admin/categories/order
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // For development, temporarily skip auth check
    // if (!session?.user) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await req.json();
    const validatedData = orderUpdateSchema.parse(body);

    await validateAndUpdateOrder(validatedData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating category orders:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update category orders' },
      { status: 500 }
    );
  }
}

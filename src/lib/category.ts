import { prisma } from './prisma';

export async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (!existingCategory) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function validateParentCategory(
  categoryId: number | null,
  parentId: number
): Promise<boolean> {
  // Can't set parent to self
  if (categoryId === parentId) {
    return false;
  }

  // Check if parent exists
  const parent = await prisma.category.findUnique({
    where: { id: parentId }
  });

  if (!parent) {
    return false;
  }

  // If this is a new category (categoryId is null), no need to check for cycles
  if (!categoryId) {
    return true;
  }

  // Check for cycles in the hierarchy
  let currentId = parent.parentCategoryId;
  while (currentId) {
    if (currentId === categoryId) {
      return false; // Found a cycle
    }

    const current = await prisma.category.findUnique({
      where: { id: currentId },
      select: { parentCategoryId: true }
    });

    if (!current) {
      break;
    }

    currentId = current.parentCategoryId;
  }

  return true;
}

export async function hasSubcategories(categoryId: number): Promise<boolean> {
  const count = await prisma.category.count({
    where: { parentCategoryId: categoryId }
  });
  return count > 0;
}

export async function getMaxOrder(parentId: number | null = null): Promise<number> {
  const maxOrder = await prisma.category.aggregate({
    where: { parentCategoryId: parentId },
    _max: { order: true }
  });

  return (maxOrder._max.order || 0) + 1;
}

export async function validateAndUpdateOrder(
  updates: Array<{ id: number; order: number }>
): Promise<void> {
  // Group updates by parent category
  const updatesByParent = new Map<number | null, typeof updates>();

  // Get all categories being updated
  const categories = await prisma.category.findMany({
    where: { id: { in: updates.map(u => u.id) } },
    select: { id: true, parentCategoryId: true }
  });

  // Group updates by parent
  categories.forEach(cat => {
    const update = updates.find(u => u.id === cat.id);
    if (!update) return;

    const parentUpdates = updatesByParent.get(cat.parentCategoryId) || [];
    parentUpdates.push(update);
    updatesByParent.set(cat.parentCategoryId, parentUpdates);
  });

  // Process each group separately
  for (const [parentId, groupUpdates] of updatesByParent.entries()) {
    // Verify no duplicate orders within the same parent
    const orders = groupUpdates.map(u => u.order);
    if (new Set(orders).size !== orders.length) {
      throw new Error('Duplicate orders not allowed within the same level');
    }

    // Update orders
    await Promise.all(
      groupUpdates.map(update =>
        prisma.category.update({
          where: { id: update.id },
          data: { order: update.order }
        })
      )
    );
  }
}

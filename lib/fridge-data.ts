export interface FridgeItem {
  id: string;
  name: string;
  category: 'produce' | 'protein' | 'dairy' | 'pantry' | 'other';
  addedDate: string; // ISO date
  shelfLifeDays: number;
  quantity?: string;
}

export const SHELF_LIFE: Record<string, { days: number; category: FridgeItem['category'] }> = {
  // Produce
  'cilantro': { days: 7, category: 'produce' },
  'green onion': { days: 7, category: 'produce' },
  'lettuce': { days: 7, category: 'produce' },
  'spinach': { days: 5, category: 'produce' },
  'tomatoes': { days: 7, category: 'produce' },
  'bell peppers': { days: 10, category: 'produce' },
  'onions': { days: 30, category: 'produce' },
  'garlic': { days: 30, category: 'produce' },
  'ginger': { days: 21, category: 'produce' },
  'carrots': { days: 21, category: 'produce' },
  'broccoli': { days: 5, category: 'produce' },
  'cucumber': { days: 7, category: 'produce' },
  'avocado': { days: 4, category: 'produce' },
  'lemon': { days: 21, category: 'produce' },
  'lime': { days: 21, category: 'produce' },
  'mushrooms': { days: 5, category: 'produce' },
  'zucchini': { days: 7, category: 'produce' },
  'potatoes': { days: 28, category: 'produce' },
  'sweet potatoes': { days: 28, category: 'produce' },
  'cabbage': { days: 14, category: 'produce' },
  'kale': { days: 5, category: 'produce' },
  'celery': { days: 14, category: 'produce' },
  'corn': { days: 3, category: 'produce' },
  'jalapeno': { days: 14, category: 'produce' },
  'basil': { days: 5, category: 'produce' },
  'parsley': { days: 7, category: 'produce' },
  'mint': { days: 7, category: 'produce' },
  'green beans': { days: 5, category: 'produce' },
  'asparagus': { days: 4, category: 'produce' },
  'cauliflower': { days: 7, category: 'produce' },
  'eggplant': { days: 5, category: 'produce' },
  'beets': { days: 14, category: 'produce' },
  'radishes': { days: 10, category: 'produce' },
  'peas': { days: 4, category: 'produce' },

  // Protein
  'chicken breast': { days: 2, category: 'protein' },
  'chicken thighs': { days: 2, category: 'protein' },
  'ground beef': { days: 2, category: 'protein' },
  'steak': { days: 3, category: 'protein' },
  'salmon': { days: 2, category: 'protein' },
  'shrimp': { days: 2, category: 'protein' },
  'pork': { days: 3, category: 'protein' },
  'turkey': { days: 2, category: 'protein' },
  'tofu': { days: 5, category: 'protein' },
  'eggs': { days: 28, category: 'protein' },
  'bacon': { days: 7, category: 'protein' },
  'sausage': { days: 3, category: 'protein' },
  'ground turkey': { days: 2, category: 'protein' },
  'cod': { days: 2, category: 'protein' },
  'tuna steak': { days: 2, category: 'protein' },
  'lamb': { days: 3, category: 'protein' },

  // Dairy
  'milk': { days: 7, category: 'dairy' },
  'butter': { days: 30, category: 'dairy' },
  'cheddar cheese': { days: 28, category: 'dairy' },
  'mozzarella': { days: 14, category: 'dairy' },
  'cream cheese': { days: 14, category: 'dairy' },
  'yogurt': { days: 14, category: 'dairy' },
  'sour cream': { days: 21, category: 'dairy' },
  'heavy cream': { days: 10, category: 'dairy' },
  'parmesan': { days: 42, category: 'dairy' },
  'feta': { days: 14, category: 'dairy' },
  'cottage cheese': { days: 7, category: 'dairy' },
  'ricotta': { days: 7, category: 'dairy' },

  // Pantry (once opened)
  'rice': { days: 365, category: 'pantry' },
  'pasta': { days: 365, category: 'pantry' },
  'soy sauce': { days: 180, category: 'pantry' },
  'olive oil': { days: 180, category: 'pantry' },
  'coconut milk': { days: 5, category: 'pantry' },
  'salsa': { days: 14, category: 'pantry' },
  'tortillas': { days: 14, category: 'pantry' },
  'bread': { days: 7, category: 'pantry' },
  'peanut butter': { days: 90, category: 'pantry' },
  'jam': { days: 30, category: 'pantry' },
  'hot sauce': { days: 180, category: 'pantry' },
  'ketchup': { days: 180, category: 'pantry' },
  'mustard': { days: 180, category: 'pantry' },
  'mayo': { days: 60, category: 'pantry' },
  'sriracha': { days: 180, category: 'pantry' },
  'fish sauce': { days: 180, category: 'pantry' },
  'sesame oil': { days: 180, category: 'pantry' },
  'vinegar': { days: 365, category: 'pantry' },
  'maple syrup': { days: 365, category: 'pantry' },
  'honey': { days: 365, category: 'pantry' },
};

export function getShelfLife(itemName: string): { days: number; category: FridgeItem['category'] } | null {
  const normalized = itemName.toLowerCase().trim();
  // Direct match
  if (SHELF_LIFE[normalized]) return SHELF_LIFE[normalized];
  // Partial match
  for (const [key, value] of Object.entries(SHELF_LIFE)) {
    if (normalized.includes(key) || key.includes(normalized)) return value;
  }
  return null;
}

export function getDaysRemaining(addedDate: string, shelfLifeDays: number): number {
  const added = new Date(addedDate);
  const expiry = new Date(added.getTime() + shelfLifeDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getFreshnessStatus(daysRemaining: number): 'fresh' | 'use-soon' | 'expiring' | 'expired' {
  if (daysRemaining <= 0) return 'expired';
  if (daysRemaining <= 2) return 'expiring';
  if (daysRemaining <= 4) return 'use-soon';
  return 'fresh';
}

export function searchShelfLife(query: string): string[] {
  if (!query.trim()) return [];
  const normalized = query.toLowerCase().trim();
  return Object.keys(SHELF_LIFE)
    .filter((key) => key.includes(normalized))
    .slice(0, 8);
}

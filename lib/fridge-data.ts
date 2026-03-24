export type StorageLocation = 'fridge' | 'pantry';

export interface FridgeItem {
  id: string;
  name: string;
  category: 'produce' | 'protein' | 'dairy' | 'pantry' | 'other';
  addedDate: string; // ISO date
  shelfLifeDays: number;
  quantity?: string;
  storage: StorageLocation;
}

export const SHELF_LIFE: Record<string, { days: number; category: FridgeItem['category']; storage: StorageLocation }> = {
  // Produce - Fridge
  'cilantro': { days: 7, category: 'produce', storage: 'fridge' },
  'green onion': { days: 7, category: 'produce', storage: 'fridge' },
  'lettuce': { days: 7, category: 'produce', storage: 'fridge' },
  'spinach': { days: 5, category: 'produce', storage: 'fridge' },
  'tomatoes': { days: 7, category: 'produce', storage: 'fridge' },
  'bell peppers': { days: 10, category: 'produce', storage: 'fridge' },
  'broccoli': { days: 5, category: 'produce', storage: 'fridge' },
  'cucumber': { days: 7, category: 'produce', storage: 'fridge' },
  'avocado': { days: 4, category: 'produce', storage: 'fridge' },
  'mushrooms': { days: 5, category: 'produce', storage: 'fridge' },
  'zucchini': { days: 7, category: 'produce', storage: 'fridge' },
  'kale': { days: 5, category: 'produce', storage: 'fridge' },
  'celery': { days: 14, category: 'produce', storage: 'fridge' },
  'corn': { days: 3, category: 'produce', storage: 'fridge' },
  'basil': { days: 5, category: 'produce', storage: 'fridge' },
  'parsley': { days: 7, category: 'produce', storage: 'fridge' },
  'mint': { days: 7, category: 'produce', storage: 'fridge' },
  'green beans': { days: 5, category: 'produce', storage: 'fridge' },
  'asparagus': { days: 4, category: 'produce', storage: 'fridge' },
  'cauliflower': { days: 7, category: 'produce', storage: 'fridge' },
  'eggplant': { days: 5, category: 'produce', storage: 'fridge' },
  'beets': { days: 14, category: 'produce', storage: 'fridge' },
  'radishes': { days: 10, category: 'produce', storage: 'fridge' },
  'peas': { days: 4, category: 'produce', storage: 'fridge' },

  // Produce - Pantry
  'onions': { days: 30, category: 'produce', storage: 'pantry' },
  'garlic': { days: 30, category: 'produce', storage: 'pantry' },
  'ginger': { days: 21, category: 'produce', storage: 'pantry' },
  'carrots': { days: 21, category: 'produce', storage: 'pantry' },
  'lemon': { days: 21, category: 'produce', storage: 'pantry' },
  'lime': { days: 21, category: 'produce', storage: 'pantry' },
  'potatoes': { days: 28, category: 'produce', storage: 'pantry' },
  'sweet potatoes': { days: 28, category: 'produce', storage: 'pantry' },
  'cabbage': { days: 14, category: 'produce', storage: 'pantry' },
  'jalapeno': { days: 14, category: 'produce', storage: 'pantry' },

  // Protein - Fridge
  'chicken breast': { days: 2, category: 'protein', storage: 'fridge' },
  'chicken thighs': { days: 2, category: 'protein', storage: 'fridge' },
  'ground beef': { days: 2, category: 'protein', storage: 'fridge' },
  'steak': { days: 3, category: 'protein', storage: 'fridge' },
  'salmon': { days: 2, category: 'protein', storage: 'fridge' },
  'shrimp': { days: 2, category: 'protein', storage: 'fridge' },
  'pork': { days: 3, category: 'protein', storage: 'fridge' },
  'turkey': { days: 2, category: 'protein', storage: 'fridge' },
  'tofu': { days: 5, category: 'protein', storage: 'fridge' },
  'eggs': { days: 28, category: 'protein', storage: 'fridge' },
  'bacon': { days: 7, category: 'protein', storage: 'fridge' },
  'sausage': { days: 3, category: 'protein', storage: 'fridge' },
  'ground turkey': { days: 2, category: 'protein', storage: 'fridge' },
  'cod': { days: 2, category: 'protein', storage: 'fridge' },
  'tuna steak': { days: 2, category: 'protein', storage: 'fridge' },
  'lamb': { days: 3, category: 'protein', storage: 'fridge' },

  // Dairy - Fridge
  'milk': { days: 7, category: 'dairy', storage: 'fridge' },
  'butter': { days: 30, category: 'dairy', storage: 'fridge' },
  'cheddar cheese': { days: 28, category: 'dairy', storage: 'fridge' },
  'mozzarella': { days: 14, category: 'dairy', storage: 'fridge' },
  'cream cheese': { days: 14, category: 'dairy', storage: 'fridge' },
  'yogurt': { days: 14, category: 'dairy', storage: 'fridge' },
  'sour cream': { days: 21, category: 'dairy', storage: 'fridge' },
  'heavy cream': { days: 10, category: 'dairy', storage: 'fridge' },
  'parmesan': { days: 42, category: 'dairy', storage: 'fridge' },
  'feta': { days: 14, category: 'dairy', storage: 'fridge' },
  'cottage cheese': { days: 7, category: 'dairy', storage: 'fridge' },
  'ricotta': { days: 7, category: 'dairy', storage: 'fridge' },

  // Pantry items
  'rice': { days: 365, category: 'pantry', storage: 'pantry' },
  'pasta': { days: 365, category: 'pantry', storage: 'pantry' },
  'soy sauce': { days: 180, category: 'pantry', storage: 'pantry' },
  'olive oil': { days: 180, category: 'pantry', storage: 'pantry' },
  'coconut milk': { days: 5, category: 'pantry', storage: 'fridge' },
  'salsa': { days: 14, category: 'pantry', storage: 'fridge' },
  'tortillas': { days: 14, category: 'pantry', storage: 'pantry' },
  'bread': { days: 7, category: 'pantry', storage: 'pantry' },
  'peanut butter': { days: 90, category: 'pantry', storage: 'pantry' },
  'jam': { days: 30, category: 'pantry', storage: 'pantry' },
  'hot sauce': { days: 180, category: 'pantry', storage: 'pantry' },
  'ketchup': { days: 180, category: 'pantry', storage: 'pantry' },
  'mustard': { days: 180, category: 'pantry', storage: 'pantry' },
  'mayo': { days: 60, category: 'pantry', storage: 'pantry' },
  'sriracha': { days: 180, category: 'pantry', storage: 'pantry' },
  'fish sauce': { days: 180, category: 'pantry', storage: 'pantry' },
  'sesame oil': { days: 180, category: 'pantry', storage: 'pantry' },
  'vinegar': { days: 365, category: 'pantry', storage: 'pantry' },
  'maple syrup': { days: 365, category: 'pantry', storage: 'pantry' },
  'honey': { days: 365, category: 'pantry', storage: 'pantry' },
};

export function getShelfLife(itemName: string): { days: number; category: FridgeItem['category']; storage: StorageLocation } | null {
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

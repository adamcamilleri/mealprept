export interface PantryPreset {
  category: string;
  emoji: string;
  items: string[];
}

export const PANTRY_PRESETS: PantryPreset[] = [
  {
    category: 'Cooking Basics',
    emoji: '\u{1F9C2}',
    items: ['salt', 'black pepper', 'olive oil', 'vegetable oil', 'butter', 'all-purpose flour', 'sugar', 'brown sugar'],
  },
  {
    category: 'Fridge Staples',
    emoji: '\u{1F95A}',
    items: ['eggs', 'milk', 'butter', 'cheddar cheese', 'sour cream', 'cream cheese'],
  },
  {
    category: 'Sauces & Condiments',
    emoji: '\u{1FAD9}',
    items: ['soy sauce', 'hot sauce', 'ketchup', 'mustard', 'mayo', 'Worcestershire sauce', 'vinegar', 'honey'],
  },
  {
    category: 'Spice Rack',
    emoji: '\u{1F336}\uFE0F',
    items: ['garlic powder', 'onion powder', 'cumin', 'paprika', 'smoked paprika', 'chili powder', 'oregano', 'Italian seasoning', 'cinnamon', 'red pepper flakes', 'bay leaves'],
  },
  {
    category: 'Dry Goods',
    emoji: '\u{1F35A}',
    items: ['rice', 'pasta', 'bread', 'tortillas', 'oats', 'panko breadcrumbs'],
  },
  {
    category: 'Canned & Jarred',
    emoji: '\u{1F96B}',
    items: ['canned tomatoes', 'tomato paste', 'chicken broth', 'coconut milk', 'black beans', 'chickpeas'],
  },
  {
    category: 'Fresh Essentials',
    emoji: '\u{1F9C4}',
    items: ['garlic', 'onions', 'lemons', 'limes', 'ginger'],
  },
];

/** Determine storage location for a preset item */
export function getPresetStorage(item: string): 'fridge' | 'pantry' {
  const fridgeItems = new Set([
    'eggs', 'milk', 'butter', 'cheddar cheese', 'sour cream', 'cream cheese',
    'coconut milk',
  ]);
  return fridgeItems.has(item) ? 'fridge' : 'pantry';
}

/** Determine shelf life in days for a preset item */
export function getPresetShelfLife(item: string): number {
  const shelfLifeMap: Record<string, number> = {
    // Fridge staples
    eggs: 28,
    milk: 7,
    butter: 30,
    'cheddar cheese': 28,
    'sour cream': 21,
    'cream cheese': 14,
    // Cooking basics
    salt: 365,
    'black pepper': 365,
    'olive oil': 180,
    'vegetable oil': 180,
    'all-purpose flour': 180,
    sugar: 365,
    'brown sugar': 365,
    // Sauces & condiments
    'soy sauce': 180,
    'hot sauce': 180,
    ketchup: 180,
    mustard: 180,
    mayo: 60,
    'Worcestershire sauce': 365,
    vinegar: 365,
    honey: 365,
    // Spices
    'garlic powder': 365,
    'onion powder': 365,
    cumin: 365,
    paprika: 365,
    'smoked paprika': 365,
    'chili powder': 365,
    oregano: 365,
    'Italian seasoning': 365,
    cinnamon: 365,
    'red pepper flakes': 365,
    'bay leaves': 365,
    // Dry goods
    rice: 365,
    pasta: 365,
    bread: 7,
    tortillas: 14,
    oats: 180,
    'panko breadcrumbs': 180,
    // Canned & jarred
    'canned tomatoes': 365,
    'tomato paste': 365,
    'chicken broth': 365,
    'coconut milk': 365,
    'black beans': 365,
    chickpeas: 365,
    // Fresh essentials
    garlic: 30,
    onions: 30,
    lemons: 21,
    limes: 21,
    ginger: 21,
  };
  return shelfLifeMap[item] ?? 180;
}

/** Determine category for a preset item */
export function getPresetCategory(item: string): 'produce' | 'protein' | 'dairy' | 'pantry' | 'other' {
  const categoryMap: Record<string, 'produce' | 'protein' | 'dairy' | 'pantry' | 'other'> = {
    eggs: 'protein',
    milk: 'dairy',
    butter: 'dairy',
    'cheddar cheese': 'dairy',
    'sour cream': 'dairy',
    'cream cheese': 'dairy',
    garlic: 'produce',
    onions: 'produce',
    lemons: 'produce',
    limes: 'produce',
    ginger: 'produce',
  };
  return categoryMap[item] ?? 'pantry';
}

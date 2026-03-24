export interface TasteProfile {
  id?: string;
  userId?: string;
  cuisines: string[];
  proteins: string[];
  favoriteDishes?: string;
  effortLevel: 'quick' | 'medium' | 'involved' | 'slowcooker';
  leastFavorites?: string;
  hardNos: string[];
  prepDays: number;
  servings: number;
}

export interface Ingredient {
  item: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  activeTime: string;
  totalTime: string;
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
  storage: string;
}

export interface GroceryItem {
  item: string;
  amount: string;
  usedIn: string[];
}

export interface GroceryCategory {
  category: string;
  items: GroceryItem[];
}

export interface MealPlan {
  id?: string;
  userId?: string;
  profileId?: string;
  planName: string;
  recipes: Recipe[];
  groceryList: GroceryCategory[];
  prepOrder: string;
  createdAt?: string;
}

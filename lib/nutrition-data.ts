export type IngredientValues = {
  calories: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
};

export type NutritionRow = {
  names: string[];
  kcalPer100g: number;
  proteinGPer100g: number;
  carbsGPer100g: number;
  fatGPer100g: number;
};

const NUTRITION_TABLE: NutritionRow[] = [
  { names: ["manzana", "apple"], kcalPer100g: 52, proteinGPer100g: 0.3, carbsGPer100g: 14, fatGPer100g: 0.2 },
  { names: ["plátano", "banana"], kcalPer100g: 89, proteinGPer100g: 1.1, carbsGPer100g: 22.8, fatGPer100g: 0.3 },
  { names: ["naranja", "orange"], kcalPer100g: 47, proteinGPer100g: 0.9, carbsGPer100g: 11.8, fatGPer100g: 0.1 },
  { names: ["fresa", "strawberry"], kcalPer100g: 32, proteinGPer100g: 0.7, carbsGPer100g: 7.7, fatGPer100g: 0.3 },
  { names: ["uva", "grape"], kcalPer100g: 69, proteinGPer100g: 0.7, carbsGPer100g: 18.1, fatGPer100g: 0.2 },
  { names: ["sandía", "watermelon"], kcalPer100g: 30, proteinGPer100g: 0.6, carbsGPer100g: 7.6, fatGPer100g: 0.2 },
  { names: ["aguacate", "avocado"], kcalPer100g: 160, proteinGPer100g: 2, carbsGPer100g: 8.5, fatGPer100g: 14.7 },
  { names: ["pechuga de pollo", "chicken breast"], kcalPer100g: 165, proteinGPer100g: 31, carbsGPer100g: 0, fatGPer100g: 3.6 },
  { names: ["muslo de pollo", "chicken thigh"], kcalPer100g: 226, proteinGPer100g: 25, carbsGPer100g: 0, fatGPer100g: 15 },
  { names: ["res", "beef"], kcalPer100g: 250, proteinGPer100g: 26, carbsGPer100g: 0, fatGPer100g: 17 },
  { names: ["cerdo", "pork"], kcalPer100g: 242, proteinGPer100g: 27, carbsGPer100g: 0, fatGPer100g: 14 },
  { names: ["salmón", "salmon"], kcalPer100g: 208, proteinGPer100g: 20, carbsGPer100g: 0, fatGPer100g: 13 },
  { names: ["atún", "tuna"], kcalPer100g: 132, proteinGPer100g: 28, carbsGPer100g: 0, fatGPer100g: 1 },
  { names: ["camarón", "shrimp"], kcalPer100g: 99, proteinGPer100g: 24, carbsGPer100g: 0.2, fatGPer100g: 0.3 },
  { names: ["huevo", "egg"], kcalPer100g: 155, proteinGPer100g: 13, carbsGPer100g: 1.1, fatGPer100g: 11 },
  { names: ["arroz blanco cocido", "white rice cooked"], kcalPer100g: 130, proteinGPer100g: 2.7, carbsGPer100g: 28, fatGPer100g: 0.3 },
  { names: ["pasta cocida", "pasta cocida", "pasta cooked"], kcalPer100g: 131, proteinGPer100g: 5, carbsGPer100g: 25, fatGPer100g: 1.1 },
  { names: ["quinoa cocida", "quinoa cooked"], kcalPer100g: 120, proteinGPer100g: 4.4, carbsGPer100g: 21.3, fatGPer100g: 1.9 },
  { names: ["avena", "oats"], kcalPer100g: 389, proteinGPer100g: 16.9, carbsGPer100g: 66, fatGPer100g: 6.9 },
  { names: ["pan blanco", "white bread"], kcalPer100g: 265, proteinGPer100g: 9, carbsGPer100g: 49, fatGPer100g: 3.2 },
  { names: ["papa cocida", "potato cooked"], kcalPer100g: 87, proteinGPer100g: 1.9, carbsGPer100g: 20, fatGPer100g: 0.1 },
  { names: ["batata", "sweet potato"], kcalPer100g: 86, proteinGPer100g: 1.6, carbsGPer100g: 20, fatGPer100g: 0.1 },
  { names: ["zanahoria", "carrot"], kcalPer100g: 41, proteinGPer100g: 0.9, carbsGPer100g: 9.6, fatGPer100g: 0.2 },
  { names: ["tomate", "tomato"], kcalPer100g: 18, proteinGPer100g: 0.9, carbsGPer100g: 3.9, fatGPer100g: 0.2 },
  { names: ["cebolla", "onion"], kcalPer100g: 40, proteinGPer100g: 1.1, carbsGPer100g: 9.3, fatGPer100g: 0.1 },
  { names: ["espinaca", "spinach"], kcalPer100g: 23, proteinGPer100g: 2.9, carbsGPer100g: 3.6, fatGPer100g: 0.4 },
  { names: ["brócoli", "broccoli"], kcalPer100g: 34, proteinGPer100g: 2.8, carbsGPer100g: 7, fatGPer100g: 0.4 },
  { names: ["pimiento", "bell pepper"], kcalPer100g: 20, proteinGPer100g: 0.9, carbsGPer100g: 4.6, fatGPer100g: 0.2 },
  { names: ["pepino", "cucumber"], kcalPer100g: 15, proteinGPer100g: 0.7, carbsGPer100g: 3.6, fatGPer100g: 0.1 },
  { names: ["lechuga", "lettuce"], kcalPer100g: 15, proteinGPer100g: 1.4, carbsGPer100g: 2.9, fatGPer100g: 0.2 },
  { names: ["champiñón", "mushroom"], kcalPer100g: 22, proteinGPer100g: 3.1, carbsGPer100g: 3.3, fatGPer100g: 0.3 },
  { names: ["maíz", "corn"], kcalPer100g: 86, proteinGPer100g: 3.2, carbsGPer100g: 19, fatGPer100g: 1.2 },
  { names: ["frijoles cocidos", "beans cooked"], kcalPer100g: 127, proteinGPer100g: 8.7, carbsGPer100g: 20, fatGPer100g: 0.5 },
  { names: ["lentejas cocidas", "lentils cooked"], kcalPer100g: 116, proteinGPer100g: 9, carbsGPer100g: 20, fatGPer100g: 0.4 },
  { names: ["garbanzos cocidos", "chickpeas cooked"], kcalPer100g: 164, proteinGPer100g: 8.9, carbsGPer100g: 27, fatGPer100g: 2.6 },
  { names: ["queso", "cheese"], kcalPer100g: 402, proteinGPer100g: 25, carbsGPer100g: 1.3, fatGPer100g: 33 },
  { names: ["leche", "milk"], kcalPer100g: 42, proteinGPer100g: 3.4, carbsGPer100g: 5, fatGPer100g: 1 },
  { names: ["yogur natural", "plain yogurt"], kcalPer100g: 59, proteinGPer100g: 10, carbsGPer100g: 3.6, fatGPer100g: 0.4 },
  { names: ["mantequilla", "butter"], kcalPer100g: 717, proteinGPer100g: 0.9, carbsGPer100g: 0.1, fatGPer100g: 81 },
  { names: ["aceite de oliva", "olive oil"], kcalPer100g: 884, proteinGPer100g: 0, carbsGPer100g: 0, fatGPer100g: 100 },
  { names: ["azúcar", "sugar"], kcalPer100g: 387, proteinGPer100g: 0, carbsGPer100g: 100, fatGPer100g: 0 },
  { names: ["miel", "honey"], kcalPer100g: 304, proteinGPer100g: 0.3, carbsGPer100g: 82, fatGPer100g: 0 },
  { names: ["almendras", "almonds"], kcalPer100g: 579, proteinGPer100g: 21, carbsGPer100g: 22, fatGPer100g: 50 },
];

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function rowMatches(row: NutritionRow, query: string): boolean {
  const normalizedQuery = normalizeName(query);
  return row.names.some((n) => normalizeName(n) === normalizedQuery);
}

export function findNutrientByName(name: string): NutritionRow | undefined {
  if (!name) return undefined;
  return NUTRITION_TABLE.find((row) => rowMatches(row, name));
}

export function findNutrientByNameFuzzy(name: string): NutritionRow | undefined {
  if (!name) return undefined;
  const normalizedQuery = normalizeName(name);
  return (
    NUTRITION_TABLE.find((row) => row.names.some((n) => normalizeName(n) === normalizedQuery)) ??
    NUTRITION_TABLE.find((row) =>
      row.names.some((n) => normalizeName(n).includes(normalizedQuery))
    ) ??
    NUTRITION_TABLE.find((row) =>
      row.names.some((n) => normalizedQuery.includes(normalizeName(n)))
    )
  );
}

export function calculateIngredientCalories(weightG: number, kcalPer100g: number): number {
  return Math.round((weightG * kcalPer100g) / 100);
}

export function calculateIngredientMacro(weightG: number, gramsPer100g: number): number {
  return roundToOneDecimal((weightG * gramsPer100g) / 100);
}

export function computeIngredient(
  name: string,
  weightG: number,
  aiValues: IngredientValues
): Required<IngredientValues> {
  const row = findNutrientByName(name);
  if (!row) {
    return {
      calories: Math.round(aiValues.calories),
      proteinG: aiValues.proteinG ?? 0,
      carbsG: aiValues.carbsG ?? 0,
      fatG: aiValues.fatG ?? 0,
    };
  }

  return {
    calories: calculateIngredientCalories(weightG, row.kcalPer100g),
    proteinG: calculateIngredientMacro(weightG, row.proteinGPer100g),
    carbsG: calculateIngredientMacro(weightG, row.carbsGPer100g),
    fatG: calculateIngredientMacro(weightG, row.fatGPer100g),
  };
}

export function calculateTotalCalories(ingredients: { weightG: number; kcalPer100g: number }[]): number {
  return ingredients.reduce(
    (sum, item) => sum + calculateIngredientCalories(item.weightG, item.kcalPer100g),
    0
  );
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function getNutritionTable(): readonly NutritionRow[] {
  return NUTRITION_TABLE;
}

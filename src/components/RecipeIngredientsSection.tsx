import React from 'react';
import { Trash2, Plus } from 'lucide-react';

interface Ingredient {
  id?: string;
  ingredient_name: string;
  quantity_per_portion: number;
  unit: string;
  category: string;
}

interface RecipeIngredientsSectionProps {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
}

const UNITS = ['g', 'kg', 'ml', 'l', 'dl', 'cl', 'st', 'tsk', 'msk', 'krm'];
const CATEGORIES = ['Grönt', 'Mejeri', 'Torrvaror', 'Kryddor', 'Kött/fisk', 'Frys', 'Övrigt'];

export const RecipeIngredientsSection: React.FC<RecipeIngredientsSectionProps> = ({
  ingredients,
  onChange
}) => {
  const handleAddIngredient = () => {
    onChange([
      ...ingredients,
      {
        ingredient_name: '',
        quantity_per_portion: 0,
        unit: 'g',
        category: ''
      }
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recept & inköpsunderlag</h3>
          <p className="text-sm text-gray-600 mt-1">
            Lägg till ingredienser för att senare kunna skapa smarta inköpslistor
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddIngredient}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#56c5c5' }}
        >
          <Plus className="w-4 h-4" />
          Lägg till ingrediens
        </button>
      </div>

      {ingredients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Inga ingredienser tillagda än</p>
          <p className="text-sm mt-1">Klicka på "Lägg till ingrediens" för att börja</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-3 text-sm font-medium text-gray-700 px-3">
            <div className="col-span-4">Ingrediens</div>
            <div className="col-span-2">Mängd/portion</div>
            <div className="col-span-2">Enhet</div>
            <div className="col-span-3">Kategori</div>
            <div className="col-span-1"></div>
          </div>

          {ingredients.map((ingredient, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 rounded-lg">
              <div className="col-span-4">
                <input
                  type="text"
                  value={ingredient.ingredient_name}
                  onChange={(e) => handleIngredientChange(index, 'ingredient_name', e.target.value)}
                  placeholder="T.ex. Lök"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  step="0.01"
                  value={ingredient.quantity_per_portion || ''}
                  onChange={(e) => handleIngredientChange(index, 'quantity_per_portion', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="col-span-2">
                <select
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-3">
                <select
                  value={ingredient.category || ''}
                  onChange={(e) => handleIngredientChange(index, 'category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Välj kategori</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Ta bort"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

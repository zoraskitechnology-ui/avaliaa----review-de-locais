
import React, { useState } from 'react';
import { Category, Subcategory } from '../types';
import { BackArrowIcon } from './icons';

interface CategorySelectorProps {
  categories: Category[];
  onSelectSubcategory: (subcategory: Subcategory) => void;
  onSearch: (query: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ categories, onSelectSubcategory }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  if (selectedCategory) {
    return (
      <div className="animate-fade-in-up">
        <button
          onClick={() => setSelectedCategory(null)}
          className="flex items-center mb-8 font-semibold text-teal-400 hover:text-teal-300 transition-all duration-300 hover:translate-x-1 group"
        >
          <div className="transition-transform duration-300 group-hover:-translate-x-1">
            <BackArrowIcon />
          </div>
          <span className="ml-2">Voltar para Categorias</span>
        </button>
        <h2 className="text-4xl font-bold mb-8 text-center text-gradient-primary">
          {selectedCategory.name}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {selectedCategory.subcategories.map((subcategory) => (
            <button
              key={subcategory.id}
              onClick={() => onSelectSubcategory(subcategory)}
              className="p-5 card-modern text-center transition-all duration-300 hover:scale-105 hover-glow-teal group"
            >
              <span className="text-base md:text-lg font-semibold text-white group-hover:text-teal-300 transition-colors">
                {subcategory.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-gradient-vibrant tracking-tight">
        Descubra lugares.<br />Viva experiências.
      </h2>
      <p className="text-center text-gray-300 mb-12 text-xl font-medium">
        Selecione uma categoria e comece sua jornada.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category)}
            className="group flex flex-col items-center justify-center p-6 card-modern aspect-square transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400 hover:scale-105 hover-glow-teal"
          >
            <div className="text-5xl mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              {category.icon}
            </div>
            <h3 className="text-sm md:text-base font-bold text-white text-center leading-tight">
              {category.name}
            </h3>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  onFilterChange: (selectedCategories: string[]) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, onFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategoryToggle = (categoryId: string) => {
    const updatedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(updatedCategories);
    onFilterChange(updatedCategories);
  };

  return (
    <div className="bg-[#F5F5F5] rounded-xl shadow-md p-6">
      <h3 className="text-lg font-serif font-bold text-soft-brown mb-4">Catégories</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <input
              type="checkbox"
              id={category.id}
              checked={selectedCategories.includes(category.id)}
              onChange={() => handleCategoryToggle(category.id)}
              className="hidden"
            />
            <label
              htmlFor={category.id}
              className="flex items-center cursor-pointer text-soft-brown hover:text-soft-green transition-colors"
            >
              <div
                className={`w-5 h-5 border rounded mr-2 flex items-center justify-center ${selectedCategories.includes(category.id) ? 'bg-[#A8D5BA] border-soft-green' : 'border-[#F5E8C7]'}`}
              >
                {selectedCategories.includes(category.id) && <Check className="w-4 h-4 text-[#F5F5F5]" />}
              </div>
              {category.name}
            </label>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
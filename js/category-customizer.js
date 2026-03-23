/**
 * Phase 12: Category Customization Module
 * Comprehensive category management with 10 features:
 * 1. Color Picker
 * 2. Icon Customization
 * 3. Drag-to-Reorder
 * 4. Create Custom Categories
 * 5. Delete/Merge Categories
 * 6. Category Presets
 * 7. Sub-categories Support
 * 8. Icon Library
 * 9. Category Aliases
 * 10. Hide Unused Categories Toggle
 */

const CategoryCustomizer = {
  // Icon library for quick selection
  iconLibrary: [
    { name: 'Groceries', emoji: '🛒', category: 'food' },
    { name: 'Dining', emoji: '🍔', category: 'food' },
    { name: 'Coffee', emoji: '☕', category: 'food' },
    { name: 'Gas', emoji: '⛽', category: 'transport' },
    { name: 'Shopping', emoji: '🛍️', category: 'shopping' },
    { name: 'Utilities', emoji: '💡', category: 'home' },
    { name: 'Healthcare', emoji: '⚕️', category: 'health' },
    { name: 'Entertainment', emoji: '🎬', category: 'fun' },
    { name: 'Transport', emoji: '🚕', category: 'transport' },
    { name: 'Taxi/Uber', emoji: '🚗', category: 'transport' },
    { name: 'Train', emoji: '🚆', category: 'transport' },
    { name: 'Flight', emoji: '✈️', category: 'transport' },
    { name: 'Hotel', emoji: '🏨', category: 'travel' },
    { name: 'Restaurant', emoji: '🍽️', category: 'food' },
    { name: 'Gym', emoji: '💪', category: 'health' },
    { name: 'Medicine', emoji: '💊', category: 'health' },
    { name: 'Movie', emoji: '🎥', category: 'fun' },
    { name: 'Gaming', emoji: '🎮', category: 'fun' },
    { name: 'Music', emoji: '🎵', category: 'fun' },
    { name: 'Books', emoji: '📚', category: 'learning' },
    { name: 'Education', emoji: '🎓', category: 'learning' },
    { name: 'Internet', emoji: '📡', category: 'utilities' },
    { name: 'Phone', emoji: '📱', category: 'utilities' },
    { name: 'Water', emoji: '💧', category: 'utilities' },
    { name: 'Electricity', emoji: '🔌', category: 'utilities' },
    { name: 'Rent', emoji: '🏠', category: 'home' },
    { name: 'Home Repair', emoji: '🔧', category: 'home' },
    { name: 'Furniture', emoji: '🛋️', category: 'home' },
    { name: 'Clothes', emoji: '👕', category: 'shopping' },
    { name: 'Shoes', emoji: '👟', category: 'shopping' },
    { name: 'Jewelry', emoji: '💍', category: 'shopping' },
    { name: 'Beauty', emoji: '💄', category: 'personal' },
    { name: 'Haircut', emoji: '✂️', category: 'personal' },
    { name: 'Pet Care', emoji: '🐾', category: 'pets' },
    { name: 'Pet Food', emoji: '🦴', category: 'pets' },
    { name: 'Insurance', emoji: '📋', category: 'financial' },
    { name: 'Loan Payment', emoji: '💳', category: 'financial' },
    { name: 'Investment', emoji: '📈', category: 'financial' },
    { name: 'Tax', emoji: '📊', category: 'financial' },
    { name: 'Birthday Gift', emoji: '🎁', category: 'gifts' },
    { name: 'Holiday Gift', emoji: '🎄', category: 'gifts' },
    { name: 'Donation', emoji: '❤️', category: 'charity' },
    { name: 'Work', emoji: '💼', category: 'work' },
    { name: 'Parking', emoji: '🅿️', category: 'transport' },
    { name: 'Toll', emoji: '🛣️', category: 'transport' },
    { name: 'Coffee Shop', emoji: '☕', category: 'food' },
    { name: 'Bar', emoji: '🍸', category: 'food' },
    { name: 'Wine', emoji: '🍷', category: 'food' },
    { name: 'Subscription', emoji: '🔄', category: 'digital' },
    { name: 'Software', emoji: '💻', category: 'digital' },
    { name: 'Miscellaneous', emoji: '📌', category: 'other' },
  ],

  // Category color presets
  colorPresets: [
    '#4ade80', // Green
    '#f97316', // Orange
    '#a16207', // Brown
    '#ef4444', // Red
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#8b5cf6', // Purple
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#06b6d4', // Teal
    '#3b82f6', // Blue
    '#d946ef', // Fuchsia
    '#14b8a6', // Teal
    '#64748b', // Slate
  ],

  // Category presets for quick setup
  categoryPresets: {
    minimal: [
      { name: 'Food & Dining', emoji: '🍔', color: '#f97316' },
      { name: 'Transportation', emoji: '🚕', color: '#10b981' },
      { name: 'Housing', emoji: '🏠', color: '#8b5cf6' },
      { name: 'Utilities', emoji: '💡', color: '#06b6d4' },
      { name: 'Entertainment', emoji: '🎬', color: '#6366f1' },
      { name: 'Other', emoji: '📌', color: '#6b7280' },
    ],
    detailed: [
      { name: 'Groceries', emoji: '🛒', color: '#4ade80' },
      { name: 'Dining Out', emoji: '🍽️', color: '#f97316' },
      { name: 'Gas', emoji: '⛽', color: '#ef4444' },
      { name: 'Public Transit', emoji: '🚆', color: '#10b981' },
      { name: 'Uber/Taxi', emoji: '🚗', color: '#14b8a6' },
      { name: 'Rent', emoji: '🏠', color: '#8b5cf6' },
      { name: 'Utilities', emoji: '💡', color: '#06b6d4' },
      { name: 'Internet', emoji: '📡', color: '#3b82f6' },
      { name: 'Healthcare', emoji: '⚕️', color: '#ec4899' },
      { name: 'Insurance', emoji: '📋', color: '#64748b' },
      { name: 'Entertainment', emoji: '🎬', color: '#6366f1' },
      { name: 'Shopping', emoji: '🛍️', color: '#d946ef' },
      { name: 'Other', emoji: '📌', color: '#6b7280' },
    ],
    advanced: [
      { name: 'Groceries', emoji: '🛒', color: '#4ade80' },
      { name: 'Dining Out', emoji: '🍽️', color: '#f97316' },
      { name: 'Coffee', emoji: '☕', color: '#a16207' },
      { name: 'Gas', emoji: '⛽', color: '#ef4444' },
      { name: 'Public Transit', emoji: '🚆', color: '#10b981' },
      { name: 'Uber/Taxi', emoji: '🚗', color: '#14b8a6' },
      { name: 'Parking', emoji: '🅿️', color: '#f59e0b' },
      { name: 'Rent', emoji: '🏠', color: '#8b5cf6' },
      { name: 'Home Repair', emoji: '🔧', color: '#64748b' },
      { name: 'Utilities', emoji: '💡', color: '#06b6d4' },
      { name: 'Internet', emoji: '📡', color: '#3b82f6' },
      { name: 'Healthcare', emoji: '⚕️', color: '#ec4899' },
      { name: 'Insurance', emoji: '📋', color: '#8b5cf6' },
      { name: 'Gym', emoji: '💪', color: '#d946ef' },
      { name: 'Entertainment', emoji: '🎬', color: '#6366f1' },
      { name: 'Shopping', emoji: '🛍️', color: '#d946ef' },
      { name: 'Subscriptions', emoji: '🔄', color: '#06b6d4' },
      { name: 'Education', emoji: '🎓', color: '#3b82f6' },
      { name: 'Gifts', emoji: '🎁', color: '#ec4899' },
      { name: 'Other', emoji: '📌', color: '#6b7280' },
    ],
  },

  /**
   * Initialize category with default structure including new Phase 12 properties
   */
  createCategory(name, emoji, color, parentId = null) {
    return {
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      emoji,
      color,
      createdAt: new Date().toISOString(),
      parentId, // For sub-categories
      aliases: [], // Alternative names for this category
      isHidden: false, // Feature 10: Hide unused toggle
      subcategories: [], // Feature 7: Sub-categories
      customOrder: 0, // Feature 3: Drag-to-reorder
      usageCount: 0, // Track usage for hiding unused
      lastUsedDate: null,
    };
  },

  /**
   * Create category from preset
   */
  createCategoryFromIcon(iconObj, color) {
    return this.createCategory(iconObj.name, iconObj.emoji, color);
  },

  /**
   * Apply category preset (Minimal, Detailed, Advanced)
   */
  applyPreset(presetName) {
    if (!this.categoryPresets[presetName]) {
      console.error(`Unknown preset: ${presetName}`);
      return [];
    }
    return this.categoryPresets[presetName].map((cat, idx) =>
      this.createCategory(cat.name, cat.emoji, cat.color)
    );
  },

  /**
   * Get categories by usage frequency
   */
  getCategoriesByUsage(categories, transactions) {
    const usage = {};
    categories.forEach(cat => {
      usage[cat.id] = transactions.filter(t => t.category === cat.id).length;
    });
    return usage;
  },

  /**
   * Get unused categories
   */
  getUnusedCategories(categories, transactions) {
    const usage = this.getCategoriesByUsage(categories, transactions);
    return categories.filter(cat => usage[cat.id] === 0);
  },

  /**
   * Merge two categories (reassign transactions)
   */
  mergCategories(sourceCatId, targetCatId, transactions) {
    return transactions.map(txn => ({
      ...txn,
      category: txn.category === sourceCatId ? targetCatId : txn.category,
    }));
  },

  /**
   * Delete category (with option to reassign to another)
   */
  deleteCategory(catId, transactions, replacementCatId = null) {
    if (replacementCatId) {
      return this.mergCategories(catId, replacementCatId, transactions);
    }
    // If no replacement, just remove transactions of this category
    return transactions.filter(txn => txn.category !== catId);
  },

  /**
   * Reorder categories (Feature 3: Drag-to-reorder)
   */
  reorderCategories(categories, fromIndex, toIndex) {
    const newOrder = [...categories];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    
    // Update custom order
    return newOrder.map((cat, idx) => ({
      ...cat,
      customOrder: idx,
    }));
  },

  /**
   * Add sub-category (Feature 7: Sub-categories)
   */
  addSubcategory(parentCat, subName, emoji, color) {
    const subCat = this.createCategory(subName, emoji, color, parentCat.id);
    return {
      ...parentCat,
      subcategories: [...(parentCat.subcategories || []), subCat.id],
    };
  },

  /**
   * Get all subcategories for a category
   */
  getSubcategories(parentId, allCategories) {
    return allCategories.filter(cat => cat.parentId === parentId);
  },

  /**
   * Add alias for category (Feature 9: Aliases)
   */
  addAlias(category, alias) {
    return {
      ...category,
      aliases: [...(category.aliases || []), alias],
    };
  },

  /**
   * Find category by alias
   */
  findCategoryByAlias(alias, categories) {
    return categories.find(cat =>
      cat.aliases && cat.aliases.includes(alias.toLowerCase())
    );
  },

  /**
   * Toggle hide unused categories (Feature 10)
   */
  toggleHideUnused(categories, hideUnused, transactions) {
    if (!hideUnused) return categories;
    
    const usage = this.getCategoriesByUsage(categories, transactions);
    return categories.map(cat => ({
      ...cat,
      isHidden: usage[cat.id] === 0,
    }));
  },

  /**
   * Get visible categories (considering hide unused)
   */
  getVisibleCategories(categories, hideUnused = false, transactions = []) {
    if (!hideUnused) {
      return categories.filter(cat => !cat.isHidden);
    }
    return this.toggleHideUnused(categories, true, transactions)
      .filter(cat => !cat.isHidden);
  },

  /**
   * Validate category name
   */
  validateCategory(name, emoji, existingCategories = []) {
    const errors = [];
    
    if (!name || name.trim().length === 0) {
      errors.push('Category name is required');
    }
    if (name.length > 50) {
      errors.push('Category name must be less than 50 characters');
    }
    if (!emoji || emoji.trim().length === 0) {
      errors.push('Category emoji is required');
    }
    if (existingCategories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      errors.push('A category with this name already exists');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Export categories
   */
  exportCategories(categories) {
    return JSON.stringify(categories, null, 2);
  },

  /**
   * Import categories from JSON
   */
  importCategories(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to import categories:', e);
      return [];
    }
  },

  /**
   * Get category statistics
   */
  getCategoryStats(category, transactions) {
    const categoryTxns = transactions.filter(t => t.category === category.id);
    const expenses = categoryTxns.filter(t => t.type === 'expense');
    const income = categoryTxns.filter(t => t.type === 'income');
    
    return {
      totalTransactions: categoryTxns.length,
      totalExpenses: expenses.reduce((sum, t) => sum + t.amount, 0),
      totalIncome: income.reduce((sum, t) => sum + t.amount, 0),
      averageTransaction: categoryTxns.length > 0 
        ? categoryTxns.reduce((sum, t) => sum + t.amount, 0) / categoryTxns.length 
        : 0,
      lastUsed: categoryTxns.length > 0
        ? new Date(Math.max(...categoryTxns.map(t => new Date(t.date))))
        : null,
    };
  },

  /**
   * Search categories
   */
  searchCategories(query, categories) {
    const q = query.toLowerCase();
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(q) ||
      cat.aliases.some(alias => alias.toLowerCase().includes(q)) ||
      cat.emoji.includes(query)
    );
  },

  /**
   * Update category usage stats
   */
  updateCategoryUsage(categories, transactions) {
    return categories.map(cat => {
      const categoryTxns = transactions.filter(t => t.category === cat.id);
      const lastTxn = categoryTxns.length > 0
        ? new Date(Math.max(...categoryTxns.map(t => new Date(t.date))))
        : null;
      
      return {
        ...cat,
        usageCount: categoryTxns.length,
        lastUsedDate: lastTxn ? lastTxn.toISOString() : null,
      };
    });
  },
};

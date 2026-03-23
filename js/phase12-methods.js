/**
 * Phase 12: Category Customization Methods
 * These methods are injected into the app.js setup() return object
 */

// Computed property for filtered categories
function filteredCategoriesForCustomizer() {
  let filtered = categories.value;
  
  if (categorySearchQuery.value) {
    const q = categorySearchQuery.value.toLowerCase();
    filtered = filtered.filter(cat =>
      cat.name.toLowerCase().includes(q) ||
      (cat.aliases && cat.aliases.some(alias => alias.toLowerCase().includes(q)))
    );
  }
  
  if (categoryCustomizerSettings.hideUnused) {
    filtered = filtered.filter(cat => {
      const count = transactions.value.filter(t => t.category === cat.id).length;
      return count > 0;
    });
  }
  
  return filtered;
}

// Get category statistics
function getCategoryStats(category, trans) {
  const categoryTxns = trans.filter(t => t.category === category.id);
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
}

// Add new category
function addNewCategory() {
  const validation = CategoryCustomizer.validateCategory(
    newCategoryForm.name,
    newCategoryForm.emoji,
    categories.value
  );
  
  if (!validation.valid) {
    showNotification(`Error: ${validation.errors.join(', ')}`);
    return;
  }
  
  const newCat = CategoryCustomizer.createCategory(
    newCategoryForm.name,
    newCategoryForm.emoji,
    newCategoryForm.color,
    newCategoryForm.parentId || null
  );
  
  if (newCategoryForm.aliasesInput) {
    const aliases = newCategoryForm.aliasesInput
      .split(',')
      .map(a => a.trim().toLowerCase())
      .filter(a => a);
    newCat.aliases = aliases;
  }
  
  categories.value.push(newCat);
  saveAllData();
  showNotification(`Category "${newCategoryForm.name}" created`);
  
  // Reset form
  newCategoryForm.name = '';
  newCategoryForm.emoji = '📌';
  newCategoryForm.color = '#6b7280';
  newCategoryForm.parentId = '';
  newCategoryForm.aliasesInput = '';
  showAddCategoryForm.value = false;
}

// Edit category modal
function editCategoryModal(cat) {
  editingCategory.id = cat.id;
  editingCategory.name = cat.name;
  editingCategory.emoji = cat.emoji;
  editingCategory.color = cat.color;
  editingCategory.aliasesEdit = (cat.aliases || []).join(', ');
  showEditCategoryModal.value = true;
}

// Save edit category
function saveEditCategory() {
  const cat = categories.value.find(c => c.id === editingCategory.id);
  if (!cat) return;
  
  cat.name = editingCategory.name;
  cat.emoji = editingCategory.emoji;
  cat.color = editingCategory.color;
  
  if (editingCategory.aliasesEdit) {
    cat.aliases = editingCategory.aliasesEdit
      .split(',')
      .map(a => a.trim().toLowerCase())
      .filter(a => a);
  } else {
    cat.aliases = [];
  }
  
  categories.value = [...categories.value]; // trigger reactivity
  saveAllData();
  showNotification(`Category "${cat.name}" updated`);
  showEditCategoryModal.value = false;
}

// Show delete category confirmation
function showDeleteCategoryConfirm(cat) {
  if (confirm(`Delete category "${cat.name}"? Transactions will be removed.`)) {
    categories.value = categories.value.filter(c => c.id !== cat.id);
    transactions.value = transactions.value.filter(t => t.category !== cat.id);
    saveAllData();
    showNotification(`Category "${cat.name}" deleted`);
  }
}

// Drag and drop handlers
function handleCategoryDragStart(e, index) {
  draggedCategoryIndex = index;
  e.dataTransfer.effectAllowed = 'move';
}

function handleCategoryDragEnd() {
  draggedCategoryIndex = null;
}

function handleCategoryDrop(e) {
  e.preventDefault();
  if (draggedCategoryIndex === null) return;
  
  const filtered = filteredCategoriesForCustomizer();
  if (draggedCategoryIndex < filtered.length) {
    const draggedCat = filtered[draggedCategoryIndex];
    const draggedIdx = categories.value.findIndex(c => c.id === draggedCat.id);
    
    // Find target index (bottom of drop zone)
    const allItems = document.querySelectorAll('.category-item-customizer');
    let targetIdx = draggedIdx;
    
    allItems.forEach((item, idx) => {
      const rect = item.getBoundingClientRect();
      if (e.clientY > rect.top) {
        targetIdx = categories.value.findIndex(c => c.id === filtered[idx]?.id);
      }
    });
    
    if (targetIdx !== draggedIdx) {
      categories.value = CategoryCustomizer.reorderCategories(
        categories.value,
        draggedIdx,
        Math.max(0, targetIdx)
      );
      saveAllData();
    }
  }
}

// Apply preset
function applyPreset(presetName) {
  if (confirm(`Replace all categories with ${presetName} preset?`)) {
    const presetCategories = CategoryCustomizer.applyPreset(presetName);
    categories.value = presetCategories;
    saveAllData();
    showNotification(`${presetName} preset applied`);
  }
}

// Select icon for new category
function selectIconForNewCategory(icon) {
  newCategoryForm.emoji = icon.emoji;
  newCategoryForm.name = icon.name;
  showNotification(`Selected ${icon.emoji} ${icon.name}`);
}

// Merge categories
function mergeCategories() {
  if (!mergeState.sourceId || !mergeState.targetId) {
    showNotification('Please select both source and target categories');
    return;
  }
  
  const sourceCat = categories.value.find(c => c.id === mergeState.sourceId);
  const targetCat = categories.value.find(c => c.id === mergeState.targetId);
  
  if (!sourceCat || !targetCat) {
    showNotification('Categories not found');
    return;
  }
  
  // Merge transactions
  transactions.value = transactions.value.map(txn =>
    txn.category === mergeState.sourceId
      ? { ...txn, category: mergeState.targetId }
      : txn
  );
  
  // Delete source category if requested
  if (mergeState.deleteSource) {
    categories.value = categories.value.filter(c => c.id !== mergeState.sourceId);
  }
  
  saveAllData();
  showNotification(`Merged ${sourceCat.name} into ${targetCat.name}`);
  showMergeCategoriesModal.value = false;
  mergeState.sourceId = '';
  mergeState.targetId = '';
}

// Export categories to JSON
function exportCategoriesToJSON() {
  const json = CategoryCustomizer.exportCategories(categories.value);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `categories-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showNotification('Categories exported');
}

// Import categories from file
function importCategoriesFromFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = CategoryCustomizer.importCategories(event.target.result);
      if (Array.isArray(imported) && imported.length > 0) {
        if (confirm('Replace current categories with imported ones?')) {
          categories.value = imported;
          saveAllData();
          showNotification(`${imported.length} categories imported`);
        }
      } else {
        showNotification('Invalid category format');
      }
    } catch (err) {
      showNotification('Error importing categories');
      console.error(err);
    }
  };
  reader.readAsText(file);
}

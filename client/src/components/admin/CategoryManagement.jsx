import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const CategoryManagement = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    icon: '',
    color: '#FF6B35',
    isActive: true,
    sortOrder: 0,
    parentId: null
  });

  const predefinedIcons = [
    '🏔️', '🎭', '📚', '🎪', '⚽', '🧘', '🍳', '🎨', '🎵', '🏊',
    '🚴', '🧗', '⛺', '🎯', '🎳', '🎮', '📸', '🎪', '🎢', '🏰',
    '🌊', '🏜️', '🌸', '🌳', '🦎', '🐪', '🐎', '🦅', '🎪', '🎨'
  ];

  const predefinedColors = [
    '#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setMessage({ type: 'error', text: 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  };

  const saveCategory = async (categoryData) => {
    try {
      setSaving(true);
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory._id}`, categoryData);
        setMessage({ type: 'success', text: 'Category updated successfully' });
      } else {
        await api.post('/admin/categories', categoryData);
        setMessage({ type: 'success', text: 'Category created successfully' });
      }
      
      await fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Failed to save category:', error);
      setMessage({ type: 'error', text: 'Failed to save category' });
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await api.delete(`/admin/categories/${categoryId}`);
      setMessage({ type: 'success', text: 'Category deleted successfully' });
      await fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      setMessage({ type: 'error', text: 'Failed to delete category' });
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setNewCategory({
      name: { en: '', ar: '' },
      description: { en: '', ar: '' },
      icon: '',
      color: '#FF6B35',
      isActive: true,
      sortOrder: 0,
      parentId: null
    });
  };

  const startEditing = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name || { en: '', ar: '' },
      description: category.description || { en: '', ar: '' },
      icon: category.icon || '',
      color: category.color || '#FF6B35',
      isActive: category.isActive !== false,
      sortOrder: category.sortOrder || 0,
      parentId: category.parentId || null
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveCategory(newCategory);
  };

  const updateCategoryField = (field, value, language = null) => {
    if (language) {
      setNewCategory(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [language]: value
        }
      }));
    } else {
      setNewCategory(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const reorderCategories = async (draggedId, targetId) => {
    try {
      await api.put('/admin/categories/reorder', {
        draggedId,
        targetId
      });
      await fetchCategories();
      setMessage({ type: 'success', text: 'Categories reordered successfully' });
    } catch (error) {
      console.error('Failed to reorder categories:', error);
      setMessage({ type: 'error', text: 'Failed to reorder categories' });
    }
  };

  const toggleCategoryStatus = async (categoryId, isActive) => {
    try {
      await api.patch(`/admin/categories/${categoryId}/status`, { isActive });
      await fetchCategories();
      setMessage({ 
        type: 'success', 
        text: `Category ${isActive ? 'activated' : 'deactivated'} successfully` 
      });
    } catch (error) {
      console.error('Failed to update category status:', error);
      setMessage({ type: 'error', text: 'Failed to update category status' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display-sm font-bold text-ludus-dark">
            Category Management
          </h1>
          <p className="text-body-sm text-ludus-gray-600">
            Manage activity categories with multilingual support
          </p>
        </div>
        <Button
          onClick={resetForm}
          className="bg-ludus-orange text-white"
        >
          ➕ Add New Category
        </Button>
      </div>

      {message && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Form */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* English Name */}
              <div>
                <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                  Name (English)
                </label>
                <Input
                  value={newCategory.name.en}
                  onChange={(e) => updateCategoryField('name', e.target.value, 'en')}
                  placeholder="Adventure Activities"
                  required
                />
              </div>

              {/* Arabic Name */}
              <div>
                <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                  Name (Arabic)
                </label>
                <Input
                  value={newCategory.name.ar}
                  onChange={(e) => updateCategoryField('name', e.target.value, 'ar')}
                  placeholder="أنشطة المغامرة"
                  dir="rtl"
                  required
                />
              </div>

              {/* English Description */}
              <div>
                <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                  Description (English)
                </label>
                <textarea
                  value={newCategory.description.en}
                  onChange={(e) => updateCategoryField('description', e.target.value, 'en')}
                  placeholder="Exciting outdoor adventures and thrilling experiences"
                  className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md resize-none h-20"
                />
              </div>

              {/* Arabic Description */}
              <div>
                <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                  Description (Arabic)
                </label>
                <textarea
                  value={newCategory.description.ar}
                  onChange={(e) => updateCategoryField('description', e.target.value, 'ar')}
                  placeholder="مغامرات خارجية مثيرة وتجارب مشوقة"
                  className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md resize-none h-20"
                  dir="rtl"
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {predefinedIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => updateCategoryField('icon', icon)}
                      className={`p-2 rounded-md text-xl hover:bg-ludus-gray-100 ${
                        newCategory.icon === icon ? 'bg-ludus-orange text-white' : 'bg-ludus-gray-50'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <Input
                  value={newCategory.icon}
                  onChange={(e) => updateCategoryField('icon', e.target.value)}
                  placeholder="🏔️ or enter custom emoji"
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                  Color
                </label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {predefinedColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updateCategoryField('color', color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newCategory.color === color ? 'border-ludus-dark' : 'border-ludus-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => updateCategoryField('color', e.target.value)}
                />
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                  Sort Order
                </label>
                <Input
                  type="number"
                  value={newCategory.sortOrder}
                  onChange={(e) => updateCategoryField('sortOrder', parseInt(e.target.value))}
                  min="0"
                />
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                  Parent Category (Optional)
                </label>
                <select
                  value={newCategory.parentId || ''}
                  onChange={(e) => updateCategoryField('parentId', e.target.value || null)}
                  className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md"
                >
                  <option value="">No Parent (Top Level)</option>
                  {categories.filter(cat => cat._id !== editingCategory?._id).map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name?.en || category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newCategory.isActive}
                  onChange={(e) => updateCategoryField('isActive', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-label-sm text-ludus-dark">
                  Active Category
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-ludus-orange text-white flex-1"
                >
                  {saving ? '💾 Saving...' : editingCategory ? '📝 Update' : '➕ Create'}
                </Button>
                {editingCategory && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="text-ludus-dark border-ludus-gray-300"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">
              Categories ({categories.length})
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-ludus-orange border-t-transparent mx-auto"></div>
                <p className="text-ludus-gray-600 mt-2">Loading categories...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {categories.map(category => (
                  <div
                    key={category._id}
                    className={`p-4 rounded-lg border-2 ${
                      category.isActive !== false 
                        ? 'bg-white border-ludus-gray-200' 
                        : 'bg-ludus-gray-50 border-ludus-gray-300 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                          style={{ backgroundColor: category.color || '#FF6B35' }}
                        >
                          {category.icon || '📁'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-ludus-dark">
                            {category.name?.en || category.name} / {category.name?.ar}
                          </h4>
                          <p className="text-sm text-ludus-gray-600">
                            {category.description?.en || category.description}
                          </p>
                          <div className="text-xs text-ludus-gray-500 mt-1">
                            Order: {category.sortOrder || 0} | 
                            Status: {category.isActive !== false ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleCategoryStatus(category._id, !category.isActive)}
                          className={category.isActive !== false 
                            ? 'text-orange-600 border-orange-300' 
                            : 'text-green-600 border-green-300'
                          }
                        >
                          {category.isActive !== false ? '⏸️' : '▶️'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(category)}
                          className="text-ludus-orange border-ludus-orange/30"
                        >
                          ✏️
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteCategory(category._id)}
                          className="text-red-600 border-red-300"
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Category Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-r from-ludus-orange to-ludus-orange-600 text-white">
          <div className="text-2xl font-bold">{categories.filter(c => c.isActive !== false).length}</div>
          <div className="text-sm opacity-90">Active Categories</div>
        </Card>
        <Card className="p-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white">
          <div className="text-2xl font-bold">{categories.filter(c => c.isActive === false).length}</div>
          <div className="text-sm opacity-90">Inactive Categories</div>
        </Card>
        <Card className="p-4 bg-gradient-to-r from-ludus-orange to-ludus-orange-dark text-white">
          <div className="text-2xl font-bold">{categories.filter(c => c.parentId).length}</div>
          <div className="text-sm opacity-90">Subcategories</div>
        </Card>
        <Card className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="text-2xl font-bold">{categories.filter(c => !c.parentId).length}</div>
          <div className="text-sm opacity-90">Top Level</div>
        </Card>
      </div>
    </div>
  );
};

export default CategoryManagement;
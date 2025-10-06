"use client";

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface MenuItem {
  id: string;
  name: string;
  href: string;
  badge?: string;
  visible: boolean;
  order: number;
  megaMenu?: {
    enabled: boolean;
    featured: Array<{
      id: string;
      name: string;
      price: number;
      href: string;
      badge?: string;
      image?: string;
    }>;
    categories: Array<{
      id: string;
      name: string;
      href: string;
      icon?: string;
    }>;
    brands: Array<{
      id: string;
      name: string;
      href: string;
    }>;
  };
}

interface MenuManagementProps {
  className?: string;
}

export function MenuManagement({ className = '' }: MenuManagementProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch menu items from API
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/menu');
      const result = await response.json();
      
      if (result.success) {
        setMenuItems(result.data);
      } else {
        console.error('Failed to fetch menu items:', result.error);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMenuItem = async (item: MenuItem) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      const result = await response.json();
      if (result.success) {
        setMenuItems(items => 
          items.map(existing => 
            existing.id === item.id ? item : existing
          )
        );
        setIsEditing(null);
      } else {
        alert('Lỗi khi lưu menu: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Lỗi kết nối khi lưu menu');
    } finally {
      setLoading(false);
    }
  };

  const deleteMenuItem = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mục menu này?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      if (result.success) {
        setMenuItems(items => items.filter(item => item.id !== id));
      } else {
        alert('Lỗi khi xóa menu: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Lỗi kết nối khi xóa menu');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id: string) => {
    const item = menuItems.find(item => item.id === id);
    if (!item) return;

    const updatedItem = { ...item, visible: !item.visible };
    await saveMenuItem(updatedItem);
  };

  const moveItem = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = menuItems.findIndex(item => item.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= menuItems.length) return;

    setLoading(true);
    try {
      const newItems = [...menuItems];
      [newItems[currentIndex], newItems[newIndex]] = [newItems[newIndex], newItems[currentIndex]];
      
      // Update order values
      const reorderData = newItems.map((item, index) => ({
        id: item.id,
        order: index + 1
      }));
      
      const response = await fetch('/api/menu', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: reorderData }),
      });
      
      const result = await response.json();
      if (result.success) {
        setMenuItems(result.data);
      } else {
        alert('Lỗi khi sắp xếp menu: ' + result.error);
      }
    } catch (error) {
      console.error('Error reordering menu items:', error);
      alert('Lỗi kết nối khi sắp xếp menu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quản lý Menu</h3>
            <p className="text-sm text-gray-600 mt-1">
              Quản lý các mục menu chính và mega menu
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Thêm mục menu</span>
          </button>
        </div>
      </div>

      {/* Menu Items List */}
      <div className="divide-y">
        {menuItems.map((item, index) => (
          <div key={item.id} className="px-6 py-4">
            {isEditing === item.id ? (
              <EditMenuForm 
                item={item} 
                onSave={saveMenuItem}
                onCancel={() => setIsEditing(null)}
                loading={loading}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Drag Handle */}
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveItem(item.id, 'up')}
                      disabled={index === 0 || loading}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <ArrowUpIcon className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => moveItem(item.id, 'down')}
                      disabled={index === menuItems.length - 1 || loading}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <ArrowDownIcon className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Menu Item Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                      {item.megaMenu?.enabled && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                          Mega Menu
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{item.href}</p>
                    {item.megaMenu?.enabled && (
                      <div className="text-xs text-gray-400 mt-1">
                        {item.megaMenu.featured.length} sản phẩm nổi bật • {' '}
                        {item.megaMenu.categories.length} danh mục • {' '}
                        {item.megaMenu.brands.length} thương hiệu
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleVisibility(item.id)}
                    disabled={loading}
                    className={`p-2 rounded-lg transition-colors ${
                      item.visible 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {item.visible ? (
                      <EyeIcon className="h-4 w-4" />
                    ) : (
                      <EyeSlashIcon className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={() => setIsEditing(item.id)}
                    disabled={loading}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    disabled={loading}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {menuItems.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có mục menu nào
            </h3>
            <p className="text-gray-500 mb-4">
              Bắt đầu bằng cách thêm mục menu đầu tiên
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Thêm mục menu</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <AddMenuModal 
          onClose={() => setShowAddForm(false)}
          onAdd={async (newItem) => {
            setLoading(true);
            try {
              const response = await fetch('/api/menu', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(newItem),
              });
              
              const result = await response.json();
              if (result.success) {
                setMenuItems(items => [...items, result.data]);
                setShowAddForm(false);
              } else {
                alert('Lỗi khi thêm menu: ' + result.error);
              }
            } catch (error) {
              console.error('Error adding menu item:', error);
              alert('Lỗi kết nối khi thêm menu');
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
    </div>
  );
}

// Edit Menu Form Component
function EditMenuForm({ 
  item, 
  onSave, 
  onCancel, 
  loading 
}: { 
  item: MenuItem; 
  onSave: (item: MenuItem) => void; 
  onCancel: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState(item);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên menu
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Đường dẫn
          </label>
          <input
            type="text"
            value={formData.href}
            onChange={(e) => setFormData({ ...formData, href: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Badge (tùy chọn)
        </label>
        <input
          type="text"
          value={formData.badge || ''}
          onChange={(e) => setFormData({ ...formData, badge: e.target.value || undefined })}
          placeholder="VD: HOT, NEW, SALE..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.visible}
            onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
            className="rounded border-gray-300 text-black focus:ring-black"
          />
          <span className="text-sm text-gray-700">Hiển thị menu</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.megaMenu?.enabled || false}
            onChange={(e) => setFormData({ 
              ...formData, 
              megaMenu: formData.megaMenu 
                ? { ...formData.megaMenu, enabled: e.target.checked }
                : { enabled: e.target.checked, featured: [], categories: [], brands: [] }
            })}
            className="rounded border-gray-300 text-black focus:ring-black"
          />
          <span className="text-sm text-gray-700">Bật Mega Menu</span>
        </label>
      </div>

      <div className="flex space-x-3 pt-4 border-t">
        <button
          onClick={() => onSave(formData)}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}

// Add Menu Modal Component
function AddMenuModal({ 
  onClose, 
  onAdd 
}: { 
  onClose: () => void; 
  onAdd: (item: Omit<MenuItem, 'id' | 'order'>) => void; 
}) {
  const [formData, setFormData] = useState({
    name: '',
    href: '',
    badge: '',
    visible: true,
    megaMenu: {
      enabled: false,
      featured: [],
      categories: [],
      brands: []
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.href) {
      onAdd({
        ...formData,
        badge: formData.badge || undefined
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thêm mục menu mới
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên menu *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đường dẫn *
            </label>
            <input
              type="text"
              value={formData.href}
              onChange={(e) => setFormData({ ...formData, href: e.target.value })}
              placeholder="/category/example"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Badge (tùy chọn)
            </label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              placeholder="VD: HOT, NEW, SALE..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.visible}
                onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm text-gray-700">Hiển thị menu</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.megaMenu.enabled}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  megaMenu: { ...formData.megaMenu, enabled: e.target.checked }
                })}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm text-gray-700">Bật Mega Menu</span>
            </label>
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Thêm menu
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
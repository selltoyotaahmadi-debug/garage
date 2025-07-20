import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useNotifications } from '../../contexts/NotificationContext';

export default function WarehouseInventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    quantity: 0,
    minQuantity: 0,
    price: 0,
    supplierId: ''
  });

  const { inventory, suppliers, getLowStockItems } = useData();
  const { addNotification } = useNotifications();

  const lowStockItems = getLowStockItems();

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStock = 
      stockFilter === 'all' ||
      (stockFilter === 'low' && item.quantity <= item.minQuantity) ||
      (stockFilter === 'normal' && item.quantity > item.minQuantity && item.quantity <= item.minQuantity * 2) ||
      (stockFilter === 'high' && item.quantity > item.minQuantity * 2);
    
    return matchesSearch && matchesStock;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      // updateInventoryItem(editingItem, formData);
      addNotification({
        title: 'قطعه ویرایش شد',
        message: `اطلاعات ${formData.name} با موفقیت به‌روزرسانی شد`,
        type: 'success'
      });
      setEditingItem(null);
    } else {
      // addInventoryItem(formData);
      addNotification({
        title: 'قطعه جدید اضافه شد',
        message: `${formData.name} با موفقیت به انبار اضافه شد`,
        type: 'success'
      });
    }
    
    setFormData({
      name: '',
      code: '',
      quantity: 0,
      minQuantity: 0,
      price: 0,
      supplierId: ''
    });
    setShowAddForm(false);
  };

  const handleEdit = (item: any) => {
    setFormData({
      name: item.name,
      code: item.code,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      price: item.price,
      supplierId: item.supplierId
    });
    setEditingItem(item.id);
    setShowAddForm(true);
  };

  const handleStockUpdate = (itemId: string, type: 'in' | 'out', amount: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    // const newQuantity = type === 'in' ? item.quantity + amount : item.quantity - amount;
    
    // if (newQuantity < 0) {
    //   addNotification({
    //     title: 'خطا',
    //     message: 'موجودی نمی‌تواند منفی باشد',
    //     type: 'error'
    //   });
    //   return;
    // }

    // updateInventoryItem(itemId, { quantity: newQuantity });
    
    addNotification({
      title: type === 'in' ? 'ورود موجودی' : 'خروج موجودی',
      message: `${amount} عدد ${item.name} ${type === 'in' ? 'وارد' : 'خارج'} شد`,
      type: 'info'
    });
  };

  const getStockStatus = (item: any) => {
    if (item.quantity <= item.minQuantity) {
      return { 
        color: 'text-red-600 dark:text-red-400', 
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        icon: AlertTriangle, 
        text: 'کم' 
      };
    } else if (item.quantity <= item.minQuantity * 2) {
      return { 
        color: 'text-yellow-600 dark:text-yellow-400', 
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        icon: TrendingDown, 
        text: 'متوسط' 
      };
    } else {
      return { 
        color: 'text-green-600 dark:text-green-400', 
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        icon: TrendingUp, 
        text: 'کافی' 
      };
    }
  };

  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">موجودی انبار</h2>
          <p className="text-gray-600 dark:text-gray-400">مدیریت موجودی و قطعات انبار</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingItem(null);
            setFormData({
              name: '',
              code: '',
              quantity: 0,
              minQuantity: 0,
              price: 0,
              supplierId: ''
            });
          }}
          className="btn-primary flex items-center space-x-2 space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>قطعه جدید</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">کل اقلام</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{inventory.length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">موجودی کم</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{lowStockItems.length}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">ارزش کل</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {(totalValue / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">میانگین قیمت</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {inventory.length > 0 ? Math.round(inventory.reduce((sum, item) => sum + item.price, 0) / inventory.length).toLocaleString() : 0} تومان
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 space-x-reverse mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">
              هشدار موجودی کم ({lowStockItems.length} مورد)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockItems.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-red-100 dark:bg-red-900/50 p-2 rounded">
                <span className="text-red-700 dark:text-red-300 font-medium">{item.name}</span>
                <span className="text-sm text-red-600 dark:text-red-400">
                  {item.quantity}/{item.minQuantity}
                </span>
              </div>
            ))}
            {lowStockItems.length > 6 && (
              <div className="text-sm text-red-600 dark:text-red-400 p-2">
                و {lowStockItems.length - 6} مورد دیگر...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام یا کد قطعه..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="all">همه موجودی‌ها</option>
          <option value="low">موجودی کم</option>
          <option value="normal">موجودی متوسط</option>
          <option value="high">موجودی کافی</option>
        </select>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingItem ? 'ویرایش قطعه' : 'افزودن قطعه جدید'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                نام قطعه *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                کد قطعه *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                تعداد موجود
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                حداقل موجودی
              </label>
              <input
                type="number"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                قیمت (تومان)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                تأمین‌کننده
              </label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">انتخاب تأمین‌کننده</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-3 flex space-x-3 space-x-reverse">
              <button type="submit" className="btn-success">
                {editingItem ? 'ویرایش' : 'ثبت'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}
                className="btn-secondary"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredInventory.map((item) => {
          const status = getStockStatus(item);
          const StatusIcon = status.icon;
          const supplier = suppliers.find(s => s.id === item.supplierId);
          
          return (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 card-hover border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      کد: {item.code}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 space-x-reverse px-2 py-1 rounded-full ${status.bgColor}`}>
                  <StatusIcon className={`w-3 h-3 ${status.color}`} />
                  <span className={`text-xs font-medium ${status.color}`}>
                    {status.text}
                  </span>
                </div>
              </div>

              {/* Stock Info */}
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">موجودی:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.quantity} عدد</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">حداقل:</span>
                  <span className="text-gray-900 dark:text-white">{item.minQuantity} عدد</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">قیمت:</span>
                  <span className="text-gray-900 dark:text-white">{item.price.toLocaleString()} تومان</span>
                </div>
                {supplier && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">تأمین‌کننده:</span>
                    <span className="text-gray-900 dark:text-white text-xs">{supplier.name}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>موجودی</span>
                  <span>{Math.round((item.quantity / (item.minQuantity * 3)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.quantity <= item.minQuantity ? 'bg-red-500' :
                      item.quantity <= item.minQuantity * 2 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((item.quantity / (item.minQuantity * 3)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => {
                    const amount = prompt('تعداد ورود:');
                    if (amount && parseInt(amount) > 0) {
                      handleStockUpdate(item.id, 'in', parseInt(amount));
                    }
                  }}
                  className="flex-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-xs font-medium py-1 px-2 border border-green-200 dark:border-green-800 rounded hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                  title="ورود موجودی"
                >
                  ورود
                </button>
                <button
                  onClick={() => {
                    const amount = prompt('تعداد خروج:');
                    if (amount && parseInt(amount) > 0) {
                      handleStockUpdate(item.id, 'out', parseInt(amount));
                    }
                  }}
                  className="flex-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium py-1 px-2 border border-red-200 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  title="خروج موجودی"
                >
                  خروج
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium py-1 px-2 border border-blue-200 dark:border-blue-800 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  ویرایش
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            قطعه‌ای یافت نشد
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            هیچ قطعه‌ای با فیلترهای انتخابی یافت نشد
          </p>
        </div>
      )}
    </div>
  );
}
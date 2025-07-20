import React, { useState } from 'react';
import { Truck, Plus, Search, Edit, Trash2, Phone, MapPin, Mail, Package, DollarSign } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  website?: string;
  category: string;
  paymentTerms: string;
  rating: number;
  isActive: boolean;
  totalOrders: number;
  totalAmount: number;
  lastOrderDate?: string;
  createdAt: string;
  notes?: string;
}

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'شرکت قطعات سازان',
      contactPerson: 'احمد محمدی',
      phone: '021-12345678',
      email: 'info@parts.com',
      address: 'تهران، بازار قطعات یدکی',
      website: 'www.parts.com',
      category: 'قطعات موتور',
      paymentTerms: '30 روز',
      rating: 4.5,
      isActive: true,
      totalOrders: 25,
      totalAmount: 15000000,
      lastOrderDate: '2024-01-15',
      createdAt: '2024-01-01',
      notes: 'تأمین‌کننده معتبر با کیفیت بالا'
    },
    {
      id: '2',
      name: 'پخش روغن پارس',
      contactPerson: 'مریم رضایی',
      phone: '021-87654321',
      email: 'sales@oil.com',
      address: 'تهران، خیابان انقلاب',
      category: 'روغن و مواد مصرفی',
      paymentTerms: '15 روز',
      rating: 4.2,
      isActive: true,
      totalOrders: 18,
      totalAmount: 8500000,
      lastOrderDate: '2024-01-10',
      createdAt: '2024-01-02'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    category: '',
    paymentTerms: '',
    notes: ''
  });

  const { addNotification } = useNotifications();

  const categories = [
    'قطعات موتور',
    'قطعات ترمز',
    'روغن و مواد مصرفی',
    'لاستیک و رینگ',
    'قطعات برقی',
    'قطعات بدنه',
    'ابزار و تجهیزات',
    'سایر'
  ];

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.includes(searchTerm);
    
    const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSupplier: Supplier = {
      id: Date.now().toString(),
      ...formData,
      rating: 0,
      isActive: true,
      totalOrders: 0,
      totalAmount: 0,
      createdAt: new Date().toISOString()
    };

    if (editingSupplier) {
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === editingSupplier ? { ...supplier, ...formData } : supplier
      ));
      addNotification({
        title: 'تأمین‌کننده ویرایش شد',
        message: `اطلاعات ${formData.name} با موفقیت به‌روزرسانی شد`,
        type: 'success'
      });
      setEditingSupplier(null);
    } else {
      setSuppliers(prev => [...prev, newSupplier]);
      addNotification({
        title: 'تأمین‌کننده جدید اضافه شد',
        message: `${formData.name} با موفقیت ثبت شد`,
        type: 'success'
      });
    }
    
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      website: '',
      category: '',
      paymentTerms: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address,
      website: supplier.website || '',
      category: supplier.category,
      paymentTerms: supplier.paymentTerms,
      notes: supplier.notes || ''
    });
    setEditingSupplier(supplier.id);
    setShowAddForm(true);
  };

  const handleDelete = (supplierId: string, supplierName: string) => {
    if (confirm(`آیا از حذف ${supplierName} اطمینان دارید؟`)) {
      setSuppliers(prev => prev.filter(supplier => supplier.id !== supplierId));
      addNotification({
        title: 'تأمین‌کننده حذف شد',
        message: `${supplierName} از سیستم حذف شد`,
        type: 'warning'
      });
    }
  };

  const toggleSupplierStatus = (supplierId: string) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId ? { ...supplier, isActive: !supplier.isActive } : supplier
    ));
    
    const supplier = suppliers.find(s => s.id === supplierId);
    addNotification({
      title: 'وضعیت تأمین‌کننده تغییر کرد',
      message: `${supplier?.name} ${supplier?.isActive ? 'غیرفعال' : 'فعال'} شد`,
      type: 'info'
    });
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const getTotalSupplierValue = () => {
    return suppliers.reduce((sum, supplier) => sum + supplier.totalAmount, 0);
  };

  const getActiveSuppliers = () => {
    return suppliers.filter(supplier => supplier.isActive).length;
  };

  return (
    <div className="p-responsive">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="responsive-text-2xl font-bold text-gray-900 dark:text-white">مدیریت تأمین‌کنندگان</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">مدیریت تأمین‌کنندگان و شرکای تجاری</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingSupplier(null);
            setFormData({
              name: '',
              contactPerson: '',
              phone: '',
              email: '',
              address: '',
              website: '',
              category: '',
              paymentTerms: '',
              notes: ''
            });
          }}
          className="btn-primary flex items-center space-x-2 space-x-reverse text-sm md:text-base"
        >
          <Plus className="w-4 h-4" />
          <span>تأمین‌کننده جدید</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid-responsive mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">کل تأمین‌کنندگان</p>
              <p className="responsive-text-2xl font-bold text-gray-900 dark:text-white">{suppliers.length}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-2 md:p-3 rounded-lg">
              <Truck className="w-4 h-4 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">تأمین‌کنندگان فعال</p>
              <p className="responsive-text-2xl font-bold text-green-600 dark:text-green-400">{getActiveSuppliers()}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 md:p-3 rounded-lg">
              <Package className="w-4 h-4 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">کل خریدها</p>
              <p className="responsive-text-2xl font-bold text-blue-600 dark:text-blue-400">
                {(getTotalSupplierValue() / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 md:p-3 rounded-lg">
              <DollarSign className="w-4 h-4 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">کل سفارشات</p>
              <p className="responsive-text-2xl font-bold text-purple-600 dark:text-purple-400">
                {suppliers.reduce((sum, supplier) => sum + supplier.totalOrders, 0)}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 md:p-3 rounded-lg">
              <Package className="w-4 h-4 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid-responsive-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام، مسئول یا شماره تماس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm md:text-base"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm md:text-base"
        >
          <option value="all">همه دسته‌ها</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 mb-6 border-responsive">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingSupplier ? 'ویرایش تأمین‌کننده' : 'افزودن تأمین‌کننده جدید'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                نام شرکت *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                placeholder="نام شرکت تأمین‌کننده"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                نام مسئول *
              </label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                placeholder="نام مسئول فروش"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                شماره تماس *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                placeholder="021-12345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ایمیل
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                placeholder="info@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                وب‌سایت
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                placeholder="www.company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                دسته‌بندی *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="">انتخاب دسته‌بندی</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                شرایط پرداخت
              </label>
              <input
                type="text"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                placeholder="مثال: 30 روز"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                آدرس
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                placeholder="آدرس کامل"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                یادداشت
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                placeholder="یادداشت‌های اضافی..."
              />
            </div>

            <div className="lg:col-span-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
              <button type="submit" className="btn-success text-sm">
                {editingSupplier ? 'ویرایش' : 'ثبت'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingSupplier(null);
                }}
                className="btn-secondary text-sm"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive card-hover">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                  <Truck className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                    {supplier.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {supplier.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse">
                <button
                  onClick={() => toggleSupplierStatus(supplier.id)}
                  className={`w-8 h-4 rounded-full transition-colors ${
                    supplier.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                    supplier.isActive ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 space-x-reverse text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{supplier.contactPerson}</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{supplier.phone}</span>
              </div>
              {supplier.email && (
                <div className="flex items-center space-x-2 space-x-reverse text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{supplier.email}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 space-x-reverse text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 truncate">{supplier.address}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">سفارشات</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{supplier.totalOrders}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">کل خرید</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {supplier.totalAmount.toLocaleString()} تومان
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1 space-x-reverse">
                {getRatingStars(supplier.rating)}
                <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                  ({supplier.rating.toFixed(1)})
                </span>
              </div>
              {supplier.paymentTerms && (
                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">
                  {supplier.paymentTerms}
                </span>
              )}
            </div>

            {/* Last Order */}
            {supplier.lastOrderDate && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                آخرین سفارش: {new Date(supplier.lastOrderDate).toLocaleDateString('fa-IR')}
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={() => handleEdit(supplier)}
                className="flex-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium py-2 px-3 border border-red-200 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                ویرایش
              </button>
              <button
                onClick={() => addNotification({
                  title: 'سفارش جدید',
                  message: `سفارش جدید برای ${supplier.name} ایجاد شد`,
                  type: 'info'
                })}
                className="flex-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium py-2 px-3 border border-red-200 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                سفارش
              </button>
              <button
                onClick={() => handleDelete(supplier.id, supplier.name)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            تأمین‌کننده‌ای یافت نشد
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            هیچ تأمین‌کننده‌ای با فیلترهای انتخابی یافت نشد
          </p>
        </div>
      )}
    </div>
  );
}
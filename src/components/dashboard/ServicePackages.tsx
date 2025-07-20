import React, { useState } from 'react';
import { Wrench, Plus, Search, Edit, Trash2, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  services: ServiceItem[];
  duration: number; // in minutes
  price: number;
  isActive: boolean;
  category: 'maintenance' | 'repair' | 'inspection' | 'custom';
  createdAt: string;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  estimatedTime: number; // in minutes
}

export default function ServicePackages() {
  const [packages, setPackages] = useState<ServicePackage[]>([
    {
      id: '1',
      name: 'سرویس کامل',
      description: 'سرویس جامع شامل تعویض روغن، فیلتر، و بررسی کامل خودرو',
      services: [
        { id: '1', name: 'تعویض روغن موتور', description: 'تعویض روغن و فیلتر روغن', estimatedTime: 30 },
        { id: '2', name: 'بررسی ترمز', description: 'بررسی سیستم ترمز و لنت‌ها', estimatedTime: 20 },
        { id: '3', name: 'بررسی تایر', description: 'بررسی فشار و وضعیت تایرها', estimatedTime: 15 },
        { id: '4', name: 'بررسی باتری', description: 'تست باتری و سیستم شارژ', estimatedTime: 10 }
      ],
      duration: 75,
      price: 500000,
      isActive: true,
      category: 'maintenance',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'تعویض روغن سریع',
      description: 'تعویض سریع روغن موتور و فیلتر',
      services: [
        { id: '1', name: 'تعویض روغن موتور', description: 'تعویض روغن موتور با روغن مناسب', estimatedTime: 20 },
        { id: '2', name: 'تعویض فیلتر روغن', description: 'تعویض فیلتر روغن جدید', estimatedTime: 10 }
      ],
      duration: 30,
      price: 200000,
      isActive: true,
      category: 'maintenance',
      createdAt: '2024-01-02'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    services: [{ name: '', description: '', estimatedTime: 0 }],
    price: 0,
    category: 'maintenance' as ServicePackage['category']
  });

  const { addNotification } = useNotifications();

  const categories = [
    { value: 'maintenance', label: 'نگهداری' },
    { value: 'repair', label: 'تعمیر' },
    { value: 'inspection', label: 'بازرسی' },
    { value: 'custom', label: 'سفارشی' }
  ];

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = 
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || pkg.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalDuration = formData.services.reduce((sum, service) => sum + service.estimatedTime, 0);
    
    const newPackage: ServicePackage = {
      id: Date.now().toString(),
      ...formData,
      services: formData.services.map((service, index) => ({
        id: (index + 1).toString(),
        ...service
      })),
      duration: totalDuration,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    if (editingPackage) {
      setPackages(prev => prev.map(pkg => 
        pkg.id === editingPackage ? { ...pkg, ...newPackage, id: editingPackage } : pkg
      ));
      addNotification({
        title: 'بسته خدمات ویرایش شد',
        message: `بسته ${formData.name} با موفقیت به‌روزرسانی شد`,
        type: 'success'
      });
      setEditingPackage(null);
    } else {
      setPackages(prev => [...prev, newPackage]);
      addNotification({
        title: 'بسته خدمات جدید ایجاد شد',
        message: `بسته ${formData.name} با موفقیت ثبت شد`,
        type: 'success'
      });
    }
    
    setFormData({
      name: '',
      description: '',
      services: [{ name: '', description: '', estimatedTime: 0 }],
      price: 0,
      category: 'maintenance'
    });
    setShowAddForm(false);
  };

  const handleEdit = (pkg: ServicePackage) => {
    setFormData({
      name: pkg.name,
      description: pkg.description,
      services: pkg.services.map(service => ({
        name: service.name,
        description: service.description,
        estimatedTime: service.estimatedTime
      })),
      price: pkg.price,
      category: pkg.category
    });
    setEditingPackage(pkg.id);
    setShowAddForm(true);
  };

  const handleDelete = (packageId: string, packageName: string) => {
    if (confirm(`آیا از حذف بسته "${packageName}" اطمینان دارید؟`)) {
      setPackages(prev => prev.filter(pkg => pkg.id !== packageId));
      addNotification({
        title: 'بسته خدمات حذف شد',
        message: `بسته ${packageName} حذف شد`,
        type: 'warning'
      });
    }
  };

  const togglePackageStatus = (packageId: string) => {
    setPackages(prev => prev.map(pkg => 
      pkg.id === packageId ? { ...pkg, isActive: !pkg.isActive } : pkg
    ));
    
    const pkg = packages.find(p => p.id === packageId);
    addNotification({
      title: 'وضعیت بسته تغییر کرد',
      message: `بسته ${pkg?.name} ${pkg?.isActive ? 'غیرفعال' : 'فعال'} شد`,
      type: 'info'
    });
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { name: '', description: '', estimatedTime: 0 }]
    });
  };

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index)
    });
  };

  const updateService = (index: number, field: string, value: any) => {
    const updatedServices = formData.services.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    );
    setFormData({ ...formData, services: updatedServices });
  };

  const getCategoryColor = (category: ServicePackage['category']) => {
    switch (category) {
      case 'maintenance':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'repair':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'inspection':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'custom':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getCategoryText = (category: ServicePackage['category']) => {
    return categories.find(c => c.value === category)?.label || 'نامشخص';
  };

  return (
    <div className="p-responsive">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="responsive-text-2xl font-bold text-gray-900 dark:text-white">بسته‌های خدمات</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">مدیریت بسته‌های خدمات و تعرفه‌ها</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingPackage(null);
            setFormData({
              name: '',
              description: '',
              services: [{ name: '', description: '', estimatedTime: 0 }],
              price: 0,
              category: 'maintenance'
            });
          }}
          className="btn-primary flex items-center space-x-2 space-x-reverse text-sm md:text-base"
        >
          <Plus className="w-4 h-4" />
          <span>بسته جدید</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid-responsive mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">کل بسته‌ها</p>
              <p className="responsive-text-2xl font-bold text-gray-900 dark:text-white">{packages.length}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-2 md:p-3 rounded-lg">
              <Wrench className="w-4 h-4 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">بسته‌های فعال</p>
              <p className="responsive-text-2xl font-bold text-green-600 dark:text-green-400">
                {packages.filter(pkg => pkg.isActive).length}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 md:p-3 rounded-lg">
              <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">میانگین قیمت</p>
              <p className="responsive-text-2xl font-bold text-blue-600 dark:text-blue-400">
                {packages.length > 0 ? (packages.reduce((sum, pkg) => sum + pkg.price, 0) / packages.length / 1000).toFixed(0) : 0}K
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
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">میانگین زمان</p>
              <p className="responsive-text-2xl font-bold text-purple-600 dark:text-purple-400">
                {packages.length > 0 ? Math.round(packages.reduce((sum, pkg) => sum + pkg.duration, 0) / packages.length) : 0} دقیقه
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 md:p-3 rounded-lg">
              <Clock className="w-4 h-4 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
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
            placeholder="جستجو بر اساس نام یا توضیحات..."
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
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 mb-6 border-responsive">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingPackage ? 'ویرایش بسته خدمات' : 'ایجاد بسته خدمات جدید'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نام بسته *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="نام بسته خدمات"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  دسته‌بندی *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ServicePackage['category'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                توضیحات
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                placeholder="توضیحات بسته خدمات..."
              />
            </div>

            {/* Services */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  خدمات شامل *
                </label>
                <button
                  type="button"
                  onClick={addService}
                  className="text-red-500 hover:text-red-600 text-sm flex items-center space-x-1 space-x-reverse"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن خدمت</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.services.map((service, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <input
                        type="text"
                        placeholder="نام خدمت"
                        value={service.name}
                        onChange={(e) => updateService(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <input
                        type="text"
                        placeholder="توضیحات"
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                      />
                    </div>
                    
                    <div>
                      <input
                        type="number"
                        placeholder="زمان (دقیقه)"
                        min="0"
                        value={service.estimatedTime}
                        onChange={(e) => updateService(index, 'estimatedTime', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                        required
                      />
                    </div>
                    
                    <div className="flex items-center">
                      {formData.services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price and Duration Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    قیمت کل (تومان) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    زمان کل (محاسبه خودکار)
                  </label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                    {formData.services.reduce((sum, service) => sum + service.estimatedTime, 0)} دقیقه
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
              <button type="submit" className="btn-success text-sm">
                {editingPackage ? 'ویرایش' : 'ثبت'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingPackage(null);
                }}
                className="btn-secondary text-sm"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Packages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <div key={pkg.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive card-hover">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                  <Wrench className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                    {pkg.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(pkg.category)}`}>
                    {getCategoryText(pkg.category)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse">
                <button
                  onClick={() => togglePackageStatus(pkg.id)}
                  className={`w-8 h-4 rounded-full transition-colors ${
                    pkg.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                    pkg.isActive ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Description */}
            {pkg.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {pkg.description}
              </p>
            )}

            {/* Services List */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                خدمات شامل:
              </h4>
              <div className="space-y-1">
                {pkg.services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">{service.name}</span>
                    <span className="text-gray-500 dark:text-gray-500">{service.estimatedTime} دقیقه</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price and Duration */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2 space-x-reverse">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {pkg.price.toLocaleString()} تومان
                </span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {pkg.duration} دقیقه
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={() => handleEdit(pkg)}
                className="flex-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium py-2 px-3 border border-red-200 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                ویرایش
              </button>
              <button
                onClick={() => handleDelete(pkg.id, pkg.name)}
                className="flex-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium py-2 px-3 border border-red-200 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            بسته خدماتی یافت نشد
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            هیچ بسته خدماتی با فیلترهای انتخابی یافت نشد
          </p>
        </div>
      )}
    </div>
  );
}
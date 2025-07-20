import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Car, Phone, MapPin, Mail, User, Users, Calendar, FileText, Eye, CheckCircle, X, FileText as FileTextIcon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDate } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export default function CustomerManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: ''
  });
  const navigate = useNavigate();

  const { customers, vehicles, jobCards, addCustomer, updateCustomer, deleteCustomer, getCustomerVehicles } = useData();
  const { addNotification } = useNotifications();

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCustomer) {
      updateCustomer(editingCustomer, formData);
      addNotification({
        title: 'مشتری ویرایش شد',
        message: `اطلاعات ${formData.name} با موفقیت به‌روزرسانی شد`,
        type: 'success'
      });
      setEditingCustomer(null);
    } else {
      addCustomer({ ...formData, isActive: true });
      addNotification({
        title: 'مشتری جدید اضافه شد',
        message: `${formData.name} با موفقیت ثبت شد`,
        type: 'success'
      });
    }
    
    setFormData({ name: '', phone: '', address: '', email: '' });
    setShowAddForm(false);
  };

  const handleEdit = (customer: any) => {
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      email: customer.email || ''
    });
    setEditingCustomer(customer.id);
    setShowAddForm(true);
  };

  const handleDelete = (customerId: string, customerName: string) => {
    if (confirm(`آیا از حذف ${customerName} اطمینان دارید؟`)) {
      deleteCustomer(customerId);
      addNotification({
        title: 'مشتری حذف شد',
        message: `${customerName} از سیستم حذف شد`,
        type: 'warning'
      });
    }
  };

  const handleViewDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  // Calculate customer statistics
  const getCustomerStats = (customerId: string) => {
    const customerVehicles = getCustomerVehicles(customerId);
    const customerJobCards = jobCards.filter(jc => jc.customerId === customerId);
    const completedJobCards = customerJobCards.filter(jc => jc.status === 'completed');
    const totalVisits = customerJobCards.length;
    const lastVisit = customerJobCards.length > 0 
      ? customerJobCards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
      : null;
    
    return {
      vehicleCount: customerVehicles.length,
      totalVisits,
      completedRepairs: completedJobCards.length,
      lastVisit
    };
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">مدیریت مشتریان</h2>
          <p className="text-gray-600 dark:text-gray-400">مدیریت اطلاعات مشتریان تعمیرگاه</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingCustomer(null);
            setFormData({ name: '', phone: '', address: '', email: '' });
          }}
          className="btn-primary flex items-center space-x-2 space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>مشتری جدید</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام یا شماره تماس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm ? (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 mb-8 border-2 border-red-100 dark:border-red-900/30 shadow-xl">
          <div className="flex items-center space-x-3 space-x-reverse mb-6">
            <div className="bg-red-500 p-3 rounded-full">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCustomer ? 'ویرایش اطلاعات مشتری' : 'ثبت مشتری جدید'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {editingCustomer ? 'اطلاعات مشتری را ویرایش کنید' : 'اطلاعات مشتری جدید را وارد کنید'}
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2 space-x-reverse">
                <User className="w-4 h-4 text-red-500" />
                <span>
                نام کامل *
                </span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-red-300"
                placeholder="نام و نام خانوادگی"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2 space-x-reverse">
                <Phone className="w-4 h-4 text-red-500" />
                <span>
                شماره تماس *
                </span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-red-300"
                placeholder="09123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2 space-x-reverse">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>
                آدرس
                </span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-red-300"
                placeholder="آدرس کامل"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2 space-x-reverse">
                <Mail className="w-4 h-4 text-red-500" />
                <span>
                ایمیل
                </span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-red-300"
                placeholder="example@email.com"
              />
            </div>
            <div className="md:col-span-2 flex space-x-4 space-x-reverse pt-6 border-t border-gray-200 dark:border-gray-700">
              <button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 space-x-reverse">
                <CheckCircle className="w-5 h-5" />
                <span>
                {editingCustomer ? 'ویرایش' : 'ثبت'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingCustomer(null);
                  setFormData({ name: '', phone: '', address: '', email: '' });
                }}
                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 space-x-reverse"
              >
                <X className="w-5 h-5" />
                <span>
                انصراف
                </span>
              </button>
            </div>
          </form>
        </div>
      ) : showCustomerDetails && selectedCustomer ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                <User className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedCustomer.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedCustomer.phone}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCustomerDetails(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              بازگشت به لیست
            </button>
          </div>
          
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 ml-2 text-red-500" />
                اطلاعات مشتری
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">شماره تماس:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedCustomer.phone}</span>
                </div>
                {selectedCustomer.email && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">ایمیل:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedCustomer.email}</span>
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">آدرس:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedCustomer.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">تاریخ ثبت:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatDate(selectedCustomer.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 ml-2 text-red-500" />
                آمار مشتری
              </h4>
              {(() => {
                const stats = getCustomerStats(selectedCustomer.id);
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">تعداد خودروها:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{stats.vehicleCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">تعداد مراجعات:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{stats.totalVisits}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">تعمیرات تکمیل شده:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{stats.completedRepairs}</span>
                    </div>
                    {stats.lastVisit && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">آخرین مراجعه:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatDate(stats.lastVisit)}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
          
          {/* Customer Vehicles */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Car className="w-5 h-5 ml-2 text-red-500" />
              خودروهای مشتری
            </h4>
            
            {(() => {
              const customerVehicles = getCustomerVehicles(selectedCustomer.id);
              
              return customerVehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customerVehicles.map(vehicle => {
                    const vehicleJobCards = jobCards.filter(jc => jc.vehicleId === vehicle.id);
                    const activeJobCard = vehicleJobCards.find(jc => jc.status !== 'completed');
                    
                    return (
                      <div key={vehicle.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                              <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{vehicle.plateNumber}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.model} - {vehicle.year}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            vehicle.status === 'in_repair' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
                              : vehicle.status === 'delivered'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {vehicle.status === 'in_repair' ? 'در تعمیر' : 
                             vehicle.status === 'delivered' ? 'تحویل شده' : 'آماده'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">رنگ:</span>
                            <span className="text-gray-900 dark:text-white">{vehicle.color || 'نامشخص'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">تعداد تعمیرات:</span>
                            <span className="text-gray-900 dark:text-white">{vehicleJobCards.length}</span>
                          </div>
                          {activeJobCard && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">وضعیت فعلی:</span>
                              <span className="text-blue-600 dark:text-blue-400">در حال تعمیر</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4">
                          <button
                            onClick={() => navigate(`/admin/vehicles/${vehicle.id}`)}
                            className="w-full py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center space-x-1 space-x-reverse"
                          >
                            <Eye className="w-4 h-4" />
                            <span>مشاهده جزئیات</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    این مشتری هنوز خودرویی ثبت نکرده است
                  </p>
                </div>
              );
            })()}
          </div>
          
          {/* Customer Visit History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileTextIcon className="w-5 h-5 ml-2 text-red-500" />
              تاریخچه مراجعات
            </h4>
            
            {(() => {
              const customerJobCards = jobCards.filter(jc => jc.customerId === selectedCustomer.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              
              return customerJobCards.length > 0 ? (
                <div className="space-y-4">
                  {customerJobCards.map(jobCard => {
                    const vehicle = vehicles.find(v => v.id === jobCard.vehicleId);
                    
                    return (
                      <div key={jobCard.id} className={`p-4 rounded-lg border ${
                        jobCard.status === 'completed' 
                          ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' 
                          : jobCard.status === 'in_progress'
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
                          : 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800'
                      }`}>
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 ml-2 text-gray-500" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatDate(jobCard.createdAt)}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            jobCard.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' 
                              : jobCard.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
                          }`}>
                            {jobCard.status === 'completed' ? 'تکمیل شده' : 
                             jobCard.status === 'in_progress' ? 'در حال انجام' : 'در انتظار'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          <Car className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {vehicle?.plateNumber} - {vehicle?.model}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          {jobCard.description}
                        </p>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            تعمیرکار: {jobCard.mechanicName || 'نامشخص'}
                          </span>
                          {jobCard.completedAt && (
                            <span className="text-gray-500 dark:text-gray-400">
                              تکمیل: {formatDate(jobCard.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    این مشتری هنوز مراجعه‌ای نداشته است
                  </p>
                </div>
              );
            })()}
          </div>
          
          {/* Actions */}
          <div className="flex justify-end mt-6 space-x-3 space-x-reverse">
            <button
              onClick={() => {
                setEditingCustomer(selectedCustomer.id);
                setFormData({
                  name: selectedCustomer.name,
                  phone: selectedCustomer.phone,
                  address: selectedCustomer.address || '',
                  email: selectedCustomer.email || ''
                });
                setShowCustomerDetails(false);
                setShowAddForm(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ویرایش مشتری
            </button>
            <button
              onClick={() => setShowCustomerDetails(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              بازگشت
            </button>
          </div>
        </div>
      ) : null}

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  مشتری
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  تماس
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  آدرس
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  خودروها
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCustomers.map((customer) => {
                const customerVehicles = getCustomerVehicles(customer.id);
                return (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full ml-3">
                          <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {customer.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {customer.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 ml-1" />
                        {customer.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car className="w-4 h-4 text-gray-400 ml-1" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {customerVehicles.length} خودرو
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleViewDetails(customer)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id, customer.name)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
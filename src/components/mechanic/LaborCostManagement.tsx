import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, DollarSign, Clock, FileText, Car, User, Calculator } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';

export default function LaborCostManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    amount: 0
  });

  const { 
    vehicles, 
    customers, 
    updateVehicle
  } = useData();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // خودروهایی که کارت کاری فعال دارند و تعمیرکار آن کاربر فعلی است
  const myVehicles = vehicles.filter(v => {
    return v.status === 'in_repair' && v.mechanicId === user?.id;
  });
  
  // محاسبه کل اجرت‌های تعمیرکار
  const totalLaborCosts = myVehicles.reduce((sum, vehicle) => {
    return sum + (vehicle.laborCosts?.reduce((laborSum, labor) => laborSum + labor.totalCost, 0) || 0);
  }, 0);

  // فیلتر کردن خودروها بر اساس جستجو
  const filteredVehicles = myVehicles.filter(vehicle => {
    const customer = customers.find(c => c.id === vehicle.customerId);
    
    return vehicle?.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
           vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
           customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehicle) {
      addNotification({
        title: 'خطا',
        message: 'لطفاً خودرو را انتخاب کنید',
        type: 'error'
      });
      return;
    }

    // پیدا کردن خودرو
    const vehicle = vehicles.find(v => v.id === selectedVehicle);

    const newLaborCost = {
      id: Date.now().toString(),
      title: formData.title,
      description: '',
      hours: 0,
      hourlyRate: 0,
      totalCost: formData.amount,
      createdAt: new Date().toISOString()
    };

    const updatedLaborCosts = [...(vehicle?.laborCosts || []), newLaborCost];

    updateVehicle(selectedVehicle, {
      laborCosts: updatedLaborCosts
    });

    addNotification({
      title: 'اجرت جدید اضافه شد',
      message: `اجرت ${formData.title} با موفقیت ثبت شد`,
      type: 'success'
    });

    setFormData({
      title: '',
      amount: 0
    });
    setSelectedVehicle('');
    setShowAddForm(false);
  };

  const handleDeleteLaborCost = (vehicleId: string, laborCostId: string) => {
    const vehicle = myVehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const updatedLaborCosts = vehicle.laborCosts?.filter(lc => lc.id !== laborCostId) || [];

    updateVehicle(vehicleId, {
      laborCosts: updatedLaborCosts
    });

    addNotification({
      title: 'اجرت حذف شد',
      message: 'اجرت با موفقیت حذف شد',
      type: 'warning'
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            مدیریت اجرت‌ها
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            ثبت و مدیریت اجرت‌های کاری
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2 space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>اجرت جدید</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">کل اجرت‌ها</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalLaborCosts)}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">کارهای دارای اجرت</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {toPersianDigits(myVehicles.filter(v => v.laborCosts && v.laborCosts.length > 0).length)}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">میانگین اجرت</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {myVehicles.length > 0 ? formatCurrency(totalLaborCosts / myVehicles.length) : formatCurrency(0)}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <Calculator className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="جستجو بر اساس پلاک، مشتری یا توضیحات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Add Labor Cost Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ثبت اجرت جدید
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  خودرو *
                </label>
                <select
                  required
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">انتخاب خودرو</option>
                  {myVehicles.map((vehicle) => {
                    const customer = customers.find(c => c.id === vehicle.customerId);
                    return (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plateNumber} - {vehicle.model} ({customer?.name})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  عنوان اجرت *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="مثال: تعویض روغن موتور"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                مبلغ اجرت (تومان) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="مبلغ به تومان"
              />
            </div>

            <div className="flex space-x-3 space-x-reverse">
              <button type="submit" className="btn-success">
                ثبت اجرت
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Labor Costs List */}
      <div className="space-y-6">
        {filteredVehicles.map((vehicle) => {
          const customer = customers.find(c => c.id === vehicle.customerId);
          const totalVehicleLaborCost = vehicle.laborCosts?.reduce((sum, labor) => sum + labor.totalCost, 0) || 0;
          
          return (
            <div key={vehicle.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              {/* Vehicle Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {vehicle.plateNumber} - {vehicle.model}
                    </h3>
                    <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                      <User className="w-4 h-4" />
                      <span>{customer?.name}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalVehicleLaborCost)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    کل اجرت
                  </p>
                </div>
              </div>

              {/* Labor Costs */}
              {vehicle.laborCosts && vehicle.laborCosts.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    اجرت‌های ثبت شده:
                  </h4>
                  {vehicle.laborCosts.map((laborCost) => (
                    <div key={laborCost.id} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg">
                          <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {laborCost.title}
                          </h5>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="text-left">
                          <p className="font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(laborCost.totalCost)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(laborCost.createdAt).toLocaleDateString('fa-IR')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteLaborCost(vehicle.id, laborCost.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    هنوز اجرتی برای این کار ثبت نشده است
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            خودرویی یافت نشد
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            هیچ خودرویی با فیلترهای انتخابی یافت نشد
          </p>
        </div>
      )}
    </div>
  );
}
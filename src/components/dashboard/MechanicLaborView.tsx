import React, { useState } from 'react';
import { Search, DollarSign, Clock, User, Car, Calendar, FileText, CheckCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';

export default function MechanicLaborView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMechanic, setSelectedMechanic] = useState<string>('');

  const { jobCards, vehicles, customers } = useData();
  const { users } = useAuth();

  // فیلتر کردن تعمیرکاران
  const mechanics = users.filter(user => user.role === 'mechanic');

  // محاسبه اجرت‌های هر تعمیرکار
  const getMechanicLabors = (mechanicId: string) => {
    const mechanicJobCards = jobCards.filter(jc => jc.mechanicId === mechanicId);
    
    return mechanicJobCards.flatMap(jobCard => {
      const vehicle = vehicles.find(v => v.id === jobCard.vehicleId);
      const customer = customers.find(c => c.id === jobCard.customerId);
      
      return (jobCard.laborCosts || []).map(labor => ({
        ...labor,
        jobCardId: jobCard.id,
        jobCardStatus: jobCard.status,
        vehicleInfo: vehicle ? `${vehicle.plateNumber} - ${vehicle.model}` : 'نامشخص',
        customerName: customer?.name || 'نامشخص',
        date: jobCard.createdAt
      }));
    });
  };

  // محاسبه کل اجرت‌های تعمیرکار
  const getTotalLaborCost = (mechanicId: string) => {
    const labors = getMechanicLabors(mechanicId);
    return labors.reduce((sum, labor) => sum + labor.totalCost, 0);
  };

  // فیلتر کردن اجرت‌ها بر اساس جستجو
  const filteredMechanics = mechanics.filter(mechanic =>
    mechanic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // اجرت‌های تعمیرکار انتخاب شده
  const selectedMechanicLabors = selectedMechanic 
    ? getMechanicLabors(selectedMechanic)
    : [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          مدیریت اجرت‌های تعمیرکاران
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          مشاهده و بررسی اجرت‌های ثبت شده توسط تعمیرکاران
        </p>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام تعمیرکار..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          value={selectedMechanic}
          onChange={(e) => setSelectedMechanic(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="">انتخاب تعمیرکار</option>
          {mechanics.map((mechanic) => (
            <option key={mechanic.id} value={mechanic.id}>
              {mechanic.name}
            </option>
          ))}
        </select>
      </div>

      {/* Mechanics List */}
      {!selectedMechanic && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredMechanics.map((mechanic) => {
            const mechanicLabors = getMechanicLabors(mechanic.id);
            const totalLaborCost = getTotalLaborCost(mechanic.id);
            const completedLabors = mechanicLabors.filter(labor => 
              labor.jobCardStatus === 'completed'
            ).length;
            
            return (
              <div 
                key={mechanic.id} 
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-red-300 dark:hover:border-red-700 transition-colors"
                onClick={() => setSelectedMechanic(mechanic.id)}
              >
                <div className="flex items-center space-x-3 space-x-reverse mb-4">
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                    <User className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {mechanic.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{mechanic.username}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 space-x-reverse mb-1">
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">کل اجرت‌ها</span>
                    </div>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(totalLaborCost)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 space-x-reverse mb-1">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">تعداد اجرت</span>
                    </div>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {toPersianDigits(mechanicLabors.length)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {toPersianDigits(completedLabors)} کار تکمیل شده
                  </span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    مشاهده جزئیات
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Mechanic Labor Details */}
      {selectedMechanic && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                <User className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {mechanics.find(m => m.id === selectedMechanic)?.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  جزئیات اجرت‌های ثبت شده
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedMechanic('')}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              بازگشت به لیست
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-300">کل اجرت‌ها</span>
              </div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(getTotalLaborCost(selectedMechanic))}
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">تعداد اجرت</span>
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {toPersianDigits(selectedMechanicLabors.length)}
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-800 dark:text-purple-300">کل ساعات کار</span>
              </div>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {toPersianDigits(selectedMechanicLabors.reduce((sum, labor) => sum + labor.hours, 0))} ساعت
              </p>
            </div>
          </div>

          {/* Labor List */}
          {selectedMechanicLabors.length > 0 ? (
            <div className="space-y-4">
              {selectedMechanicLabors.map((labor) => (
                <div key={labor.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                        <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {labor.title}
                        </h4>
                        {labor.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {labor.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      labor.jobCardStatus === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : labor.jobCardStatus === 'in_progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {labor.jobCardStatus === 'completed' ? 'تکمیل شده' : 
                       labor.jobCardStatus === 'in_progress' ? 'در حال انجام' : 'در انتظار'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Car className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {labor.vehicleInfo}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {labor.customerName}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {toPersianDigits(labor.hours)} ساعت
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {formatCurrency(labor.hourlyRate)} / ساعت
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(labor.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      شناسه کارت: {labor.jobCardId}
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(labor.totalCost)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                اجرتی یافت نشد
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                این تعمیرکار هنوز اجرتی ثبت نکرده است
              </p>
            </div>
          )}
        </div>
      )}

      {filteredMechanics.length === 0 && !selectedMechanic && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            تعمیرکاری یافت نشد
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            هیچ تعمیرکاری با فیلترهای انتخابی یافت نشد
          </p>
        </div>
      )}
    </div>
  );
}
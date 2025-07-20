import React, { useState } from 'react';
import { Search, Car, User, Clock, Calendar, Wrench, FileText, CheckCircle, X, Printer, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDate, formatDuration, toPersianDigits } from '../../utils/formatters';

export default function MechanicVehicles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const { vehicles, customers, updateVehicle } = useData();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // فیلتر کردن خودروهایی که به این تعمیرکار اختصاص یافته‌اند
  const myVehicles = vehicles.filter(vehicle => vehicle.mechanicId === user?.id);

  const filteredVehicles = myVehicles.filter(vehicle => {
    const customer = customers.find(c => c.id === vehicle.customerId);
    
    const matchesSearch = 
      vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (vehicleId: string, newStatus: string) => {
    updateVehicle(vehicleId, { status: newStatus as any });
    
    addNotification({
      title: 'وضعیت خودرو تغییر کرد',
      message: `وضعیت به "${newStatus === 'in_repair' ? 'در تعمیر' : newStatus === 'delivered' ? 'تحویل شده' : 'آماده'}" تغییر یافت`,
      type: 'success'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'in_repair':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'آماده';
      case 'in_repair':
        return 'در تعمیر';
      case 'delivered':
        return 'تحویل شده';
      default:
        return 'نامشخص';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          خودروهای من
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          مدیریت خودروهای اختصاص یافته به شما
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="جستجو بر اساس پلاک، مشتری یا مدل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="available">آماده</option>
          <option value="in_repair">در تعمیر</option>
          <option value="delivered">تحویل شده</option>
        </select>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const customer = customers.find(c => c.id === vehicle.customerId);
          const daysInShop = vehicle.receptionDate ? 
            Math.ceil((new Date().getTime() - new Date(vehicle.receptionDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
          
          return (
            <div key={vehicle.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 card-hover border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      <span className="ltr inline-block">{vehicle.plateNumber}</span>
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.model} - {vehicle.year}
                    </p>
                  </div>
                </div>
                <select
                  value={vehicle.status}
                  onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                  className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(vehicle.status)}`}
                >
                  <option value="available">آماده</option>
                  <option value="in_repair">در تعمیر</option>
                  <option value="delivered">تحویل شده</option>
                </select>
              </div>

              {/* Customer Info */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {customer?.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {customer?.phone}
                  </span>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">رنگ:</span>
                  <span className="text-gray-900 dark:text-white">{vehicle.color}</span>
                </div>
                {vehicle.vin && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">شماره شاسی:</span>
                    <span className="text-gray-900 dark:text-white text-xs">{vehicle.vin}</span>
                  </div>
                )}
                {vehicle.receptionDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">تاریخ پذیرش:</span>
                    <span className="text-gray-900 dark:text-white">{formatDate(vehicle.receptionDate)}</span>
                  </div>
                )}
                {daysInShop > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">مدت در تعمیرگاه:</span>
                    <span className="text-gray-900 dark:text-white">{daysInShop} روز</span>
                  </div>
                )}
              </div>

              {/* Labor Costs */}
              {vehicle.laborCosts && vehicle.laborCosts.length > 0 && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">اجرت‌های ثبت شده:</h4>
                  <div className="space-y-1">
                    {vehicle.laborCosts.map((labor, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-green-700 dark:text-green-300">{labor.title}</span>
                        <span className="text-green-700 dark:text-green-300">{labor.totalCost.toLocaleString()} تومان</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View Details Button */}
              <div className="mt-4">
                <button
                  onClick={() => navigate(`/mechanic/vehicles/${vehicle.id}`)}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  مشاهده جزئیات
                </button>
              </div>
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
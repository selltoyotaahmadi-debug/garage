import React, { useState } from 'react';
import { Search, Car, User, Calendar, DollarSign, Wrench, CheckCircle, X, Printer } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDate, formatCurrency, toPersianDigits } from '../../utils/formatters';
import VehicleReceptionForm from '../forms/VehicleReceptionForm';

export default function VehicleManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showReceptionForm, setShowReceptionForm] = useState(false);

  const { vehicles, customers, updateVehicle } = useData();
  const { users } = useAuth();
  const { addNotification } = useNotifications();

  // Filter vehicles based on search
  const filteredVehicles = vehicles.filter(vehicle => {
    const customer = customers.find(c => c.id === vehicle.customerId);
    
    const matchesSearch = 
      vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const assignMechanic = (vehicleId: string, mechanicId: string) => {
    updateVehicle(vehicleId, { 
      mechanicId,
      status: 'in_repair'
    });
    
    const mechanic = users.find(u => u.id === mechanicId);
    
    addNotification({
      title: 'تعمیرکار تعیین شد',
      message: `${mechanic?.name} به عنوان تعمیرکار تعیین شد`,
      type: 'success'
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">مدیریت خودروهای در تعمیر</h2>
          <p className="text-gray-600 dark:text-gray-400">مدیریت خودروهای در تعمیر و تعیین تعمیرکار</p>
        </div>
        <button
          onClick={() => setShowReceptionForm(true)}
          className="btn-primary flex items-center space-x-2 space-x-reverse"
        >
          <Car className="w-4 h-4" />
          <span>پذیرش خودرو</span>
        </button>
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

      {/* Vehicle Reception Form */}
      {showReceptionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">پذیرش خودرو جدید</h3>
              <button 
                onClick={() => setShowReceptionForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <VehicleReceptionForm onComplete={() => setShowReceptionForm(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Vehicles Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  خودرو
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  مشتری
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  تعمیرکار
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  تاریخ پذیرش
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  وضعیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  اجرت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredVehicles.map((vehicle) => {
                const customer = customers.find(c => c.id === vehicle.customerId);
                const mechanic = users.find(u => u.id === vehicle.mechanicId);
                const totalLaborCost = vehicle.laborCosts?.reduce((sum, labor) => sum + labor.totalCost, 0) || 0;
                
                return (
                  <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full ml-3">
                          <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {vehicle.plateNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {vehicle.model} - {vehicle.year}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 ml-1" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {customer?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vehicle.mechanicId ? (
                        <span className="text-sm text-gray-900 dark:text-white">
                          {mechanic?.name || 'نامشخص'}
                        </span>
                      ) : (
                        <select
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                          onChange={(e) => assignMechanic(vehicle.id, e.target.value)}
                          value=""
                        >
                          <option value="" disabled>انتخاب تعمیرکار</option>
                          {users.filter(u => u.role === 'mechanic').map(mechanic => (
                            <option key={mechanic.id} value={mechanic.id}>
                              {mechanic.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 ml-1" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {vehicle.receptionDate ? formatDate(vehicle.receptionDate) : 'نامشخص'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                        {getStatusText(vehicle.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-green-500 ml-1" />
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(totalLaborCost)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => {
                            // Handle print
                            addNotification({
                              title: 'چاپ فرم',
                              message: 'فرم خودرو در حال چاپ است',
                              type: 'info'
                            });
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            // Handle status change
                            const newStatus = vehicle.status === 'in_repair' ? 'delivered' : 
                                            vehicle.status === 'available' ? 'in_repair' : 'available';
                            updateVehicle(vehicle.id, { status: newStatus as any });
                            
                            addNotification({
                              title: 'وضعیت تغییر کرد',
                              message: `وضعیت به ${getStatusText(newStatus)} تغییر یافت`,
                              type: 'success'
                            });
                          }}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          {vehicle.status === 'in_repair' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Wrench className="w-4 h-4" />
                          )}
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
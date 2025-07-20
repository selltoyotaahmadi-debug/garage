import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, Users, DollarSign, Calendar, Package, 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Clock, User, Wrench, FileText, Plus
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatNumber, toPersianDigits } from '../../utils/formatters';

export default function DashboardOverview() {
  const navigate = useNavigate();
  const { customers, vehicles, inventory, partRequests } = useData();
  const { users } = useAuth();
  
  // Stats
  const stats = {
    totalCustomers: customers.length,
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter(v => v.status === 'in_repair').length,
    totalRevenue: vehicles.reduce((sum, vehicle) => {
      return sum + (vehicle.laborCosts?.reduce((laborSum, labor) => laborSum + labor.totalCost, 0) || 0);
    }, 0),
    lowStockItems: inventory.filter(item => item.quantity <= item.minQuantity).length,
    pendingRequests: partRequests.filter(req => req.status === 'pending').length
  };

  // Recent vehicles
  const recentVehicles = [...vehicles]
    .sort((a, b) => new Date(b.receptionDate || '').getTime() - new Date(a.receptionDate || '').getTime())
    .slice(0, 5);

  // Active mechanics
  const activeMechanics = users.filter(user => user.role === 'mechanic' && user.isActive);

  // Monthly data for chart
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  
  useEffect(() => {
    // Generate some sample data for the chart
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 
                    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    
    const data = months.map((month, index) => {
      // Random data for demonstration
      return {
        month,
        vehicles: Math.floor(Math.random() * 20) + 5,
        revenue: Math.floor(Math.random() * 50000000) + 10000000
      };
    });
    
    setMonthlyData(data);
  }, []);

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">مشتریان</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{toPersianDigits(stats.totalCustomers)}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">خودروها</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{toPersianDigits(stats.totalVehicles)}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
              <Car className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">در تعمیر</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{toPersianDigits(stats.activeVehicles)}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
              <Wrench className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">درآمد کل</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">آمار ماهانه</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">خودروهای پذیرش شده:</span>
              <span className="text-gray-900 dark:text-white font-medium">{toPersianDigits(15)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">خودروهای تحویل شده:</span>
              <span className="text-gray-900 dark:text-white font-medium">{toPersianDigits(12)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">مشتریان جدید:</span>
              <span className="text-gray-900 dark:text-white font-medium">{toPersianDigits(8)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">درآمد ماهانه:</span>
              <span className="text-green-600 dark:text-green-400 font-medium">{formatCurrency(25000000)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">هشدارها</h3>
          </div>
          <div className="space-y-3">
            {stats.lowStockItems > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Package className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-300">موجودی کم</span>
                </div>
                <span className="text-red-600 dark:text-red-400 font-medium">{toPersianDigits(stats.lowStockItems)} مورد</span>
              </div>
            )}
            
            {stats.pendingRequests > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-yellow-700 dark:text-yellow-300">درخواست‌های در انتظار</span>
                </div>
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">{toPersianDigits(stats.pendingRequests)} مورد</span>
              </div>
            )}
            
            {stats.activeVehicles > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-700 dark:text-blue-300">خودروهای در تعمیر</span>
                </div>
                <span className="text-blue-600 dark:text-blue-400 font-medium">{toPersianDigits(stats.activeVehicles)} خودرو</span>
              </div>
            )}
            
            {stats.lowStockItems === 0 && stats.pendingRequests === 0 && stats.activeVehicles === 0 && (
              <div className="flex items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 ml-2" />
                <span className="text-green-700 dark:text-green-300">همه چیز مرتب است</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">روند کسب و کار</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">مشتریان نسبت به ماه قبل:</span>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 ml-1" />
                <span className="text-green-600 dark:text-green-400 font-medium">+12%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">درآمد نسبت به ماه قبل:</span>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 ml-1" />
                <span className="text-green-600 dark:text-green-400 font-medium">+8%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">تعمیرات نسبت به ماه قبل:</span>
              <div className="flex items-center">
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400 ml-1" />
                <span className="text-red-600 dark:text-red-400 font-medium">-3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Vehicles and Mechanics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">خودروهای اخیر</h3>
            <button 
              onClick={() => navigate('/admin/vehicles')}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              مشاهده همه
            </button>
          </div>
          <div className="space-y-3">
            {recentVehicles.map((vehicle) => {
              const customer = customers.find(c => c.id === vehicle.customerId);
              return (
                <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                      <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {vehicle.plateNumber}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {customer?.name}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vehicle.status === 'in_repair' 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : vehicle.status === 'delivered'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {vehicle.status === 'in_repair' ? 'در تعمیر' : 
                     vehicle.status === 'delivered' ? 'تحویل شده' : 'آماده'}
                  </span>
                </div>
              );
            })}
            
            {recentVehicles.length === 0 && (
              <div className="text-center py-8">
                <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  هیچ خودرویی ثبت نشده است
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تعمیرکاران فعال</h3>
            <button 
              onClick={() => navigate('/admin/users')}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              مشاهده همه
            </button>
          </div>
          <div className="space-y-3">
            {activeMechanics.map((mechanic) => {
              const mechanicVehicles = vehicles.filter(v => v.mechanicId === mechanic.id && v.status === 'in_repair');
              return (
                <div key={mechanic.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                      <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {mechanic.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {mechanicVehicles.length} خودرو در تعمیر
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Car className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-1" />
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {toPersianDigits(mechanicVehicles.length)}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {activeMechanics.length === 0 && (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  هیچ تعمیرکاری ثبت نشده است
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">دسترسی سریع</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/admin/vehicles')}
            className="flex flex-col items-center justify-center p-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
          >
            <Car className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">مدیریت خودروها</span>
          </button>
          
          <button
            onClick={() => navigate('/admin/customers')}
            className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
          >
            <Users className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">مشتریان</span>
          </button>
          
          <button
            onClick={() => navigate('/admin/vehicles')}
            className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg transition-colors"
          >
            <Wrench className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">خودروها</span>
          </button>
          
          <button
            onClick={() => navigate('/admin/reports')}
            className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg transition-colors"
          >
            <FileText className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">گزارش‌ها</span>
          </button>
        </div>
      </div>
    </div>
  );
}
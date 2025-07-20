import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Calendar, DollarSign, Car, User, Package, FileText } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';

export default function ReportsAnalytics() {
  const [reportType, setReportType] = useState<'financial' | 'vehicles' | 'customers' | 'inventory'>('financial');
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { vehicles, customers, inventory, suppliers } = useData();
  const { users } = useAuth();

  // Calculate total revenue
  const totalRevenue = vehicles.reduce((sum, vehicle) => {
    return sum + (vehicle.laborCosts?.reduce((laborSum, labor) => laborSum + labor.totalCost, 0) || 0);
  }, 0);

  // Calculate average repair time
  const calculateAverageRepairTime = () => {
    const completedVehicles = vehicles.filter(v => v.status === 'delivered' && v.receptionDate);
    if (completedVehicles.length === 0) return 0;
    
    const totalDays = completedVehicles.reduce((sum, vehicle) => {
      const receptionDate = new Date(vehicle.receptionDate!);
      const completionDate = new Date(); // Assuming completion date is today for simplicity
      const days = Math.ceil((completionDate.getTime() - receptionDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    
    return totalDays / completedVehicles.length;
  };

  // Calculate mechanic performance
  const calculateMechanicPerformance = () => {
    const mechanics = users.filter(user => user.role === 'mechanic');
    
    return mechanics.map(mechanic => {
      const mechanicVehicles = vehicles.filter(v => v.mechanicId === mechanic.id);
      const completedVehicles = mechanicVehicles.filter(v => v.status === 'delivered');
      const totalRevenue = mechanicVehicles.reduce((sum, vehicle) => {
        return sum + (vehicle.laborCosts?.reduce((laborSum, labor) => laborSum + labor.totalCost, 0) || 0);
      }, 0);
      
      return {
        id: mechanic.id,
        name: mechanic.name,
        totalVehicles: mechanicVehicles.length,
        completedVehicles: completedVehicles.length,
        revenue: totalRevenue
      };
    });
  };

  // Generate sample data for charts
  const generateChartData = () => {
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 
                    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 50000000) + 10000000,
      vehicles: Math.floor(Math.random() * 20) + 5
    }));
  };

  const chartData = generateChartData();
  const mechanicPerformance = calculateMechanicPerformance();
  const averageRepairTime = calculateAverageRepairTime();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">گزارش‌ها و تحلیل‌ها</h2>
        <p className="text-gray-600 dark:text-gray-400">گزارش‌های مالی و عملکردی تعمیرگاه</p>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setReportType('financial')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reportType === 'financial'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <DollarSign className="w-4 h-4 ml-2" />
            گزارش مالی
          </button>
          <button
            onClick={() => setReportType('vehicles')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reportType === 'vehicles'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Car className="w-4 h-4 ml-2" />
            گزارش خودروها
          </button>
          <button
            onClick={() => setReportType('customers')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reportType === 'customers'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <User className="w-4 h-4 ml-2" />
            گزارش مشتریان
          </button>
          <button
            onClick={() => setReportType('inventory')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reportType === 'inventory'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Package className="w-4 h-4 ml-2" />
            گزارش انبار
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 ml-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">بازه زمانی</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDateRange('day')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === 'day'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              روزانه
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === 'week'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              هفتگی
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === 'month'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              ماهانه
            </button>
            <button
              onClick={() => setDateRange('year')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === 'year'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              سالانه
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">از تاریخ</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">تا تاریخ</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {reportType === 'financial' && (
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">درآمد کل</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">نسبت به دوره قبل:</span>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4 ml-1" />
                  <span>+12%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">تعداد تعمیرات</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {toPersianDigits(vehicles.filter(v => v.status === 'delivered').length)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">نسبت به دوره قبل:</span>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4 ml-1" />
                  <span>+8%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">میانگین هر تعمیر</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(totalRevenue / Math.max(1, vehicles.filter(v => v.status === 'delivered').length))}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">نسبت به دوره قبل:</span>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4 ml-1" />
                  <span>+5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">نمودار درآمد</h3>
              <button className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                <Download className="w-4 h-4 ml-1" />
                دانلود گزارش
              </button>
            </div>
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  نمودار درآمد ماهانه
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  (در نسخه نمایشی، نمودار واقعی نمایش داده نمی‌شود)
                </p>
              </div>
            </div>
          </div>

          {/* Mechanic Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">عملکرد تعمیرکاران</h3>
              <button className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                <Download className="w-4 h-4 ml-1" />
                دانلود گزارش
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      تعمیرکار
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      تعداد خودرو
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      تکمیل شده
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      درآمد
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {mechanicPerformance.map((mechanic) => (
                    <tr key={mechanic.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {mechanic.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {toPersianDigits(mechanic.totalVehicles)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {toPersianDigits(mechanic.completedVehicles)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                        {formatCurrency(mechanic.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'vehicles' && (
        <div className="space-y-6">
          {/* Vehicle Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                  <Car className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">کل خودروها</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {toPersianDigits(vehicles.length)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">در تعمیر:</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {toPersianDigits(vehicles.filter(v => v.status === 'in_repair').length)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500 dark:text-gray-400">تحویل شده:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {toPersianDigits(vehicles.filter(v => v.status === 'delivered').length)}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">میانگین زمان تعمیر</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {toPersianDigits(Math.round(averageRepairTime))} روز
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">نسبت به دوره قبل:</span>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4 ml-1" />
                  <span>-5%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">نرخ تکمیل</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {toPersianDigits(Math.round(
                      (vehicles.filter(v => v.status === 'delivered').length / Math.max(1, vehicles.length)) * 100
                    ))}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">نسبت به دوره قبل:</span>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4 ml-1" />
                  <span>+3%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Distribution Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">توزیع مدل خودروها</h3>
              <button className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                <Download className="w-4 h-4 ml-1" />
                دانلود گزارش
              </button>
            </div>
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <PieChart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  نمودار توزیع مدل خودروها
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  (در نسخه نمایشی، نمودار واقعی نمایش داده نمی‌شود)
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Status Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">وضعیت خودروها</h3>
              <button className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                <Download className="w-4 h-4 ml-1" />
                دانلود گزارش
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      وضعیت
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      تعداد
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      درصد
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        آماده
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {toPersianDigits(vehicles.filter(v => v.status === 'available').length)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {toPersianDigits(Math.round(
                        (vehicles.filter(v => v.status === 'available').length / Math.max(1, vehicles.length)) * 100
                      ))}%
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        در تعمیر
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {toPersianDigits(vehicles.filter(v => v.status === 'in_repair').length)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {toPersianDigits(Math.round(
                        (vehicles.filter(v => v.status === 'in_repair').length / Math.max(1, vehicles.length)) * 100
                      ))}%
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        تحویل شده
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {toPersianDigits(vehicles.filter(v => v.status === 'delivered').length)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {toPersianDigits(Math.round(
                        (vehicles.filter(v => v.status === 'delivered').length / Math.max(1, vehicles.length)) * 100
                      ))}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'customers' && (
        <div className="space-y-6">
          {/* Customer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <User className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">کل مشتریان</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {toPersianDigits(customers.length)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">مشتریان فعال:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {toPersianDigits(customers.filter(c => c.isActive).length)}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">خودرو به ازای هر مشتری</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {toPersianDigits((vehicles.length / Math.max(1, customers.length)).toFixed(1))}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">نسبت به دوره قبل:</span>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4 ml-1" />
                  <span>+2%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">میانگین هزینه هر مشتری</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(totalRevenue / Math.max(1, customers.length))}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">نسبت به دوره قبل:</span>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4 ml-1" />
                  <span>+8%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">مشتریان برتر</h3>
              <button className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                <Download className="w-4 h-4 ml-1" />
                دانلود گزارش
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      مشتری
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      تعداد خودرو
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      تعداد مراجعه
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      مجموع هزینه
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {customers.slice(0, 5).map((customer) => {
                    const customerVehicles = vehicles.filter(v => v.customerId === customer.id);
                    const totalCost = customerVehicles.reduce((sum, vehicle) => {
                      return sum + (vehicle.laborCosts?.reduce((laborSum, labor) => laborSum + labor.totalCost, 0) || 0);
                    }, 0);
                    
                    return (
                      <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full ml-3">
                              <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {customer.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {customer.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {toPersianDigits(customerVehicles.length)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {toPersianDigits(customerVehicles.filter(v => v.status === 'delivered').length)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                          {formatCurrency(totalCost)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">کل اقلام انبار</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {toPersianDigits(inventory.length)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">ارزش کل:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {formatCurrency(inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0))}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">اقلام با موجودی کم</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {toPersianDigits(inventory.filter(item => item.quantity <= item.minQuantity).length)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">درصد از کل:</span>
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {toPersianDigits(Math.round(
                    (inventory.filter(item => item.quantity <= item.minQuantity).length / Math.max(1, inventory.length)) * 100
                  ))}%
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">تأمین‌کنندگان</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {toPersianDigits(suppliers.length)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">فعال:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {toPersianDigits(suppliers.filter(s => s.isActive).length)}
                </span>
              </div>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">اقلام با موجودی کم</h3>
              <button className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                <Download className="w-4 h-4 ml-1" />
                دانلود گزارش
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      نام قطعه
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      کد قطعه
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      موجودی فعلی
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      حداقل موجودی
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      قیمت
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {inventory
                    .filter(item => item.quantity <= item.minQuantity)
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            {toPersianDigits(item.quantity)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {toPersianDigits(item.minQuantity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                          {formatCurrency(item.price)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
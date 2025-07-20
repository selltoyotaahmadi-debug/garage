import React, { useState } from 'react';
import { Package, Truck, Search, BarChart3, LogOut, Home, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNotifications } from '../../contexts/NotificationContext';
import WarehouseInventory from './WarehouseInventory';
import WarehouseRequests from './WarehouseRequests';

export default function WarehouseDashboard() {
  const [activeView, setActiveView] = useState<'overview' | 'inventory' | 'requests'>('overview');
  const { logout } = useAuth();
  const { inventory, partRequests } = useData();
  const { addNotification } = useNotifications();

  const menuItems = [
    { id: 'overview', label: 'نمای کلی', icon: Home },
    { id: 'inventory', label: 'موجودی انبار', icon: Package },
    { id: 'requests', label: 'درخواست‌های قطعات', icon: Truck }
  ];

  const handleLogout = () => {
    logout();
    addNotification({
      title: 'خروج موفق',
      message: 'با موفقیت از سیستم خارج شدید',
      type: 'success'
    });
  };

  // آمار انبار
  const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity);
  const pendingRequests = partRequests.filter(req => req.status === 'pending');

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">کل اقلام انبار</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {inventory.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">موجودی کم</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {lowStockItems.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Truck className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">درخواست‌های در انتظار</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {pendingRequests.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ارزش کل انبار</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} تومان
                    </p>
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

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 space-x-reverse mb-3">
                  <Truck className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400">
                    درخواست‌های در انتظار ({pendingRequests.length} مورد)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {pendingRequests.slice(0, 4).map((request) => (
                    <div key={request.id} className="flex items-center justify-between bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded">
                      <span className="text-yellow-700 dark:text-yellow-300 font-medium">
                        {request.parts.length} قطعه
                      </span>
                      <button 
                        onClick={() => setActiveView('requests')}
                        className="text-xs text-yellow-600 dark:text-yellow-400 underline"
                      >
                        مشاهده
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">دسترسی سریع</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveView('inventory')}
                  className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                  type="button"
                >
                  <Package className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">مدیریت موجودی</span>
                </button>
                
                <button
                  onClick={() => setActiveView('requests')}
                  className="flex flex-col items-center justify-center p-4 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg transition-colors"
                  type="button"
                >
                  <Truck className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">درخواست‌های قطعات</span>
                </button>
                
                <button
                  onClick={() => {
                    addNotification({
                      title: 'گزارش موجودی',
                      message: 'گزارش موجودی انبار در حال آماده‌سازی است',
                      type: 'info'
                    });
                  }}
                  className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                  type="button"
                >
                  <BarChart3 className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">گزارش موجودی</span>
                </button>
              </div>
            </div>
          </div>
        );
      case 'inventory':
        return <WarehouseInventory />;
      case 'requests':
        return <WarehouseRequests />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-yellow-600 dark:text-yellow-400 ml-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                پنل انباردار
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 ml-2" />
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex flex-wrap gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === item.id
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 ml-2" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
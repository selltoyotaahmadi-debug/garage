import { useState } from 'react';
import { Car, Users, FileText, Package, DollarSign, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useNotifications } from '../contexts/NotificationContext';
import MechanicVehicles from './MechanicVehicles';
import PartRequests from './PartRequests';
import LaborCostManagement from './LaborCostManagement';
import VehicleReceptionForm from '../forms/VehicleReceptionForm';

type ActiveView = 'overview' | 'vehicles' | 'parts' | 'labor' | 'reception';

// Quick Action Components
const QuickActionButton = ({ icon: Icon, label, onClick, color = "red" }: { 
  icon: React.ElementType, 
  label: string, 
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void,
  color?: "red" | "blue" | "green" | "orange" 
}) => {
  const colorClasses = {
    red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50"
  };
  
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-lg ${colorClasses[color]} transition-colors`}
    >
      <Icon className="w-8 h-8 mb-2" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default function MechanicDashboard() {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const { logout } = useAuth();
  const { vehicles } = useData();
  const { addNotification } = useNotifications();

  const menuItems = [
    { id: 'overview', label: 'نمای کلی', icon: Users },
    { id: 'vehicles', label: 'خودروها', icon: Car },
    { id: 'parts', label: 'درخواست قطعات', icon: Package },
    { id: 'labor', label: 'اجرت‌ها', icon: DollarSign },
    { id: 'reception', label: 'پذیرش خودرو', icon: Car },
  ];

  const handleLogout = () => {
    logout();
    addNotification({
      title: 'خروج موفق',
      message: 'با موفقیت از سیستم خارج شدید',
      type: 'success'
    });
  };

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
                    <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">خودروهای در حال تعمیر</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {vehicles.filter(v => v.status === 'in_repair').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">تعمیرات تکمیل شده</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {vehicles.filter(v => v.status === 'delivered').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">خودروهای فعال</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {vehicles.filter(v => v.status === 'in_repair').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">درخواست‌های قطعه</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Lists */}
            {/* Quick Actions */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                دسترسی سریع
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickActionButton 
                  icon={Car} 
                  label="پذیرش خودرو" 
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView('reception');
                    addNotification({
                      title: 'پذیرش خودرو',
                      message: 'به بخش پذیرش خودرو منتقل شدید',
                      type: 'info'
                    });
                  }}
                  color="red"
                />
                <QuickActionButton 
                  icon={CheckCircle} 
                  label="تحویل خودرو" 
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView('vehicles');
                    addNotification({
                      title: 'تحویل خودرو',
                      message: 'به بخش خودروها منتقل شدید',
                      type: 'info'
                    });
                  }}
                  color="green"
                />
                <QuickActionButton 
                  icon={DollarSign} 
                  label="ثبت اجرت" 
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView('labor');
                    addNotification({
                      title: 'ثبت اجرت',
                      message: 'به بخش اجرت‌ها منتقل شدید',
                      type: 'info'
                    });
                  }}
                  color="blue"
                />
                <QuickActionButton 
                  icon={Package} 
                  label="درخواست قطعه" 
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView('parts');
                    addNotification({
                      title: 'درخواست قطعه',
                      message: 'به بخش درخواست قطعات منتقل شدید',
                      type: 'info'
                    });
                  }}
                  color="orange"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* All Vehicles Currently in Shop */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  خودروهای موجود در تعمیرگاه
                </h3>
                <div className="space-y-3">
                  {vehicles.filter(v => v.status !== 'delivered').slice(0, 5).map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {vehicle.model}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          پلاک: {vehicle.plateNumber}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        vehicle.status === 'in_repair' 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : vehicle.status === 'delivered'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {vehicle.status === 'in_repair' ? 'در حال تعمیر' : 
                         vehicle.status === 'delivered' ? 'تحویل شده' : 'آماده'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Vehicles */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  خودروهای اخیر
                </h3>
                <div className="space-y-3">
                  {vehicles.slice(0, 5).map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          خودرو #{vehicle.id}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {vehicle.description || 'بدون توضیحات'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        vehicle.status === 'in_repair'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : vehicle.status === 'delivered'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {vehicle.status === 'in_repair' ? 'در حال تعمیر' : 
                         vehicle.status === 'delivered' ? 'تحویل شده' : 'آماده'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'vehicles':
        return <MechanicVehicles />;
      case 'parts':
        return <PartRequests />;
      case 'labor':
        return <LaborCostManagement />;
      case 'reception':
        return <VehicleReceptionForm />;
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
              <Car className="w-8 h-8 text-blue-600 dark:text-blue-400 ml-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                پنل مکانیک
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
                  onClick={() => setActiveView(item.id as ActiveView)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === item.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
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
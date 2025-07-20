import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import DashboardOverview from './dashboard/DashboardOverview';
import CustomerManagement from './dashboard/CustomerManagement';
import VehicleManagement from './dashboard/VehicleManagement';
import ReportsAnalytics from './dashboard/ReportsAnalytics';
import UserManagement from './dashboard/UserManagement';
import InventoryManagement from './dashboard/InventoryManagement';
import SystemSettings from './dashboard/SystemSettings';
import ServicePackages from './dashboard/ServicePackages';
import AppointmentManagement from './dashboard/AppointmentManagement';
import SMSEmailManagement from './dashboard/SMSEmailManagement';
import SupplierManagement from './dashboard/SupplierManagement';
import { JobCardManagement } from './jobcards/JobCardManagement';
import { 
  Users, 
  Car, 
  BarChart3, 
  Home,
  Settings,
  Package,
  Calendar,
  MessageSquare,
  Truck,
  FileText,
  LogOut
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { addNotification } = useNotifications();
  const { logout } = useAuth();

  const tabs = [
    { id: 'overview', label: 'نمای کلی', icon: Home },
    { id: 'customers', label: 'مشتریان', icon: Users },
    { id: 'vehicles', label: 'خودروها', icon: Car },
    { id: 'jobcards', label: 'کارت‌های کاری', icon: FileText },
    { id: 'users', label: 'کاربران', icon: Users },
    { id: 'inventory', label: 'انبار', icon: Package },
    { id: 'appointments', label: 'نوبت‌دهی', icon: Calendar },
    { id: 'messages', label: 'پیامک و ایمیل', icon: MessageSquare },
    { id: 'suppliers', label: 'تأمین‌کنندگان', icon: Truck },
    { id: 'reports', label: 'گزارش‌ها', icon: BarChart3 },
    { id: 'settings', label: 'تنظیمات', icon: Settings }
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
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'customers':
        return <CustomerManagement />;
      case 'vehicles':
        return <VehicleManagement />;
      case 'jobcards':
        return <JobCardManagement />;
      case 'users':
        return <UserManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'messages':
        return <SMSEmailManagement />;
      case 'suppliers':
        return <SupplierManagement />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white toyota-logo">
                TOYOTA AHMADI
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
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 ml-2" />
                  {tab.label}
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
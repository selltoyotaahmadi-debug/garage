import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Check, Clock, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toPersianDigits, formatCurrency } from '../../utils/formatters';
import { useData } from '../../contexts/DataContext';

export const JobCardManagement: React.FC = () => {
  const navigate = useNavigate();
  const { jobCards, vehicles, customers } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredJobCards = jobCards.filter(jobCard => {
    const vehicle = vehicles.find(v => v.id === jobCard.vehicleId);
    const customer = customers.find(c => c.id === jobCard.customerId);
    
    const matchesSearch = 
      (vehicle?.plateNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (vehicle?.model?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (customer?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (jobCard.mechanicName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || jobCard.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'در انتظار';
      case 'in_progress':
        return 'در حال انجام';
      case 'completed':
        return 'تکمیل شده';
      default:
        return 'نامشخص';
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">مدیریت کارت‌های تعمیر</h1>
          <button 
            onClick={() => navigate('/admin/jobcards/new')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
          >
            <Plus className="w-5 h-5 ml-2" />
            کارت تعمیر جدید
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="جستجو بر اساس پلاک، مشتری یا تعمیرکار..."
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
            <option value="pending">در انتظار</option>
            <option value="in_progress">در حال انجام</option>
            <option value="completed">تکمیل شده</option>
          </select>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">شماره کارت</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">خودرو</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مشتری</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاریخ ایجاد</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">هزینه کل</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تعمیرکار</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredJobCards.map((jobCard) => {
              const vehicle = vehicles.find(v => v.id === jobCard.vehicleId);
              const customer = customers.find(c => c.id === jobCard.customerId);
              
              return (
                <tr key={jobCard.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {toPersianDigits(jobCard.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle ? `${vehicle.plateNumber} - ${vehicle.model}` : jobCard.vehicleId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer ? customer.name : jobCard.customerId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getStatusText(jobCard.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(jobCard.createdAt).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(jobCard.totalCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {jobCard.mechanicName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => navigate(`/admin/jobcards/${jobCard.id}`)}
                      className="text-blue-600 hover:text-blue-900 ml-2 flex items-center"
                    >
                      <Eye className="w-4 h-4 ml-1" /> مشاهده
                    </button>
                    <button 
                      onClick={() => navigate(`/admin/jobcards/edit/${jobCard.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 ml-2 flex items-center"
                    >
                      ویرایش
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredJobCards.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              کارت کاری یافت نشد
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              هیچ کارت کاری با فیلترهای انتخابی یافت نشد
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
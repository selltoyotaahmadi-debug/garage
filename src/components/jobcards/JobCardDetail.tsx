import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Car, PenTool as Tools, Calendar, Clock, DollarSign, Package, User } from 'lucide-react';
import { toPersianDigits, formatCurrency, formatDate } from '../../utils/formatters';
import { useData } from '../../contexts/DataContext';

export const JobCardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobCards, vehicles, customers } = useData();
  const [loading, setLoading] = useState(true);
  const [daysInShop, setDaysInShop] = useState(0);

  const jobCard = jobCards.find(jc => jc.id === id);
  const vehicle = jobCard ? vehicles.find(v => v.id === jobCard.vehicleId) : null;
  const customer = jobCard && vehicle ? customers.find(c => c.id === jobCard.customerId) : null;

  useEffect(() => {
    if (jobCard) {
      // Calculate days in shop
      const createdDate = new Date(jobCard.createdAt);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysInShop(diffDays);
    }
    setLoading(false);
  }, [jobCard]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!jobCard || !vehicle || !customer) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-800">کارت کاری یافت نشد</h2>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          بازگشت
        </button>
      </div>
    );
  }

  // Calculate total parts cost
  const totalPartsCost = jobCard.partsUsed.reduce((sum, part) => sum + (part.price * part.quantity), 0);
  
  // Calculate total labor cost
  const totalLaborCost = jobCard.laborCosts.reduce((sum, labor) => sum + labor.totalCost, 0);

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold font-orbitron">TOYOTA AHMADI - جزئیات کارت تعمیر</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              jobCard.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
              jobCard.status === 'in_progress' ? 'bg-blue-200 text-blue-800' :
              'bg-green-200 text-green-800'
            }`}>
              {jobCard.status === 'pending' ? 'در انتظار' :
               jobCard.status === 'in_progress' ? 'در حال انجام' :
               'تکمیل شده'}
            </span>
          </div>
          <p className="mt-2 text-lg">شماره کارت: {toPersianDigits(jobCard.id)}</p>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Vehicle and Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Car className="mr-2 text-red-600" /> اطلاعات خودرو
              </h2>
              <div className="space-y-2">
                <p><span className="font-semibold">مدل:</span> {vehicle.model} {toPersianDigits(vehicle.year)}</p>
                <p><span className="font-semibold">پلاک:</span> {toPersianDigits(vehicle.plateNumber)}</p>
                <p><span className="font-semibold">VIN:</span> {vehicle.vin}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <User className="mr-2 text-red-600" /> اطلاعات مشتری
              </h2>
              <div className="space-y-2">
                <p><span className="font-semibold">نام:</span> {customer.name}</p>
                <p><span className="font-semibold">تلفن:</span> {toPersianDigits(customer.phone)}</p>
                <p><span className="font-semibold">ایمیل:</span> {customer.email}</p>
              </div>
            </div>
          </div>
          
          {/* Reception Time and Days in Shop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Calendar className="mr-2 text-red-600" /> زمان پذیرش
              </h2>
              <div className="space-y-2">
                <p><span className="font-semibold">تاریخ:</span> {formatDate(jobCard.createdAt)}</p>
                <p><span className="font-semibold">ساعت:</span> {toPersianDigits(new Date(jobCard.createdAt).toLocaleTimeString('fa-IR'))}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Clock className="mr-2 text-red-600" /> مدت زمان در تعمیرگاه
              </h2>
              <div className="space-y-2">
                <p><span className="font-semibold">تعداد روز:</span> {toPersianDigits(daysInShop)} روز</p>
                <p><span className="font-semibold">تعمیرکار مسئول:</span> {jobCard.mechanicName}</p>
              </div>
            </div>
          </div>
          
          {/* Issues */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Tools className="mr-2 text-red-600" /> مشکلات گزارش شده
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-2">
                {jobCard.issues.map((issue, index) => (
                  <li key={index} className="text-gray-700">{issue}</li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Parts Used */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Package className="mr-2 text-red-600" /> قطعات استفاده شده
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نام قطعه</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تعداد</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">قیمت واحد</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">قیمت کل</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobCard.partsUsed.map((part) => (
                    <tr key={part.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{toPersianDigits(part.quantity)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(part.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(part.price * part.quantity)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">جمع کل قطعات:</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(totalPartsCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Labor Costs */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <DollarSign className="mr-2 text-red-600" /> اجرت‌های نصب
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">شرح خدمات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ساعت کار</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نرخ ساعتی</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">هزینه کل</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobCard.laborCosts.map((labor) => (
                    <tr key={labor.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{labor.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{toPersianDigits(labor.hours)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(labor.hourlyRate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(labor.totalCost)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">جمع کل اجرت:</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(totalLaborCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Total Cost */}
          <div className="bg-gray-100 p-6 rounded-lg border-t-4 border-red-600">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">جمع کل هزینه‌ها:</h2>
              <span className="text-2xl font-bold text-red-600">{formatCurrency(jobCard.totalCost)}</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 ml-4"
            >
              بازگشت
            </button>
            <button 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              چاپ فاکتور
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Car, User, Calendar, Clock, CheckSquare, Save, Printer, DollarSign } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatCurrency } from '../../utils/formatters';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function VehicleExitForm() {
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isDelivering, setIsDelivering] = useState(false);
  
  const { vehicles, customers, updateVehicle } = useData();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  // فیلتر کردن خودروهایی که آماده تحویل هستند
  const deliverableVehicles = vehicles.filter(v => v.status === 'in_repair');
  
  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVehicle(e.target.value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsDelivering(true);
      
      if (!selectedVehicle) {
        addNotification({
          title: 'خطا',
          message: 'لطفاً یک خودرو انتخاب کنید',
          type: 'error'
        });
        setIsDelivering(false);
        return;
      }
      
      // تغییر وضعیت خودرو به تحویل شده
      updateVehicle(selectedVehicle, { 
        status: 'delivered'
      });
      
      addNotification({
        title: 'تحویل موفق',
        message: 'خودرو با موفقیت تحویل مشتری شد',
        type: 'success'
      });
      
      // چاپ فاکتور
      generateInvoice();
      
      // بازگشت به حالت اولیه
      setSelectedVehicle('');
      setPaymentMethod('cash');
      setAdditionalNotes('');
      setIsDelivering(false);
      
    } catch (error) {
      console.error('Error delivering vehicle:', error);
      addNotification({
        title: 'خطا',
        message: 'خطا در تحویل خودرو',
        type: 'error'
      });
      setIsDelivering(false);
    }
  };
  
  const generateInvoice = () => {
    try {
      const vehicle = vehicles.find(v => v.id === selectedVehicle);
      if (!vehicle) return;
      
      const customer = customers.find(c => c.id === vehicle.customerId);
      if (!customer) return;
      
      const totalLaborCost = vehicle.laborCosts?.reduce((sum, labor) => sum + labor.totalCost, 0) || 0;
      
      // ایجاد PDF
      const doc = new jsPDF();
      
      // اطلاعات تعمیرگاه
      doc.setFontSize(20);
      doc.text('تعمیرگاه تویوتا احمدی', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text('فاکتور تعمیر خودرو', 105, 30, { align: 'center' });
      
      // اطلاعات مشتری و خودرو
      doc.setFontSize(10);
      doc.text(`نام مشتری: ${customer.name}`, 15, 50);
      doc.text(`شماره تماس: ${customer.phone}`, 15, 57);
      doc.text(`پلاک خودرو: ${vehicle.plateNumber}`, 15, 64);
      doc.text(`مدل خودرو: ${vehicle.model} ${vehicle.year}`, 15, 71);
      
      // تاریخ و شماره فاکتور
      const today = new Date();
      doc.text(`تاریخ: ${today.toLocaleDateString('fa-IR')}`, 150, 50);
      doc.text(`شماره فاکتور: INV-${Math.floor(Math.random() * 10000)}`, 150, 57);
      
      // جدول اجرت‌ها
      if (vehicle.laborCosts && vehicle.laborCosts.length > 0) {
        const tableColumn = ["ردیف", "شرح خدمات", "مبلغ (تومان)"];
        const tableRows = vehicle.laborCosts.map((labor, index) => [
          (index + 1).toString(),
          labor.title,
          labor.totalCost.toLocaleString()
        ]);
        
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 85,
          theme: 'grid',
          styles: { halign: 'center', font: 'helvetica' },
          headStyles: { fillColor: [220, 38, 38] },
          alternateRowStyles: { fillColor: [245, 245, 245] }
        });
        
        // جمع کل
        const finalY = (doc as any).lastAutoTable.finalY || 120;
        doc.text(`جمع کل: ${totalLaborCost.toLocaleString()} تومان`, 150, finalY + 15);
        
        // روش پرداخت
        doc.text(`روش پرداخت: ${paymentMethod === 'cash' ? 'نقدی' : 'کارت بانکی'}`, 15, finalY + 15);
        
        // توضیحات
        if (additionalNotes) {
          doc.text('توضیحات:', 15, finalY + 30);
          doc.text(additionalNotes, 15, finalY + 37);
        }
        
        // امضاها
        doc.text('امضای مشتری:', 30, finalY + 60);
        doc.text('امضای مسئول تعمیرگاه:', 150, finalY + 60);
        
        // خط امضا
        doc.line(30, finalY + 70, 80, finalY + 70);
        doc.line(150, finalY + 70, 200, finalY + 70);
      }
      
      // ذخیره یا چاپ
      doc.save(`invoice-${vehicle.plateNumber}.pdf`);
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      addNotification({
        title: 'خطا',
        message: 'خطا در ایجاد فاکتور',
        type: 'error'
      });
    }
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          تحویل خودرو
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          فرم تحویل خودرو به مشتری
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">انتخاب خودرو</h3>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              خودرو آماده تحویل
            </label>
            <select
              value={selectedVehicle}
              onChange={handleVehicleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">انتخاب خودرو</option>
              {deliverableVehicles.map((vehicle) => {
                const customer = customers.find(c => c.id === vehicle.customerId);
                return (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plateNumber} - {vehicle.model} ({customer?.name})
                  </option>
                );
              })}
            </select>
          </div>
          
          {selectedVehicle && (() => {
            const vehicle = vehicles.find(v => v.id === selectedVehicle);
            const customer = vehicle ? customers.find(c => c.id === vehicle.customerId) : null;
            const totalLaborCost = vehicle?.laborCosts?.reduce((sum, labor) => sum + labor.totalCost, 0) || 0;
            
            if (!vehicle || !customer) return null;
            
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">مشتری:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">خودرو:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{vehicle.model} {vehicle.year}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">پلاک: {vehicle.plateNumber}</p>
                  </div>
                </div>
                
                {vehicle.laborCosts && vehicle.laborCosts.length > 0 ? (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">اجرت‌های ثبت شده:</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">شرح</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">مبلغ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {vehicle.laborCosts.map((labor, index) => (
                            <tr key={index} className="bg-white dark:bg-gray-800">
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{labor.title}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{labor.totalCost.toLocaleString()} تومان</td>
                            </tr>
                          ))}
                          <tr className="bg-gray-50 dark:bg-gray-700 font-medium">
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">جمع کل</td>
                            <td className="px-4 py-2 text-sm text-green-600 dark:text-green-400">{totalLaborCost.toLocaleString()} تومان</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-yellow-700 dark:text-yellow-400">هیچ اجرتی برای این خودرو ثبت نشده است.</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
        
        {/* Payment Information */}
        {selectedVehicle && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 space-x-reverse mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">اطلاعات پرداخت</h3>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                روش پرداخت
              </label>
              <div className="flex space-x-4 space-x-reverse">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">نقدی</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">کارت بانکی</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                توضیحات اضافی
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="توضیحات اضافی..."
              />
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        <div className="flex justify-end space-x-3 space-x-reverse">
          <button
            type="submit"
            disabled={isDelivering || !selectedVehicle}
            className="flex items-center space-x-2 space-x-reverse px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isDelivering ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>در حال پردازش...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>تحویل خودرو</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            disabled={isDelivering || !selectedVehicle}
            onClick={generateInvoice}
            className="flex items-center space-x-2 space-x-reverse px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Printer className="w-5 h-5" />
            <span>چاپ فاکتور</span>
          </button>
        </div>
      </form>
    </div>
  );
}
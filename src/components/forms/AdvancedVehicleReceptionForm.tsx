import React, { useState, useEffect } from 'react';
import { Car, User, Phone, Calendar, Clock, FileText, CheckCircle, X, Save, Camera, Upload, Pencil, Users, Printer, Download, Plus, AlertTriangle, Package, FileImage } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { saveDamageInspection, getDamageInspection } from '../../utils/damageInspectionService';
import DamageInspectionCanvas from '../common/DamageInspectionCanvas';
import IranianLicensePlate from '../common/IranianLicensePlate';
import FuelLevelIndicator from '../common/FuelLevelIndicator';
import carModelsData from '../../data/settings/carModels.json';
import accessoriesData from '../../data/settings/accessories.json';
import termsData from '../../data/settings/terms.json';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdvancedVehicleReceptionForm = () => {
  // State for form data
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerEmail: '',
    vehicleId: '',
    vehicleModel: '',
    vehicleYear: new Date().getFullYear(),
    vehicleColor: '',
    vehicleVin: '',
    plateRight: '',
    plateLetter: 'الف',
    plateMiddle: '',
    plateLeft: '',
    mechanicId: '',
    description: '',
    odometer: '',
    fuelLevel: 50
  });

  // State for accessories and damage inspection
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [damageInspectionData, setDamageInspectionData] = useState<string>('');
  const [currentView, setCurrentView] = useState<'form' | 'damage' | 'success'>('form');
  const [submittedJobCard, setSubmittedJobCard] = useState<any>(null);
  const [submittedVehicle, setSubmittedVehicle] = useState<any>(null);
  const [submittedCustomer, setSubmittedCustomer] = useState<any>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const { addCustomer, addVehicle, addJobCard, customers, vehicles, updateVehicle } = useData();
  const { users, user } = useAuth();
  const { addNotification } = useNotifications();

  // Filter mechanics
  const mechanics = users.filter(u => u.role === 'mechanic');

  // Handle customer selection
  const handleCustomerSelect = (customerId: string) => {
    if (customerId === 'new') {
      setFormData({
        ...formData,
        customerId: 'new',
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        customerEmail: ''
      });
    } else {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setFormData({
          ...formData,
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerAddress: customer.address || '',
          customerEmail: customer.email || ''
        });
      }
    }
  };

  // Handle vehicle selection
  const handleVehicleSelect = (vehicleId: string) => {
    if (vehicleId === 'new') {
      setFormData({
        ...formData,
        vehicleId: 'new',
        vehicleModel: '',
        vehicleYear: new Date().getFullYear(),
        vehicleColor: '',
        vehicleVin: '',
        plateRight: '',
        plateLetter: 'الف',
        plateMiddle: '',
        plateLeft: ''
      });
    } else {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        const plateParts = vehicle.plateNumber.split('-');
        setFormData({
          ...formData,
          vehicleId: vehicle.id,
          vehicleModel: vehicle.model,
          vehicleYear: vehicle.year,
          vehicleColor: vehicle.color,
          vehicleVin: vehicle.vin || '',
          plateRight: plateParts[0] || '',
          plateLetter: plateParts[1] || 'الف',
          plateMiddle: plateParts[2] || '',
          plateLeft: plateParts[3] || ''
        });
      }
    }
  };

  const generatePDF = () => {
    try {
      // Create a new PDF document with RTL support
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Add RTL support
      doc.setR2L(true);
      
      // Add a title
      doc.setFontSize(20);
      doc.text('فرم پذیرش خودرو - تعمیرگاه تویوتا احمدی', 105, 15, { align: 'center' });
      
      // Add date and time
      doc.setFontSize(12);
      doc.text(`تاریخ: ${new Date().toLocaleDateString('fa-IR')} - ساعت: ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`, 105, 25, { align: 'center' });
      
      // Add customer information
      doc.setFontSize(16);
      doc.text('اطلاعات مشتری', 190, 35, { align: 'right' });
      
      doc.setFontSize(12);
      doc.text(`نام: ${submittedCustomer?.name || formData.customerName}`, 190, 45, { align: 'right' });
      doc.text(`تلفن: ${submittedCustomer?.phone || formData.customerPhone}`, 190, 52, { align: 'right' });
      if (submittedCustomer?.address || formData.customerAddress) {
        doc.text(`آدرس: ${submittedCustomer?.address || formData.customerAddress}`, 190, 59, { align: 'right' });
      }
      
      // Add vehicle information
      doc.setFontSize(16);
      doc.text('اطلاعات خودرو', 190, 70, { align: 'right' });
      
      doc.setFontSize(12);
      doc.text(`پلاک: ${submittedVehicle?.plateNumber || `${formData.plateRight}-${formData.plateLetter}-${formData.plateMiddle}-${formData.plateLeft}`}`, 190, 80, { align: 'right' });
      doc.text(`مدل: ${submittedVehicle?.model || formData.vehicleModel}`, 190, 87, { align: 'right' });
      doc.text(`رنگ: ${submittedVehicle?.color || formData.vehicleColor}`, 190, 94, { align: 'right' });
      doc.text(`سال: ${submittedVehicle?.year || formData.vehicleYear}`, 190, 101, { align: 'right' });
      doc.text(`کیلومتر: ${formData.odometer} کیلومتر`, 190, 108, { align: 'right' });
      doc.text(`سطح سوخت: ${formData.fuelLevel}%`, 190, 115, { align: 'right' });
      
      if (submittedVehicle?.vin || formData.vehicleVin) {
        doc.text(`شماره شاسی: ${submittedVehicle?.vin || formData.vehicleVin}`, 190, 122, { align: 'right' });
      }
      
      // Add job information
      doc.setFontSize(16);
      doc.text('اطلاعات کار', 190, 135, { align: 'right' });
      
      doc.setFontSize(12);
      doc.text(`توضیحات: ${submittedJobCard?.description || formData.description}`, 190, 145, { align: 'right' });
      doc.text(`تعمیرکار: ${users.find(u => u.id === (submittedJobCard?.mechanicId || formData.mechanicId))?.name || 'نامشخص'}`, 190, 152, { align: 'right' });
      
      // Add accessories table
      doc.setFontSize(16);
      doc.text('قطعات همراه خودرو', 105, 165, { align: 'center' });
      
      const accessoriesTableData = selectedAccessories.map(accId => {
        const accessory = accessoriesData.carAccessories.find(a => a.id === accId);
        return [accessory?.name || accId];
      });
      
      if (accessoriesTableData.length > 0) {
        (doc as any).autoTable({
          startY: 170,
          head: [['قطعات همراه']],
          body: accessoriesTableData,
          theme: 'grid',
          headStyles: { fillColor: [220, 38, 38], halign: 'center' },
          styles: { font: 'Arial', halign: 'right', rtl: true },
        });
      } else {
        doc.setFontSize(12);
        doc.text('هیچ قطعه‌ای انتخاب نشده است', 105, 175, { align: 'center' });
      }
      
      // Add damage inspection image if available
      if (damageInspectionData) {
        const currentY = (doc as any).lastAutoTable?.finalY || 180;
        doc.setFontSize(16);
        doc.text('نقشه خط و خش', 105, currentY + 10, { align: 'center' });
        doc.addImage(damageInspectionData, 'JPEG', 20, currentY + 15, 170, 100);
      }
      
      // Add terms and conditions
      const currentY = damageInspectionData ? ((doc as any).lastAutoTable?.finalY || 180) + 120 : ((doc as any).lastAutoTable?.finalY || 180) + 10;
      doc.setFontSize(16);
      doc.text('شرایط و ضوابط', 105, currentY, { align: 'center' });
      
      doc.setFontSize(10);
      const termsAndConditions = termsData.terms || [];
      termsAndConditions.forEach((term, index) => {
        doc.text(`${index + 1}. ${term}`, 190, currentY + 10 + (index * 7), { align: 'right' });
      });
      
      // Add signature lines
      const signaturesY = currentY + 10 + (termsAndConditions.length * 7) + 10;
      doc.setFontSize(12);
      doc.text('امضای مشتری', 40, signaturesY);
      doc.line(10, signaturesY + 5, 70, signaturesY + 5);
      
      doc.text('امضای پذیرنده', 170, signaturesY);
      doc.line(140, signaturesY + 5, 200, signaturesY + 5);
      
      // Save the PDF
      const plateNumber = submittedVehicle?.plateNumber || `${formData.plateRight}-${formData.plateLetter}-${formData.plateMiddle}-${formData.plateLeft}`;
      doc.save(`فرم_پذیرش_${plateNumber.replace(/\s/g, '_')}.pdf`);
      
      // Show success notification
      toast.success('فرم پذیرش با موفقیت دانلود شد');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('خطا در ایجاد فایل PDF');
    }
  };

  const handlePrint = () => {
    setShowPrintPreview(true);
    setTimeout(() => {
      window.print();
      setShowPrintPreview(false);
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // بررسی اطلاعات ضروری
      if (!formData.mechanicId || !formData.description) {
        addNotification({
          title: 'خطا',
          message: 'لطفاً تمام فیلدهای ضروری را پر کنید',
          type: 'error'
        });
        return;
      }

      // اگر مشتری جدید است، آن را اضافه کنیم
      let customerId = formData.customerId;
      
      let newCustomer = null;
      if (formData.customerId === 'new') {
        if (!formData.customerName || !formData.customerPhone) {
          addNotification({
            title: 'خطا',
            message: 'لطفاً نام و شماره تماس مشتری را وارد کنید',
            type: 'error'
          });
          return;
        }

        newCustomer = {
          name: formData.customerName,
          phone: formData.customerPhone,
          address: formData.customerAddress || '',
          email: formData.customerEmail || '',
          isActive: true
        };
        
        addCustomer(newCustomer);
        customerId = newCustomer.id;
        toast.success('مشتری جدید با موفقیت ثبت شد');
      }
      
      // ایجاد خودرو جدید یا استفاده از خودروی موجود
      let newVehicle = null;
      let vehicleId = formData.vehicleId === 'new' ? '' : formData.vehicleId;
      
      if (formData.vehicleId === 'new') {
        if (!formData.vehicleModel || !formData.plateRight || !formData.plateMiddle || !formData.plateLeft) {
          addNotification({
            title: 'خطا',
            message: 'لطفاً اطلاعات کامل خودرو را وارد کنید',
            type: 'error'
          });
          return;
        }
        
        newVehicle = {
          customerId,
          plateNumber: `${formData.plateRight}-${formData.plateLetter}-${formData.plateMiddle}-${formData.plateLeft}`,
          model: formData.vehicleModel,
          year: formData.vehicleYear,
          color: formData.vehicleColor,
          vin: formData.vehicleVin.toUpperCase(),
          status: 'in_repair'
        };
        
        addVehicle(newVehicle);
        
        // به جای دسترسی مستقیم به آخرین خودرو، از ID تولید شده استفاده می‌کنیم
        // و در ادامه آن را به‌روزرسانی می‌کنیم
        vehicleId = Date.now().toString(); // این یک تخمین است، در واقعیت ID توسط addVehicle تولید می‌شود
        newVehicle = {...newVehicle, id: vehicleId};
        toast.success('خودرو جدید با موفقیت ثبت شد');
      }
      
      // بررسی وجود خودرو
      if (!vehicleId) {
        addNotification({
          title: 'خطا',
          message: 'لطفاً خودرو را انتخاب کنید',
          type: 'error'
        });
        return;
      }
      
      // ایجاد کارت کاری جدید
      const selectedMechanic = users.find(u => u.id === formData.mechanicId);
      const mechanicName = selectedMechanic ? selectedMechanic.name : 'نامشخص';
      
      const newJobCard = {
        vehicleId,
        customerId,
        mechanicId: formData.mechanicId,
        mechanicName,
        description: formData.description,
        status: 'pending',
        parts: [],
        laborCosts: [],
        damageInspectionData
      };
      
      addJobCard(newJobCard);
      
      toast.success('کارت کاری جدید با موفقیت ثبت شد');
      
      // ذخیره اطلاعات خط و خش
      if (damageInspectionData) {
        await saveDamageInspection(vehicleId, 'pending', damageInspectionData);
        
        // به‌روزرسانی خودرو با اطلاعات خط و خش
        if (vehicleId) {
          updateVehicle(vehicleId, {
            damageInspectionData: damageInspectionData
          });
        }
        
        toast.success('اطلاعات خط و خش با موفقیت ذخیره شد');
        addNotification({
          title: 'ذخیره موفق',
          message: 'اطلاعات خط و خش خودرو با موفقیت ذخیره شد',
          type: 'success'
        });
      }
      
      // ذخیره اطلاعات برای نمایش در صفحه موفقیت
      setSubmittedJobCard(newJobCard);
      setSubmittedVehicle(newVehicle || vehicles.find(v => v.id === vehicleId));
      setSubmittedCustomer(newCustomer || customers.find(c => c.id === customerId));
      
      // نمایش پیام موفقیت
      toast.success('پذیرش خودرو با موفقیت انجام شد');
      addNotification({
        title: 'پذیرش موفق',
        message: 'خودرو با موفقیت پذیرش شد',
        type: 'success'
      });
      
      // تغییر به صفحه موفقیت
      setCurrentView('success');
    } catch (error) {
      console.error('Error submitting form:', error);
      addNotification({
        title: 'خطا',
        message: 'خطا در ثبت اطلاعات. لطفاً دوباره تلاش کنید',
        type: 'error'
      });
      toast.error('خطا در فرآیند پذیرش خودرو');
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      customerEmail: '',
      vehicleId: '',
      vehicleModel: '',
      vehicleYear: new Date().getFullYear(),
      vehicleColor: '',
      vehicleVin: '',
      plateRight: '',
      plateLetter: 'الف',
      plateMiddle: '',
      plateLeft: '',
      mechanicId: '',
      description: '',
      odometer: '',
      fuelLevel: 50
    });
    setSelectedAccessories([]);
    setDamageInspectionData('');
    setCurrentView('form');
  };

  // انتخاب قطعات پیش‌فرض
  useEffect(() => {
    const defaultAccessories = accessoriesData.carAccessories
      .filter(acc => acc.isDefault)
      .map(acc => acc.id);
    setSelectedAccessories(defaultAccessories);
  }, []);

  // نمایش فرم اصلی
  if (currentView === 'form') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ToastContainer
          position="top-left"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        
        {/* Print Preview (hidden except when printing) */}
        {showPrintPreview && (
          <div className="hidden print:block p-8">
            <div className="text-center mb-8 border-b-2 border-red-500 pb-4">
              <h1 className="text-2xl font-bold mb-2">فرم پذیرش خودرو</h1>
              <p className="text-lg">تعمیرگاه تویوتا احمدی</p>
              <p className="text-sm">تاریخ: {new Date().toLocaleDateString('fa-IR')} - ساعت: {new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="border p-4 rounded">
                <h2 className="text-xl font-bold mb-3 border-b pb-2">اطلاعات مشتری</h2>
                <p className="mb-2"><span className="font-bold">نام:</span> {submittedCustomer?.name || formData.customerName}</p>
                <p className="mb-2"><span className="font-bold">تلفن:</span> {submittedCustomer?.phone || formData.customerPhone}</p>
                {(submittedCustomer?.address || formData.customerAddress) && <p className="mb-2"><span className="font-bold">آدرس:</span> {submittedCustomer?.address || formData.customerAddress}</p>}
              </div>
              
              <div className="border p-4 rounded">
                <h2 className="text-xl font-bold mb-3 border-b pb-2">اطلاعات خودرو</h2>
                <p className="mb-2"><span className="font-bold">پلاک:</span> {submittedVehicle?.plateNumber || `${formData.plateRight}-${formData.plateLetter}-${formData.plateMiddle}-${formData.plateLeft}`}</p>
                <p className="mb-2"><span className="font-bold">مدل:</span> {submittedVehicle?.model || formData.vehicleModel}</p>
                <p className="mb-2"><span className="font-bold">رنگ:</span> {submittedVehicle?.color || formData.vehicleColor}</p>
                <p className="mb-2"><span className="font-bold">سال:</span> {submittedVehicle?.year || formData.vehicleYear}</p>
                <p className="mb-2"><span className="font-bold">کیلومتر:</span> {formData.odometer} کیلومتر</p>
                <p className="mb-2"><span className="font-bold">سطح سوخت:</span> {formData.fuelLevel}%</p>
                {(submittedVehicle?.vin || formData.vehicleVin) && <p className="mb-2"><span className="font-bold">شماره شاسی:</span> {submittedVehicle?.vin || formData.vehicleVin}</p>}
              </div>
            </div>
            
            <div className="border p-4 rounded mb-6">
              <h2 className="text-xl font-bold mb-3 border-b pb-2">اطلاعات کار</h2>
              <p className="mb-2"><span className="font-bold">توضیحات:</span> {submittedJobCard?.description || formData.description}</p>
              <p className="mb-2"><span className="font-bold">تعمیرکار:</span> {users.find(u => u.id === (submittedJobCard?.mechanicId || formData.mechanicId))?.name || 'نامشخص'}</p>
            </div>
            
            <div className="border p-4 rounded mb-6">
              <h2 className="text-xl font-bold mb-3 border-b pb-2">قطعات همراه خودرو</h2>
              {selectedAccessories.length > 0 ? (
                <ul className="list-disc list-inside">
                  {selectedAccessories.map((accId, index) => {
                    const accessory = accessoriesData.carAccessories.find(a => a.id === accId);
                    return (
                      <li key={index}>{accessory?.name || accId}</li>
                    );
                  })}
                </ul>
              ) : (
                <p>هیچ قطعه‌ای انتخاب نشده است</p>
              )}
            </div>
            
            {damageInspectionData && (
              <div className="border p-4 rounded mb-6">
                <h2 className="text-xl font-bold mb-3 border-b pb-2">نقشه خط و خش</h2>
                <div className="flex justify-center">
                  <img src={damageInspectionData} alt="نقشه خط و خش" className="max-w-full h-auto" />
                </div>
              </div>
            )}
            
            <div className="border p-4 rounded mb-6">
              <h2 className="text-xl font-bold mb-3 border-b pb-2">شرایط و ضوابط</h2>
              <ol className="list-decimal list-inside">
                {(termsData.terms || []).map((term, index) => (
                  <li key={index} className="mb-2">{term}</li>
                ))}
              </ol>
            </div>
            
            <div className="flex justify-between mt-12">
              <div className="text-center">
                <p className="font-bold">امضای مشتری</p>
                <div className="border-t-2 border-black w-40 mt-12"></div>
              </div>
              <div className="text-center">
                <p className="font-bold">امضای پذیرنده</p>
                <div className="border-t-2 border-black w-40 mt-12"></div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            فرم پذیرش پیشرفته خودرو
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            اطلاعات خودرو و مشتری را وارد کنید
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 space-x-reverse mb-6">
              <div className="bg-blue-500 p-3 rounded-full">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  انتخاب مشتری
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  مشتری موجود را انتخاب کنید یا مشتری جدید اضافه کنید
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  انتخاب مشتری *
                </label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">انتخاب کنید</option>
                  <option value="new">مشتری جدید</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              {formData.customerId === 'new' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      نام و نام خانوادگی *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="نام و نام خانوادگی مشتری"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      شماره تماس *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="09123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      آدرس
                    </label>
                    <input
                      type="text"
                      value={formData.customerAddress}
                      onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="آدرس مشتری"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ایمیل
                    </label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="example@email.com"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 space-x-reverse mb-6">
              <div className="bg-red-500 p-3 rounded-full">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  انتخاب خودرو
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  خودرو موجود را انتخاب کنید یا خودرو جدید اضافه کنید
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  انتخاب خودرو *
                </label>
                <select
                  required
                  value={formData.vehicleId}
                  onChange={(e) => handleVehicleSelect(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">انتخاب کنید</option>
                  <option value="new">خودرو جدید</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plateNumber} - {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>

              {formData.vehicleId === 'new' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      مدل خودرو *
                    </label>
                    <select
                      required
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">انتخاب مدل</option>
                      {carModelsData.brands.map((brand) => (
                        <optgroup key={brand.id} label={brand.name}>
                          {brand.models.map((model) => (
                            <option key={`${brand.id}-${model}`} value={model}>
                              {model}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      سال تولید *
                    </label>
                    <select
                      required
                      value={formData.vehicleYear}
                      onChange={(e) => setFormData({ ...formData, vehicleYear: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">انتخاب سال</option>
                      {carModelsData.years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      رنگ *
                    </label>
                    <select
                      required
                      value={formData.vehicleColor}
                      onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">انتخاب رنگ</option>
                      {carModelsData.colors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      شماره شاسی (VIN)
                    </label>
                    <input
                      type="text"
                      value={formData.vehicleVin}
                      onChange={(e) => setFormData({ ...formData, vehicleVin: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="شماره شاسی"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      شماره پلاک *
                    </label>
                    <IranianLicensePlate
                      plateNumber=""
                      editable={true}
                      plateRight={formData.plateRight}
                      plateLetter={formData.plateLetter}
                      plateMiddle={formData.plateMiddle}
                      plateLeft={formData.plateLeft}
                      onRightChange={(value) => setFormData({ ...formData, plateRight: value })}
                      onLetterChange={(value) => setFormData({ ...formData, plateLetter: value })}
                      onMiddleChange={(value) => setFormData({ ...formData, plateMiddle: value })}
                      onLeftChange={(value) => setFormData({ ...formData, plateLeft: value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      کیلومتر فعلی *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.odometer}
                      onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="کیلومتر فعلی خودرو"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      سطح سوخت *
                    </label>
                    <div className="space-y-2">
                      <FuelLevelIndicator 
                        level={formData.fuelLevel} 
                        onChange={(level) => setFormData({ ...formData, fuelLevel: level })}
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={formData.fuelLevel}
                        onChange={(e) => setFormData({ ...formData, fuelLevel: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Accessories */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 space-x-reverse mb-6">
              <div className="bg-green-500 p-3 rounded-full">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  قطعات همراه خودرو
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  قطعات همراه خودرو را مشخص کنید
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {accessoriesData.carAccessories.map((accessory) => (
                <div key={accessory.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`accessory-${accessory.id}`}
                    checked={selectedAccessories.includes(accessory.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAccessories([...selectedAccessories, accessory.id]);
                      } else {
                        setSelectedAccessories(selectedAccessories.filter(id => id !== accessory.id));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`accessory-${accessory.id}`}
                    className="mr-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {accessory.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Service Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 space-x-reverse mb-6">
              <div className="bg-purple-500 p-3 rounded-full">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  اطلاعات سرویس
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  جزئیات سرویس مورد نیاز را وارد کنید
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تعمیرکار *
                </label>
                <select
                  required
                  value={formData.mechanicId}
                  onChange={(e) => setFormData({ ...formData, mechanicId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">انتخاب تعمیرکار</option>
                  {mechanics.map((mechanic) => (
                    <option key={mechanic.id} value={mechanic.id}>
                      {mechanic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  توضیحات مشکل *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="توضیحات مشکل خودرو را وارد کنید..."
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">خلاصه اطلاعات</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    تعمیرکار: <span className="font-medium text-gray-900 dark:text-white">{formData.mechanicId ? users.find(u => u.id === formData.mechanicId)?.name : 'انتخاب نشده'}</span>
                  </span>
                </div>
              </div>
              
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Car className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                خودرو: <span className="font-medium text-gray-900 dark:text-white">{formData.vehicleId === 'new' ? `${formData.vehicleModel} (جدید)` : formData.vehicleId ? vehicles.find(v => v.id === formData.vehicleId)?.model : 'انتخاب نشده'}</span>
              </span>
            </div>
          </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    مشتری: <span className="font-medium text-gray-900 dark:text-white">{formData.customerId === 'new' ? `${formData.customerName} (جدید)` : formData.customerId ? customers.find(c => c.id === formData.customerId)?.name : 'انتخاب نشده'}</span>
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    توضیحات: <span className="font-medium text-gray-900 dark:text-white">{formData.description ? `${formData.description.substring(0, 30)}...` : 'وارد نشده'}</span>
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    قطعات همراه: <span className="font-medium text-gray-900 dark:text-white">{selectedAccessories.length} مورد</span>
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <FileImage className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    خط و خش: <span className="font-medium text-gray-900 dark:text-white">{damageInspectionData ? 'ثبت شده' : 'ثبت نشده'}</span>
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    کیلومتر: <span className="font-medium text-gray-900 dark:text-white">{formData.odometer ? `${formData.odometer} کیلومتر` : 'وارد نشده'}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => {
                  if (!formData.vehicleId) {
                    addNotification({
                      title: 'خطا',
                      message: 'لطفاً ابتدا خودرو را انتخاب کنید',
                      type: 'error'
                    });
                    return;
                  }
                  setCurrentView('damage');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
              >
                <FileImage className="w-4 h-4" />
                <span>ثبت خط و خش</span>
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                ثبت پذیرش خودرو
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // نمایش صفحه ثبت خط و خش
  if (currentView === 'damage') {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              ثبت خط و خش خودرو
            </h3>
            <button
              onClick={() => setCurrentView('form')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <DamageInspectionCanvas
            carImage="/car-front.png"
            onSave={(imageData) => {
              setDamageInspectionData(imageData);
              setCurrentView('form');
              addNotification({
                title: 'ذخیره موفق',
                message: 'نقشه خط و خش خودرو با موفقیت ذخیره شد',
                type: 'success'
              });
            }}
            width={800}
            height={500}
          />
        </div>
      </div>
    );
  }

  // نمایش صفحه موفقیت
  if (currentView === 'success' && submittedVehicle && submittedJobCard) {
    const customer = submittedCustomer || customers.find(c => c.id === submittedJobCard.customerId);
    const mechanic = users.find(u => u.id === submittedJobCard.mechanicId);
    
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">پذیرش با موفقیت انجام شد</h2>
            <p className="text-gray-600 dark:text-gray-400">خودرو با موفقیت در سیستم ثبت شد و به تعمیرکار اختصاص یافت.</p>
          </div>
          
          {/* فرم پذیرش قابل چاپ */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-600 print:bg-white print:dark:bg-white print:text-black">
            <div className="text-center border-b border-gray-200 dark:border-gray-600 pb-4 mb-6">
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400 toyota-brand mb-2">TOYOTA AHMADI</h3>
              <p className="text-gray-600 dark:text-gray-400">فرم پذیرش خودرو</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">تاریخ: {new Date().toLocaleDateString('fa-IR')} - ساعت: {new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* اطلاعات خودرو */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Car className="w-5 h-5 ml-2 text-red-500" />
                  اطلاعات خودرو
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">پلاک:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{submittedVehicle.plateNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">مدل:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{submittedVehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">رنگ:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{submittedVehicle.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">سال:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{submittedVehicle.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">کیلومتر:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formData.odometer} کیلومتر</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">سطح سوخت:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formData.fuelLevel}%</span>
                  </div>
                  {submittedVehicle.vin && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">شماره شاسی:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{submittedVehicle.vin}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* اطلاعات مشتری */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <User className="w-5 h-5 ml-2 text-red-500" />
                  اطلاعات مشتری
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">نام:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{customer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">تلفن:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{customer?.phone}</span>
                  </div>
                  {customer?.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">آدرس:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{customer.address}</span>
                    </div>
                  )}
                  {customer?.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">ایمیل:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{customer.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* اطلاعات تعمیر */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                <Package className="w-5 h-5 ml-2 text-red-500" />
                اطلاعات تعمیر
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">تعمیرکار:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{mechanic?.name || submittedJobCard.mechanicName || 'نامشخص'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">تاریخ پذیرش:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{new Date().toLocaleDateString('fa-IR')}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400 block mb-1">توضیحات:</span>
                  <p className="font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600 p-2 rounded">
                    {submittedJobCard.description}
                  </p>
                </div>
              </div>
            </div>
            
            {/* قطعات همراه خودرو */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                <Package className="w-5 h-5 ml-2 text-red-500" />
                قطعات همراه خودرو
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {selectedAccessories.map((accessoryId) => {
                  const accessory = accessoriesData.carAccessories.find(a => a.id === accessoryId);
                  return (
                    <div key={accessoryId} className="flex items-center space-x-2 space-x-reverse">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{accessory?.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* نقشه خط و خش */}
            {damageInspectionData && (
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <FileImage className="w-5 h-5 ml-2 text-red-500" />
                  نقشه خط و خش
                </h4>
                <div className="flex justify-center">
                  <img 
                    src={damageInspectionData} 
                    alt="نقشه خط و خش خودرو" 
                    className="max-w-full h-auto border border-gray-200 dark:border-gray-600 rounded"
                  />
                </div>
              </div>
            )}
            
            {/* محل امضا */}
            <div className="grid grid-cols-2 gap-6 mt-8 print:mt-16">
              <div className="text-center">
                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-12 print:mt-24">
                  <p className="text-sm text-gray-600 dark:text-gray-400">امضای مشتری</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-12 print:mt-24">
                  <p className="text-sm text-gray-600 dark:text-gray-400">امضای پذیرنده</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* دکمه‌های عملیات */}
          <div className="flex flex-wrap justify-center gap-4 print:hidden">
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
            >
              <Printer className="w-5 h-5" />
              <span>چاپ فرم</span>
            </button>
            <button
              onClick={generatePDF}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 space-x-reverse"
            >
              <Download className="w-5 h-5" />
              <span>دانلود فرم</span>
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 space-x-reverse"
            >
              <Plus className="w-5 h-5" />
              <span>پذیرش جدید</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // اگر به هیچ کدام از شرایط بالا نرسیدیم، صفحه خطا نمایش دهیم
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">خطا در پذیرش</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">مشکلی در فرآیند پذیرش رخ داده است. لطفاً دوباره تلاش کنید.</p>
        <button
          onClick={resetForm}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          بازگشت به فرم پذیرش
        </button>
      </div>
    </div>
  );
};

export default AdvancedVehicleReceptionForm;
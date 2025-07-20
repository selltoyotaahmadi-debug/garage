import React, { useState, useEffect } from 'react';
import { Car, User, Calendar, Clock, CheckSquare, Save, X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications, Notification } from '../../contexts/NotificationContext';
import IranianLicensePlate from '../common/IranianLicensePlate';
import FuelLevelIndicator from '../common/FuelLevelIndicator';
import DamageInspectionCanvas from '../common/DamageInspectionCanvas';
import { saveDamageInspection } from '../../utils/damageInspectionService';
import carModelsData from '../../data/settings/carModels.json';
import accessoriesData from '../../data/settings/accessories.json';
import termsData from '../../data/settings/terms.json';
import jsPDF from 'jspdf';

interface VehicleReceptionFormProps {
  onComplete?: () => void;
}

export default function VehicleReceptionForm({ onComplete }: VehicleReceptionFormProps) {
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [newCustomer, setNewCustomer] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    email: ''
  });
  
  const [vehicleData, setVehicleData] = useState({
    plateRight: '',
    plateLetter: 'الف',
    plateMiddle: '',
    plateLeft: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    vin: '',
    odometer: 0,
    fuelLevel: 50,
    description: ''
  });
  
  const [accessories, setAccessories] = useState<{[key: string]: boolean}>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [damageInspectionData, setDamageInspectionData] = useState<string | null>(null);
  const [activeCarView, setActiveCarView] = useState<'front' | 'back' | 'side' | 'top'>('front');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { customers, addCustomer, addVehicle } = useData();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  // Load default accessories
  useEffect(() => {
    const defaultAccessories = accessoriesData.carAccessories.reduce((acc, item) => {
      acc[item.id] = item.isDefault;
      return acc;
    }, {} as {[key: string]: boolean});
    
    setAccessories(defaultAccessories);
  }, []);
  
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCustomer(value);
    
    if (value === 'new') {
      setNewCustomer(true);
      setCustomerData({
        name: '',
        phone: '',
        address: '',
        email: ''
      });
    } else {
      setNewCustomer(false);
      const customer = customers.find(c => c.id === value);
      if (customer) {
        setCustomerData({
          name: customer.name,
          phone: customer.phone,
          address: customer.address || '',
          email: customer.email || ''
        });
      }
    }
  };
  
  const handlePlateChange = (plateNumber: string) => {
    const parts = plateNumber.split('-');
    if (parts.length === 4) {
      setVehicleData({
        ...vehicleData,
        plateRight: parts[0],
        plateLetter: parts[1],
        plateMiddle: parts[2],
        plateLeft: parts[3]
      });
    }
  };
  
  const getFullPlateNumber = () => {
    return `${vehicleData.plateRight}-${vehicleData.plateLetter}-${vehicleData.plateMiddle}-${vehicleData.plateLeft}`;
  };
  
  const handleNextStep = () => {
    if (step === 1) {
      // Validate customer data
      if (newCustomer) {
        if (!customerData.name || !customerData.phone) {
          addNotification({
            title: 'خطا',
            message: 'لطفاً نام و شماره تماس مشتری را وارد کنید',
            type: 'error'
          });
          return;
        }
      } else if (!selectedCustomer) {
        addNotification({
          title: 'خطا',
          message: 'لطفاً یک مشتری انتخاب کنید',
          type: 'error'
        });
        return;
      }
    } else if (step === 2) {
      // Validate vehicle data
      if (!vehicleData.plateRight || !vehicleData.plateMiddle || !vehicleData.plateLeft) {
        addNotification({
          title: 'خطا',
          message: 'لطفاً پلاک خودرو را کامل وارد کنید',
          type: 'error'
        });
        return;
      }
      
      if (!vehicleData.model) {
        addNotification({
          title: 'خطا',
          message: 'لطفاً مدل خودرو را وارد کنید',
          type: 'error'
        });
        return;
      }
    }
    
    setStep(step + 1);
  };
  
  const handlePrevStep = () => {
    setStep(step - 1);
  };
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log("Submitting vehicle reception form...");
      
      if (!termsAccepted) {
        addNotification({
          title: 'خطا',
          message: 'لطفاً شرایط و ضوابط را مطالعه و تأیید کنید',
          type: 'error'
        });
        return;
      }
      
      let customerId = selectedCustomer;
      
      // اگر مشتری جدید است، ابتدا آن را اضافه کنیم
      if (newCustomer) {
        const newCustomerId = await addCustomer({
          name: customerData.name,
          phone: customerData.phone,
          address: customerData.address,
          email: customerData.email,
          isActive: true
        });
        
        customerId = newCustomerId;
      }
      
      // ایجاد خودرو
      const plateNumber = getFullPlateNumber();
      console.log("Creating vehicle with plate number:", plateNumber);

      const newVehicle = {
        customerId,
        plateNumber,
        model: vehicleData.model,
        year: vehicleData.year,
        color: vehicleData.color,
        vin: vehicleData.vin,
        odometer: vehicleData.odometer,
        fuelLevel: vehicleData.fuelLevel,
        status: 'available' as 'available' | 'in_repair' | 'delivered',
        description: vehicleData.description
      };
      
      const vehicleId = await addVehicle(newVehicle);
      
      // ذخیره اطلاعات خط و خش
      if (damageInspectionData) {
        console.log("Saving damage inspection data...");
        try {
          const result = await saveDamageInspection(vehicleId, '', damageInspectionData);
          console.log('Damage inspection saved:', result);
        } catch (error) {
          console.error('Error saving damage inspection:', error);
        }
      }
      
      addNotification({
        title: 'پذیرش موفق',
        message: 'خودرو با موفقیت پذیرش شد',
        type: 'success'
      });

      // Generate and download reception PDF
      generateReceptionPDF(customerId, vehicleId, plateNumber);
      
      setIsSubmitting(false);
      
      // بازگشت به حالت اولیه
      setStep(1);
      setSelectedCustomer('');
      setNewCustomer(false);
      setCustomerData({
        name: '',
        phone: '',
        address: '',
        email: ''
      });
      setVehicleData({
        plateRight: '',
        plateLetter: 'الف',
        plateMiddle: '',
        plateLeft: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        vin: '',
        odometer: 0,
        fuelLevel: 50,
        description: ''
      });
      setTermsAccepted(false);
      setDamageInspectionData(null);
      
    } catch (error) {
      console.error('Error submitting vehicle reception:', error);
      addNotification({
        title: 'خطا',
        message: `خطا در پذیرش خودرو: ${error?.message || 'خطای ناشناخته'}`,
        message: 'خطا در پذیرش خودرو',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
      if (onComplete) {
        onComplete();
      }
    }
  };
  
  const handleDamageInspectionSave = (imageData: string) => {
    setDamageInspectionData(imageData);
    addNotification({
      title: 'ذخیره موفق',
      message: 'اطلاعات خط و خش خودرو با موفقیت ذخیره شد',
      type: 'success'
    });
  };
  
  const generateReceptionPDF = (customerId: string, vehicleId: string, plateNumber: string) => {
    try {
      const customer = newCustomer 
        ? { name: customerData.name, phone: customerData.phone, address: customerData.address || '' } 
        : customers.find(c => c.id === customerId);
      
      if (!customer) return;
      
      // ایجاد PDF
      const doc = new jsPDF();
      
      // اطلاعات تعمیرگاه
      doc.setFontSize(20);
      doc.text('تعمیرگاه تویوتا احمدی', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text('فرم پذیرش خودرو', 105, 30, { align: 'center' });
      
      // اطلاعات مشتری و خودرو
      doc.setFontSize(12);
      doc.text(`شماره پذیرش: ${vehicleId}`, 15, 45);
      doc.text(`تاریخ: ${new Date().toLocaleDateString('fa-IR')}`, 150, 45);
      
      doc.text(`نام مشتری: ${customer.name}`, 15, 55);
      doc.text(`شماره تماس: ${customer.phone}`, 15, 62);
      if (customer.address) {
        doc.text(`آدرس: ${customer.address}`, 15, 69);
      }
      
      doc.text(`پلاک خودرو: ${plateNumber}`, 15, 80);
      doc.text(`مدل خودرو: ${vehicleData.model} ${vehicleData.year}`, 15, 87);
      doc.text(`رنگ: ${vehicleData.color || 'نامشخص'}`, 15, 94);
      if (vehicleData.vin) {
        doc.text(`شماره شاسی: ${vehicleData.vin}`, 15, 101);
      }
      doc.text(`کیلومتر کارکرد: ${vehicleData.odometer}`, 15, 108);
      doc.text(`سطح سوخت: ${vehicleData.fuelLevel}%`, 15, 115);
      
      // قطعات همراه خودرو
      doc.text('قطعات همراه خودرو:', 15, 130);
      let yPos = 137;
      accessoriesData.carAccessories.forEach((accessory, index) => {
        if (accessories[accessory.id]) {
          doc.text(`☑ ${accessory.name}`, 20, yPos);
        } else {
          doc.text(`☐ ${accessory.name}`, 20, yPos);
        }
        
        yPos += 7;
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
      
      // توضیحات
      if (vehicleData.description) {
        yPos += 10;
        doc.text('توضیحات:', 15, yPos);
        yPos += 7;
        doc.text(vehicleData.description, 20, yPos);
      }
      
      // شرایط و ضوابط
      yPos += 15;
      doc.text('شرایط و ضوابط:', 15, yPos);
      yPos += 7;
      
      termsData.termsAndConditions.forEach((term, index) => {
        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(`${index + 1}. ${term}`, 20, yPos, { maxWidth: 170 });
        yPos += 10;
      });
      
      // امضاها
      yPos += 10;
      doc.text('امضای مشتری:', 30, yPos);
      doc.text('امضای مسئول پذیرش:', 150, yPos);
      
      // خط امضا
      yPos += 10;
      doc.line(30, yPos, 80, yPos);
      doc.line(150, yPos, 200, yPos);
      
      // ذخیره یا چاپ
      doc.save(`reception-${plateNumber}.pdf`);
      
      addNotification({
        title: 'فرم پذیرش',
        message: 'فرم پذیرش خودرو با موفقیت دانلود شد',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error generating reception PDF:', error);
      addNotification({
        title: 'خطا',
        message: 'خطا در ایجاد فرم پذیرش',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">اطلاعات مشتری</h3>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  انتخاب مشتری
                </label>
                <select
                  value={selectedCustomer}
                  onChange={handleCustomerChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">انتخاب مشتری</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                  <option value="new">+ مشتری جدید</option>
                </select>
              </div>
              
              {newCustomer && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        نام و نام خانوادگی *
                      </label>
                      <input
                        type="text"
                        value={customerData.name}
                        onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="نام و نام خانوادگی مشتری"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        شماره تماس *
                      </label>
                      <input
                        type="tel"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="09123456789"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        آدرس
                      </label>
                      <input
                        type="text"
                        value={customerData.address}
                        onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="آدرس مشتری"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ایمیل
                      </label>
                      <input
                        type="email"
                        value={customerData.email}
                        onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                  <Car className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">اطلاعات خودرو</h3>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  پلاک خودرو *
                </label>
                <IranianLicensePlate 
                  plateNumber=""
                  editable={true}
                  plateRight={vehicleData.plateRight}
                  plateLetter={vehicleData.plateLetter}
                  plateMiddle={vehicleData.plateMiddle}
                  plateLeft={vehicleData.plateLeft}
                  onRightChange={(value) => setVehicleData({ ...vehicleData, plateRight: value })}
                  onLetterChange={(value) => setVehicleData({ ...vehicleData, plateLetter: value })}
                  onMiddleChange={(value) => setVehicleData({ ...vehicleData, plateMiddle: value })}
                  onLeftChange={(value) => setVehicleData({ ...vehicleData, plateLeft: value })}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    مدل خودرو *
                  </label>
                  <select
                    value={vehicleData.model}
                    onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">انتخاب مدل</option>
                    {carModelsData.brands.map((brand) => (
                      <optgroup key={brand.id} label={brand.name}>
                        {brand.models.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    سال ساخت *
                  </label>
                  <select
                    value={vehicleData.year}
                    onChange={(e) => setVehicleData({ ...vehicleData, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    {carModelsData.years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رنگ خودرو
                  </label>
                  <select
                    value={vehicleData.color}
                    onChange={(e) => setVehicleData({ ...vehicleData, color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                    value={vehicleData.vin}
                    onChange={(e) => setVehicleData({ ...vehicleData, vin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="شماره شاسی خودرو"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    کیلومتر کارکرد
                  </label>
                  <input
                    type="number"
                    value={vehicleData.odometer}
                    onChange={(e) => setVehicleData({ ...vehicleData, odometer: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="کیلومتر کارکرد"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    سطح سوخت
                  </label>
                  <div className="flex items-center">
                    <FuelLevelIndicator 
                      level={vehicleData.fuelLevel} 
                      onChange={(level) => setVehicleData({ ...vehicleData, fuelLevel: level })}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  توضیحات
                </label>
                <textarea
                  value={vehicleData.description}
                  onChange={(e) => setVehicleData({ ...vehicleData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="توضیحات و مشکلات خودرو"
                />
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <CheckSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">قطعات همراه خودرو</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {accessoriesData.carAccessories.map((accessory) => (
                  <div key={accessory.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`accessory-${accessory.id}`}
                      checked={accessories[accessory.id] || false}
                      onChange={(e) => setAccessories({ ...accessories, [accessory.id]: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`accessory-${accessory.id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      {accessory.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                  <Car className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">بررسی خط و خش</h3>
              </div>
              
              <div className="mb-4">
                <div className="flex space-x-2 space-x-reverse mb-4">
                  <button
                    onClick={() => setActiveCarView('front')}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      activeCarView === 'front' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    نمای جلو
                  </button>
                  <button
                    onClick={() => setActiveCarView('side')}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      activeCarView === 'side' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    نمای کنار
                  </button>
                  <button
                    onClick={() => setActiveCarView('back')}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      activeCarView === 'back' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    نمای عقب
                  </button>
                  <button
                    onClick={() => setActiveCarView('top')}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      activeCarView === 'top' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    نمای بالا
                  </button>
                </div>
                
                <div className="flex justify-center">
                  <DamageInspectionCanvas 
                    carImage={`/car-${activeCarView}.png`}
                    initialData={damageInspectionData || undefined}
                    onSave={handleDamageInspectionSave}
                    width={600}
                    height={400}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">شرایط و ضوابط</h3>
              </div>
              
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg max-h-60 overflow-y-auto">
                <ul className="list-disc list-inside space-y-2">
                  {termsData.termsAndConditions.map((term, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300 text-sm">
                      {term}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="terms-accepted"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="terms-accepted" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  شرایط و ضوابط فوق را مطالعه کرده و می‌پذیرم
                </label>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">خلاصه اطلاعات</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">مشتری:</span> {newCustomer ? customerData.name : customers.find(c => c.id === selectedCustomer)?.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">تماس:</span> {newCustomer ? customerData.phone : customers.find(c => c.id === selectedCustomer)?.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">خودرو:</span> {vehicleData.model} {vehicleData.year}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">پلاک:</span> {getFullPlateNumber()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          پذیرش خودرو
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          فرم پذیرش خودرو جدید در تعمیرگاه
        </p>
      </div>
      
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          {[1, 2, 3, 4].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  stepNumber === step
                    ? 'bg-blue-600 text-white'
                    : stepNumber < step
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {stepNumber < step ? <CheckSquare className="w-4 h-4" /> : stepNumber}
              </div>
              
              {stepNumber < 4 && (
                <div 
                  className={`flex-1 h-1 mx-2 ${
                    stepNumber < step
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">اطلاعات مشتری</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">اطلاعات خودرو</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">قطعات و خط و خش</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">تأیید نهایی</span>
        </div>
      </div>
      
      {/* Step Content */}
      {renderStepContent()}
      
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <button
            onClick={handlePrevStep}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            مرحله قبل
          </button>
        ) : (
          <div></div>
        )}
        
        {step < 4 ? (
          <button
            onClick={handleNextStep}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            مرحله بعد
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center space-x-2 space-x-reverse px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                <span>در حال ثبت...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>ثبت نهایی</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
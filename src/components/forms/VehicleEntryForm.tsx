import React, { useState } from 'react';
import { Car, User, Calendar, Clock, CheckSquare, Save } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import IranianLicensePlate from '../common/IranianLicensePlate';
import FuelLevelIndicator from '../common/FuelLevelIndicator';

export default function VehicleEntryForm() {
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
  
  const { customers, addCustomer, addVehicle } = useData();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate
      if (newCustomer && (!customerData.name || !customerData.phone)) {
        addNotification({
          title: 'خطا',
          message: 'لطفاً نام و شماره تماس مشتری را وارد کنید',
          type: 'error'
        });
        return;
      }
      
      if (!selectedCustomer && !newCustomer) {
        addNotification({
          title: 'خطا',
          message: 'لطفاً یک مشتری انتخاب کنید',
          type: 'error'
        });
        return;
      }
      
      if (!vehicleData.plateRight || !vehicleData.plateMiddle || !vehicleData.plateLeft || !vehicleData.model) {
        addNotification({
          title: 'خطا',
          message: 'لطفاً اطلاعات خودرو را کامل وارد کنید',
          type: 'error'
        });
        return;
      }
      
      let customerId = selectedCustomer;
      
      // اگر مشتری جدید است، ابتدا آن را اضافه کنیم
      if (newCustomer) {
        addCustomer({
          name: customerData.name,
          phone: customerData.phone,
          address: customerData.address,
          email: customerData.email,
          isActive: true
        });
        
        // در حالت واقعی، باید customerId را از پاسخ دریافت کنیم
        // اما در اینجا فرض می‌کنیم که آخرین مشتری اضافه شده است
        customerId = customers[customers.length - 1]?.id || '1';
      }
      
      // ایجاد خودرو
      const plateNumber = getFullPlateNumber();
      
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
      
      addVehicle(newVehicle);
      
      addNotification({
        title: 'ثبت موفق',
        message: 'خودرو با موفقیت ثبت شد',
        type: 'success'
      });
      
      // بازگشت به حالت اولیه
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
      
    } catch (error) {
      console.error('Error submitting vehicle entry:', error);
      addNotification({
        title: 'خطا',
        message: 'خطا در ثبت خودرو',
        type: 'error'
      });
    }
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ثبت خودرو جدید
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          فرم ثبت خودرو جدید در سیستم
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
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
        
        {/* Vehicle Information */}
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
              <input
                type="text"
                value={vehicleData.model}
                onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="مدل خودرو"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                سال ساخت *
              </label>
              <input
                type="number"
                value={vehicleData.year}
                onChange={(e) => setVehicleData({ ...vehicleData, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="سال ساخت"
                min="1990"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                رنگ خودرو
              </label>
              <input
                type="text"
                value={vehicleData.color}
                onChange={(e) => setVehicleData({ ...vehicleData, color: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="رنگ خودرو"
              />
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
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 space-x-reverse px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>ثبت خودرو</span>
          </button>
        </div>
      </form>
    </div>
  );
}
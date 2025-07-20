import React, { useState } from 'react';
import { Save, Plus, Trash2, Settings, FileText, Package, CheckCircle, Car, DollarSign, Mail, Phone, Building, User, Clock, Calendar } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { toast } from 'react-toastify';
import termsData from '../../data/settings/terms.json';
import accessoriesData from '../../data/settings/accessories.json';
import generalData from '../../data/settings/general.json';
import servicesData from '../../data/settings/services.json';
import notificationsData from '../../data/settings/notifications.json';
import fs from 'fs';

export default function SystemSettings() {
  const { addNotification } = useNotifications();
  
  // تب فعال
  const [activeTab, setActiveTab] = useState<'general' | 'terms' | 'accessories' | 'services' | 'notifications'>('general');
  
  // تنظیمات شرایط و ضوابط
  const [termsAndConditions, setTermsAndConditions] = useState<string[]>(termsData.termsAndConditions);
  
  // تنظیمات قطعات همراه خودرو
  const [carAccessories, setCarAccessories] = useState(accessoriesData.carAccessories);
  
  // تنظیمات عمومی
  const [generalSettings, setGeneralSettings] = useState(generalData);
  
  // تنظیمات خدمات
  const [serviceSettings, setServiceSettings] = useState(servicesData);
  
  // تنظیمات اعلان‌ها
  const [notificationSettings, setNotificationSettings] = useState(notificationsData);
  
  // مدیریت شرایط و ضوابط
  const [newTerm, setNewTerm] = useState('');
  const [editingTermIndex, setEditingTermIndex] = useState<number | null>(null);
  
  const addTerm = () => {
    if (newTerm.trim()) {
      setTermsAndConditions([...termsAndConditions, newTerm]);
      setNewTerm('');
      addNotification({
        title: 'شرط جدید اضافه شد',
        message: 'شرط جدید با موفقیت به لیست شرایط و ضوابط اضافه شد',
        type: 'success'
      });
      toast.success('شرط جدید با موفقیت اضافه شد');
    }
  };
  
  const updateTerm = (index: number) => {
    if (newTerm.trim() && editingTermIndex !== null) {
      const updatedTerms = [...termsAndConditions];
      updatedTerms[editingTermIndex] = newTerm;
      setTermsAndConditions(updatedTerms);
      setNewTerm('');
      setEditingTermIndex(null);
      addNotification({
        title: 'شرط ویرایش شد',
        message: 'شرط مورد نظر با موفقیت ویرایش شد',
        type: 'success'
      });
      toast.success('شرط با موفقیت ویرایش شد');
    }
  };
  
  const deleteTerm = (index: number) => {
    const updatedTerms = [...termsAndConditions];
    updatedTerms.splice(index, 1);
    setTermsAndConditions(updatedTerms);
    addNotification({
      title: 'شرط حذف شد',
      message: 'شرط مورد نظر با موفقیت حذف شد',
      type: 'warning'
    });
    toast.warning('شرط با موفقیت حذف شد');
  };
  
  const startEditTerm = (index: number) => {
    setNewTerm(termsAndConditions[index]);
    setEditingTermIndex(index);
  };
  
  // مدیریت قطعات همراه خودرو
  const [newAccessory, setNewAccessory] = useState('');
  
  const addAccessory = () => {
    if (newAccessory.trim()) {
      setCarAccessories([
        ...carAccessories,
        { id: Date.now().toString(), name: newAccessory, isDefault: true }
      ]);
      setNewAccessory('');
      addNotification({
        title: 'قطعه جدید اضافه شد',
        message: 'قطعه جدید با موفقیت به لیست قطعات همراه خودرو اضافه شد',
        type: 'success'
      });
      toast.success('قطعه جدید با موفقیت اضافه شد');
    }
  };
  
  const deleteAccessory = (id: string) => {
    setCarAccessories(carAccessories.filter(item => item.id !== id));
    addNotification({
      title: 'قطعه حذف شد',
      message: 'قطعه مورد نظر با موفقیت حذف شد',
      type: 'warning'
    });
    toast.warning('قطعه با موفقیت حذف شد');
  };
  
  const toggleDefaultAccessory = (id: string) => {
    setCarAccessories(carAccessories.map(item => 
      item.id === id ? { ...item, isDefault: !item.isDefault } : item
    ));
  };
  
  // ذخیره تنظیمات
  const saveSettings = () => {
    // ذخیره تنظیمات در فایل‌های JSON
    try {
      // ذخیره تنظیمات در localStorage
      localStorage.setItem('termsAndConditions', JSON.stringify(termsAndConditions));
      localStorage.setItem('carAccessories', JSON.stringify(carAccessories));
      localStorage.setItem('generalSettings', JSON.stringify(generalSettings));
      localStorage.setItem('serviceSettings', JSON.stringify(serviceSettings));
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      
      toast.success('تنظیمات با موفقیت ذخیره شد');
    } catch (error) {
      toast.error('خطا در ذخیره تنظیمات');
    }
  };
  
  // بارگذاری تنظیمات از فایل‌های JSON
  React.useEffect(() => {
    // بارگذاری تنظیمات از localStorage
    const savedTerms = localStorage.getItem('termsAndConditions');
    const savedAccessories = localStorage.getItem('carAccessories');
    const savedGeneralSettings = localStorage.getItem('generalSettings');
    const savedServiceSettings = localStorage.getItem('serviceSettings');
    const savedNotificationSettings = localStorage.getItem('notificationSettings');

    if (savedTerms) setTermsAndConditions(JSON.parse(savedTerms));
    if (savedAccessories) setCarAccessories(JSON.parse(savedAccessories));
    if (savedGeneralSettings) setGeneralSettings(JSON.parse(savedGeneralSettings));
    if (savedServiceSettings) setServiceSettings(JSON.parse(savedServiceSettings));
    if (savedNotificationSettings) setNotificationSettings(JSON.parse(savedNotificationSettings));
  }, []);
  
  return (
    <div className="p-responsive">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تنظیمات سیستم</h2>
          <p className="text-gray-600 dark:text-gray-400">تنظیمات پیش‌فرض و قالب‌های سیستم</p>
        </div>
        <button
          onClick={saveSettings}
          className="btn-primary flex items-center space-x-2 space-x-reverse"
        >
          <Save className="w-4 h-4" />
          <span>ذخیره تنظیمات</span>
        </button>
      </div>
      
      {/* تب‌ها */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border-responsive mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 space-x-reverse px-4 md:px-6 overflow-x-auto">
            {[
              { id: 'general', label: 'تنظیمات عمومی', icon: Settings },
              { id: 'terms', label: 'شرایط و ضوابط', icon: FileText },
              { id: 'accessories', label: 'قطعات همراه خودرو', icon: Package },
              { id: 'services', label: 'خدمات و تعرفه‌ها', icon: DollarSign },
              { id: 'notifications', label: 'اعلان‌ها و پیام‌ها', icon: Mail }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 space-x-reverse py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600 dark:text-red-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      
        {/* تنظیمات شرایط و ضوابط */}
        {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 space-x-reverse mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">اطلاعات تعمیرگاه</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">اطلاعات پایه تعمیرگاه</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نام تعمیرگاه
                </label>
                <input
                  type="text"
                  value={generalSettings.companyName}
                  onChange={(e) => setGeneralSettings({...generalSettings, companyName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  شماره تماس
                </label>
                <input
                  type="text"
                  value={generalSettings.companyPhone}
                  onChange={(e) => setGeneralSettings({...generalSettings, companyPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  آدرس
                </label>
                <input
                  type="text"
                  value={generalSettings.companyAddress}
                  onChange={(e) => setGeneralSettings({...generalSettings, companyAddress: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ایمیل
                </label>
                <input
                  type="email"
                  value={generalSettings.companyEmail}
                  onChange={(e) => setGeneralSettings({...generalSettings, companyEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 space-x-reverse mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تنظیمات مالی</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">تنظیمات مالی و قیمت‌گذاری</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  واحد پول
                </label>
                <input
                  type="text"
                  value={generalSettings.defaultCurrency}
                  onChange={(e) => setGeneralSettings({...generalSettings, defaultCurrency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نرخ مالیات (درصد)
                </label>
                <input
                  type="number"
                  value={generalSettings.taxRate}
                  onChange={(e) => setGeneralSettings({...generalSettings, taxRate: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نرخ پایه دستمزد (تومان/ساعت)
                </label>
                <input
                  type="number"
                  value={generalSettings.defaultLaborRate}
                  onChange={(e) => setGeneralSettings({...generalSettings, defaultLaborRate: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  متن پاورقی رسید
                </label>
                <textarea
                  value={generalSettings.receiptFooterText}
                  onChange={(e) => setGeneralSettings({...generalSettings, receiptFooterText: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 space-x-reverse mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ساعات کاری</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">تنظیم ساعات و روزهای کاری</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ساعت شروع
                  </label>
                  <input
                    type="time"
                    value={generalSettings.workingHours.start}
                    onChange={(e) => setGeneralSettings({
                      ...generalSettings, 
                      workingHours: {...generalSettings.workingHours, start: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ساعت پایان
                  </label>
                  <input
                    type="time"
                    value={generalSettings.workingHours.end}
                    onChange={(e) => setGeneralSettings({
                      ...generalSettings, 
                      workingHours: {...generalSettings.workingHours, end: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  روزهای کاری
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'].map((day) => (
                    <label key={day} className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        checked={generalSettings.workingDays.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGeneralSettings({
                              ...generalSettings,
                              workingDays: [...generalSettings.workingDays, day]
                            });
                          } else {
                            setGeneralSettings({
                              ...generalSettings,
                              workingDays: generalSettings.workingDays.filter(d => d !== day)
                            });
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
        
        {activeTab === 'terms' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">شرایط و ضوابط</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">متن شرایط و ضوابط نمایش داده شده در فرم پذیرش</p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex space-x-2 space-x-reverse">
              <input
                type="text"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                placeholder="متن شرط جدید را وارد کنید..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              {editingTermIndex !== null ? (
                <button
                  onClick={() => updateTerm(editingTermIndex)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  ویرایش
                </button>
              ) : (
                <button
                  onClick={addTerm}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  افزودن
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {termsAndConditions.map((term, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 ml-2">{term}</p>
                <div className="flex space-x-1 space-x-reverse">
                  <button
                    onClick={() => startEditTerm(index)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTerm(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
        
        {activeTab === 'accessories' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">قطعات همراه خودرو</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">لیست قطعات همراه خودرو در فرم پذیرش</p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex space-x-2 space-x-reverse">
              <input
                type="text"
                value={newAccessory}
                onChange={(e) => setNewAccessory(e.target.value)}
                placeholder="نام قطعه جدید را وارد کنید..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={addAccessory}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                افزودن
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {carAccessories.map((accessory) => (
              <div key={accessory.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    checked={accessory.isDefault}
                    onChange={() => toggleDefaultAccessory(accessory.id)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{accessory.name}</span>
                </div>
                <button
                  onClick={() => deleteAccessory(accessory.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4" />
              <span>موارد انتخاب شده به صورت پیش‌فرض در فرم پذیرش نمایش داده می‌شوند</span>
            </div>
          </div>
        </div>
        )}
        
        {activeTab === 'services' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تنظیمات خدمات</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">تنظیمات مربوط به خدمات و نوبت‌دهی</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                مدت زمان پیش‌فرض خدمات (دقیقه)
              </label>
              <input
                type="number"
                value={serviceSettings.defaultServiceDuration}
                onChange={(e) => setServiceSettings({...serviceSettings, defaultServiceDuration: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                حداقل فاصله بین نوبت‌ها (دقیقه)
              </label>
              <input
                type="number"
                value={serviceSettings.minServiceInterval}
                onChange={(e) => setServiceSettings({...serviceSettings, minServiceInterval: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                زمان یادآوری نوبت (ساعت قبل)
              </label>
              <input
                type="number"
                value={serviceSettings.reminderTime}
                onChange={(e) => setServiceSettings({...serviceSettings, reminderTime: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                مهلت لغو نوبت (ساعت)
              </label>
              <input
                type="number"
                value={serviceSettings.cancelationPeriod}
                onChange={(e) => setServiceSettings({...serviceSettings, cancelationPeriod: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="0"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={serviceSettings.allowOnlineBooking}
                onChange={(e) => setServiceSettings({...serviceSettings, allowOnlineBooking: e.target.checked})}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                امکان نوبت‌دهی آنلاین
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={serviceSettings.requireDeposit}
                onChange={(e) => setServiceSettings({...serviceSettings, requireDeposit: e.target.checked})}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                نیاز به پیش‌پرداخت
              </label>
            </div>
          </div>
          
          {serviceSettings.requireDeposit && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                مبلغ پیش‌پرداخت (تومان)
              </label>
              <input
                type="number"
                value={serviceSettings.depositAmount}
                onChange={(e) => setServiceSettings({...serviceSettings, depositAmount: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="0"
              />
            </div>
          )}
          
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 mt-6">خدمات پیش‌فرض</h4>
          <div className="space-y-3">
            {serviceSettings.defaultServices.map((service, index) => (
              <div key={service.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <input
                  type="text"
                  value={service.name}
                  onChange={(e) => {
                    const updatedServices = [...serviceSettings.defaultServices];
                    updatedServices[index].name = e.target.value;
                    setServiceSettings({...serviceSettings, defaultServices: updatedServices});
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                  placeholder="نام خدمت"
                />
                <input
                  type="number"
                  value={service.duration}
                  onChange={(e) => {
                    const updatedServices = [...serviceSettings.defaultServices];
                    updatedServices[index].duration = parseInt(e.target.value);
                    setServiceSettings({...serviceSettings, defaultServices: updatedServices});
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                  placeholder="مدت زمان (دقیقه)"
                  min="0"
                />
                <input
                  type="number"
                  value={service.price}
                  onChange={(e) => {
                    const updatedServices = [...serviceSettings.defaultServices];
                    updatedServices[index].price = parseInt(e.target.value);
                    setServiceSettings({...serviceSettings, defaultServices: updatedServices});
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                  placeholder="قیمت (تومان)"
                  min="0"
                />
                <button
                  onClick={() => {
                    const updatedServices = serviceSettings.defaultServices.filter((_, i) => i !== index);
                    setServiceSettings({...serviceSettings, defaultServices: updatedServices});
                  }}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <button
              onClick={() => {
                const newService = {
                  id: Date.now().toString(),
                  name: '',
                  duration: serviceSettings.defaultServiceDuration,
                  price: 0
                };
                setServiceSettings({
                  ...serviceSettings,
                  defaultServices: [...serviceSettings.defaultServices, newService]
                });
              }}
              className="w-full py-2 px-4 border border-dashed border-orange-300 dark:border-orange-700 rounded-lg text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 ml-1" />
              افزودن خدمت جدید
            </button>
          </div>
        </div>
        )}
        
        {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تنظیمات اعلان‌ها</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">تنظیمات ارسال پیامک و ایمیل</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={notificationSettings.sendSMSOnReception}
                onChange={(e) => setNotificationSettings({...notificationSettings, sendSMSOnReception: e.target.checked})}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                ارسال پیامک هنگام پذیرش
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={notificationSettings.sendSMSOnCompletion}
                onChange={(e) => setNotificationSettings({...notificationSettings, sendSMSOnCompletion: e.target.checked})}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                ارسال پیامک هنگام تکمیل تعمیر
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={notificationSettings.sendEmailOnReception}
                onChange={(e) => setNotificationSettings({...notificationSettings, sendEmailOnReception: e.target.checked})}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                ارسال ایمیل هنگام پذیرش
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={notificationSettings.sendEmailOnCompletion}
                onChange={(e) => setNotificationSettings({...notificationSettings, sendEmailOnCompletion: e.target.checked})}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                ارسال ایمیل هنگام تکمیل تعمیر
              </label>
            </div>
          </div>
          
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تنظیمات پنل پیامک</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">تنظیمات پنل فراز اس ام اس</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsPanel.isActive}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings, 
                      smsPanel: {...notificationSettings.smsPanel, isActive: e.target.checked}
                    })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    فعال‌سازی پنل پیامک
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    نام کاربری
                  </label>
                  <input
                    type="text"
                    value={notificationSettings.smsPanel.username}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings, 
                      smsPanel: {...notificationSettings.smsPanel, username: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="نام کاربری پنل فراز اس ام اس"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رمز عبور
                  </label>
                  <input
                    type="password"
                    value={notificationSettings.smsPanel.password}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings, 
                      smsPanel: {...notificationSettings.smsPanel, password: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="رمز عبور پنل فراز اس ام اس"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    کلید API
                  </label>
                  <input
                    type="text"
                    value={notificationSettings.smsPanel.apiKey}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings, 
                      smsPanel: {...notificationSettings.smsPanel, apiKey: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="کلید API پنل فراز اس ام اس"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    شماره فرستنده
                  </label>
                  <input
                    type="text"
                    value={notificationSettings.smsPanel.senderNumber}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings, 
                      smsPanel: {...notificationSettings.smsPanel, senderNumber: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="شماره فرستنده پیامک"
                  />
                </div>
                
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <div className="flex items-center space-x-2 space-x-reverse text-sm text-purple-700 dark:text-purple-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>برای استفاده از پنل فراز اس ام اس، اطلاعات حساب کاربری خود را وارد کنید</span>
                  </div>
                </div>
              </div>
            </div>
            
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                قالب پیامک پذیرش
              </label>
              <textarea
                value={notificationSettings.smsTemplates.reception}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings, 
                  smsTemplates: {...notificationSettings.smsTemplates, reception: e.target.value}
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                متغیرها: {'{customerName}'} - {'{plateNumber}'} - {'{date}'} - {'{receptionNumber}'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                قالب پیامک تکمیل تعمیر
              </label>
              <textarea
                value={notificationSettings.smsTemplates.completion}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings, 
                  smsTemplates: {...notificationSettings.smsTemplates, completion: e.target.value}
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                متغیرها: {'{customerName}'} - {'{plateNumber}'} - {'{totalCost}'}
              </p>
            </div>
          </div>
        </div>
        )}
    </div>
  );
}
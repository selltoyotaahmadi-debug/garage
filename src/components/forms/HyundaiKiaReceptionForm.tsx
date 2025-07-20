import React, { useState, useRef } from 'react';
import { Car, User, Phone, Calendar, Clock, FileText, Printer, Download, CheckSquare, Check, X, Camera, Save } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDate, toPersianDigits } from '../../utils/formatters';

export default function HyundaiKiaReceptionForm() {
  const [formData, setFormData] = useState({
    // اطلاعات اصلی
    receptionNumber: toPersianDigits('۳۷۷۷'),
    receptionDate: new Date().toLocaleDateString('fa-IR'),
    receptionTime: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    carType: '',
    carModel: '',
    warranty: false,
    warrantyExpiry: '',
    chassisNumber: '',
    plateNumber: '',
    color: '',
    mileage: '',
    motorNumber: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerPostalCode: '',
    hasWarranty: false,
    mechanicId: '',
    
    // وضعیت ظاهری خودرو
    damageNotes: '',
    
    // لوازم جانبی خودرو
    accessories: {
      radio: false,
      jack: false,
      spareTire: false,
      tools: false,
      speaker: false,
      fireExtinguisher: false,
      firstAidKit: false,
      mirror: false,
      wipers: false,
      hubcaps: false,
      antenna: false,
      usbCable: false,
      remote: false,
      lighter: false,
      floorMats: false,
      mudGuards: false,
      sunroof: false,
      airConditioner: false
    },
    
    // میزان سوخت
    fuelLevel: 'half', // empty, quarter, half, threequarters, full
    
    // اظهارات مشتری
    customerComments: '',
    
    // اطلاعات تماس
    contactDate: '',
    contactTime: '',
    contactPerson: '',
    contactSubject: '',
    contactResult: '',
    
    // تاریخ کارشناسی
    inspectionDate: '',
    
    // توافق
    agreement: false,
    
    // هزینه تقریبی
    estimatedCost: '5,000,000'
  });
  
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasImage, setCanvasImage] = useState<string | null>(null);

  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const { users } = useAuth();

  // فیلتر کردن تعمیرکاران
  const mechanics = users.filter(user => user.role === 'mechanic');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: checked
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const generateRandomChassisNumber = () => {
    const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 17; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // تابع برای شروع رسم روی canvas
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // تنظیم مختصات شروع
    if ('touches' in e) {
      // رویداد لمسی
      const rect = canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      // رویداد موس
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
    
    // جلوگیری از اسکرول صفحه هنگام رسم
    if ('touches' in e) {
      e.preventDefault();
    }
  };

  // تابع برای رسم روی canvas
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'red';
    
    // ادامه رسم
    if ('touches' in e) {
      // رویداد لمسی
      const rect = canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      // رویداد موس
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    
    // جلوگیری از اسکرول صفحه هنگام رسم
    if ('touches' in e) {
      e.preventDefault();
    }
  };

  // تابع برای پایان رسم
  const endDrawing = () => {
    setIsDrawing(false);
    
    // ذخیره تصویر canvas
    const canvas = canvasRef.current;
    if (canvas) {
      setCanvasImage(canvas.toDataURL('image/png'));
    }
  };

  // تابع برای پاک کردن canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // بارگذاری مجدد تصویر پس‌زمینه
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = '/car-top.png';
    
    setCanvasImage(null);
  };

  // بارگذاری تصویر پس‌زمینه در canvas هنگام بارگذاری کامپوننت
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = '/car-top.png';
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.carType || !formData.customerName || !formData.plateNumber || !formData.mechanicId || !formData.mileage) {
      addNotification({
        title: 'خطا',
        message: 'لطفاً فیلدهای اجباری را پر کنید',
        type: 'error'
      });
      return;
    }

    if (!formData.agreement) {
      addNotification({
        title: 'خطا',
        message: 'لطفاً با شرایط و ضوابط موافقت کنید',
        type: 'error'
      });
      return;
    }

    addNotification({
      title: 'پذیرش خودرو انجام شد',
      message: `خودرو ${formData.carType} ${formData.carModel} به شماره پلاک ${formData.plateNumber} با موفقیت پذیرش شد`,
      type: 'success'
    });

    // نمایش پیش‌نمایش چاپ
    setShowPrintPreview(true);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const originalContents = document.body.innerHTML;
    const printContents = printContent.innerHTML;
    
    document.body.innerHTML = printContents;
    window.print();
    
    // بازگشت به حالت اصلی
    setTimeout(() => {
      document.body.innerHTML = originalContents;
      window.location.reload();
    }, 100);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          فرم پذیرش خودرو هیوندای و کیا
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          اطلاعات خودرو و مشتری را وارد کنید
        </p>
      </div>

      {!showPrintPreview ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اطلاعات اصلی */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-r-4 border-red-500 pr-2">اطلاعات اصلی</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  شماره پذیرش
                </label>
                <input
                  type="text"
                  name="receptionNumber"
                  value={formData.receptionNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تاریخ پذیرش
                </label>
                <input
                  type="text"
                  name="receptionDate"
                  value={formData.receptionDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ساعت پذیرش
                </label>
                <input
                  type="text"
                  name="receptionTime"
                  value={formData.receptionTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نوع خودرو *
                </label>
                <select
                  name="carType"
                  value={formData.carType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">انتخاب کنید</option>
                  <option value="پژو">پژو</option>
                  <option value="سمند">سمند</option>
                  <option value="هیوندای">هیوندای</option>
                  <option value="کیا">کیا</option>
                  <option value="جنسیس">جنسیس</option>
                  <option value="سانتافه">سانتافه</option>
                  <option value="توسان">توسان</option>
                  <option value="سوناتا">سوناتا</option>
                  <option value="آزرا">آزرا</option>
                  <option value="النترا">النترا</option>
                  <option value="اسپورتیج">اسپورتیج</option>
                  <option value="سراتو">سراتو</option>
                  <option value="اپتیما">اپتیما</option>
                  <option value="سورنتو">سورنتو</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  مدل خودرو *
                </label>
                <input
                  type="text"
                  name="carModel"
                  value={formData.carModel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="مثال: ۲۰۲۰"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  گارانتی
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasWarranty"
                    checked={formData.hasWarranty}
                    onChange={handleChange}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    گارانتی دارد
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  شماره شاسی
                </label>
                <input
                  type="text"
                  name="chassisNumber"
                  value={formData.chassisNumber || generateRandomChassisNumber()}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  شروع گارانتی
                </label>
                <input
                  type="date"
                  name="warrantyExpiry"
                  value={formData.warrantyExpiry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={!formData.hasWarranty}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  پلاک *
                </label>
                <input
                  type="text"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="مثال: ایران 12 - 111 ب 89"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  رنگ خودرو
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="مثال: سفید"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  کیلومتر کارکرد
                </label>
                <input
                  type="text"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="مثال: 40000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  شماره موتور
                </label>
                <input
                  type="text"
                  name="motorNumber"
                  value={formData.motorNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  مالک خودرو *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="نام و نام خانوادگی"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تلفن مشتری
                </label>
                <input
                  type="text"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="مثال: 09123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  آدرس مشتری
                </label>
                <input
                  type="text"
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="آدرس کامل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  کد پستی
                </label>
                <input
                  type="text"
                  name="customerPostalCode"
                  value={formData.customerPostalCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تعمیرکار مسئول *
                </label>
                <select
                  name="mechanicId"
                  value={formData.mechanicId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">انتخاب تعمیرکار</option>
                  {mechanics.map((mechanic) => (
                    <option key={mechanic.id} value={mechanic.id}>
                      {mechanic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* لوازم جانبی خودرو و میزان سوخت */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* لوازم جانبی خودرو - ستون اول */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-r-4 border-red-500 pr-2">لوازم جانبی خودرو</h3>
                <div className="grid grid-cols-2 gap-3 border p-3 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.radio"
                      checked={formData.accessories.radio}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      رادیو/پخش صوت
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.jack"
                      checked={formData.accessories.jack}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      جک
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.spareTire"
                      checked={formData.accessories.spareTire}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      زاپاس
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.airConditioner"
                      checked={formData.accessories.airConditioner}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      کولر
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.tools"
                      checked={formData.accessories.tools}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      جعبه ابزار
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.speaker"
                      checked={formData.accessories.speaker}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      بلندگو
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.fireExtinguisher"
                      checked={formData.accessories.fireExtinguisher}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      کپسول آتش نشانی
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.firstAidKit"
                      checked={formData.accessories.firstAidKit}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      جعبه کمک‌های اولیه
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.mirror"
                      checked={formData.accessories.mirror}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      آینه بغل
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.wipers"
                      checked={formData.accessories.wipers}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      برف پاک کن جلو
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.hubcaps"
                      checked={formData.accessories.hubcaps}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      قالپاق
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.antenna"
                      checked={formData.accessories.antenna}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      آنتن
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.usbCable"
                      checked={formData.accessories.usbCable}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      کابل USB
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.remote"
                      checked={formData.accessories.remote}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      ریموت
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.lighter"
                      checked={formData.accessories.lighter}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      فندک
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.floorMats"
                      checked={formData.accessories.floorMats}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      کفپوش
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.mudGuards"
                      checked={formData.accessories.mudGuards}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      گل‌پخش‌کن
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessories.sunroof"
                      checked={formData.accessories.sunroof}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      سانروف
                    </label>
                  </div>
                </div>
              </div>
              
              {/* میزان سوخت و وضعیت ظاهری خودرو */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-r-4 border-red-500 pr-2">میزان سوخت</h3>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold">E</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <input
                        type="radio"
                        name="fuelLevel"
                        value="empty"
                        checked={formData.fuelLevel === 'empty'}
                        onChange={handleChange}
                        className="mb-2"
                      />
                      <span className="text-xs">EM</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <input
                        type="radio"
                        name="fuelLevel"
                        value="quarter"
                        checked={formData.fuelLevel === 'quarter'}
                        onChange={handleChange}
                        className="mb-2"
                      />
                      <span className="text-xs">1/4</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <input
                        type="radio"
                        name="fuelLevel"
                        value="half"
                        checked={formData.fuelLevel === 'half'}
                        onChange={handleChange}
                        className="mb-2"
                      />
                      <span className="text-xs">1/2</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <input
                        type="radio"
                        name="fuelLevel"
                        value="threequarters"
                        checked={formData.fuelLevel === 'threequarters'}
                        onChange={handleChange}
                        className="mb-2"
                      />
                      <span className="text-xs">3/4</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <input
                        type="radio"
                        name="fuelLevel"
                        value="full"
                        checked={formData.fuelLevel === 'full'}
                        onChange={handleChange}
                        className="mb-2"
                      />
                      <span className="text-xs">F</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-r-4 border-red-500 pr-2">وضعیت ظاهری خودرو</h3>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <div className="mb-4 flex justify-between">
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-sm"
                    >
                      پاک کردن
                    </button>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      روی تصویر بکشید تا آسیب‌ها را مشخص کنید
                    </div>
                  </div>
                  
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={300}
                      className="border border-gray-300 dark:border-gray-600 rounded w-full bg-white"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={endDrawing}
                      onMouseLeave={endDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={endDrawing}
                    />
                  </div>
                  
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      توضیحات آسیب‌ها
                    </label>
                    <textarea
                      name="damageNotes"
                      value={formData.damageNotes}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                      placeholder="توضیحات آسیب‌های ظاهری خودرو..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* اظهارات مشتری */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-r-4 border-red-500 pr-2">اظهارات مشتری</h3>
            <textarea
              name="customerComments"
              value={formData.customerComments}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="مشکلات و ایرادات خودرو از نظر مشتری..."
            />
          </div>

          {/* تذکر و نکته‌های مهم */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-r-4 border-red-500 pr-2">تذکر و نکته‌های مهم</h3>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <p>در صورتی که علاوه بر موارد اظهار شده، در حین فرآیند تعمیر، کارشناسان تعمیرگاه مشکلات دیگری را در خودرو مشاهده نمودند، با اطلاع رسانی به جناب آقای/خانم سعید علی حسینی اقدامی انجام نخواهد شد.</p>
              <p>تعمیرگاه هیچ مسئولیتی در قبال وسایل شخصی و وجه نقدی که در خودرو شناسایی شده و وجود صرف و یا رابطه علیت بین آن و خودرو محرز نباشد، به عنوان مالک خودرو شناسایی شده و وجود صرف و یا رابطه علیت بین آن و خودرو محرز نباشد، به عنوان مالک خودرو شناسایی شده و وجود صرف و یا رابطه علیت بین آن و خودرو محرز نباشد، ندارد.</p>
              <p>در صورت مفقود شدن پس از تحویل خودرو به مشتری، تعمیرگاه هیچ مسئولیتی نخواهد داشت.</p>
              <p>هزینه تقریبی خودرو با توجه به اظهارات فوق مبلغ {formData.estimatedCost} ریال می باشد (این مبلغ برآورد تقریبی بوده و مبلغ نهایی در فاکتور مشتری محاسبه خواهد شد)</p>
              <p>تعمیرگاه خودرو رضایت خود را از تمامی خدمات ارائه شده جهت رفع عیب خودرو مطابق اظهارات درج شده در این فرم اعلام می دارم و تمامی اظهارات این فرم را تأیید می نمایم.</p>
            </div>
            
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                name="agreement"
                checked={formData.agreement}
                onChange={handleChange}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                required
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                بدینوسیله اینجانب سعید علی حسینی با آگاهی کامل از شرایط و ضوابط تعمیرگاه خودرو رضایت خود را از تمامی خدمات ارائه شده جهت رفع عیب خودرو مطابق اظهارات درج شده در این فرم اعلام می دارم و تمامی اظهارات این فرم را تأیید می نمایم.
              </label>
            </div>
          </div>

          {/* دکمه‌های عملیات */}
          <div className="flex space-x-4 space-x-reverse">
            <button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <Check className="w-5 h-5 ml-2" />
              ثبت و پذیرش خودرو
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  carType: '',
                  warranty: false,
                  warrantyExpiry: '',
                  plateNumber: '',
                  color: '',
                  mileage: '',
                  customerName: '',
                  customerPhone: '',
                  hasWarranty: false,
                  accessories: {
                    radio: false,
                    jack: false,
                    spareTire: false,
                    tools: false,
                    speaker: false,
                    fireExtinguisher: false,
                    firstAidKit: false,
                    mirror: false,
                    wipers: false,
                    hubcaps: false,
                    antenna: false,
                    usbCable: false,
                    remote: false,
                    lighter: false,
                    floorMats: false,
                    mudGuards: false,
                    sunroof: false,
                    airConditioner: false
                  },
                  fuelLevel: 'half',
                  customerComments: '',
                  agreement: false
                });
              }}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <X className="w-5 h-5 ml-2" />
              پاک کردن فرم
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between mb-6">
            <button
              onClick={() => setShowPrintPreview(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <X className="w-4 h-4 ml-2" />
              <span>بازگشت به فرم</span>
            </button>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                <Printer className="w-4 h-4 ml-2" />
                چاپ فرم
              </button>
              <button
                onClick={() => {
                  addNotification({
                    title: 'دانلود فرم',
                    message: `فرم پذیرش خودرو ${formData.plateNumber} با موفقیت دانلود شد`,
                    type: 'success'
                  });
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                <Download className="w-4 h-4 ml-2" />
                دانلود PDF
              </button>
            </div>
          </div>

          {/* پیش‌نمایش چاپ */}
          <div ref={printRef} className="border-2 border-gray-300 p-4">
            <table className="w-full border-collapse">
              <tbody>
                {/* Header Row */}
                <tr>
                  <td className="border border-gray-400 p-2 w-1/4 text-center">
                    <img src="/kia-logo.png" alt="KIA" className="h-12 inline-block" />
                  </td>
                  <td className="border border-gray-400 p-2 w-2/4 text-center">
                    <h2 className="text-lg font-bold">تعمیرگاه تخصصی هیوندای، کیا و هیبرید</h2>
                    <p className="text-xs">مکانیکی، هیوندای، سیستم کشی، کامپیوتر، اتوماتیک، الکتریک، صافکاری و نقاشی</p>
                  </td>
                  <td className="border border-gray-400 p-2 w-1/4 text-center">
                    <img src="/hyundai-logo.png" alt="Hyundai" className="h-12 inline-block" />
                  </td>
                </tr>
                
                {/* Reception Info Row */}
                <tr>
                  <td className="border border-gray-400 p-2">
                    <p className="text-sm">شماره پذیرش: {formData.receptionNumber}</p>
                  </td>
                  <td className="border border-gray-400 p-2 text-center">
                    <h3 className="text-lg font-bold">فرم پذیرش خودرو</h3>
                  </td>
                  <td className="border border-gray-400 p-2 text-left">
                    <p className="text-sm">زمان پذیرش: {formData.receptionDate}</p>
                  </td>
                </tr>
                
                {/* Car Info Row */}
                <tr>
                  <td className="border border-gray-400 p-2">
                    <p className="text-sm">نوع خودرو: {formData.carType}</p>
                  </td>
                  <td className="border border-gray-400 p-2">
                    <p className="text-sm">شماره شاسی: {formData.chassisNumber}</p>
                  </td>
                  <td className="border border-gray-400 p-2">
                    <p className="text-sm">گارانتی: {formData.hasWarranty ? 'دارد' : 'ندارد'}</p>
                  </td>
                </tr>
                
                <tr>
                  <td className="border border-gray-400 p-2">
                    <p className="text-sm">پلاک: {formData.plateNumber}</p>
                  </td>
                  <td className="border border-gray-400 p-2">
                    <p className="text-sm">شروع گارانتی: {formData.warrantyExpiry || '-'}</p>
                  </td>
                  <td className="border border-gray-400 p-2">
                    <p className="text-sm">کیلومتر کارکرد: {formData.mileage}</p>
                  </td>
                </tr>
                
                <tr>
                  <td className="border border-gray-400 p-2">
                    <p className="text-sm">رنگ خودرو: {formData.color}</p>
                  </td>
                  <td className="border border-gray-400 p-2">
                    <p className="text-sm">شماره موتور: {formData.motorNumber || '-'}</p>
                  </td>
                  <td className="border border-gray-400 p-2">
                    <p className="text-sm">نوع گیربکس: دستی</p>
                  </td>
                </tr>
                
                {/* Customer Info Row */}
                <tr>
                  <td className="border border-gray-400 p-2">
                    <p className="text-sm">مالک خودرو: {formData.customerName}</p>
                  </td>
                  <td className="border border-gray-400 p-2">
                    <p className="text-sm">آورنده: {formData.customerName}</p>
                  </td>
                  <td className="border border-gray-400 p-2">
                    <p className="text-sm">تلفن مشتری: {formData.customerPhone}</p>
                  </td>
                </tr>
                
                <tr>
                  <td className="border border-gray-400 p-2" colSpan={2}>
                    <p className="text-sm">کد پستی: {formData.customerPostalCode || '-'}</p>
                  </td>
                  <td className="border border-gray-400 p-2">
                    <div className="flex items-center">
                      <input type="checkbox" checked={true} readOnly className="w-4 h-4" />
                      <label className="ml-2 text-sm">گارانتی دارد</label>
                    </div>
                  </td>
                </tr>
                
                {/* Car Accessories and Fuel */}
                <tr>
                  <td className="border border-gray-400 p-2" colSpan={2}>
                    <h4 className="text-sm font-bold mb-2">وضعیت ظاهری خودرو</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {canvasImage ? (
                        <img src={canvasImage} alt="وضعیت ظاهری خودرو" className="w-full" />
                      ) : (
                        <>
                          <img src="/car-front.png" alt="نمای جلو" className="w-full" />
                          <img src="/car-back.png" alt="نمای عقب" className="w-full" />
                        </>
                      )}
                    </div>
                    {formData.damageNotes && (
                      <p className="text-xs mt-2">توضیحات: {formData.damageNotes}</p>
                    )}
                  </td>
                  <td className="border border-gray-400 p-2">
                    <h4 className="text-sm font-bold mb-2">میزان سوخت</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">E</span>
                      <div className="flex-1 h-4 mx-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-4 bg-red-500 rounded-full" 
                          style={{ 
                            width: formData.fuelLevel === 'empty' ? '0%' : 
                                  formData.fuelLevel === 'quarter' ? '25%' : 
                                  formData.fuelLevel === 'half' ? '50%' : 
                                  formData.fuelLevel === 'threequarters' ? '75%' : '100%' 
                          }}
                        ></div>
                      </div>
                      <span className="text-xs">F</span>
                    </div>
                    
                    <h4 className="text-sm font-bold mt-4 mb-2">لوازم جانبی خودرو</h4>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="flex items-center">
                        <input type="checkbox" checked={formData.accessories.radio} readOnly className="w-3 h-3" />
                        <label className="ml-1">رادیو/پخش</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" checked={formData.accessories.jack} readOnly className="w-3 h-3" />
                        <label className="ml-1">جک</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" checked={formData.accessories.spareTire} readOnly className="w-3 h-3" />
                        <label className="ml-1">زاپاس</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" checked={formData.accessories.tools} readOnly className="w-3 h-3" />
                        <label className="ml-1">جعبه ابزار</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" checked={formData.accessories.antenna} readOnly className="w-3 h-3" />
                        <label className="ml-1">آنتن</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" checked={formData.accessories.usbCable} readOnly className="w-3 h-3" />
                        <label className="ml-1">کابل USB</label>
                      </div>
                    </div>
                  </td>
                </tr>
                
                {/* Customer Comments */}
                <tr>
                  <td className="border border-gray-400 p-2" colSpan={3}>
                    <h4 className="text-sm font-bold mb-2">اظهارات مشتری</h4>
                    <p className="text-sm min-h-[50px]">{formData.customerComments || 'بدون اظهارات'}</p>
                  </td>
                </tr>
                
                {/* Estimated Cost */}
                <tr>
                  <td className="border border-gray-400 p-2" colSpan={3}>
                    <p className="text-sm">هزینه تقریبی خودرو با توجه به اظهارات فوق مبلغ {formData.estimatedCost} ریال می باشد (این مبلغ برآورد تقریبی بوده و مبلغ نهایی در فاکتور مشتری محاسبه خواهد شد)</p>
                  </td>
                </tr>
                
                {/* Important Notes */}
                <tr>
                  <td className="border border-gray-400 p-2" colSpan={3}>
                    <h4 className="text-sm font-bold mb-2">تذکر و نکته‌های مهم</h4>
                    <ol className="text-xs list-decimal list-inside space-y-1">
                      <li>در صورتی که علاوه بر موارد اظهار شده، در حین فرآیند تعمیر، کارشناسان تعمیرگاه مشکلات دیگری را در خودرو مشاهده نمودند، با اطلاع رسانی به مشتری اقدامی انجام نخواهد شد.</li>
                      <li>تعمیرگاه هیچ مسئولیتی در قبال وسایل شخصی و وجه نقدی که در خودرو باقی مانده باشد، ندارد.</li>
                      <li>در صورت مفقود شدن پس از تحویل خودرو به مشتری، تعمیرگاه هیچ مسئولیتی نخواهد داشت.</li>
                    </ol>
                  </td>
                </tr>
                
                {/* Agreement */}
                <tr>
                  <td className="border border-gray-400 p-2" colSpan={3}>
                    <div className="flex items-center justify-center">
                      <div className="flex items-center mx-4">
                        <input type="checkbox" checked={formData.agreement} readOnly className="w-4 h-4" />
                        <label className="ml-2 text-sm">موافقت دارم</label>
                      </div>
                      <div className="flex items-center mx-4">
                        <input type="checkbox" checked={!formData.agreement} readOnly className="w-4 h-4" />
                        <label className="ml-2 text-sm">موافقت ندارم</label>
                      </div>
                    </div>
                  </td>
                </tr>
                
                {/* Contact Info */}
                <tr>
                  <td className="border border-gray-400 p-2" colSpan={3}>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p>تاریخ و ساعت تماس:</p>
                        <p>تماس گیرنده:</p>
                        <p>موضوع تماس:</p>
                        <p>نتیجه:</p>
                      </div>
                      <div>
                        <p>تاریخ کارشناسی فنی / کارشناسی پذیرش:</p>
                      </div>
                    </div>
                  </td>
                </tr>
                
                {/* Signatures */}
                <tr>
                  <td className="border border-gray-400 p-2" colSpan={3}>
                    <p className="text-xs text-center mb-2">بدینوسیله اینجانب {formData.customerName} با آگاهی کامل از شرایط و ضوابط تعمیرگاه خودرو رضایت خود را از تمامی خدمات ارائه شده جهت رفع عیب خودرو مطابق اظهارات درج شده در این فرم اعلام می دارم و تمامی اظهارات این فرم را تأیید می نمایم.</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-sm font-bold mb-16">محل امضای مشتری</p>
                        <p className="text-xs">تاریخ: {formData.receptionDate}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold mb-16">محل امضای تعمیرگاه</p>
                        <p className="text-xs">تاریخ: {formData.receptionDate}</p>
                      </div>
                    </div>
                  </td>
                </tr>
                
                {/* Footer */}
                <tr>
                  <td className="border border-gray-400 p-2 text-center" colSpan={3}>
                    <p className="text-xs">توزیع نسخ: 1-مشتری 2-بایگانی 3-حسابداری 4-تعمیرات و بایگانی پذیرش</p>
                    <p className="text-xs mt-1">فرم: حسابداری - شماره حساب: 0123456789</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
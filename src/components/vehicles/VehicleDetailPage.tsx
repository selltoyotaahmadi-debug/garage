import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Car, User, FileText, Clock, Calendar, DollarSign, Package, 
  Wrench, CheckCircle, X, AlertTriangle, Plus, Save, Edit, Trash2, Printer
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDate, formatCurrency, toPersianDigits } from '../../utils/formatters';
import DamageInspectionCanvas from '../common/DamageInspectionCanvas';

const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vehicles, customers, jobCards, updateJobCard, updateVehicle } = useData();
  const { users, user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState<'info' | 'repairs' | 'labor' | 'parts' | 'damage'>('info');
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [vehicleJobCards, setVehicleJobCards] = useState<any[]>([]);
  const [activeJobCard, setActiveJobCard] = useState<any>(null);
  
  // State for labor cost form
  const [showLaborForm, setShowLaborForm] = useState(false);
  const [laborFormData, setLaborFormData] = useState({
    title: '',
    description: '',
    hours: 1,
    hourlyRate: 100000
  });
  
  // State for damage inspection
  const [showDamageInspection, setShowDamageInspection] = useState(false);
  const [damageInspectionData, setDamageInspectionData] = useState<string | null>(null);
  const [activeCarView, setActiveCarView] = useState<'front' | 'back' | 'side' | 'top'>('front');
  
  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      
      // Find vehicle
      const foundVehicle = vehicles.find(v => v.id === id);
      if (!foundVehicle) {
        addNotification({
          title: 'خطا',
          message: 'خودرو مورد نظر یافت نشد',
          type: 'error'
        });
        navigate(-1);
        return;
      }
      
      setVehicle(foundVehicle);
      
      // Find customer
      const foundCustomer = customers.find(c => c.id === foundVehicle.customerId);
      setCustomer(foundCustomer);
      
      // Find job cards for this vehicle
      const foundJobCards = jobCards.filter(jc => jc.vehicleId === id);
      setVehicleJobCards(foundJobCards);
      
      // Find active job card
      const foundActiveJobCard = foundJobCards.find(jc => jc.status !== 'completed');
      setActiveJobCard(foundActiveJobCard);
      
      // Set damage inspection data if available
      if (foundActiveJobCard && foundActiveJobCard.damageInspectionData) {
        setDamageInspectionData(foundActiveJobCard.damageInspectionData);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [id, vehicles, customers, jobCards, navigate, addNotification]);
  
  const handleAddLaborCost = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeJobCard) {
      addNotification({
        title: 'خطا',
        message: 'کارت کاری فعال یافت نشد',
        type: 'error'
      });
      return;
    }
    
    const newLaborCost = {
      id: Date.now().toString(),
      title: laborFormData.title,
      description: laborFormData.description,
      hours: laborFormData.hours,
      hourlyRate: laborFormData.hourlyRate,
      totalCost: laborFormData.hours * laborFormData.hourlyRate,
      createdAt: new Date().toISOString()
    };
    
    const updatedLaborCosts = [...(activeJobCard.laborCosts || []), newLaborCost];
    
    updateJobCard(activeJobCard.id, {
      laborCosts: updatedLaborCosts
    });
    
    addNotification({
      title: 'اجرت اضافه شد',
      message: `اجرت ${laborFormData.title} با موفقیت ثبت شد`,
      type: 'success'
    });
    
    setLaborFormData({
      title: '',
      description: '',
      hours: 1,
      hourlyRate: 100000
    });
    setShowLaborForm(false);
    
    // Update job cards
    const updatedJobCards = jobCards.map(jc => 
      jc.id === activeJobCard.id 
        ? { ...jc, laborCosts: updatedLaborCosts } 
        : jc
    );
    setVehicleJobCards(updatedJobCards.filter(jc => jc.vehicleId === id));
    setActiveJobCard({ ...activeJobCard, laborCosts: updatedLaborCosts });
  };
  
  const handleDeleteLaborCost = (laborId: string) => {
    if (!activeJobCard) return;
    
    const updatedLaborCosts = activeJobCard.laborCosts.filter((lc: any) => lc.id !== laborId);
    
    updateJobCard(activeJobCard.id, {
      laborCosts: updatedLaborCosts
    });
    
    addNotification({
      title: 'اجرت حذف شد',
      message: 'اجرت با موفقیت حذف شد',
      type: 'warning'
    });
    
    // Update job cards
    const updatedJobCards = jobCards.map(jc => 
      jc.id === activeJobCard.id 
        ? { ...jc, laborCosts: updatedLaborCosts } 
        : jc
    );
    setVehicleJobCards(updatedJobCards.filter(jc => jc.vehicleId === id));
    setActiveJobCard({ ...activeJobCard, laborCosts: updatedLaborCosts });
  };
  
  const handleStatusChange = (jobCardId: string, newStatus: string) => {
    updateJobCard(jobCardId, { 
      status: newStatus as any,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
    });
    
    const statusText = newStatus === 'pending' ? 'در انتظار' : 
                     newStatus === 'in_progress' ? 'در حال انجام' : 'تکمیل شده';
    
    addNotification({
      title: 'وضعیت تغییر کرد',
      message: `وضعیت به "${statusText}" تغییر یافت`,
      type: 'info'
    });
    
    // If completed, update vehicle status
    if (newStatus === 'completed' && vehicle) {
      updateVehicle(vehicle.id, { status: 'available' });
      setVehicle({ ...vehicle, status: 'available' });
    }
    
    // Update job cards
    const updatedJobCards = jobCards.map(jc => 
      jc.id === jobCardId 
        ? { 
            ...jc, 
            status: newStatus as any,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : jc.completedAt
          } 
        : jc
    );
    setVehicleJobCards(updatedJobCards.filter(jc => jc.vehicleId === id));
    
    // Update active job card
    if (activeJobCard && activeJobCard.id === jobCardId) {
      setActiveJobCard({ 
        ...activeJobCard, 
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : activeJobCard.completedAt
      });
    }
  };
  
  const handleSaveDamageInspection = (imageData: string) => {
    if (!activeJobCard) return;
    
    updateJobCard(activeJobCard.id, {
      damageInspectionData: imageData
    });
    
    setDamageInspectionData(imageData);
    setShowDamageInspection(false);
    
    addNotification({
      title: 'نقشه خط و خش ذخیره شد',
      message: 'نقشه خط و خش با موفقیت ذخیره شد',
      type: 'success'
    });
  };
  
  const getCarImage = () => {
    switch (activeCarView) {
      case 'front':
        return '/car-front.png';
      case 'back':
        return '/car-back.png';
      case 'side':
        return '/car-side.png';
      case 'top':
        return '/car-top.png';
      default:
        return '/car-front.png';
    }
  };
  
  // چاپ فرم خروج خودرو
  const handlePrintExitForm = () => {
    if (!vehicle || !customer || !activeJobCard) return;
    
    // محاسبه هزینه‌ها
    const totalLaborCost = activeJobCard.laborCosts?.reduce((sum, labor) => sum + labor.totalCost, 0) || 0;
    const totalPartsCost = activeJobCard.parts?.reduce((sum, part) => sum + (part.quantity * part.price), 0) || 0;
    const totalCost = totalLaborCost + totalPartsCosts;
    
    // یافتن تعمیرکار
    const mechanic = users.find(u => u.id === activeJobCard.mechanicId);
    
    // ایجاد پنجره جدید برای چاپ
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addNotification({
        title: 'خطا',
        message: 'خطا در باز کردن پنجره چاپ',
        type: 'error'
      });
      return;
    }
    
    // ایجاد محتوای HTML
    printWindow.document.write(`
      <html dir="rtl">
      <head>
        <title>فرم خروج خودرو - ${vehicle.plateNumber}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @font-face {
            font-family: 'Vazirmatn';
            src: url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Regular.woff2') format('woff2');
          }
          body { 
            font-family: 'Vazirmatn', sans-serif; 
            padding: 20px; 
            direction: rtl;
            font-size: 12pt;
            max-width: 21cm;
            margin: 0 auto;
          }
          .header { 
            text-align: center; 
            margin-bottom: 20px; 
            border-bottom: 2px solid #dc2626;
            padding-bottom: 10px;
          }
          .header h1 {
            margin: 5px 0;
            font-size: 18pt;
            color: #dc2626;
          }
          .header p {
            margin: 3px 0;
            font-size: 10pt;
          }
          .section { 
            margin-bottom: 15px; 
            border: 1px solid #ddd; 
            padding: 10px; 
            border-radius: 5px; 
          }
          .title { 
            font-weight: bold; 
            margin-bottom: 10px; 
            color: #dc2626;
            font-size: 14pt;
          }
          .row { 
            display: flex; 
            margin-bottom: 5px; 
            font-size: 10pt;
          }
          .label { 
            font-weight: bold; 
            width: 120px; 
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          .table th, .table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: right;
          }
          .table th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .total-row {
            font-weight: bold;
            background-color: #f9f9f9;
          }
          .signatures { 
            display: flex; 
            justify-content: space-between; 
            margin-top: 30px; 
          }
          .signature { 
            text-align: center; 
            border-top: 1px solid #000; 
            padding-top: 10px; 
            width: 150px; 
          }
          .damage-image {
            max-width: 100%;
            height: auto;
            border: 1px solid #ddd;
            margin-top: 10px;
          }
          .buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
          }
          .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'Vazirmatn', sans-serif;
          }
          .btn-print {
            background-color: #2563eb;
            color: white;
          }
          .btn-close {
            background-color: #dc2626;
            color: white;
          }
          @media print {
            .buttons { display: none; }
            body { font-size: 10pt; }
            @page {
              size: A4;
              margin: 1cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>فرم خروج خودرو</h1>
          <p>تعمیرگاه تویوتا احمدی</p>
          <p>تاریخ: ${new Date().toLocaleDateString('fa-IR')} - ساعت: ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        
        <div class="section">
          <div class="title">اطلاعات خودرو</div>
          <div class="row"><span class="label">پلاک:</span> ${vehicle.plateNumber}</div>
          <div class="row"><span class="label">مدل:</span> ${vehicle.model}</div>
          <div class="row"><span class="label">رنگ:</span> ${vehicle.color || 'نامشخص'}</div>
          <div class="row"><span class="label">سال:</span> ${vehicle.year || 'نامشخص'}</div>
          ${vehicle.vin ? `<div class="row"><span class="label">شماره شاسی:</span> ${vehicle.vin}</div>` : ''}
        </div>
        
        <div class="section">
          <div class="title">اطلاعات مالک</div>
          <div class="row"><span class="label">نام:</span> ${customer.name}</div>
          <div class="row"><span class="label">تلفن:</span> ${customer.phone}</div>
          ${customer.address ? `<div class="row"><span class="label">آدرس:</span> ${customer.address}</div>` : ''}
          ${customer.email ? `<div class="row"><span class="label">ایمیل:</span> ${customer.email}</div>` : ''}
        </div>
        
        <div class="section">
          <div class="title">اطلاعات تعمیر</div>
          <div class="row"><span class="label">تاریخ پذیرش:</span> ${formatDate(activeJobCard.createdAt)}</div>
          <div class="row"><span class="label">تاریخ تکمیل:</span> ${activeJobCard.completedAt ? formatDate(activeJobCard.completedAt) : 'هنوز تکمیل نشده'}</div>
          <div class="row"><span class="label">تعمیرکار:</span> ${mechanic?.name || activeJobCard.mechanicName || 'نامشخص'}</div>
          <div class="row"><span class="label">توضیحات:</span> ${activeJobCard.description}</div>
        </div>
        
        ${activeJobCard.parts && activeJobCard.parts.length > 0 ? `
        <div class="section">
          <div class="title">قطعات استفاده شده</div>
          <table class="table">
            <thead>
              <tr>
                <th>نام قطعه</th>
                <th>تعداد</th>
                <th>قیمت واحد (تومان)</th>
                <th>قیمت کل (تومان)</th>
              </tr>
            </thead>
            <tbody>
              ${activeJobCard.parts.map(part => `
                <tr>
                  <td>${part.name}</td>
                  <td>${part.quantity}</td>
                  <td>${part.price.toLocaleString()}</td>
                  <td>${(part.price * part.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3">جمع کل قطعات:</td>
                <td>${totalPartsCost.toLocaleString()} تومان</td>
              </tr>
            </tbody>
          </table>
        </div>
        ` : ''}
        
        ${activeJobCard.laborCosts && activeJobCard.laborCosts.length > 0 ? `
        <div class="section">
          <div class="title">اجرت‌های تعمیر</div>
          <table class="table">
            <thead>
              <tr>
                <th>عنوان</th>
                <th>ساعت کار</th>
                <th>نرخ ساعتی (تومان)</th>
                <th>هزینه کل (تومان)</th>
              </tr>
            </thead>
            <tbody>
              ${activeJobCard.laborCosts.map(labor => `
                <tr>
                  <td>${labor.title}${labor.description ? ` (${labor.description})` : ''}</td>
                  <td>${labor.hours}</td>
                  <td>${labor.hourlyRate.toLocaleString()}</td>
                  <td>${labor.totalCost.toLocaleString()}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3">جمع کل اجرت‌ها:</td>
                <td>${totalLaborCost.toLocaleString()} تومان</td>
              </tr>
            </tbody>
          </table>
        </div>
        ` : ''}
        
        <div class="section">
          <div class="title">جمع کل هزینه‌ها</div>
          <table class="table">
            <tbody>
              <tr>
                <td>هزینه قطعات:</td>
                <td>${totalPartsCost.toLocaleString()} تومان</td>
              </tr>
              <tr>
                <td>هزینه اجرت:</td>
                <td>${totalLaborCost.toLocaleString()} تومان</td>
              </tr>
              <tr class="total-row">
                <td>جمع کل:</td>
                <td>${totalCost.toLocaleString()} تومان</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        ${activeJobCard.damageInspectionData ? `
        <div class="section">
          <div class="title">نقشه خط و خش</div>
          <img src="${activeJobCard.damageInspectionData}" alt="نقشه خط و خش" class="damage-image" />
        </div>
        ` : ''}
        
        <div class="section">
          <div class="title">توضیحات تحویل</div>
          <p>خودرو فوق پس از انجام تعمیرات لازم، در تاریخ ${new Date().toLocaleDateString('fa-IR')} به مالک تحویل داده شد.</p>
          <p>کلیه قطعات تعویضی به مدت 3 ماه دارای گارانتی می‌باشند.</p>
        </div>
        
        <div class="signatures">
          <div class="signature">امضای مالک</div>
          <div class="signature">امضای تحویل دهنده</div>
          <div class="signature">مهر تعمیرگاه</div>
        </div>
        
        <div class="buttons">
          <button class="btn btn-print" onclick="window.print()">چاپ فرم</button>
          <button class="btn btn-close" onclick="window.close()">بستن</button>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };
  
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  if (!vehicle) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">خودرو یافت نشد</h2>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          بازگشت
        </button>
      </div>
    );
  }
  
  // Calculate total costs
  const totalLaborCost = activeJobCard?.laborCosts?.reduce((sum: number, labor: any) => sum + labor.totalCost, 0) || 0;
  const totalPartsCost = activeJobCard?.parts?.reduce((sum: number, part: any) => sum + (part.quantity * part.price), 0) || 0;
  const totalCost = totalLaborCost + totalPartsCost;
  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 text-white rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">جزئیات خودرو</h1>
            <p className="text-lg">پلاک: {vehicle.plateNumber}</p>
          </div>
          <div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              vehicle.status === 'in_repair' 
                ? 'bg-yellow-200 text-yellow-800' 
                : vehicle.status === 'delivered'
                ? 'bg-blue-200 text-blue-800'
                : 'bg-green-200 text-green-800'
            }`}>
              {vehicle.status === 'in_repair' ? 'در تعمیر' : 
               vehicle.status === 'delivered' ? 'تحویل شده' : 'آماده'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-x border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'info'
                  ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              اطلاعات خودرو
            </button>
            <button
              onClick={() => setActiveTab('repairs')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'repairs'
                  ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              تعمیرات
            </button>
            <button
              onClick={() => setActiveTab('labor')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'labor'
                  ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              اجرت‌ها
            </button>
            <button
              onClick={() => setActiveTab('parts')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'parts'
                  ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              قطعات
            </button>
            <button
              onClick={() => setActiveTab('damage')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'damage'
                  ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              خط و خش
            </button>
          </nav>
        </div>
      </div>
      
      {/* Content */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-b-lg border-x border-b border-gray-200 dark:border-gray-700">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Car className="w-5 h-5 ml-2 text-red-500" />
                اطلاعات خودرو
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">مدل:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{vehicle.model || 'نامشخص'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">سال:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{vehicle.year ? toPersianDigits(vehicle.year) : 'نامشخص'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">رنگ:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{vehicle.color || 'نامشخص'}</span>
                </div>
                {vehicle.vin && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">شماره شاسی:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{vehicle.vin}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">وضعیت:</span>
                  <span className={`font-medium ${
                    vehicle.status === 'in_repair' 
                      ? 'text-yellow-600 dark:text-yellow-400' 
                      : vehicle.status === 'delivered'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {vehicle.status === 'in_repair' ? 'در تعمیر' : 
                     vehicle.status === 'delivered' ? 'تحویل شده' : 'آماده'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Customer Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 ml-2 text-red-500" />
                اطلاعات مالک
              </h4>
              {customer ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">نام:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{customer.name || 'نامشخص'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">تلفن:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{customer.phone || 'نامشخص'}</span>
                  </div>
                  {customer.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">ایمیل:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">آدرس:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{customer.address}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">اطلاعات مالک در دسترس نیست</p>
              )}
            </div>
            
            {/* Current Repair Info */}
            {activeJobCard ? (
              <div className="md:col-span-2 bg-red-50 dark:bg-red-900/30 rounded-lg p-4 border-2 border-red-300 dark:border-red-700">
                <h4 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-4 flex items-center">
                  <FileText className="w-5 h-5 ml-2 text-red-500" />
                  اطلاعات تعمیر فعلی
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-red-700 dark:text-red-300">تاریخ پذیرش:</span>
                      <span className="font-medium text-red-800 dark:text-red-400">{formatDate(activeJobCard.createdAt || '')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-700 dark:text-red-300">مدت در تعمیرگاه:</span>
                      <span className="font-medium text-red-800 dark:text-red-400">
                        {toPersianDigits(Math.ceil((new Date().getTime() - new Date(activeJobCard.createdAt).getTime()) / (1000 * 60 * 60 * 24)))} روز
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-700 dark:text-red-300">تعمیرکار:</span>
                      <span className="font-medium text-red-800 dark:text-red-400">
                        {activeJobCard.mechanicName || users.find(u => u.id === activeJobCard.mechanicId)?.name || 'نامشخص'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-red-700 dark:text-red-300">تعداد قطعات:</span>
                      <span className="font-medium text-red-800 dark:text-red-400">{toPersianDigits(activeJobCard.parts?.length || 0)} قطعه</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-700 dark:text-red-300">هزینه اجرت:</span>
                      <span className="font-medium text-red-800 dark:text-red-400">{formatCurrency(totalLaborCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-700 dark:text-red-300">هزینه کل:</span>
                      <span className="font-medium text-red-800 dark:text-red-400">{formatCurrency(totalCost)}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-red-700 dark:text-red-300">مشکلات:</span>
                    <p className="mt-1 text-red-800 dark:text-red-400">{activeJobCard.description}</p>
                  </div>
                  
                  {/* Status Change */}
                  <div className="md:col-span-2 mt-4 pt-4 border-t border-red-300 dark:border-red-700">
                    <div className="flex items-center justify-between">
                      <span className="text-red-700 dark:text-red-300">وضعیت فعلی:</span>
                      <select
                        value={activeJobCard.status}
                        onChange={(e) => handleStatusChange(activeJobCard.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${getStatusColor(activeJobCard.status)}`}
                      >
                        <option value="pending">در انتظار</option>
                        <option value="in_progress">در حال انجام</option>
                        <option value="completed">تکمیل شده</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 ml-2 text-gray-500" />
                  اطلاعات تعمیر
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  این خودرو در حال حاضر در تعمیر نیست
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'repairs' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Wrench className="w-5 h-5 ml-2 text-red-500" />
              تاریخچه تعمیرات
            </h3>
            
            {vehicleJobCards.length > 0 ? (
              <div className="space-y-4">
                {vehicleJobCards.map((jobCard) => {
                  const mechanic = users.find(u => u.id === jobCard.mechanicId);
                  const totalLaborCost = jobCard.laborCosts?.reduce((sum: number, labor: any) => sum + labor.totalCost, 0) || 0;
                  const totalPartsCost = jobCard.parts?.reduce((sum: number, part: any) => sum + (part.quantity * part.price), 0) || 0;
                  const totalCost = totalLaborCost + totalPartsCost;
                  
                  return (
                    <div key={jobCard.id} className={`p-4 rounded-lg border ${
                      jobCard.status === 'completed' 
                        ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' 
                        : jobCard.status === 'in_progress'
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
                        : 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800'
                    }`}>
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center">
                          <FileText className={`w-5 h-5 ml-2 ${
                            jobCard.status === 'completed' 
                              ? 'text-green-500' 
                              : jobCard.status === 'in_progress'
                              ? 'text-blue-500'
                              : 'text-yellow-500'
                          }`} />
                          <span className="font-semibold">
                            {formatDate(jobCard.createdAt)}
                          </span>
                        </div>
                        <select
                          value={jobCard.status}
                          onChange={(e) => handleStatusChange(jobCard.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(jobCard.status)}`}
                        >
                          <option value="pending">در انتظار</option>
                          <option value="in_progress">در حال انجام</option>
                          <option value="completed">تکمیل شده</option>
                        </select>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {jobCard.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center">
                          <User className="w-4 h-4 ml-1 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            تعمیرکار: {mechanic?.name || jobCard.mechanicName || 'نامشخص'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Package className="w-4 h-4 ml-1 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            تعداد قطعات: {toPersianDigits(jobCard.parts?.length || 0)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 ml-1 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            هزینه کل: {formatCurrency(totalCost)}
                          </span>
                        </div>
                      </div>
                      
                      {jobCard.completedAt && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          تکمیل شده در: {formatDate(jobCard.completedAt)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  هیچ سابقه تعمیری برای این خودرو ثبت نشده است
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'labor' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                اجرت‌های تعمیر
              </h3>
              
              {activeJobCard && activeJobCard.status !== 'completed' && (
                <button
                  onClick={() => setShowLaborForm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  افزودن اجرت
                </button>
              )}
            </div>
            
            {/* Labor Form */}
            {showLaborForm && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  ثبت اجرت جدید
                </h4>
                <form onSubmit={handleAddLaborCost} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        عنوان اجرت *
                      </label>
                      <input
                        type="text"
                        required
                        value={laborFormData.title}
                        onChange={(e) => setLaborFormData({ ...laborFormData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                        placeholder="مثال: تعویض روغن موتور"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        توضیحات
                      </label>
                      <input
                        type="text"
                        value={laborFormData.description}
                        onChange={(e) => setLaborFormData({ ...laborFormData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                        placeholder="توضیحات اضافی..."
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ساعات کار *
                      </label>
                      <input
                        type="number"
                        required
                        min="0.5"
                        step="0.5"
                        value={laborFormData.hours}
                        onChange={(e) => setLaborFormData({ ...laborFormData, hours: parseFloat(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        نرخ ساعتی (تومان) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={laborFormData.hourlyRate}
                        onChange={(e) => setLaborFormData({ ...laborFormData, hourlyRate: parseInt(e.target.value) || 100000 })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        مجموع اجرت
                      </label>
                      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
                        {formatCurrency(laborFormData.hours * laborFormData.hourlyRate)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 space-x-reverse">
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      ثبت اجرت
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLaborForm(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Labor Costs List */}
            {activeJobCard && activeJobCard.laborCosts && activeJobCard.laborCosts.length > 0 ? (
              <div className="space-y-4">
                {activeJobCard.laborCosts.map((labor: any) => (
                  <div key={labor.id} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {labor.title}
                        </h5>
                        {labor.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {labor.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Clock className="w-3 h-3" />
                            <span>{toPersianDigits(labor.hours)} ساعت</span>
                          </div>
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <DollarSign className="w-3 h-3" />
                            <span>{formatCurrency(labor.hourlyRate)} / ساعت</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="text-left">
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(labor.totalCost)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(labor.createdAt)}
                        </p>
                      </div>
                      {activeJobCard.status !== 'completed' && (
                        <button
                          onClick={() => handleDeleteLaborCost(labor.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Total */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">مجموع اجرت‌ها:</span>
                    <span className="font-bold text-lg text-green-600 dark:text-green-400">
                      {formatCurrency(totalLaborCost)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  هیچ اجرتی برای این خودرو ثبت نشده است
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'parts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                قطعات مصرفی
              </h3>
              
              {activeJobCard && activeJobCard.status !== 'completed' && (
                <button
                  onClick={() => {
                    addNotification({
                      title: 'در حال توسعه',
                      message: 'این قابلیت در حال توسعه است',
                      type: 'info'
                    });
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  افزودن قطعه
                </button>
              )}
            </div>
            
            {/* Parts List */}
            {activeJobCard && activeJobCard.parts && activeJobCard.parts.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          نام قطعه
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          تعداد
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          قیمت واحد
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          قیمت کل
                        </th>
                        {activeJobCard.status !== 'completed' && (
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            عملیات
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {activeJobCard.parts.map((part: any) => (
                        <tr key={part.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {part.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {toPersianDigits(part.quantity)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(part.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(part.price * part.quantity)}
                          </td>
                          {activeJobCard.status !== 'completed' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => {
                                  addNotification({
                                    title: 'در حال توسعه',
                                    message: 'این قابلیت در حال توسعه است',
                                    type: 'info'
                                  });
                                }}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-left">
                          جمع کل:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(totalPartsCost)}
                        </td>
                        {activeJobCard.status !== 'completed' && <td></td>}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  هیچ قطعه‌ای برای این خودرو ثبت نشده است
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'damage' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                نقشه خط و خش
              </h3>
              
              {activeJobCard && activeJobCard.status !== 'completed' && (
                <button
                  onClick={() => setShowDamageInspection(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                >
                  <Edit className="w-4 h-4 ml-2" />
                  ویرایش نقشه
                </button>
              )}
            </div>
            
            {showDamageInspection ? (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-center space-x-2 space-x-reverse mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveCarView('front')}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      activeCarView === 'front'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    نمای جلو
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCarView('back')}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      activeCarView === 'back'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    نمای عقب
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCarView('side')}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      activeCarView === 'side'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    نمای کنار
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCarView('top')}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      activeCarView === 'top'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    نمای بالا
                  </button>
                </div>
                
                <DamageInspectionCanvas
                  carImage={getCarImage()}
                  initialData={damageInspectionData || undefined}
                  onSave={handleSaveDamageInspection}
                  width={500}
                  height={300}
                />
              </div>
            ) : (
              damageInspectionData ? (
                <div 
                  className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer"
                  onClick={() => {
                    const imgWindow = window.open('', '_blank');
                    if (imgWindow) {
                      imgWindow.document.write(`
                        <html>
                          <head>
                            <title>نقشه خط و خش خودرو</title>
                            <style>
                              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5; }
                              img { max-width: 90%; max-height: 90%; border: 1px solid #ddd; }
                              .close-btn { position: absolute; top: 20px; right: 20px; background: #dc2626; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; }
                            </style>
                          </head>
                          <body>
                            <img src="${damageInspectionData}" alt="نقشه خط و خش خودرو" />
                            <button class="close-btn" onclick="window.close()">بستن</button>
                          </body>
                        </html>
                      `);
                    }
                  }}
                >
                  <img 
                    src={damageInspectionData} 
                    alt="نقشه خط و خش خودرو" 
                    className="max-w-full h-auto rounded-lg"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    این تصویر در زمان پذیرش خودرو ثبت شده است
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    (برای بزرگنمایی روی تصویر کلیک کنید)
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    اطلاعات خط و خش برای این خودرو ثبت نشده است
                  </p>
                  {activeJobCard && activeJobCard.status !== 'completed' && (
                    <button
                      onClick={() => setShowDamageInspection(true)}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      ثبت نقشه خط و خش
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
        >
          بازگشت
        </button>
        
        {activeJobCard && (
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={() => handlePrintExitForm()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Printer className="w-4 h-4 ml-2" />
              چاپ فاکتور
            </button>
            
            {activeJobCard.status === 'completed' ? (
              <button
                onClick={() => {
                  updateVehicle(vehicle.id, { status: 'delivered' });
                  setVehicle({ ...vehicle, status: 'delivered' });
                  
                  addNotification({
                    title: 'خودرو تحویل شد',
                    message: 'وضعیت خودرو به تحویل شده تغییر یافت',
                    type: 'success'
                  });
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <CheckCircle className="w-4 h-4 ml-2" />
                تحویل خودرو
              </button>
            ) : (
              <button
                onClick={() => {
                  handleStatusChange(activeJobCard.id, 'completed');
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <CheckCircle className="w-4 h-4 ml-2" />
                تکمیل تعمیر
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetailPage;
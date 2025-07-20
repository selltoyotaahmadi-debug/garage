import React, { useState } from 'react';
import { Plus, Search, Package, Clock, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Customer } from '../../contexts/DataContext';

interface RequestedPart {
  name: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high';
  notes?: string;
}

export default function PartRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    parts: [{ name: '', quantity: 1, urgency: 'medium' as 'low' | 'medium' | 'high', notes: '' }],
    notes: ''
  });

  const { 
    partRequests, 
    vehicles, 
    customers,
    addPartRequest, 
  } = useData();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const myPartRequests = partRequests.filter(pr => pr.mechanicId === user?.id);
  const myVehicles = vehicles.filter(v => {
    // خودروهایی که در تعمیر هستند و تعمیرکار آن کاربر فعلی است
    return v.status === 'in_repair' && v.mechanicId === user?.id;
  });
  
  const filteredRequests = myPartRequests.filter(request => {
    const vehicle = vehicles.find(v => v.id === request.vehicleId);
    
    const matchesSearch = 
      vehicle?.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicleId || formData.parts.length === 0 || !formData.parts[0].name) {
      addNotification({
        title: 'خطا',
        message: 'لطفاً تمام فیلدهای اجباری را پر کنید',
        type: 'error'
      });
      return;
    }

    addPartRequest({
      mechanicId: user?.id || '',
      vehicleId: formData.vehicleId,
      jobCardId: '', // این فیلد دیگر استفاده نمی‌شود
      parts: formData.parts.filter(part => part.name.trim() && part.quantity > 0),
      status: 'pending',
      notes: formData.notes
    });

    addNotification({
      title: 'درخواست قطعه ارسال شد',
      message: 'درخواست شما برای انباردار ارسال شد',
      type: 'success'
    });

    setFormData({
      vehicleId: '',
      parts: [{ name: '', quantity: 1, urgency: 'medium', notes: '' }],
      notes: ''
    });
    setShowAddForm(false);
  };

  const addPartRow = () => {
    setFormData({
      ...formData,
      parts: [...formData.parts, { name: '', quantity: 1, urgency: 'medium', notes: '' }]
    });
  };

  const removePartRow = (index: number) => {
    setFormData({
      ...formData,
      parts: formData.parts.filter((_, i) => i !== index)
    });
  };

  const updatePart = (index: number, field: string, value: any) => {
    const updatedParts = formData.parts.map((part, i) => 
      i === index ? { ...part, [field]: value } : part
    );
    setFormData({ ...formData, parts: updatedParts });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'در انتظار';
      case 'approved':
        return 'تأیید شده';
      case 'rejected':
        return 'رد شده';
      case 'delivered':
        return 'تحویل شده';
      default:
        return 'نامشخص';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'فوری';
      case 'medium':
        return 'متوسط';
      case 'low':
        return 'عادی';
      default:
        return 'نامشخص';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            درخواست قطعات
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            مدیریت درخواست‌های قطعات برای کارت‌های کاری
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2 space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>درخواست جدید</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="جستجو بر اساس پلاک یا توضیحات..."
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
          <option value="approved">تأیید شده</option>
          <option value="rejected">رد شده</option>
          <option value="delivered">تحویل شده</option>
        </select>
      </div>

      {/* Add Request Form */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 mb-8 border-2 border-green-100 dark:border-green-900/30 shadow-xl">
          <div className="flex items-center space-x-3 space-x-reverse mb-6">
            <div className="bg-green-500 p-3 rounded-full">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                درخواست قطعات جدید
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                قطعات مورد نیاز برای تعمیر را درخواست کنید
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  خودرو *
                </label>
                <select
                  required
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">انتخاب خودرو</option>
                  {myVehicles.map((vehicle) => {
                    const customer = customers.find(c => c.id === vehicle.customerId);
                    return (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plateNumber} - {vehicle.model} ({customer?.name})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Parts */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  قطعات مورد نیاز *
                </label>
                <button
                  type="button"
                  onClick={addPartRow}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  + افزودن قطعه
                </button>
              </div>
              <div className="space-y-3">
                {formData.parts.map((part, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <input
                        type="text"
                        placeholder="نام قطعه مورد نیاز"
                        value={part.name}
                        onChange={(e) => updatePart(index, 'name', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            // Focus on quantity input
                            const quantityInput = e.currentTarget.parentElement?.nextElementSibling?.querySelector('input');
                            if (quantityInput) quantityInput.focus();
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="تعداد"
                        min="1"
                        value={part.quantity}
                        onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            // Add new part row when Enter is pressed on the last row
                            if (index === formData.parts.length - 1) {
                              addPartRow();
                              // Focus will be set to the new part name input in the next render cycle
                              setTimeout(() => {
                                const inputs = document.querySelectorAll('input[placeholder="نام قطعه مورد نیاز"]');
                                const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
                                if (lastInput) lastInput.focus();
                              }, 0);
                            } else {
                              // Focus on urgency select
                              const urgencySelect = e.currentTarget.parentElement?.nextElementSibling?.querySelector('select');
                              if (urgencySelect) urgencySelect.focus();
                            }
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <select
                        value={part.urgency}
                        onChange={(e) => updatePart(index, 'urgency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                      >
                        <option value="low">عادی</option>
                        <option value="medium">متوسط</option>
                        <option value="high">فوری</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="text"
                        value={part.notes}
                        onChange={(e) => updatePart(index, 'notes', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                      />
                      {formData.parts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePartRow(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                یادداشت کلی
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="توضیحات اضافی..."
              />
            </div>

            <div className="flex space-x-4 space-x-reverse pt-6 border-t border-gray-200 dark:border-gray-700">
              <button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 space-x-reverse">
                <CheckCircle className="w-5 h-5" />
                <span>
                ارسال درخواست
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 space-x-reverse"
              >
                <X className="w-5 h-5" />
                <span>
                انصراف
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => {
          const vehicle = vehicles.find(v => v.id === request.vehicleId);
          
          return (
            <div key={request.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className={`p-2 rounded-lg ${
                    request.parts.some(part => part.urgency === 'high') 
                      ? 'bg-red-100 dark:bg-red-900/30' 
                      : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    <Package className={`w-5 h-5 ${
                      request.parts.some(part => part.urgency === 'high')
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      درخواست برای {vehicle?.plateNumber}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {vehicle?.model}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
              </div>

              {/* Parts List */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  قطعات درخواستی:
                </h4>
                <div className="space-y-2">
                  {request.parts.map((part, index) => {
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="text-sm text-gray-900 dark:text-white">{part.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            تعداد: {part.quantity}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className={`text-xs font-medium ${getUrgencyColor(part.urgency)}`}>
                            {getUrgencyText(part.urgency)}
                          </span>
                          {part.urgency === 'high' && (
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              {request.notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    یادداشت:
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {request.notes}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(request.requestedAt).toLocaleDateString('fa-IR')}</span>
                </div>
                {request.status === 'delivered' && (
                  <div className="flex items-center space-x-1 space-x-reverse text-xs text-green-600 dark:text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>تحویل شده</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            درخواستی یافت نشد
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            هیچ درخواست قطعه‌ای با فیلترهای انتخابی یافت نشد
          </p>
        </div>
      )}
    </div>
  );
}
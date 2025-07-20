import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle, X, AlertTriangle, User, Car } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

export default function WarehouseRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { 
    partRequests, 
    vehicles, 
    updatePartRequest
  } = useData();
  const { users, user } = useAuth();
  const { addNotification } = useNotifications();

  const filteredRequests = partRequests.filter(request => {
    const vehicle = vehicles.find(v => v.id === request.vehicleId);
    const mechanic = users.find(u => u.id === request.mechanicId);
    
    const matchesSearch = 
      vehicle?.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mechanic?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleRequestAction = (requestId: string, action: 'approve' | 'reject' | 'deliver', notes?: string) => {
    const request = partRequests.find(r => r.id === requestId);
    if (!request) return;

    if (action === 'approve') {
      updatePartRequest(requestId, { 
        status: 'approved', 
        processedBy: user?.id,
        notes 
      });

      addNotification({
        title: 'درخواست تأیید شد',
        message: 'درخواست قطعات تأیید و آماده تحویل است',
        type: 'success'
      });
    } else if (action === 'reject') {
      updatePartRequest(requestId, { 
        status: 'rejected', 
        processedBy: user?.id,
        notes 
      });

      addNotification({
        title: 'درخواست رد شد',
        message: 'درخواست قطعات رد شد',
        type: 'warning'
      });
    } else if (action === 'deliver') {
      updatePartRequest(requestId, { 
        status: 'delivered', 
        processedBy: user?.id,
        notes 
      });

      addNotification({
        title: 'قطعات تحویل شد',
        message: 'قطعات با موفقیت تحویل داده شد',
        type: 'success'
      });
    }
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

  const pendingCount = partRequests.filter(r => r.status === 'pending').length;
  const approvedCount = partRequests.filter(r => r.status === 'approved').length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          درخواست‌های قطعات
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          بررسی و تأیید درخواست‌های قطعات از تعمیرکاران
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">کل درخواست‌ها</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{partRequests.length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">در انتظار</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">تأیید شده</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{approvedCount}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">تحویل شده</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {partRequests.filter(r => r.status === 'delivered').length}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="جستجو بر اساس پلاک، تعمیرکار یا توضیحات..."
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

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => {
          const vehicle = vehicles.find(v => v.id === request.vehicleId);
          const mechanic = users.find(u => u.id === request.mechanicId);
          const hasUrgentParts = request.parts.some(part => part.urgency === 'high');
          
          return (
            <div key={request.id} className={`bg-white dark:bg-gray-800 rounded-lg p-6 border ${
              hasUrgentParts ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className={`p-2 rounded-lg ${
                    hasUrgentParts ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    <Package className={`w-5 h-5 ${
                      hasUrgentParts ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        درخواست برای {vehicle?.plateNumber}
                      </h3>
                      {hasUrgentParts && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {vehicle?.model}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
              </div>

              {/* Mechanic Info */}
              <div className="flex items-center space-x-2 space-x-reverse mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">تعمیرکار:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {mechanic?.name}
                </span>
                <Car className="w-4 h-4 text-gray-400 mr-4" />
                <span className="text-sm text-gray-600 dark:text-gray-400">خودرو:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {vehicle?.model}
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
                      <div key={index} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {part.name}
                            </span>
                            <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500 dark:text-gray-400">
                              <span>تعداد: {part.quantity}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <span className={`text-xs font-medium ${getUrgencyColor(part.urgency)}`}>
                              {getUrgencyText(part.urgency)}
                            </span>
                          </div>
                        </div>
                        {part.notes && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {part.notes}
                          </p>
                        )}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    {request.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(request.requestedAt).toLocaleDateString('fa-IR')}</span>
                  {request.processedAt && (
                    <>
                      <span>•</span>
                      <span>پردازش: {new Date(request.processedAt).toLocaleDateString('fa-IR')}</span>
                    </>
                  )}
                </div>
                
                {request.status === 'pending' && (
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => {
                        const notes = prompt('یادداشت (اختیاری):');
                        handleRequestAction(request.id, 'approve', notes || undefined);
                      }}
                      className="btn-success text-sm py-1 px-3"
                    >
                      تأیید
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt('دلیل رد (اختیاری):');
                        handleRequestAction(request.id, 'reject', notes || undefined);
                      }}
                      className="btn-danger text-sm py-1 px-3"
                    >
                      رد
                    </button>
                  </div>
                )}
                
                {request.status === 'approved' && (
                  <button
                    onClick={() => {
                      if (confirm('آیا از تحویل قطعات اطمینان دارید؟')) {
                        handleRequestAction(request.id, 'deliver');
                      }
                    }}
                    className="btn-primary text-sm py-1 px-3"
                  >
                    تحویل
                  </button>
                )}
                
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
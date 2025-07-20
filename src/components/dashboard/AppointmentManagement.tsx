import React, { useState } from 'react';
import { Calendar, Clock, Plus, Search, Edit, Trash2, User, Car, Phone, CheckCircle, X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface Appointment {
  id: string;
  customerId: string;
  vehicleId: string;
  date: string;
  time: string;
  service: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      customerId: '1',
      vehicleId: '1',
      date: '2024-01-20',
      time: '09:00',
      service: 'تعویض روغن',
      status: 'scheduled',
      notes: 'مشتری ترجیح می‌دهد صبح زود بیاید',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      customerId: '2',
      vehicleId: '2',
      date: '2024-01-21',
      time: '14:00',
      service: 'بررسی کامل',
      status: 'confirmed',
      createdAt: '2024-01-16'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    date: '',
    time: '',
    service: '',
    notes: ''
  });

  const { customers, vehicles } = useData();
  const { addNotification } = useNotifications();

  const services = [
    'تعویض روغن',
    'بررسی کامل',
    'تعمیر ترمز',
    'تعویض لاستیک',
    'تنظیم موتور',
    'تعمیر کولر',
    'تعمیر برق',
    'رنگ و نقاشی',
    'صافکاری',
    'سایر خدمات'
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30'
  ];

  const filteredAppointments = appointments.filter(appointment => {
    const customer = customers.find(c => c.id === appointment.customerId);
    const vehicle = vehicles.find(v => v.id === appointment.vehicleId);
    
    const matchesSearch = 
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      ...formData,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    if (editingAppointment) {
      setAppointments(prev => prev.map(app => 
        app.id === editingAppointment ? { ...app, ...formData } : app
      ));
      addNotification({
        title: 'نوبت ویرایش شد',
        message: 'اطلاعات نوبت با موفقیت به‌روزرسانی شد',
        type: 'success'
      });
      setEditingAppointment(null);
    } else {
      setAppointments(prev => [...prev, newAppointment]);
      addNotification({
        title: 'نوبت جدید ثبت شد',
        message: 'نوبت با موفقیت در تقویم ثبت شد',
        type: 'success'
      });
    }
    
    setFormData({
      customerId: '',
      vehicleId: '',
      date: '',
      time: '',
      service: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleEdit = (appointment: Appointment) => {
    setFormData({
      customerId: appointment.customerId,
      vehicleId: appointment.vehicleId,
      date: appointment.date,
      time: appointment.time,
      service: appointment.service,
      notes: appointment.notes || ''
    });
    setEditingAppointment(appointment.id);
    setShowAddForm(true);
  };

  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointments(prev => prev.map(app => 
      app.id === appointmentId ? { ...app, status: newStatus } : app
    ));
    
    const statusText = {
      'scheduled': 'زمان‌بندی شده',
      'confirmed': 'تأیید شده',
      'completed': 'تکمیل شده',
      'cancelled': 'لغو شده'
    }[newStatus];
    
    addNotification({
      title: 'وضعیت نوبت تغییر کرد',
      message: `وضعیت به "${statusText}" تغییر یافت`,
      type: 'info'
    });
  };

  const handleDelete = (appointmentId: string) => {
    if (confirm('آیا از حذف این نوبت اطمینان دارید؟')) {
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
      addNotification({
        title: 'نوبت حذف شد',
        message: 'نوبت از تقویم حذف شد',
        type: 'warning'
      });
    }
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'زمان‌بندی شده';
      case 'confirmed':
        return 'تأیید شده';
      case 'completed':
        return 'تکمیل شده';
      case 'cancelled':
        return 'لغو شده';
      default:
        return 'نامشخص';
    }
  };

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(app => app.date === today);
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(app => app.date > today).slice(0, 5);
  };

  return (
    <div className="p-responsive">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="responsive-text-2xl font-bold text-gray-900 dark:text-white">مدیریت نوبت‌دهی</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">مدیریت نوبت‌های مراجعه مشتریان</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingAppointment(null);
            setFormData({
              customerId: '',
              vehicleId: '',
              date: '',
              time: '',
              service: '',
              notes: ''
            });
          }}
          className="btn-primary flex items-center space-x-2 space-x-reverse text-sm md:text-base"
        >
          <Plus className="w-4 h-4" />
          <span>نوبت جدید</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid-responsive mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">نوبت‌های امروز</p>
              <p className="responsive-text-2xl font-bold text-red-600 dark:text-red-400">{getTodayAppointments().length}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-2 md:p-3 rounded-lg">
              <Calendar className="w-4 h-4 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">نوبت‌های آینده</p>
              <p className="responsive-text-2xl font-bold text-blue-600 dark:text-blue-400">{getUpcomingAppointments().length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 md:p-3 rounded-lg">
              <Clock className="w-4 h-4 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">تأیید شده</p>
              <p className="responsive-text-2xl font-bold text-green-600 dark:text-green-400">
                {appointments.filter(a => a.status === 'confirmed').length}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 md:p-3 rounded-lg">
              <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">کل نوبت‌ها</p>
              <p className="responsive-text-2xl font-bold text-gray-900 dark:text-white">{appointments.length}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 md:p-3 rounded-lg">
              <Calendar className="w-4 h-4 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid-responsive-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام مشتری، پلاک یا خدمت..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm md:text-base"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm md:text-base"
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="scheduled">زمان‌بندی شده</option>
          <option value="confirmed">تأیید شده</option>
          <option value="completed">تکمیل شده</option>
          <option value="cancelled">لغو شده</option>
        </select>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 mb-6 border-responsive">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingAppointment ? 'ویرایش نوبت' : 'ثبت نوبت جدید'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                مشتری *
              </label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value, vehicleId: '' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="">انتخاب مشتری</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                خودرو *
              </label>
              <select
                required
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                disabled={!formData.customerId}
              >
                <option value="">انتخاب خودرو</option>
                {vehicles
                  .filter(vehicle => vehicle.customerId === formData.customerId)
                  .map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plateNumber} - {vehicle.model}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                تاریخ *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ساعت *
              </label>
              <select
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="">انتخاب ساعت</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                نوع خدمت *
              </label>
              <select
                required
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="">انتخاب خدمت</option>
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                یادداشت
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                placeholder="یادداشت‌های اضافی..."
              />
            </div>

            <div className="lg:col-span-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
              <button type="submit" className="btn-success text-sm">
                {editingAppointment ? 'ویرایش' : 'ثبت'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAppointment(null);
                }}
                className="btn-secondary text-sm"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appointments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-responsive">
        <div className="table-responsive">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  مشتری
                </th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  خودرو
                </th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  تاریخ و ساعت
                </th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  خدمت
                </th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  وضعیت
                </th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAppointments.map((appointment) => {
                const customer = customers.find(c => c.id === appointment.customerId);
                const vehicle = vehicles.find(v => v.id === appointment.vehicleId);
                
                return (
                  <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full ml-3">
                          <User className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {customer?.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Phone className="w-3 h-3 ml-1" />
                            {customer?.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car className="w-4 h-4 text-gray-400 ml-1" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {vehicle?.plateNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {vehicle?.model}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(appointment.date).toLocaleDateString('fa-IR')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="w-3 h-3 ml-1" />
                        {appointment.time}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {appointment.service}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <select
                        value={appointment.status}
                        onChange={(e) => handleStatusChange(appointment.id, e.target.value as Appointment['status'])}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(appointment.status)}`}
                      >
                        <option value="scheduled">زمان‌بندی شده</option>
                        <option value="confirmed">تأیید شده</option>
                        <option value="completed">تکمیل شده</option>
                        <option value="cancelled">لغو شده</option>
                      </select>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleEdit(appointment)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(appointment.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            نوبتی یافت نشد
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            هیچ نوبتی با فیلترهای انتخابی یافت نشد
          </p>
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { CreditCard, Plus, Search, Edit, Trash2, Eye, Download, Send, DollarSign, Calendar, User, Car } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  vehicleId: string;
  jobCardId?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
  paidAt?: string;
  notes?: string;
}

interface InvoiceItem {
  id: string;
  type: 'service' | 'part';
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-001',
      customerId: '1',
      vehicleId: '1',
      jobCardId: '1',
      items: [
        {
          id: '1',
          type: 'service',
          description: 'تعویض روغن موتور',
          quantity: 1,
          unitPrice: 200000,
          total: 200000
        },
        {
          id: '2',
          type: 'part',
          description: 'روغن موتور 5W30',
          quantity: 4,
          unitPrice: 50000,
          total: 200000
        }
      ],
      subtotal: 400000,
      tax: 36000,
      discount: 0,
      total: 436000,
      status: 'sent',
      dueDate: '2024-02-01',
      createdAt: '2024-01-15',
      notes: 'فاکتور تعویض روغن'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    jobCardId: '',
    items: [{ type: 'service', description: '', quantity: 1, unitPrice: 0 }],
    discount: 0,
    dueDate: '',
    notes: ''
  });

  const { customers, vehicles, jobCards } = useData();
  const { addNotification } = useNotifications();

  const filteredInvoices = invoices.filter(invoice => {
    const customer = customers.find(c => c.id === invoice.customerId);
    const vehicle = vehicles.find(v => v.id === invoice.vehicleId);
    
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const calculateTotals = (items: any[], discount: number) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.09; // 9% tax
    const total = subtotal + tax - discount;
    return { subtotal, tax, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { subtotal, tax, total } = calculateTotals(formData.items, formData.discount);
    
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      ...formData,
      items: formData.items.map((item, index) => ({
        id: (index + 1).toString(),
        ...item,
        total: item.quantity * item.unitPrice
      })),
      subtotal,
      tax,
      total,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    if (editingInvoice) {
      setInvoices(prev => prev.map(inv => 
        inv.id === editingInvoice ? { ...inv, ...newInvoice, id: editingInvoice } : inv
      ));
      addNotification({
        title: 'فاکتور ویرایش شد',
        message: 'اطلاعات فاکتور با موفقیت به‌روزرسانی شد',
        type: 'success'
      });
      setEditingInvoice(null);
    } else {
      setInvoices(prev => [...prev, newInvoice]);
      addNotification({
        title: 'فاکتور جدید ایجاد شد',
        message: `فاکتور ${newInvoice.invoiceNumber} با موفقیت ثبت شد`,
        type: 'success'
      });
    }
    
    setFormData({
      customerId: '',
      vehicleId: '',
      jobCardId: '',
      items: [{ type: 'service', description: '', quantity: 1, unitPrice: 0 }],
      discount: 0,
      dueDate: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleEdit = (invoice: Invoice) => {
    setFormData({
      customerId: invoice.customerId,
      vehicleId: invoice.vehicleId,
      jobCardId: invoice.jobCardId || '',
      items: invoice.items.map(item => ({
        type: item.type,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      discount: invoice.discount,
      dueDate: invoice.dueDate,
      notes: invoice.notes || ''
    });
    setEditingInvoice(invoice.id);
    setShowAddForm(true);
  };

  const handleStatusChange = (invoiceId: string, newStatus: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId ? { 
        ...inv, 
        status: newStatus,
        paidAt: newStatus === 'paid' ? new Date().toISOString() : inv.paidAt
      } : inv
    ));
    
    const statusText = {
      'draft': 'پیش‌نویس',
      'sent': 'ارسال شده',
      'paid': 'پرداخت شده',
      'overdue': 'معوقه'
    }[newStatus];
    
    addNotification({
      title: 'وضعیت فاکتور تغییر کرد',
      message: `وضعیت به "${statusText}" تغییر یافت`,
      type: 'info'
    });
  };

  const handleDelete = (invoiceId: string, invoiceNumber: string) => {
    if (confirm(`آیا از حذف فاکتور ${invoiceNumber} اطمینان دارید؟`)) {
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      addNotification({
        title: 'فاکتور حذف شد',
        message: `فاکتور ${invoiceNumber} حذف شد`,
        type: 'warning'
      });
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { type: 'service', description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = formData.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, items: updatedItems });
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status: Invoice['status']) => {
    switch (status) {
      case 'draft':
        return 'پیش‌نویس';
      case 'sent':
        return 'ارسال شده';
      case 'paid':
        return 'پرداخت شده';
      case 'overdue':
        return 'معوقه';
      default:
        return 'نامشخص';
    }
  };

  const getTotalRevenue = () => {
    return invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
  };

  const getPendingAmount = () => {
    return invoices
      .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);
  };

  return (
    <div className="p-responsive">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="responsive-text-2xl font-bold text-gray-900 dark:text-white">مدیریت فاکتورها</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">ایجاد و مدیریت فاکتورهای فروش</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingInvoice(null);
            setFormData({
              customerId: '',
              vehicleId: '',
              jobCardId: '',
              items: [{ type: 'service', description: '', quantity: 1, unitPrice: 0 }],
              discount: 0,
              dueDate: '',
              notes: ''
            });
          }}
          className="btn-primary flex items-center space-x-2 space-x-reverse text-sm md:text-base"
        >
          <Plus className="w-4 h-4" />
          <span>فاکتور جدید</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid-responsive mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">کل فاکتورها</p>
              <p className="responsive-text-2xl font-bold text-gray-900 dark:text-white">{invoices.length}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-2 md:p-3 rounded-lg">
              <CreditCard className="w-4 h-4 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">درآمد کل</p>
              <p className="responsive-text-2xl font-bold text-green-600 dark:text-green-400">
                {(getTotalRevenue() / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 md:p-3 rounded-lg">
              <DollarSign className="w-4 h-4 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">در انتظار پرداخت</p>
              <p className="responsive-text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {(getPendingAmount() / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 md:p-3 rounded-lg">
              <Calendar className="w-4 h-4 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">پرداخت شده</p>
              <p className="responsive-text-2xl font-bold text-blue-600 dark:text-blue-400">
                {invoices.filter(inv => inv.status === 'paid').length}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 md:p-3 rounded-lg">
              <CreditCard className="w-4 h-4 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
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
            placeholder="جستجو بر اساس شماره فاکتور، مشتری یا پلاک..."
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
          <option value="draft">پیش‌نویس</option>
          <option value="sent">ارسال شده</option>
          <option value="paid">پرداخت شده</option>
          <option value="overdue">معوقه</option>
        </select>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 mb-6 border-responsive">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingInvoice ? 'ویرایش فاکتور' : 'ایجاد فاکتور جدید'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer and Vehicle Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  تاریخ سررسید
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  آیتم‌های فاکتور *
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-red-500 hover:text-red-600 text-sm flex items-center space-x-1 space-x-reverse"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن آیتم</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <select
                        value={item.type}
                        onChange={(e) => updateItem(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                      >
                        <option value="service">خدمت</option>
                        <option value="part">قطعه</option>
                      </select>
                    </div>
                    
                    <div>
                      <input
                        type="text"
                        placeholder="شرح"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <input
                        type="number"
                        placeholder="تعداد"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <input
                        type="number"
                        placeholder="قیمت واحد"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                        required
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {(item.quantity * item.unitPrice).toLocaleString()} تومان
                      </span>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    تخفیف (تومان)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>جمع کل:</span>
                      <span>{calculateTotals(formData.items, 0).subtotal.toLocaleString()} تومان</span>
                    </div>
                    <div className="flex justify-between">
                      <span>مالیات (9%):</span>
                      <span>{calculateTotals(formData.items, 0).tax.toLocaleString()} تومان</span>
                    </div>
                    <div className="flex justify-between">
                      <span>تخفیف:</span>
                      <span>-{formData.discount.toLocaleString()} تومان</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>مبلغ نهایی:</span>
                      <span>{calculateTotals(formData.items, formData.discount).total.toLocaleString()} تومان</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
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

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
              <button type="submit" className="btn-success text-sm">
                {editingInvoice ? 'ویرایش' : 'ثبت'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingInvoice(null);
                }}
                className="btn-secondary text-sm"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-responsive">
        <div className="table-responsive">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  شماره فاکتور
                </th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  مشتری
                </th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  خودرو
                </th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  مبلغ
                </th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  وضعیت
                </th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  تاریخ
                </th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInvoices.map((invoice) => {
                const customer = customers.find(c => c.id === invoice.customerId);
                const vehicle = vehicles.find(v => v.id === invoice.vehicleId);
                
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full ml-3">
                          <CreditCard className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {invoice.invoiceNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(invoice.createdAt).toLocaleDateString('fa-IR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 ml-1" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {customer?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car className="w-4 h-4 text-gray-400 ml-1" />
                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {vehicle?.plateNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {vehicle?.model}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {invoice.total.toLocaleString()} تومان
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value as Invoice['status'])}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(invoice.status)}`}
                      >
                        <option value="draft">پیش‌نویس</option>
                        <option value="sent">ارسال شده</option>
                        <option value="paid">پرداخت شده</option>
                        <option value="overdue">معوقه</option>
                      </select>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fa-IR') : '-'}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => {
                            addNotification({
                              title: 'مشاهده فاکتور',
                              message: `فاکتور ${invoice.invoiceNumber} نمایش داده شد`,
                              type: 'info'
                            });
                            
                            // ایجاد یک پنجره جدید برای نمایش فاکتور
                            const printWindow = window.open('', '_blank');
                            if (!printWindow) return;
                            
                            const customer = customers.find(c => c.id === invoice.customerId);
                            const vehicle = vehicles.find(v => v.id === invoice.vehicleId);
                            
                            // ایجاد محتوای HTML
                            printWindow.document.write(`
                              <html dir="rtl">
                              <head>
                                <title>فاکتور ${invoice.invoiceNumber}</title>
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
                                    max-width: 800px;
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
                                    color: #dc2626;
                                  }
                                  .invoice-info {
                                    display: flex;
                                    justify-content: space-between;
                                    margin-bottom: 20px;
                                  }
                                  .invoice-info div {
                                    flex: 1;
                                  }
                                  .section { 
                                    margin-bottom: 20px; 
                                    border: 1px solid #ddd; 
                                    padding: 10px; 
                                    border-radius: 5px; 
                                  }
                                  .title { 
                                    font-weight: bold; 
                                    margin-bottom: 10px; 
                                    color: #dc2626;
                                  }
                                  table {
                                    width: 100%;
                                    border-collapse: collapse;
                                  }
                                  th, td {
                                    border: 1px solid #ddd;
                                    padding: 8px;
                                    text-align: right;
                                  }
                                  th {
                                    background-color: #f2f2f2;
                                  }
                                  .total-row {
                                    font-weight: bold;
                                    background-color: #f9f9f9;
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
                                  }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <h1>فاکتور فروش</h1>
                                  <p>تعمیرگاه تویوتا احمدی</p>
                                </div>
                                
                                <div class="invoice-info">
                                  <div>
                                    <p><strong>شماره فاکتور:</strong> ${invoice.invoiceNumber}</p>
                                    <p><strong>تاریخ صدور:</strong> ${new Date(invoice.createdAt).toLocaleDateString('fa-IR')}</p>
                                    <p><strong>تاریخ سررسید:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fa-IR') : 'ندارد'}</p>
                                  </div>
                                  <div>
                                    <p><strong>مشتری:</strong> ${customer?.name || 'نامشخص'}</p>
                                    <p><strong>تلفن:</strong> ${customer?.phone || 'نامشخص'}</p>
                                    <p><strong>خودرو:</strong> ${vehicle?.plateNumber || 'نامشخص'} - ${vehicle?.model || 'نامشخص'}</p>
                                  </div>
                                </div>
                                
                                <div class="section">
                                  <div class="title">اقلام فاکتور</div>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>ردیف</th>
                                        <th>شرح</th>
                                        <th>نوع</th>
                                        <th>تعداد</th>
                                        <th>قیمت واحد (تومان)</th>
                                        <th>قیمت کل (تومان)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${invoice.items.map((item, index) => `
                                        <tr>
                                          <td>${index + 1}</td>
                                          <td>${item.description}</td>
                                          <td>${item.type === 'service' ? 'خدمت' : 'قطعه'}</td>
                                          <td>${item.quantity}</td>
                                          <td>${item.unitPrice.toLocaleString()}</td>
                                          <td>${item.total.toLocaleString()}</td>
                                        </tr>
                                      `).join('')}
                                    </tbody>
                                  </table>
                                </div>
                                
                                <div class="section">
                                  <div class="title">خلاصه فاکتور</div>
                                  <table>
                                    <tbody>
                                      <tr>
                                        <td>جمع کل:</td>
                                        <td>${invoice.subtotal.toLocaleString()} تومان</td>
                                      </tr>
                                      <tr>
                                        <td>مالیات (9%):</td>
                                        <td>${invoice.tax.toLocaleString()} تومان</td>
                                      </tr>
                                      <tr>
                                        <td>تخفیف:</td>
                                        <td>${invoice.discount.toLocaleString()} تومان</td>
                                      </tr>
                                      <tr class="total-row">
                                        <td>مبلغ قابل پرداخت:</td>
                                        <td>${invoice.total.toLocaleString()} تومان</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                                
                                ${invoice.notes ? `
                                <div class="section">
                                  <div class="title">توضیحات</div>
                                  <p>${invoice.notes}</p>
                                </div>
                                ` : ''}
                                
                                <div class="buttons">
                                  <button class="btn btn-print" onclick="window.print()">چاپ فاکتور</button>
                                  <button class="btn btn-close" onclick="window.close()">بستن</button>
                                </div>
                              </body>
                              </html>
                            `);
                            
                            printWindow.document.close();
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="مشاهده"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="ویرایش"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            // ایجاد یک عنصر a برای دانلود
                            const customer = customers.find(c => c.id === invoice.customerId);
                            const vehicle = vehicles.find(v => v.id === invoice.vehicleId);
                            
                            // ایجاد محتوای HTML
                            const html = `
                              <html dir="rtl">
                              <head>
                                <title>فاکتور ${invoice.invoiceNumber}</title>
                                <style>
                                  @font-face {
                                    font-family: 'Vazirmatn';
                                    src: url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Regular.woff2') format('woff2');
                                  }
                                  body { 
                                    font-family: 'Vazirmatn', sans-serif; 
                                    padding: 20px; 
                                    direction: rtl;
                                    max-width: 800px;
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
                                    color: #dc2626;
                                  }
                                  .invoice-info {
                                    display: flex;
                                    justify-content: space-between;
                                    margin-bottom: 20px;
                                  }
                                  .invoice-info div {
                                    flex: 1;
                                  }
                                  .section { 
                                    margin-bottom: 20px; 
                                    border: 1px solid #ddd; 
                                    padding: 10px; 
                                    border-radius: 5px; 
                                  }
                                  .title { 
                                    font-weight: bold; 
                                    margin-bottom: 10px; 
                                    color: #dc2626;
                                  }
                                  table {
                                    width: 100%;
                                    border-collapse: collapse;
                                  }
                                  th, td {
                                    border: 1px solid #ddd;
                                    padding: 8px;
                                    text-align: right;
                                  }
                                  th {
                                    background-color: #f2f2f2;
                                  }
                                  .total-row {
                                    font-weight: bold;
                                    background-color: #f9f9f9;
                                  }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <h1>فاکتور فروش</h1>
                                  <p>تعمیرگاه تویوتا احمدی</p>
                                </div>
                                
                                <div class="invoice-info">
                                  <div>
                                    <p><strong>شماره فاکتور:</strong> ${invoice.invoiceNumber}</p>
                                    <p><strong>تاریخ صدور:</strong> ${new Date(invoice.createdAt).toLocaleDateString('fa-IR')}</p>
                                    <p><strong>تاریخ سررسید:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fa-IR') : 'ندارد'}</p>
                                  </div>
                                  <div>
                                    <p><strong>مشتری:</strong> ${customer?.name || 'نامشخص'}</p>
                                    <p><strong>تلفن:</strong> ${customer?.phone || 'نامشخص'}</p>
                                    <p><strong>خودرو:</strong> ${vehicle?.plateNumber || 'نامشخص'} - ${vehicle?.model || 'نامشخص'}</p>
                                  </div>
                                </div>
                                
                                <div class="section">
                                  <div class="title">اقلام فاکتور</div>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>ردیف</th>
                                        <th>شرح</th>
                                        <th>نوع</th>
                                        <th>تعداد</th>
                                        <th>قیمت واحد (تومان)</th>
                                        <th>قیمت کل (تومان)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${invoice.items.map((item, index) => `
                                        <tr>
                                          <td>${index + 1}</td>
                                          <td>${item.description}</td>
                                          <td>${item.type === 'service' ? 'خدمت' : 'قطعه'}</td>
                                          <td>${item.quantity}</td>
                                          <td>${item.unitPrice.toLocaleString()}</td>
                                          <td>${item.total.toLocaleString()}</td>
                                        </tr>
                                      `).join('')}
                                    </tbody>
                                  </table>
                                </div>
                                
                                <div class="section">
                                  <div class="title">خلاصه فاکتور</div>
                                  <table>
                                    <tbody>
                                      <tr>
                                        <td>جمع کل:</td>
                                        <td>${invoice.subtotal.toLocaleString()} تومان</td>
                                      </tr>
                                      <tr>
                                        <td>مالیات (9%):</td>
                                        <td>${invoice.tax.toLocaleString()} تومان</td>
                                      </tr>
                                      <tr>
                                        <td>تخفیف:</td>
                                        <td>${invoice.discount.toLocaleString()} تومان</td>
                                      </tr>
                                      <tr class="total-row">
                                        <td>مبلغ قابل پرداخت:</td>
                                        <td>${invoice.total.toLocaleString()} تومان</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                                
                                ${invoice.notes ? `
                                <div class="section">
                                  <div class="title">توضیحات</div>
                                  <p>${invoice.notes}</p>
                                </div>
                                ` : ''}
                                
                                <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                                  <div style="text-align: center; border-top: 1px solid #000; padding-top: 10px; width: 200px;">امضای مشتری</div>
                                  <div style="text-align: center; border-top: 1px solid #000; padding-top: 10px; width: 200px;">مهر و امضای تعمیرگاه</div>
                                </div>
                              </body>
                              </html>
                            `;
                            
                            const blob = new Blob([html], { type: 'text/html' });
                            const url = URL.createObjectURL(blob);
                            
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `فاکتور_${invoice.invoiceNumber}.html`;
                            document.body.appendChild(a);
                            a.click();
                            
                            // پاکسازی
                            setTimeout(() => {
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }, 100);
                            
                            addNotification({
                              title: 'دانلود فاکتور',
                              message: `فاکتور ${invoice.invoiceNumber} دانلود شد`,
                              type: 'success'
                            });
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="دانلود PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            // تغییر وضعیت فاکتور به ارسال شده
                            handleStatusChange(invoice.id, 'sent');
                            
                            addNotification({
                              title: 'ارسال فاکتور',
                              message: `فاکتور ${invoice.invoiceNumber} ارسال شد`,
                              type: 'success'
                            });
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="ارسال"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id, invoice.invoiceNumber)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="حذف"
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

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            فاکتوری یافت نشد
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            هیچ فاکتوری با فیلترهای انتخابی یافت نشد
          </p>
        </div>
      )}
    </div>
  );
}
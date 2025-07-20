import React, { useState } from 'react';
import { MessageSquare, Mail, Send, Users, Clock, CheckCircle, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface Message {
  id: string;
  type: 'sms' | 'email';
  subject?: string;
  content: string;
  recipients: string[];
  status: 'draft' | 'sent' | 'scheduled';
  sentAt?: string;
  scheduledAt?: string;
  createdAt: string;
  template?: boolean;
}

interface Template {
  id: string;
  name: string;
  type: 'sms' | 'email';
  subject?: string;
  content: string;
  category: string;
  createdAt: string;
}

export default function SMSEmailManagement() {
  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'templates'>('send');
  const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'sms',
      content: 'خودرو شما آماده تحویل است. لطفاً برای دریافت تماس بگیرید.',
      recipients: ['09123456789'],
      status: 'sent',
      sentAt: '2024-01-15T10:30:00',
      createdAt: '2024-01-15T10:25:00'
    },
    {
      id: '2',
      type: 'email',
      subject: 'یادآوری سرویس خودرو',
      content: 'زمان سرویس دوره‌ای خودرو شما فرا رسیده است. برای نوبت‌گیری تماس بگیرید.',
      recipients: ['customer@email.com'],
      status: 'sent',
      sentAt: '2024-01-14T14:20:00',
      createdAt: '2024-01-14T14:15:00'
    }
  ]);

  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'آماده تحویل',
      type: 'sms',
      content: 'خودرو شما آماده تحویل است. لطفاً برای دریافت تماس بگیرید.',
      category: 'تحویل',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'یادآوری سرویس',
      type: 'email',
      subject: 'یادآوری سرویس خودرو',
      content: 'زمان سرویس دوره‌ای خودرو شما فرا رسیده است. برای نوبت‌گیری تماس بگیرید.',
      category: 'یادآوری',
      createdAt: '2024-01-01'
    }
  ]);

  const [formData, setFormData] = useState({
    type: 'sms' as 'sms' | 'email',
    subject: '',
    content: '',
    recipients: '',
    scheduledAt: ''
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'sms' as 'sms' | 'email',
    subject: '',
    content: '',
    category: ''
  });

  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { customers } = useData();
  const { addNotification } = useNotifications();

  const categories = ['تحویل', 'یادآوری', 'تبریک', 'اطلاع‌رسانی', 'تشکر', 'سایر'];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recipientList = formData.recipients.split(',').map(r => r.trim()).filter(r => r);
    
    if (recipientList.length === 0) {
      addNotification({
        title: 'خطا',
        message: 'لطفاً حداقل یک گیرنده وارد کنید',
        type: 'error'
      });
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      ...formData,
      recipients: recipientList,
      status: formData.scheduledAt ? 'scheduled' : 'sent',
      sentAt: formData.scheduledAt ? undefined : new Date().toISOString(),
      scheduledAt: formData.scheduledAt || undefined,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [newMessage, ...prev]);
    
    addNotification({
      title: formData.scheduledAt ? 'پیام زمان‌بندی شد' : 'پیام ارسال شد',
      message: `پیام ${formData.type === 'sms' ? 'پیامکی' : 'ایمیل'} با موفقیت ${formData.scheduledAt ? 'زمان‌بندی' : 'ارسال'} شد`,
      type: 'success'
    });

    setFormData({
      type: 'sms',
      subject: '',
      content: '',
      recipients: '',
      scheduledAt: ''
    });
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTemplate: Template = {
      id: Date.now().toString(),
      ...templateForm,
      createdAt: new Date().toISOString()
    };

    if (editingTemplate) {
      setTemplates(prev => prev.map(template => 
        template.id === editingTemplate ? { ...template, ...templateForm } : template
      ));
      addNotification({
        title: 'قالب ویرایش شد',
        message: `قالب ${templateForm.name} با موفقیت به‌روزرسانی شد`,
        type: 'success'
      });
      setEditingTemplate(null);
    } else {
      setTemplates(prev => [newTemplate, ...prev]);
      addNotification({
        title: 'قالب جدید ایجاد شد',
        message: `قالب ${templateForm.name} با موفقیت ثبت شد`,
        type: 'success'
      });
    }
    
    setTemplateForm({
      name: '',
      type: 'sms',
      subject: '',
      content: '',
      category: ''
    });
    setShowTemplateForm(false);
  };

  const useTemplate = (template: Template) => {
    setFormData({
      type: template.type,
      subject: template.subject || '',
      content: template.content,
      recipients: '',
      scheduledAt: ''
    });
    setActiveTab('send');
    addNotification({
      title: 'قالب بارگذاری شد',
      message: `قالب ${template.name} در فرم ارسال بارگذاری شد`,
      type: 'info'
    });
  };

  const deleteTemplate = (templateId: string, templateName: string) => {
    if (confirm(`آیا از حذف قالب "${templateName}" اطمینان دارید؟`)) {
      setTemplates(prev => prev.filter(template => template.id !== templateId));
      addNotification({
        title: 'قالب حذف شد',
        message: `قالب ${templateName} حذف شد`,
        type: 'warning'
      });
    }
  };

  const editTemplate = (template: Template) => {
    setTemplateForm({
      name: template.name,
      type: template.type,
      subject: template.subject || '',
      content: template.content,
      category: template.category
    });
    setEditingTemplate(template.id);
    setShowTemplateForm(true);
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return 'ارسال شده';
      case 'scheduled':
        return 'زمان‌بندی شده';
      case 'draft':
        return 'پیش‌نویس';
      default:
        return 'نامشخص';
    }
  };

  return (
    <div className="p-responsive">
      <div className="mb-6">
        <h2 className="responsive-text-2xl font-bold text-gray-900 dark:text-white mb-2">
          مدیریت پیامک و ایمیل
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          ارسال پیامک و ایمیل به مشتریان
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid-responsive mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">کل پیام‌ها</p>
              <p className="responsive-text-2xl font-bold text-gray-900 dark:text-white">{messages.length}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-2 md:p-3 rounded-lg">
              <MessageSquare className="w-4 h-4 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">ارسال شده</p>
              <p className="responsive-text-2xl font-bold text-green-600 dark:text-green-400">
                {messages.filter(m => m.status === 'sent').length}
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
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">زمان‌بندی شده</p>
              <p className="responsive-text-2xl font-bold text-blue-600 dark:text-blue-400">
                {messages.filter(m => m.status === 'scheduled').length}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 md:p-3 rounded-lg">
              <Clock className="w-4 h-4 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border-responsive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">قالب‌ها</p>
              <p className="responsive-text-2xl font-bold text-purple-600 dark:text-purple-400">{templates.length}</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 md:p-3 rounded-lg">
              <Mail className="w-4 h-4 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border-responsive mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 space-x-reverse px-4 md:px-6">
            {[
              { id: 'send', label: 'ارسال پیام', icon: Send },
              { id: 'history', label: 'تاریخچه', icon: Clock },
              { id: 'templates', label: 'قالب‌ها', icon: Mail }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 space-x-reverse py-4 px-1 border-b-2 font-medium text-sm ${
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

        <div className="p-4 md:p-6">
          {/* Send Message Tab */}
          {activeTab === 'send' && (
            <form onSubmit={handleSendMessage} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    نوع پیام
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'sms' | 'email' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="sms">پیامک</option>
                    <option value="email">ایمیل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    زمان‌بندی (اختیاری)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>

              {formData.type === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    موضوع *
                  </label>
                  <input
                    type="text"
                    required={formData.type === 'email'}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    placeholder="موضوع ایمیل"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  متن پیام *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={formData.type === 'sms' ? 3 : 6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  placeholder={formData.type === 'sms' ? 'متن پیامک (حداکثر 160 کاراکتر)' : 'متن ایمیل'}
                  maxLength={formData.type === 'sms' ? 160 : undefined}
                />
                {formData.type === 'sms' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.content.length}/160 کاراکتر
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  گیرندگان *
                </label>
                <textarea
                  required
                  value={formData.recipients}
                  onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  placeholder={formData.type === 'sms' ? 'شماره تماس‌ها (با کاما جدا کنید)' : 'آدرس‌های ایمیل (با کاما جدا کنید)'}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.type === 'sms' ? 'مثال: 09123456789, 09987654321' : 'مثال: user1@email.com, user2@email.com'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
                <button type="submit" className="btn-primary text-sm">
                  {formData.scheduledAt ? 'زمان‌بندی پیام' : 'ارسال پیام'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({
                    type: 'sms',
                    subject: '',
                    content: '',
                    recipients: '',
                    scheduledAt: ''
                  })}
                  className="btn-secondary text-sm"
                >
                  پاک کردن
                </button>
              </div>
            </form>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className={`p-2 rounded-lg ${
                        message.type === 'sms' 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {message.type === 'sms' ? (
                          <MessageSquare className={`w-4 h-4 ${
                            message.type === 'sms' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-blue-600 dark:text-blue-400'
                          }`} />
                        ) : (
                          <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {message.type === 'sms' ? 'پیامک' : 'ایمیل'}
                          {message.subject && ` - ${message.subject}`}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {message.recipients.length} گیرنده
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                      {getStatusText(message.status)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {message.content}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {message.status === 'sent' && message.sentAt && 
                        `ارسال شده: ${new Date(message.sentAt).toLocaleString('fa-IR')}`
                      }
                      {message.status === 'scheduled' && message.scheduledAt && 
                        `زمان‌بندی: ${new Date(message.scheduledAt).toLocaleString('fa-IR')}`
                      }
                    </span>
                    <span>
                      ایجاد: {new Date(message.createdAt).toLocaleString('fa-IR')}
                    </span>
                  </div>
                </div>
              ))}
              
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    پیامی یافت نشد
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    هنوز هیچ پیامی ارسال نشده است
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="جستجو در قالب‌ها..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    setShowTemplateForm(true);
                    setEditingTemplate(null);
                    setTemplateForm({
                      name: '',
                      type: 'sms',
                      subject: '',
                      content: '',
                      category: ''
                    });
                  }}
                  className="btn-primary flex items-center space-x-2 space-x-reverse text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>قالب جدید</span>
                </button>
              </div>

              {/* Template Form */}
              {showTemplateForm && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                    {editingTemplate ? 'ویرایش قالب' : 'ایجاد قالب جدید'}
                  </h4>
                  <form onSubmit={handleSaveTemplate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          نام قالب *
                        </label>
                        <input
                          type="text"
                          required
                          value={templateForm.name}
                          onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                          placeholder="نام قالب"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          نوع
                        </label>
                        <select
                          value={templateForm.type}
                          onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value as 'sms' | 'email' })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        >
                          <option value="sms">پیامک</option>
                          <option value="email">ایمیل</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          دسته‌بندی
                        </label>
                        <select
                          value={templateForm.category}
                          onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        >
                          <option value="">انتخاب دسته‌بندی</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {templateForm.type === 'email' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          موضوع
                        </label>
                        <input
                          type="text"
                          value={templateForm.subject}
                          onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                          placeholder="موضوع ایمیل"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        متن قالب *
                      </label>
                      <textarea
                        required
                        value={templateForm.content}
                        onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        placeholder="متن قالب"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
                      <button type="submit" className="btn-success text-sm">
                        {editingTemplate ? 'ویرایش' : 'ذخیره'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowTemplateForm(false);
                          setEditingTemplate(null);
                        }}
                        className="btn-secondary text-sm"
                      >
                        انصراف
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Templates List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className={`p-2 rounded-lg ${
                          template.type === 'sms' 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          {template.type === 'sms' ? (
                            <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {template.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {template.category} • {template.type === 'sms' ? 'پیامک' : 'ایمیل'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {template.subject && (
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        موضوع: {template.subject}
                      </p>
                    )}
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {template.content}
                    </p>
                    
                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        onClick={() => useTemplate(template)}
                        className="flex-1 btn-primary text-xs py-2"
                      >
                        استفاده
                      </button>
                      <button
                        onClick={() => editTemplate(template)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id, template.name)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    قالبی یافت نشد
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    هیچ قالبی با فیلترهای انتخابی یافت نشد
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
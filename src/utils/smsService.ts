import notificationsData from '../data/settings/notifications.json';

interface SMSOptions {
  to: string;
  message: string;
}

/**
 * سرویس ارسال پیامک با استفاده از پنل فراز اس ام اس
 */
export const sendSMS = async (options: SMSOptions): Promise<boolean> => {
  try {
    const { smsPanel } = notificationsData;
    
    if (!smsPanel.isActive || !smsPanel.apiKey || !smsPanel.username || !smsPanel.password) {
      console.error('تنظیمات پنل پیامک کامل نیست');
      return false;
    }
    
    // در اینجا کد ارسال پیامک از طریق API فراز اس ام اس قرار می‌گیرد
    // این یک نمونه است و باید با API واقعی فراز اس ام اس جایگزین شود
    
    console.log(`ارسال پیامک به ${options.to}:`, options.message);
    console.log('با استفاده از پنل فراز اس ام اس');
    
    // شبیه‌سازی ارسال موفق
    return true;
  } catch (error) {
    console.error('خطا در ارسال پیامک:', error);
    return false;
  }
};

/**
 * ارسال پیامک پذیرش خودرو
 */
export const sendReceptionSMS = (customerName: string, phoneNumber: string, plateNumber: string, receptionNumber: string): Promise<boolean> => {
  const { smsTemplates } = notificationsData;
  
  // جایگزینی متغیرها در قالب پیامک
  const message = smsTemplates.reception
    .replace('{customerName}', customerName)
    .replace('{plateNumber}', plateNumber)
    .replace('{date}', new Date().toLocaleDateString('fa-IR'))
    .replace('{receptionNumber}', receptionNumber);
  
  return sendSMS({
    to: phoneNumber,
    message
  });
};

/**
 * ارسال پیامک تکمیل تعمیر
 */
export const sendCompletionSMS = (customerName: string, phoneNumber: string, plateNumber: string, totalCost: string): Promise<boolean> => {
  const { smsTemplates } = notificationsData;
  
  // جایگزینی متغیرها در قالب پیامک
  const message = smsTemplates.completion
    .replace('{customerName}', customerName)
    .replace('{plateNumber}', plateNumber)
    .replace('{totalCost}', totalCost);
  
  return sendSMS({
    to: phoneNumber,
    message
  });
};
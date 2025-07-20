/**
 * تبدیل اعداد انگلیسی به فارسی
 */
export const toPersianDigits = (n: number | string): string => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  
  return n
    .toString()
    .replace(/\d/g, x => farsiDigits[parseInt(x)]);
};

/**
 * فرمت کردن مبلغ به صورت پول
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('fa-IR')} تومان`;
};

/**
 * فرمت کردن اعداد با جداکننده هزارگان
 */
export const formatNumber = (num: number): string => {
  return toPersianDigits(num.toLocaleString('fa-IR'));
};

/**
 * فرمت کردن تاریخ
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fa-IR');
};

/**
 * فرمت کردن مدت زمان
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${toPersianDigits(hours)} ساعت و ${toPersianDigits(mins)} دقیقه`;
  } else if (hours > 0) {
    return `${toPersianDigits(hours)} ساعت`;
  } else {
    return `${toPersianDigits(mins)} دقیقه`;
  }
};
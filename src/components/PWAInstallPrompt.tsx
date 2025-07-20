import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // تشخیص دستگاه iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // ذخیره رویداد beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // بررسی اینکه آیا قبلاً این پیام را بسته‌ایم
      // در نسخه سرور، این اطلاعات در سرور ذخیره می‌شوند
      // فعلاً همیشه نمایش می‌دهیم
      const lastDismissed = null;
      
      // اگر کمتر از 7 روز از آخرین بستن گذشته، نمایش نده
      if (lastDismissed && (new Date().getTime() - lastDismissed.getTime() < 7 * 24 * 60 * 60 * 1000)) {
        return;
      }
      
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // بررسی اینکه آیا در iOS هستیم و آیا قبلاً این پیام را بسته‌ایم
    if (isIOSDevice) {
      // در نسخه سرور، این اطلاعات در سرور ذخیره می‌شوند
      // فعلاً همیشه نمایش می‌دهیم
      const lastDismissed = null;
      
      // اگر کمتر از 7 روز از آخرین بستن گذشته، نمایش نده
      if (!lastDismissed || (new Date().getTime() - lastDismissed.getTime() > 7 * 24 * 60 * 60 * 1000)) {
        setShowPrompt(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS) return;
    
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
    }
    
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    if (isIOS) {
      // در نسخه سرور، این اطلاعات در سرور ذخیره می‌شوند
      // فعلاً نیازی به ذخیره‌سازی نیست
    } else {
      // در نسخه سرور، این اطلاعات در سرور ذخیره می‌شوند
      // فعلاً نیازی به ذخیره‌سازی نیست
    }
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full mr-3">
            <Download className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">نصب اپلیکیشن</h3>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {isIOS 
          ? 'این برنامه را به صفحه اصلی خود اضافه کنید تا بتوانید به راحتی و بدون نیاز به مرورگر از آن استفاده کنید.'
          : 'این برنامه را نصب کنید تا بتوانید به راحتی و بدون نیاز به مرورگر از آن استفاده کنید.'}
      </p>
      
      {isIOS ? (
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <p className="flex items-center">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 mr-2">1</span>
            روی <span className="mx-1 px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">اشتراک‌گذاری</span> ضربه بزنید
          </p>
          <p className="flex items-center">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 mr-2">2</span>
            <span className="mx-1 px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">افزودن به صفحه اصلی</span> را انتخاب کنید
          </p>
        </div>
      ) : (
        <button
          onClick={handleInstallClick}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <Download className="w-4 h-4 ml-2" />
          نصب اپلیکیشن
        </button>
      )}
    </div>
  );
};

export default PWAInstallPrompt;
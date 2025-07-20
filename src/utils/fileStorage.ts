/**
 * سرویس ذخیره‌سازی فایل JSON
 * این سرویس برای خواندن و نوشتن در فایل‌های JSON از طریق API استفاده می‌شود
 */

// آدرس API
// در محیط توسعه از سرور محلی و در محیط تولید از API اصلی استفاده می‌کنیم
const API_URL = '/api.php';

// خواندن داده از فایل JSON
export const readJsonFile = async (filePath: string) => {
  try {
    console.log(`Reading file: ${filePath}`);
    
    // استخراج نام فایل از مسیر
    const fileName = filePath.replace('.json', '');

    let response;
    
    try {
      response = await fetch(`${API_URL}?file=${fileName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (fetchError) {
      console.error(`Fetch error for ${fileName}:`, fetchError);
      return getDefaultData(fileName);
    }
    
    if (!response.ok) {
      console.error(`Error reading file ${fileName}: ${response.status} ${response.statusText}`);
      return getDefaultData(fileName);
    }
    
    const data = await response.json();
    console.log(`File ${filePath} read successfully`);
    return data;
  } catch (error) {
    console.error(`خطا در خواندن داده ${filePath}:`, error);
    
    // اگر خطا رخ داد، یک ساختار پیش‌فرض برگردان
    return getDefaultData(filePath);
  }
};

// تابع کمکی برای ایجاد داده‌های پیش‌فرض
const getDefaultData = (filePath: string) => {
  const fileName = filePath.split('/').pop()?.replace('.json', '') || filePath;
  
  let defaultData: any = {};
  
  // Set default data based on file type
  if (fileName === 'users') {
    defaultData = {
      users: [{
        id: "1",
        username: "admin",
        password: "123456",
        name: "مدیر سیستم",
        role: "admin",
        isActive: true,
        createdAt: new Date().toISOString()
      }]
    };
  } else if (fileName === 'customers') {
    defaultData = { customers: [] };
  } else if (fileName === 'vehicles') {
    defaultData = { vehicles: [] };
  } else if (fileName === 'jobCards') {
    defaultData = { jobCards: [] };
  } else if (fileName === 'inventory') {
    defaultData = { inventory: [] };
  } else if (fileName === 'suppliers') {
    defaultData = { suppliers: [] };
  } else if (fileName === 'partRequests') {
    defaultData = { partRequests: [] };
  } else if (fileName === 'vehicleDamages') {
    defaultData = { vehicleDamages: [] };
  } else {
    // Default case for any other file
    defaultData[fileName] = [];
  }
  
  console.log(`Created default data for ${fileName}`);
  return defaultData;
};

// نوشتن داده در فایل JSON
export const writeJsonFile = async (filePath: string, data: any) => {
  try {
    console.log(`Writing file: ${filePath}`);
    
    // استخراج نام فایل از مسیر
    const fileName = filePath.replace('.json', '');

    try {
      const response = await fetch(`${API_URL}?file=${fileName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        console.error(`Error writing file ${fileName}: ${response.status} ${response.statusText}`);
        return { success: false, error: response.statusText };
      }
      
      const result = await response.json();
      console.log(`File ${filePath} written successfully`);
      return result;
    } catch (fetchError) {
      console.error(`Fetch error for ${fileName}:`, fetchError);
      return { success: false, error: fetchError.message };
    }
  } catch (error) {
    console.error(`خطا در نوشتن داده ${filePath}:`, error);
    throw error;
  }
};

// به‌روزرسانی داده در فایل JSON
export const updateJsonFile = async (filePath: string, callback: (data: any) => any) => {
  try {
    console.log(`Updating file: ${filePath}`);
    
    // ابتدا داده فعلی را بخوان
    const currentData = await readJsonFile(filePath);
    
    // callback را اعمال کن تا داده جدید را بگیری
    const updatedData = callback(currentData);
    
    // نوشتن داده جدید
    return await writeJsonFile(filePath, updatedData);
  } catch (error) {
    console.error(`خطا در به‌روزرسانی داده ${filePath}:`, error);
    throw error;
  }
};
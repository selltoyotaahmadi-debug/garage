/**
 * سرویس مدیریت اطلاعات خط و خش خودرو
 */

import { readJsonFile, writeJsonFile, updateJsonFile } from './fileStorage';

interface VehicleDamage {
  id: string;
  vehicleId: string;
  jobCardId: string;
  inspectionData: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * ذخیره اطلاعات خط و خش خودرو
 */
export const saveDamageInspection = async (vehicleId: string, jobCardId: string, inspectionData: string): Promise<any> => {
  try {
    console.log('Saving damage inspection for vehicle:', vehicleId);
    console.log('Job Card ID:', jobCardId || 'No job card ID provided'); 
    
    if (!vehicleId) {
      console.error('No vehicle ID provided');
      return false;
    }
    
    if (!inspectionData) {
      console.error('No inspection data provided');
      return false;
    }
    
    console.log('Inspection data length:', inspectionData.length);
    
    // Create a new damage inspection object
    const newDamage = {
      id: Date.now().toString(),
      vehicleId,
      jobCardId: jobCardId || 'no-job-card',
      inspectionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await updateJsonFile('vehicleDamages.json', (data) => {
      // اگر data خالی باشد، یک آرایه خالی ایجاد می‌کنیم
      const damages = data?.vehicleDamages || [];
      
      // اگر قبلاً برای این خودرو خط و خش ثبت شده، آن را به‌روزرسانی کنیم
      const existingIndex = damages.findIndex((d: VehicleDamage) => d.vehicleId === vehicleId);
      if (existingIndex >= 0) {
        const updatedDamages = [...damages];
        updatedDamages[existingIndex] = newDamage;
        return { 
          ...(data || {}), 
          vehicleDamages: updatedDamages 
        };
      }
      
      // در غیر این صورت، یک مورد جدید اضافه کنیم
      return { 
        ...(data || {}), 
        vehicleDamages: [...damages, newDamage] 
      };
    });
    
    console.log('Damage inspection saved successfully');
    return result;
  } catch (error) {
    console.error('Error saving damage inspection:', error);
    return false;
  }
};

/**
 * دریافت اطلاعات خط و خش خودرو
 */
export const getDamageInspection = async (vehicleId: string): Promise<VehicleDamage | null> => {
  try {
    const data = await readJsonFile('vehicleDamages.json');
    
    if (!data || !data.vehicleDamages || !data.vehicleDamages.length) {
      console.log('No damage inspections found');
      return null;
    }
    
    const damages = data.vehicleDamages as VehicleDamage[];
    // Get the most recent damage inspection
    const result = damages
      .filter(d => d.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;
      
    console.log('Found damage inspection:', result ? 'yes' : 'no');
    return result;
  } catch (error) {
    console.error('Error getting damage inspection:', error);
    return null;
  }
};

/**
 * دریافت تمام اطلاعات خط و خش خودرو
 */
export const getAllDamageInspections = async (vehicleId: string): Promise<VehicleDamage[]> => {
  try {
    const data = await readJsonFile('vehicleDamages.json');
    if (!data || !data.vehicleDamages || !data.vehicleDamages.length) return [];
    
    const damages = data.vehicleDamages as VehicleDamage[];
    return damages
      .filter(d => d.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error getting all damage inspections:', error);
    return [];
  }
};

/**
 * به‌روزرسانی اطلاعات خط و خش خودرو
 */
export const updateDamageInspection = async (damageId: string, inspectionData: string): Promise<boolean> => {
  try {
    return await updateJsonFile('vehicleDamages.json', (data) => {
      if (!data || !data.vehicleDamages) {
        return { vehicleDamages: [] };
      }
      
      const damages = data.vehicleDamages as VehicleDamage[];
      const updatedDamages = damages.map(damage => 
        damage.id === damageId 
          ? { ...damage, inspectionData, updatedAt: new Date().toISOString() } 
          : damage
      );
      
      return { ...data, vehicleDamages: updatedDamages };
    });
  } catch (error) {
    console.error('Error updating damage inspection:', error);
    return false;
  }
};
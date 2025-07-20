import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { readJsonFile, updateJsonFile, writeJsonFile } from '../utils/fileStorage';
import { toast } from 'react-toastify';

// تعریف یک تایمر برای ذخیره خودکار داده‌ها
let autoSaveTimer: NodeJS.Timeout | null = null;

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Vehicle {
  id: string;
  customerId: string;
  mechanicId?: string;
  fuelLevel?: number;
  odometer?: number;
  receptionDate?: string;
  plateNumber: string;
  model: string;
  year: number;
  vin?: string;
  color: string;
  status: 'available' | 'in_repair' | 'delivered';
  laborCosts?: LaborCost[];
  description?: string;
}

export interface JobCard {
  id: string;
  vehicleId: string;
  customerId: string;
  mechanicId: string;
  status: 'pending' | 'in_progress' | 'completed';
  description: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  issues: string[];
  partsUsed: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  laborCosts: LaborCost[];
  totalCost: number;
  mechanicName: string;
}

export interface LaborCost {
  id: string;
  title: string;
  description?: string;
  hours: number;
  hourlyRate: number;
  totalCost: number;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  quantity: number;
  minQuantity: number;
  price: number;
  supplierId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  createdAt: string;
  isActive: boolean;
}

export interface PartRequest {
  id: string;
  mechanicId: string;
  vehicleId: string;
  parts: {
    name: string;
    quantity: number;
    urgency: 'low' | 'medium' | 'high';
    notes?: string;
  }[];
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

interface DataContextType {
  customers: Customer[];
  vehicles: Vehicle[];
  jobCards: JobCard[];
  partRequests: PartRequest[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addJobCard: (jobCard: Omit<JobCard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJobCard: (id: string, jobCard: Partial<JobCard>) => void;
  deleteJobCard: (id: string) => void;
  updatePartRequest: (id: string, request: Partial<PartRequest>) => void;
  addPartRequest: (request: Omit<PartRequest, 'id' | 'requestedAt'>) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  getLowStockItems: () => InventoryItem[];
  getCustomerVehicles: (customerId: string) => Vehicle[];
  getPendingPartRequests: () => PartRequest[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [partRequests, setPartRequests] = useState<PartRequest[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    // بارگذاری داده‌ها از سرور
    const loadData = async () => {
      console.log("Loading data from server...");
      try {
        setIsLoading(true);
        setError(null);
        
        // بارگذاری همزمان تمام داده‌ها
        const [
          customersData,
          vehiclesData,
          jobCardsData,
          partRequestsData,
          inventoryData,
          suppliersData
        ] = await Promise.all([
          readJsonFile('customers.json'),
          readJsonFile('vehicles.json'),
          readJsonFile('jobCards.json'),
          readJsonFile('partRequests.json'),
          readJsonFile('inventory.json'),
          readJsonFile('suppliers.json')
        ]);
        
        // تنظیم داده‌ها در state
        if (customersData && customersData.customers) setCustomers(customersData.customers);
        if (vehiclesData && vehiclesData.vehicles) setVehicles(vehiclesData.vehicles);
        if (jobCardsData && jobCardsData.jobCards) setJobCards(jobCardsData.jobCards);
        if (partRequestsData && partRequestsData.partRequests) setPartRequests(partRequestsData.partRequests);
        if (inventoryData && inventoryData.inventory) setInventory(inventoryData.inventory);
        if (suppliersData && suppliersData.suppliers) setSuppliers(suppliersData.suppliers);
        
        console.log("All data loaded successfully");
      } catch (error) {
        console.error("Error loading data:", error);
        setError("خطا در بارگذاری اطلاعات. لطفاً صفحه را مجدداً بارگذاری کنید.");
        toast.error("خطا در بارگذاری اطلاعات");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // تنظیم ذخیره خودکار داده‌ها هر 60 ثانیه
    const saveInterval = setInterval(() => {
      saveAllData();
    }, 60000);
    
    return () => clearInterval(saveInterval);
  }, []);

  // ذخیره همه داده‌ها
  const saveAllData = async () => {
    console.log("Saving all data to JSON files...");
    let success = true;

    try {
      await Promise.all([
        writeJsonFile('customers.json', { customers }),
        writeJsonFile('vehicles.json', { vehicles }),
        writeJsonFile('jobCards.json', { jobCards }),
        writeJsonFile('partRequests.json', { partRequests }),
        writeJsonFile('inventory.json', { inventory }),
        writeJsonFile('suppliers.json', { suppliers })
      ]);
      console.log("All data saved successfully");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error(`خطا در ذخیره اطلاعات: ${error.message || 'خطای ناشناخته'}`);
      success = false;
    }
    
    return success;
  };

  // Customer operations
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<string> => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    
    try {
      await writeJsonFile('customers.json', { customers: updatedCustomers });
      toast.success(`مشتری ${customerData.name} با موفقیت اضافه شد`);
      return newCustomer.id;
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error(`خطا در ثبت مشتری: ${error.message}`);
      return newCustomer.id; // حتی در صورت خطا، شناسه را برگردان
    }
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    const updatedCustomers = customers.map(customer =>
      customer.id === id ? { ...customer, ...customerData } : customer
    );
    setCustomers(updatedCustomers);
    writeJsonFile('customers.json', { customers: updatedCustomers })
      .then(() => toast.success(`اطلاعات مشتری با موفقیت به‌روزرسانی شد`));
  };

  const deleteCustomer = (id: string) => {
    const updatedCustomers = customers.filter(customer => customer.id !== id);
    setCustomers(updatedCustomers);
    writeJsonFile('customers.json', { customers: updatedCustomers })
      .then(() => toast.warning(`مشتری با موفقیت حذف شد`));
  };

  // Vehicle operations
  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'createdAt'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      receptionDate: new Date().toISOString(),
      mechanicId: '',
      laborCosts: [],
      id: Date.now().toString(),
    };
    const updatedVehicles = [...vehicles, newVehicle];
    setVehicles(updatedVehicles);
    
    try {
      await writeJsonFile('vehicles.json', { vehicles: updatedVehicles });
      toast.success(`خودرو با موفقیت ثبت شد`);
      return newVehicle.id;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error(`خطا در ثبت خودرو: ${error.message}`);
      return newVehicle.id; // حتی در صورت خطا، شناسه را برگردان
    }
  };

  const updateVehicle = (id: string, vehicleData: Partial<Vehicle>) => {
    const updatedVehicles = vehicles.map(vehicle =>
      vehicle.id === id ? { ...vehicle, ...vehicleData } : vehicle
    );
    setVehicles(updatedVehicles);
    writeJsonFile('vehicles.json', { vehicles: updatedVehicles })
      .then(() => {
        toast.success(`اطلاعات خودرو با موفقیت به‌روزرسانی شد`);
        console.log("Vehicle updated:", id, vehicleData);
      });
  };

  const deleteVehicle = (id: string) => {
    const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== id);
    setVehicles(updatedVehicles);
    writeJsonFile('vehicles.json', { vehicles: updatedVehicles })
      .then(() => toast.warning(`خودرو با موفقیت حذف شد`));
  };

  // JobCard operations
  const addJobCard = (jobCardData: Omit<JobCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newJobCard: JobCard = {
      ...jobCardData,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    const updatedJobCards = [...jobCards, newJobCard];
    setJobCards(updatedJobCards);
    writeJsonFile('jobCards.json', { jobCards: updatedJobCards })
      .then(() => toast.success(`کارت کاری جدید با موفقیت ایجاد شد`));
  };

  const updateJobCard = (id: string, jobCardData: Partial<JobCard>) => {
    const updatedJobCards = jobCards.map(jobCard =>
      jobCard.id === id ? { 
        ...jobCard, 
        ...jobCardData,
        updatedAt: new Date().toISOString(),
        completedAt: jobCardData.status === 'completed' && !jobCard.completedAt ? new Date().toISOString() : jobCard.completedAt
      } : jobCard
    );
    setJobCards(updatedJobCards);
    writeJsonFile('jobCards.json', { jobCards: updatedJobCards })
      .then(() => toast.success(`کارت کاری با موفقیت به‌روزرسانی شد`));
  };

  const deleteJobCard = (id: string) => {
    const updatedJobCards = jobCards.filter(jobCard => jobCard.id !== id);
    setJobCards(updatedJobCards);
    writeJsonFile('jobCards.json', { jobCards: updatedJobCards })
      .then(() => toast.warning(`کارت کاری با موفقیت حذف شد`));
  };

  const updatePartRequest = (id: string, requestData: Partial<PartRequest>) => {
    const updatedRequests = partRequests.map(request =>
      request.id === id ? { 
        ...request, 
        ...requestData,
        processedAt: requestData.status !== request.status ? new Date().toISOString() : request.processedAt
      } : request
    );
    setPartRequests(updatedRequests);
    writeJsonFile('partRequests.json', { partRequests: updatedRequests })
      .then(() => toast.success(`درخواست قطعه با موفقیت به‌روزرسانی شد`));
  };

  // Part request operations
  const addPartRequest = (requestData: Omit<PartRequest, 'id' | 'requestedAt'>) => {
    const newRequest: PartRequest = {
      ...requestData,
      id: Date.now().toString(),
      requestedAt: new Date().toISOString()
    };
    const updatedRequests = [...partRequests, newRequest];
    setPartRequests(updatedRequests);
    writeJsonFile('partRequests.json', { partRequests: updatedRequests })
      .then(() => toast.success(`درخواست قطعه با موفقیت ثبت شد`));
  };

  // Inventory operations
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedInventory = [...inventory, newItem];
    setInventory(updatedInventory);
    writeJsonFile('inventory.json', { inventory: updatedInventory })
      .then(() => toast.success(`قطعه ${itemData.name} با موفقیت به انبار اضافه شد`));
  };

  const updateInventoryItem = (id: string, itemData: Partial<InventoryItem>) => {
    const updatedInventory = inventory.map(item =>
      item.id === id ? { ...item, ...itemData, updatedAt: new Date().toISOString() } : item
    );
    setInventory(updatedInventory);
    writeJsonFile('inventory.json', { inventory: updatedInventory })
      .then(() => toast.success(`اطلاعات قطعه با موفقیت به‌روزرسانی شد`));
  };

  // دریافت اقلام با موجودی کم
  const getLowStockItems = () => {
    return inventory.filter(item => item.quantity <= item.minQuantity);
  };

  // Helper functions
  const getCustomerVehicles = (customerId: string) => {
    return vehicles.filter(vehicle => vehicle.customerId === customerId);
  };
  
  const getPendingPartRequests = () => {
    return partRequests.filter(request => request.status === 'pending');
  };
  
  return (
    <DataContext.Provider value={{
      isLoading,
      error,
      customers,
      vehicles,
      jobCards,
      partRequests,
      inventory,
      suppliers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      addJobCard,
      updateJobCard,
      deleteJobCard,
      addPartRequest,
      updatePartRequest,
      getPendingPartRequests,
      addInventoryItem,
      updateInventoryItem,
      getLowStockItems,
      getCustomerVehicles,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
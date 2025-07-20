import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { readJsonFile, writeJsonFile, updateJsonFile } from '../utils/fileStorage';
import { toast } from 'react-toastify';

interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: 'admin' | 'mechanic' | 'warehouse';
  isActive: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  users: User[];
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // بارگذاری لیست کاربران از فایل JSON
    const loadUsers = async () => {
      console.log("Loading users...");
      setIsLoading(true);
      try {
        console.log("Loading users...");
        
        // بارگذاری کاربران از فایل JSON
        const data = await readJsonFile('users.json');
        if (data && data.users) {
          console.log("Loaded users:", data.users);
          setUsers(data.users);

          // بارگذاری اطلاعات کاربر فعلی از فایل JSON
          try {
            const sessionData = await readJsonFile('session.json');
            if (sessionData && sessionData.currentUser) {
              // تأیید اعتبار کاربر ذخیره شده
              const validUser = data.users.find(u => u.id === sessionData.currentUser.id && u.isActive);
              if (validUser) {
                setUser(sessionData.currentUser);
              }
            }
          } catch (sessionError) {
            console.log("No active session found");
          }
        } else {
          console.log("No users found in data");
          setDefaultUsers();
        }
      } catch (error) {
        console.error("Error loading users:", error);
        setDefaultUsers();
      }
      
      setIsLoading(false);
    };
    
    loadUsers();
  }, []);

  // تنظیم کاربران پیش‌فرض
  const setDefaultUsers = () => {
    const defaultUsers = [
      {
        id: "1",
        username: "admin",
        password: "123456",
        name: "مدیر سیستم",
        role: "admin",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        username: "amir",
        password: "123456",
        name: "امیر اسد پور",
        role: "mechanic",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "3",
        username: "mohammad",
        password: "123456",
        name: "محمد ده ده بزرگی",
        role: "mechanic",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "4",
        username: "reza",
        password: "123456",
        name: "رضا کرمی",
        role: "mechanic",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "5",
        username: "arian",
        password: "123456",
        name: "آریان پیشرو",
        role: "warehouse",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "6",
        username: "sajad",
        password: "123456",
        name: "سجاد کیوان شکوه",
        role: "warehouse",
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
    setUsers(defaultUsers);
    try {
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    } catch (error) {
      console.error("Error setting default users in localStorage:", error);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log("Login attempt:", username, password);

      // شبیه‌سازی درخواست API
      await new Promise(resolve => setTimeout(resolve, 500));

      const foundUser = users.find(u => 
        u.username === username && 
        u.password === password && 
        u.isActive
      );
      console.log("Found user:", foundUser);
      
      if (foundUser) {
        try {
          // حذف رمز عبور از اطلاعات کاربر برای امنیت بیشتر
          const { password: _, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword as User);
          
          // ذخیره اطلاعات کاربر برای حفظ وضعیت ورود
          await writeJsonFile('session.json', { currentUser: userWithoutPassword });
          
          return true;
        } catch (error) {
          console.error('Error processing user data:', error);
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    // حذف اطلاعات نشست کاربر
    writeJsonFile('session.json', { currentUser: null })
      .catch(error => console.error('Error clearing session:', error));
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // ذخیره در فایل JSON
    try {
      // ذخیره کاربران
      updateJsonFile('users.json', (data) => {
        return { ...data, users: updatedUsers };
      });
    } catch (error) {
      console.error("Error updating users file:", error);
    }
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    const updatedUsers = users.map(user => 
      user.id === id ? { 
        ...user, 
        ...userData,
        // اگر رمز عبور تغییر نکرده، رمز قبلی را حفظ کن
        password: userData.password || user.password 
      } : user
    );
    
    setUsers(updatedUsers);
    
    // ذخیره در فایل JSON
    try {
      // ذخیره کاربران
      updateJsonFile('users.json', (data) => {
        return { ...data, users: updatedUsers };
      });
    
      // اگر کاربر فعلی ویرایش شده، اطلاعات آن را به‌روزرسانی کنیم
      if (user && user.id === id) {
        const { password: _, ...userDataWithoutPassword } = userData;
        const updatedUser = { ...user, ...userDataWithoutPassword };
        setUser(updatedUser);
        
        writeJsonFile('session.json', { currentUser: updatedUser })
          .catch(error => console.error('Error updating session:', error));
      }
    } catch (error) {
      console.error("Error updating session:", error);
    }
  };

  const deleteUser = (id: string) => {
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    
    // ذخیره در فایل JSON
    try {
      // ذخیره کاربران
      updateJsonFile('users.json', (data) => {
        return { ...data, users: updatedUsers };
      });
    } catch (error) {
      console.error("Error updating users file:", error);
    }
    
    // اگر کاربر فعلی حذف شده، خروج از سیستم
    if (user && user.id === id) {
      logout();
    }
  };

  const isAuthenticated = !!user;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      users,
      addUser,
      updateUser,
      deleteUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { RepairForm } from './components/RepairForm';
import { ReportView } from './components/ReportView';
import { PartsManager } from './components/PartsManager';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { RepairRecord, ViewState, Part, ProductModel, User } from './types';
import { DEFAULT_SPARE_PARTS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('dashboard');
  const [records, setRecords] = useState<RepairRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<RepairRecord | null>(null);
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);

  // Initialize parts from localStorage or default
  const [parts, setParts] = useState<Part[]>(() => {
    const savedParts = localStorage.getItem('robomate_parts_v1');
    return savedParts ? JSON.parse(savedParts) : DEFAULT_SPARE_PARTS;
  });

  // Load records from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('robomate_repairs_v1'); 
    if (saved) {
      setRecords(JSON.parse(saved));
    } else {
      // Seed data for demo
      const seed: RepairRecord[] = [
        {
          id: '1001',
          rmaNumber: 'RMA-2023-0892',
          productModel: ProductModel.Luba1,
          productArea: '3000',
          productName: 'Luba-19AF',
          customer: { name: 'John Doe', email: 'john@example.com', phone: '555-0123' },
          entryDate: '2023-10-15',
          status: 'Completed',
          partsActions: [
            { partId: 'm-wheel-r', action: 'replaced' },
            { partId: 'c-bumper', action: 'repaired' }
          ],
          technicianNotes: 'Right wheel motor seized due to debris, replaced. Front bumper was cracked but repairable with bonding agent.',
          aiReport: 'Dear John Doe,\n\nWe are pleased to inform you that your Luba 1 3000 (RMA-2023-0892) has been repaired. We replaced the Right Wheel Motor and repaired the Front Bumper. The unit has been fully tested and is ready for return.\n\nRobomate Support',
          aiSms: 'Robomate Update: Your Luba 1 3000 is ready. Replaced: Wheel Motor. Repaired: Bumper. Tested & functioning perfectly. Check email for details.',
          technician: 'Jeff'
        }
      ];
      setRecords(seed);
    }
  }, []);

  // Load Users from local storage on mount, ensure Jeff exists
  useEffect(() => {
    const savedUsers = localStorage.getItem('robomate_users_v1');
    let loadedUsers: User[] = [];
    if (savedUsers) {
      loadedUsers = JSON.parse(savedUsers);
    }
    
    // Check if Super User exists
    const adminExists = loadedUsers.some(u => u.email === 'jeff@robomate.co.nz');
    if (!adminExists) {
      const superUser: User = {
        email: 'jeff@robomate.co.nz',
        password: 'luba1234',
        isAdmin: true
      };
      loadedUsers.push(superUser);
      localStorage.setItem('robomate_users_v1', JSON.stringify(loadedUsers));
    }
    setUsers(loadedUsers);
  }, []);

  // Save records to local storage
  useEffect(() => {
    if (records.length > 0) {
      localStorage.setItem('robomate_repairs_v1', JSON.stringify(records));
    }
  }, [records]);

  // Save parts to local storage
  useEffect(() => {
    localStorage.setItem('robomate_parts_v1', JSON.stringify(parts));
  }, [parts]);

  // User persistence (for new registrations/password changes)
  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('robomate_users_v1', JSON.stringify(newUsers));
  };

  // --- Auth Handlers ---

  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleRegister = async (email: string, pass: string): Promise<boolean> => {
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return false; // User exists
    }
    const newUser: User = {
      email: email,
      password: pass,
      isAdmin: false // Only Jeff is admin by default
    };
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    setCurrentUser(newUser);
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('dashboard');
  };

  const handleUpdateUserPassword = (email: string, newPass: string) => {
    const updatedUsers = users.map(u => 
        u.email.toLowerCase() === email.toLowerCase() ? { ...u, password: newPass } : u
    );
    saveUsers(updatedUsers);
  };

  // --- Navigation Handlers ---

  const handleNewRepair = () => {
    setView('new-repair');
  };

  const handleSaveRecord = (record: RepairRecord) => {
    setRecords([record, ...records]);
    setSelectedRecord(record);
    setView('view-report');
  };

  const handleViewRecord = (record: RepairRecord) => {
    setSelectedRecord(record);
    setView('view-report');
  };

  const handleManageParts = () => {
    setView('manage-parts');
  };

  const handleManageUsers = () => {
    setView('user-management');
  };

  const handleUpdateParts = (newParts: Part[]) => {
    setParts(newParts);
  };

  const handleCancel = () => {
    setView('dashboard');
    setSelectedRecord(null);
  };

  // --- Render ---

  if (!currentUser) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans pb-safe">
        {/* Header/Nav */}
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-14 sm:h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setView('dashboard')}>
                           <span className="text-robomate-primary font-extrabold text-xl sm:text-2xl tracking-tighter uppercase">ROBOMATE</span>
                           <span className="ml-2 text-gray-500 text-xs sm:text-sm font-medium border-l border-gray-300 pl-2">Service</span>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="text-xs text-gray-400 mr-2 hidden md:block">Logged in as</span>
                        <div className="flex items-center">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[100px] sm:max-w-none">{currentUser.email}</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        {/* Main Content */}
        <main className="pb-8">
            {view === 'dashboard' && (
                <Dashboard 
                    records={records} 
                    currentUser={currentUser}
                    onNewRepair={handleNewRepair} 
                    onViewRecord={handleViewRecord} 
                    onManageParts={handleManageParts}
                    onManageUsers={handleManageUsers}
                    onLogout={handleLogout}
                />
            )}
            
            {view === 'new-repair' && (
                <RepairForm 
                    availableParts={parts}
                    currentUser={currentUser}
                    onCancel={handleCancel} 
                    onSave={handleSaveRecord} 
                />
            )}

            {view === 'view-report' && selectedRecord && (
                <ReportView 
                    record={selectedRecord} 
                    availableParts={parts}
                    onClose={handleCancel} 
                />
            )}

            {view === 'manage-parts' && (
                <PartsManager
                    parts={parts}
                    onUpdateParts={handleUpdateParts}
                    onBack={handleCancel}
                />
            )}

            {view === 'user-management' && currentUser.isAdmin && (
                <UserManagement
                    users={users}
                    onUpdateUserPassword={handleUpdateUserPassword}
                    onBack={handleCancel}
                />
            )}
        </main>
    </div>
  );
};

export default App;
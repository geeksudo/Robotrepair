import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { RepairForm } from './components/RepairForm';
import { ReportView } from './components/ReportView';
import { PartsManager } from './components/PartsManager';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { RepairRecord, ViewState, Part, ProductModel, User } from './types';
import { DEFAULT_SPARE_PARTS } from './constants';
import { utils, read, writeFile } from 'xlsx';

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
    setSelectedRecord(null); // Clear any selection so form starts fresh
    setView('new-repair');
  };

  const handleContinueRepair = (record: RepairRecord) => {
    setSelectedRecord(record); // Pass existing record data to initialize form
    setView('new-repair');
  };

  const handleSaveRecord = (record: RepairRecord) => {
    // Check if record exists to update it, otherwise add new
    const existingIndex = records.findIndex(r => r.id === record.id);
    
    if (existingIndex >= 0) {
        const updatedRecords = [...records];
        updatedRecords[existingIndex] = record;
        setRecords(updatedRecords);
    } else {
        setRecords([record, ...records]);
    }
    
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

  // --- Data Sync Handlers ---

  const handleExportRecords = () => {
    // Flatten data for Excel export ease if needed, or just dump JSON
    // Here we dump the object, but stringify complex objects for better readability in Excel
    const exportData = records.map(r => ({
        ...r,
        customerName: r.customer.name,
        customerEmail: r.customer.email,
        customerPhone: r.customer.phone,
        // Helper to stringify parts for Excel view
        partsSummary: r.partsActions.map(p => p.partId + ':' + p.action).join(', '),
        // Remove complex objects to clean up Excel
        customer: JSON.stringify(r.customer),
        partsActions: JSON.stringify(r.partsActions)
    }));

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Repair Records");
    writeFile(wb, `Robomate_Records_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportRecords = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = utils.sheet_to_json(worksheet) as any[];

        const importedRecords: RepairRecord[] = jsonData.map(item => {
            // Try to parse back the JSON strings if they exist, otherwise reconstruction might be needed
            // This is a basic reconstruction. For full fidelity, we rely on the stringified JSON fields.
            let customer = { name: item.customerName || '', email: item.customerEmail || '', phone: item.customerPhone || '' };
            if (item.customer) {
                try { customer = JSON.parse(item.customer); } catch {}
            }
            
            let partsActions = [];
            if (item.partsActions) {
                 try { partsActions = JSON.parse(item.partsActions); } catch {}
            }

            return {
                id: String(item.id),
                rmaNumber: item.rmaNumber,
                entryDate: item.entryDate,
                customer: customer,
                productModel: item.productModel,
                productArea: String(item.productArea),
                productName: item.productName,
                partsActions: partsActions,
                technicianNotes: item.technicianNotes,
                status: item.status,
                aiReport: item.aiReport,
                aiSms: item.aiSms,
                technician: item.technician
            } as RepairRecord;
        });

        // Merge logic: Add records that don't exist (by ID)
        const existingIds = new Set(records.map(r => r.id));
        const newRecords = importedRecords.filter(r => !existingIds.has(r.id));
        
        if (newRecords.length > 0) {
            setRecords([...newRecords, ...records]);
            alert(`Successfully imported ${newRecords.length} new records.`);
        } else {
            alert('No new records found in file (all IDs already exist).');
        }

      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Error parsing file. Please ensure it was exported from this app.');
      }
    };
    reader.readAsArrayBuffer(file);
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
                    onContinueRepair={handleContinueRepair}
                    onViewRecord={handleViewRecord} 
                    onManageParts={handleManageParts}
                    onManageUsers={handleManageUsers}
                    onLogout={handleLogout}
                    onExportRecords={handleExportRecords}
                    onImportRecords={handleImportRecords}
                />
            )}
            
            {view === 'new-repair' && (
                <RepairForm 
                    initialData={selectedRecord}
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
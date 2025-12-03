
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
    const savedParts = localStorage.getItem('robomate_parts_v2');
    return savedParts ? JSON.parse(savedParts) : DEFAULT_SPARE_PARTS;
  });

  // Load records from local storage on mount
  useEffect(() => {
    // UPDATED to v10 to force load new filtered seed data with address, new box type, and checklist changes
    const saved = localStorage.getItem('robomate_repairs_v10'); 
    if (saved) {
      setRecords(JSON.parse(saved));
    } else {
      // FILTERED SEED DATA (Only Quoted and Completed)
      const seed: RepairRecord[] = [
        {
          id: '1001',
          rmaNumber: 'RMA-2023-1001',
          ticketNumber: 'TKT-10552',
          productModel: ProductModel.Luba2,
          productArea: '3000',
          productName: 'Luba-L2-3K-8892',
          customer: { name: 'Alice Smith', email: 'alice.s@example.com', phone: '021-555-0199', address: '15 Garden Way, Remuera, Auckland' },
          arrivalDate: '2023-10-18',
          entryDate: '2023-10-20',
          status: 'Completed',
          faultDescription: 'Robot drives in circles and stops with error. Customer suspects wheel issue.',
          partsActions: [
            { partId: 'm-wheel-r', action: 'replaced' },
            { partId: 'a-bumper', action: 'repaired' }
          ],
          technicianNotes: 'Right wheel motor seized due to debris, replaced. Front bumper was cracked but repairable with bonding agent. Firmware updated to latest version.',
          aiReport: `Subject: Service Report: Luba 2 3000 (RMA-2023-1001)

Dear Alice Smith,

We are pleased to inform you that the service for your Luba 2 3000 (RMA-2023-1001) has been successfully completed.

**Service Details**
Replaced Components: Right Front Wheel Motor. Repaired Components: Bumper. 

**Test Results**
• The mower was fully tested, including mapping, charging, mowing, and safety checks.
• Customer map has been restored.

**Recommendations**
• Please clean the bottom of the mower regularly.
• Replace the blades when they become blunt.
• Clean the tail panel and the charging pins on the charging dock from time to time.

If there is any logistics information, we will notify you separately.

Thanks for your patience, and thank you for choosing Robomate!

Robomate Service Team`,
          aiSms: 'Robomate Update: Your Luba 2 (RMA-2023-1001) is repaired and tested. Please check your email for the service report.',
          technician: 'Jeff',
          laborCost: 120,
          checklist: {
              preliminaryCheck: true,
              mapBackup: true,
              disassemblyRepair: true,
              postRepairTest: true,
              mapRestore: true,
              waitingForCustomer: false,
              waitingForParts: false,
              waitingForPartsNotes: '',
              waitingForFullReplacementApproval: false
          },
          intake: {
              shippingMethod: 'Freight',
              boxType: 'Original',
              accessories: {
                  securityKey: true,
                  camera: true,
                  bumper: true,
                  psu: false,
                  chargingDock: false,
                  chargingCable: false,
                  rtk: true,
                  rtkPsu: true,
                  cuttingDisks: false,
                  cuttingBlades: false,
                  other: false
              },
              accessoriesOther: ''
          }
        },
        {
          id: '1002',
          rmaNumber: 'RMA-2023-1002',
          ticketNumber: 'TKT-10601',
          productModel: ProductModel.Yuka,
          productArea: 'Standard',
          productName: 'Yuka-Y1-STD-4421',
          customer: { name: 'Bob Jones', email: 'bobjones@business.co.nz', phone: '027-123-4567', address: '42 Industrial Blvd, Penrose, Auckland' },
          arrivalDate: '2023-10-21',
          entryDate: '2023-10-22',
          status: 'Quoted',
          faultDescription: 'Unit is dead. Won\'t turn on even after charging for 24 hours. Cutting disk looks bent.',
          partsActions: [
             { partId: 'e-battery', action: 'replaced' },
             { partId: 'cut-disk', action: 'replaced' }
          ],
          technicianNotes: 'Battery failing to hold charge. Left cutting disk bent. Quote generated and sent to customer.',
          aiQuote: `Subject: Service Quotation: RMA-2023-1002 Yuka Standard

Dear Bob Jones,

Following our diagnostic assessment of your Yuka Standard (RMA: RMA-2023-1002), we have identified that the battery and cutting disk require replacement.

**Proposed Replacements & Repairs**
- Battery: $600.00
- Left Cutting Disk: $38.00

**Labor Cost**: $100.00

**Total Estimated Cost**: $738.00

Please reply to this email to approve the quotation so we can proceed with the repairs.

Robomate Service Team`,
          technician: 'Jeff',
          laborCost: 100,
          checklist: {
              preliminaryCheck: true,
              mapBackup: false,
              disassemblyRepair: false,
              postRepairTest: false,
              mapRestore: false,
              waitingForCustomer: true,
              waitingForParts: false,
              waitingForPartsNotes: '',
              waitingForFullReplacementApproval: false
          },
           intake: {
              shippingMethod: 'Drop Off',
              boxType: 'Custom',
              accessories: {
                  securityKey: true,
                  camera: true,
                  bumper: true,
                  psu: true,
                  chargingDock: true,
                  chargingCable: true,
                  rtk: false,
                  rtkPsu: false,
                  cuttingDisks: true,
                  cuttingBlades: true,
                  other: true
              },
              accessoriesOther: 'Wrapped in bubble wrap, no box'
          }
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
      localStorage.setItem('robomate_repairs_v10', JSON.stringify(records));
    }
  }, [records]);

  // Save parts to local storage
  useEffect(() => {
    localStorage.setItem('robomate_parts_v2', JSON.stringify(parts));
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
    
    // Conditional Navigation based on status
    if (record.status === 'Quoted' || record.status === 'Completed') {
        setSelectedRecord(record);
        setView('view-report');
    } else {
        // If simply saving progress (e.g. In Progress), go back to dashboard
        setSelectedRecord(null);
        setView('dashboard');
    }
  };

  const handleDeleteRecord = (id: string) => {
      // Ensure only admin can delete
      if (!currentUser?.isAdmin) return;
      const updatedRecords = records.filter(r => r.id !== id);
      setRecords(updatedRecords);
      // Also update local storage immediately to reflect deletion
      if (updatedRecords.length === 0) {
          localStorage.removeItem('robomate_repairs_v10');
      } else {
          localStorage.setItem('robomate_repairs_v10', JSON.stringify(updatedRecords));
      }
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
        customerAddress: r.customer.address,
        // Helper to stringify parts for Excel view
        partsSummary: r.partsActions.map(p => p.partId + ':' + p.action).join(', '),
        // Remove complex objects to clean up Excel
        customer: JSON.stringify(r.customer),
        partsActions: JSON.stringify(r.partsActions),
        checklist: JSON.stringify(r.checklist || {}),
        intake: JSON.stringify(r.intake || {})
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
            let customer = { name: item.customerName || '', email: item.customerEmail || '', phone: item.customerPhone || '', address: item.customerAddress || '' };
            if (item.customer) {
                try { customer = JSON.parse(item.customer); } catch {}
            }
            
            let partsActions = [];
            if (item.partsActions) {
                 try { partsActions = JSON.parse(item.partsActions); } catch {}
            }

            let checklist = {};
            if (item.checklist) {
                 try { checklist = JSON.parse(item.checklist); } catch {}
            }
            
            let intake = {};
            if (item.intake) {
                try { intake = JSON.parse(item.intake); } catch {}
            }

            return {
                id: String(item.id),
                rmaNumber: item.rmaNumber,
                entryDate: item.entryDate,
                arrivalDate: item.arrivalDate,
                ticketNumber: item.ticketNumber,
                faultDescription: item.faultDescription,
                customer: customer,
                productModel: item.productModel,
                productArea: String(item.productArea),
                productName: item.productName,
                partsActions: partsActions,
                technicianNotes: item.technicianNotes,
                status: item.status,
                aiReport: item.aiReport,
                aiSms: item.aiSms,
                technician: item.technician,
                checklist: checklist,
                intake: intake
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
                    onDeleteRecord={handleDeleteRecord}
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

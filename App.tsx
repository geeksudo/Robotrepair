import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { RepairForm } from './components/RepairForm';
import { ReportView } from './components/ReportView';
import { PartsManager } from './components/PartsManager';
import { RepairRecord, ViewState, Part, ProductModel } from './types';
import { DEFAULT_SPARE_PARTS } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState | 'manage-parts'>('dashboard');
  const [records, setRecords] = useState<RepairRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<RepairRecord | null>(null);
  
  // Initialize parts from localStorage or default
  const [parts, setParts] = useState<Part[]>(() => {
    const savedParts = localStorage.getItem('mammotion_parts_v1');
    return savedParts ? JSON.parse(savedParts) : DEFAULT_SPARE_PARTS;
  });

  // Load records from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mammotion_repairs_v3'); 
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
          aiReport: 'Dear John Doe,\n\nWe are pleased to inform you that your Luba 1 3000 (RMA-2023-0892) has been repaired. We replaced the Right Wheel Motor and repaired the Front Bumper. The unit has been fully tested and is ready for return.\n\nMammotion Support',
          aiSms: 'Mammotion Update: Your Luba 1 3000 is ready. Replaced: Wheel Motor. Repaired: Bumper. Tested & functioning perfectly. Check email for details.'
        }
      ];
      setRecords(seed);
    }
  }, []);

  // Save records to local storage
  useEffect(() => {
    if (records.length > 0) {
      localStorage.setItem('mammotion_repairs_v3', JSON.stringify(records));
    }
  }, [records]);

  // Save parts to local storage
  useEffect(() => {
    localStorage.setItem('mammotion_parts_v1', JSON.stringify(parts));
  }, [parts]);

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

  const handleUpdateParts = (newParts: Part[]) => {
    setParts(newParts);
  };

  const handleCancel = () => {
    setView('dashboard');
    setSelectedRecord(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
        {/* Header/Nav */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setView('dashboard')}>
                           <span className="text-green-600 font-extrabold text-2xl tracking-tighter">MAMMOTION</span>
                           <span className="ml-2 text-gray-500 text-sm font-medium border-l border-gray-300 pl-2">Repair Center</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        {/* Main Content */}
        <main>
            {view === 'dashboard' && (
                <Dashboard 
                    records={records} 
                    onNewRepair={handleNewRepair} 
                    onViewRecord={handleViewRecord} 
                    onManageParts={handleManageParts}
                />
            )}
            
            {view === 'new-repair' && (
                <RepairForm 
                    availableParts={parts}
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
        </main>
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { Customer, ProductModel, RepairRecord, PartAction, RepairActionType, Part, User, RepairChecklist, IntakeInspection } from '../types';
import { PRODUCT_MODELS, PRODUCT_AREAS } from '../constants';
import { IconArrowLeft, IconRobot, IconCheck, IconList, IconWrench, IconSparkles, IconUser, IconEdit } from './Icons';
import { generateRepairReport, generateQuote } from '../services/geminiService';

interface RepairFormProps {
  initialData?: RepairRecord | null;
  availableParts: Part[];
  currentUser: User;
  onCancel: () => void;
  onSave: (record: RepairRecord) => void;
}

const DEFAULT_CHECKLIST: RepairChecklist = {
  preliminaryCheck: false,
  mapBackup: false,
  disassemblyRepair: false,
  postRepairTest: false,
  mapRestore: false,
  waitingForCustomer: false,
  waitingForParts: false,
  waitingForPartsNotes: '',
  waitingForFullReplacementApproval: false
};

const DEFAULT_INTAKE: IntakeInspection = {
  shippingMethod: 'Freight',
  boxType: 'Original',
  accessories: {
    cuttingDisks: false,
    cuttingBlades: false,
    securityKey: false,
    camera: false,
    bumper: false,
    psu: false,
    chargingDock: false,
    chargingCable: false,
    rtk: false,
    rtkPsu: false,
    other: false,
  },
  accessoriesOther: ''
};

export const RepairForm: React.FC<RepairFormProps> = ({ initialData, availableParts, currentUser, onCancel, onSave }) => {
  const [activeTab, setActiveTab] = useState<'rma' | 'jobsheet' | 'parts'>('rma');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMode, setGeneratingMode] = useState<'quote' | 'report'>('report');
  
  // Form State
  const [customer, setCustomer] = useState<Customer>({ name: '', email: '', phone: '', address: '' });
  const [ticketNumber, setTicketNumber] = useState('');
  const [faultDescription, setFaultDescription] = useState('');
  
  const [productModel, setProductModel] = useState<ProductModel>(ProductModel.Luba2);
  const [productArea, setProductArea] = useState<string>('3000');
  const [productName, setProductName] = useState('Luba-');
  
  const [rmaNumber, setRmaNumber] = useState('RMA-');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]); // Starting Date
  const [arrivalDate, setArrivalDate] = useState(new Date().toISOString().split('T')[0]); // Arrival Date

  const [partsActions, setPartsActions] = useState<PartAction[]>([]);
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [laborCost, setLaborCost] = useState<number>(100);
  
  // Checklist & Intake State
  const [checklist, setChecklist] = useState<RepairChecklist>(DEFAULT_CHECKLIST);
  const [intake, setIntake] = useState<IntakeInspection>(DEFAULT_INTAKE);
  
  // UI State
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  // Initialize from initialData if present
  useEffect(() => {
    if (initialData) {
        setCustomer(initialData.customer);
        setTicketNumber(initialData.ticketNumber || '');
        setFaultDescription(initialData.faultDescription || '');
        setProductModel(initialData.productModel);
        setProductArea(initialData.productArea);
        setProductName(initialData.productName || 'Luba-');
        setRmaNumber(initialData.rmaNumber);
        setEntryDate(initialData.entryDate);
        setArrivalDate(initialData.arrivalDate || initialData.entryDate);
        setPartsActions(initialData.partsActions);
        setTechnicianNotes(initialData.technicianNotes);
        setLaborCost(initialData.laborCost || 100);
        if (initialData.checklist) {
            setChecklist({
                ...DEFAULT_CHECKLIST,
                ...initialData.checklist
            });
        }
        if (initialData.intake) {
            setIntake(initialData.intake);
        }
    }
  }, [initialData]);

  const handleAutoFill = () => {
      setIsAutoFilling(true);
      // Simulate API call to RMA Database
      setTimeout(() => {
          if (!customer.name) setCustomer({ 
              name: 'John Doe', 
              email: 'john.doe@example.com', 
              phone: '021-999-8888',
              address: '123 Robot Lane, Tech City, Auckland 1010' 
          });
          if (!ticketNumber) setTicketNumber('TKT-998822');
          if (!faultDescription) setFaultDescription('Customer states robot circles in place and displays error 1104. Left wheel seems stiff.');
          if (rmaNumber === 'RMA-') setRmaNumber('RMA-2023-8888');
          
          setIsAutoFilling(false);
          alert("Data retrieved from RMA Database (Simulated)");
      }, 800);
  };

  const handlePartToggle = (partId: string) => {
    setPartsActions(prev => {
      const exists = prev.find(p => p.partId === partId);
      if (exists) {
        return prev.filter(p => p.partId !== partId);
      } else {
        return [...prev, { partId, action: 'replaced' }];
      }
    });
  };

  const handleActionChange = (partId: string, action: RepairActionType) => {
    setPartsActions(prev => 
      prev.map(p => p.partId === partId ? { ...p, action } : p)
    );
  };

  const handleChecklistChange = (key: keyof RepairChecklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleIntakeAccessoryChange = (key: keyof IntakeInspection['accessories']) => {
    setIntake(prev => ({
        ...prev,
        accessories: {
            ...prev.accessories,
            [key]: !prev.accessories[key]
        }
    }));
  };

  const getTechnicianName = (email: string) => {
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  const calculateTotal = () => {
    const partsTotal = partsActions.reduce((sum, action) => {
      // Only replaced parts add to the cost in this model
      if (action.action === 'replaced') {
          const part = availableParts.find(p => p.id === action.partId);
          return sum + (part?.price || 0);
      }
      return sum;
    }, 0);
    return partsTotal + laborCost;
  };

  const constructRecord = (status: RepairRecord['status']): RepairRecord => {
     return {
        id: initialData ? initialData.id : Date.now().toString(),
        customer,
        ticketNumber,
        faultDescription,
        productModel,
        productArea,
        rmaNumber,
        productName,
        entryDate,
        arrivalDate,
        partsActions,
        technicianNotes,
        status,
        laborCost,
        technician: initialData?.technician || getTechnicianName(currentUser.email),
        aiReport: initialData?.aiReport, 
        aiSms: initialData?.aiSms,
        aiQuote: initialData?.aiQuote,
        checklist,
        intake
    };
  };

  // Saves the progress without completing the repair or generating AI
  const handleSaveProgress = () => {
    // Determine appropriate status based on workflow
    let newStatus: RepairRecord['status'] = initialData?.status || 'In Progress';
    
    // If it was just pending/new, mark as In Progress
    if (newStatus === 'Pending') {
        newStatus = 'In Progress';
    }
    
    const record = constructRecord(newStatus);
    onSave(record);
  };

  const handleGenerateQuote = async () => {
    if (partsActions.length === 0 && laborCost === 0) {
        alert("Please select parts or add labor cost to generate a quote.");
        return;
    }
    
    setIsGenerating(true);
    setGeneratingMode('quote');

    const record = constructRecord('Quoted');
    const quoteText = await generateQuote(record, availableParts, laborCost);
    record.aiQuote = quoteText;
    
    onSave(record);
    setIsGenerating(false);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratingMode('report');

    const newRecord = constructRecord('Completed');
    const aiResponse = await generateRepairReport(newRecord, availableParts);
    newRecord.aiReport = aiResponse.email;
    newRecord.aiSms = aiResponse.sms;

    onSave(newRecord);
    setIsGenerating(false);
  };

  // Group parts by category
  const partsByCategory = availableParts.reduce((acc, part) => {
    if (!acc[part.category]) acc[part.category] = [];
    acc[part.category].push(part);
    return acc;
  }, {} as Record<string, Part[]>);

  const categories = ['All', ...Object.keys(partsByCategory)];

  // Component to display context header on tabs other than RMA
  const ContextHeader = () => (
    <div className="bg-orange-50 px-4 py-2 border-b border-orange-100 flex items-center justify-between text-sm text-gray-700">
        <div className="flex items-center space-x-4">
            <div><span className="font-bold text-orange-800">RMA:</span> {rmaNumber}</div>
            <div className="hidden sm:block text-gray-400">|</div>
            <div className="truncate max-w-[150px] sm:max-w-xs"><span className="font-bold text-orange-800">Cust:</span> {customer.name || 'N/A'}</div>
        </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-8 flex flex-col h-[calc(100vh-80px)] sm:h-auto">
      <button onClick={onCancel} className="mb-4 flex items-center text-gray-500 hover:text-gray-900 transition-colors shrink-0">
        <IconArrowLeft className="w-5 h-5 mr-1" /> Back
      </button>

      <div className="bg-white shadow-lg rounded-xl flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="bg-orange-600 px-4 sm:px-8 py-4 shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
            <IconRobot className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-orange-100" />
            {initialData ? `Repair: ${initialData.rmaNumber}` : 'New Repair Entry'}
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 shrink-0 overflow-x-auto">
          <button 
            type="button"
            onClick={() => setActiveTab('rma')}
            className={`flex-1 py-3 px-2 text-sm sm:text-base font-medium text-center border-b-2 transition-colors flex items-center justify-center whitespace-nowrap ${activeTab === 'rma' ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <IconUser className="w-4 h-4 mr-2" />
            RMA Info
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('jobsheet')}
            className={`flex-1 py-3 px-2 text-sm sm:text-base font-medium text-center border-b-2 transition-colors flex items-center justify-center whitespace-nowrap ${activeTab === 'jobsheet' ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <IconList className="w-4 h-4 mr-2" />
            Job Sheet
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('parts')}
            className={`flex-1 py-3 px-2 text-sm sm:text-base font-medium text-center border-b-2 transition-colors flex items-center justify-center whitespace-nowrap ${activeTab === 'parts' ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <IconWrench className="w-4 h-4 mr-2" />
            Parts & Labor
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmitReport} className="flex-1 overflow-y-auto flex flex-col">
          
          {/* TAB 1: RMA & CUSTOMER INFO */}
          <div className={`${activeTab === 'rma' ? 'flex' : 'hidden'} flex-col flex-1`}>
            <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                {/* RMA & Dates Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">RMA Number</label>
                        <div className="flex gap-2">
                            <input required type="text" value={rmaNumber} onChange={e => setRmaNumber(e.target.value)} 
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border" 
                                placeholder="RMA-" />
                            <button 
                                type="button"
                                onClick={handleAutoFill}
                                disabled={isAutoFilling}
                                className="inline-flex items-center px-3 py-2 border border-purple-300 shadow-sm text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors whitespace-nowrap"
                                title="Auto-fill from RMA Database"
                            >
                                <IconSparkles className={`w-4 h-4 mr-2 ${isAutoFilling ? 'animate-pulse' : ''}`} />
                                {isAutoFilling ? 'Filling...' : 'Auto-Fill'}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">Enter RMA to fetch details from central DB</p>
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700">Arrival Date</label>
                        <input type="date" value={arrivalDate} onChange={e => setArrivalDate(e.target.value)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border" />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700">Starting Date</label>
                        <input required type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border" />
                    </div>
                </div>

                {/* Product Info */}
                <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Product Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">Product Model</label>
                            <select value={productModel} onChange={e => setProductModel(e.target.value as ProductModel)} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border">
                                {PRODUCT_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">Area / Version</label>
                            <select value={productArea} onChange={e => setProductArea(e.target.value)} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border">
                                {PRODUCT_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">Product Name / ID</label>
                            <input type="text" value={productName} onChange={e => setProductName(e.target.value)} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border" 
                                placeholder="e.g. Luba-1A2B" />
                        </div>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="border-t border-gray-200 pt-4 sm:pt-6">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Customer Details & Fault</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">Full Name</label>
                            <input required type="text" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">Support Ticket #</label>
                            <input type="text" value={ticketNumber} onChange={e => setTicketNumber(e.target.value)} 
                                placeholder="TKT-"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">Email</label>
                            <input required type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">Phone</label>
                            <input type="tel" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border" />
                        </div>
                        <div className="md:col-span-2">
                                <label className="block text-xs sm:text-sm font-medium text-gray-700">Address</label>
                                <input type="text" value={customer.address || ''} onChange={e => setCustomer({...customer, address: e.target.value})} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border" 
                                placeholder="Street, City, Postal Code" />
                        </div>
                        <div className="md:col-span-2">
                                <label className="block text-xs sm:text-sm font-medium text-gray-700">Fault Description</label>
                                <textarea rows={2} value={faultDescription} onChange={e => setFaultDescription(e.target.value)} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border" 
                                placeholder="Customer reported issue..." />
                        </div>
                    </div>
                </div>
            </div>
          </div>
            
          {/* TAB 2: INSPECTION & DIAGNOSIS */}
          <div className={`${activeTab === 'jobsheet' ? 'flex' : 'hidden'} flex-col flex-1`}>
            <ContextHeader />
            <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                {/* Intake Inspection */}
                <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Intake Inspection</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shipping Method</span>
                                <div className="flex space-x-4">
                                    {['Drop Off', 'Freight'].map(method => (
                                        <label key={method} className="flex items-center space-x-2 text-sm cursor-pointer">
                                            <input type="radio" 
                                                name="shippingMethod"
                                                checked={intake.shippingMethod === method}
                                                onChange={() => setIntake({...intake, shippingMethod: method as any})}
                                                className="text-orange-600 focus:ring-orange-500"
                                            />
                                            <span>{method}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Box Type</span>
                                <div className="flex space-x-4">
                                    {['Original', 'Custom', 'Pallet'].map(type => (
                                        <label key={type} className="flex items-center space-x-2 text-sm cursor-pointer">
                                            <input type="radio" 
                                                name="boxType"
                                                checked={intake.boxType === type}
                                                onChange={() => setIntake({...intake, boxType: type as any})}
                                                className="text-orange-600 focus:ring-orange-500"
                                            />
                                            <span>{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Package Contents & Accessories</span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {/* Accessory Checkboxes */}
                                <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" checked={intake.accessories.securityKey} onChange={() => handleIntakeAccessoryChange('securityKey')} className="rounded text-orange-600 focus:ring-orange-500" /><span>Security Key</span></label>
                                <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" checked={intake.accessories.camera} onChange={() => handleIntakeAccessoryChange('camera')} className="rounded text-orange-600 focus:ring-orange-500" /><span>Camera</span></label>
                                <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" checked={intake.accessories.bumper} onChange={() => handleIntakeAccessoryChange('bumper')} className="rounded text-orange-600 focus:ring-orange-500" /><span>Bumper</span></label>
                                <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" checked={intake.accessories.chargingDock} onChange={() => handleIntakeAccessoryChange('chargingDock')} className="rounded text-orange-600 focus:ring-orange-500" /><span>Charging Dock</span></label>
                                <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" checked={intake.accessories.chargingCable} onChange={() => handleIntakeAccessoryChange('chargingCable')} className="rounded text-orange-600 focus:ring-orange-500" /><span>Charging Ext. Cable</span></label>
                                <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" checked={intake.accessories.psu} onChange={() => handleIntakeAccessoryChange('psu')} className="rounded text-orange-600 focus:ring-orange-500" /><span>PSU</span></label>
                                <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" checked={intake.accessories.rtk} onChange={() => handleIntakeAccessoryChange('rtk')} className="rounded text-orange-600 focus:ring-orange-500" /><span>RTK</span></label>
                                <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" checked={intake.accessories.rtkPsu} onChange={() => handleIntakeAccessoryChange('rtkPsu')} className="rounded text-orange-600 focus:ring-orange-500" /><span>RTK PSU</span></label>
                                <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" checked={intake.accessories.cuttingDisks} onChange={() => handleIntakeAccessoryChange('cuttingDisks')} className="rounded text-orange-600 focus:ring-orange-500" /><span>Cutting Disks</span></label>
                                <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" checked={intake.accessories.cuttingBlades} onChange={() => handleIntakeAccessoryChange('cuttingBlades')} className="rounded text-orange-600 focus:ring-orange-500" /><span>Blades</span></label>
                                
                                <div className="col-span-2 sm:col-span-3 md:col-span-5 flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200">
                                    <label className="flex items-center space-x-2 text-sm cursor-pointer flex-shrink-0">
                                        <input type="checkbox" checked={intake.accessories.other} onChange={() => handleIntakeAccessoryChange('other')} className="rounded text-orange-600 focus:ring-orange-500" />
                                        <span>Other:</span>
                                    </label>
                                    <input 
                                        type="text"
                                        maxLength={50}
                                        disabled={!intake.accessories.other}
                                        value={intake.accessoriesOther || ''}
                                        onChange={(e) => setIntake({...intake, accessoriesOther: e.target.value})}
                                        placeholder="Specify other items..."
                                        className={`flex-1 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-1.5 border ${!intake.accessories.other ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Technician Checklist & Diagnosis */}
                <div className="border-t border-gray-200 pt-4 sm:pt-6">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 flex items-center">
                        Diagnosis & Workflow
                        <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Internal</span>
                    </h3>
                    
                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Repair Steps</h4>
                            <div className="space-y-3">
                                <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={checklist.preliminaryCheck} onChange={() => handleChecklistChange('preliminaryCheck')} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" /><span className="text-sm text-gray-700">Preliminary Cleaning & Inspection</span></label>
                                <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={checklist.mapBackup} onChange={() => handleChecklistChange('mapBackup')} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" /><span className="text-sm text-gray-700">Map Backup</span></label>
                                <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={checklist.disassemblyRepair} onChange={() => handleChecklistChange('disassemblyRepair')} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" /><span className="text-sm text-gray-700">Disassembly & Repair</span></label>
                                <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={checklist.postRepairTest} onChange={() => handleChecklistChange('postRepairTest')} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" /><span className="text-sm text-gray-700">Post-Repair Testing</span></label>
                                <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={checklist.mapRestore} onChange={() => handleChecklistChange('mapRestore')} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" /><span className="text-sm text-gray-700">Map Restore & Unbind</span></label>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Status Flags</h4>
                            <div className="space-y-3">
                                <label className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-orange-100 transition-colors"><input type="checkbox" checked={checklist.waitingForCustomer} onChange={() => handleChecklistChange('waitingForCustomer')} className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" /><span className={`text-sm font-medium ${checklist.waitingForCustomer ? 'text-purple-700' : 'text-gray-600'}`}>Waiting for Customer Reply</span></label>
                                
                                <div className="p-2 rounded transition-colors hover:bg-orange-50 border border-transparent hover:border-orange-100">
                                    <label className="flex items-center space-x-3 cursor-pointer mb-2">
                                        <input type="checkbox" checked={checklist.waitingForParts} onChange={() => handleChecklistChange('waitingForParts')} className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                                        <span className={`text-sm font-medium ${checklist.waitingForParts ? 'text-red-700' : 'text-gray-600'}`}>Waiting for Parts</span>
                                    </label>
                                    <textarea 
                                        rows={2}
                                        disabled={!checklist.waitingForParts}
                                        placeholder={checklist.waitingForParts ? "List required parts here..." : ""}
                                        value={checklist.waitingForPartsNotes || ''} 
                                        onChange={(e) => setChecklist(prev => ({...prev, waitingForPartsNotes: e.target.value}))}
                                        className={`block w-full text-sm rounded-md border shadow-sm ml-7 transition-all w-[calc(100%-1.75rem)] ${
                                            checklist.waitingForParts 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-white text-gray-900' 
                                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    />
                                </div>

                                <label className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-orange-100 transition-colors">
                                    <input type="checkbox" checked={checklist.waitingForFullReplacementApproval} onChange={() => handleChecklistChange('waitingForFullReplacementApproval')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                    <span className={`text-sm font-medium ${checklist.waitingForFullReplacementApproval ? 'text-blue-700' : 'text-gray-600'}`}>Waiting for Full Replacement Approval</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technician Notes */}
                <div className="border-t border-gray-200 pt-4 sm:pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Technician Notes</label>
                    <textarea required rows={4} value={technicianNotes} onChange={e => setTechnicianNotes(e.target.value)} 
                        className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 border" 
                        placeholder="Describe diagnosis, repairs performed, and observations..." />
                </div>
            </div>
          </div>

          {/* TAB 3: PARTS & LABOR */}
          <div className={`${activeTab === 'parts' ? 'block' : 'hidden'} flex-1`}>
            <ContextHeader />
            <div className="p-4 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                    <div className="flex flex-col">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">Spare Parts</h3>
                        <p className="text-xs sm:text-sm text-gray-500">Select parts used. 'Replaced' adds cost, 'Repaired' is $0.</p>
                    </div>
                    <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        <div className="flex space-x-2">
                        {categories.map(cat => (
                            <button
                            key={cat}
                            type="button"
                            onClick={() => setFilterCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-all ${
                                filterCategory === cat
                                ? 'bg-orange-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            >
                            {cat}
                            </button>
                        ))}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-[50vh] overflow-y-auto parts-scroll">
                    {Object.entries(partsByCategory)
                    .filter(([category]) => filterCategory === 'All' || category === filterCategory)
                    .map(([category, parts]: [string, Part[]]) => (
                        <div key={category} className="mb-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 sticky top-0 bg-gray-50 py-1 z-10">{category}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {parts.map(part => {
                                const partAction = partsActions.find(p => p.partId === part.id);
                                const isSelected = !!partAction;
                                const isRepaired = partAction?.action === 'repaired';
                                
                                return (
                                    <div key={part.id} className={`flex items-center p-3 rounded-lg border transition-all ${isSelected ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-gray-200 hover:border-orange-200'}`}>
                                        <button type="button" onClick={() => handlePartToggle(part.id)} className={`flex-shrink-0 h-5 w-5 rounded border flex items-center justify-center mr-3 transition-colors ${isSelected ? 'bg-orange-600 border-orange-600' : 'border-gray-300 bg-white'}`}>
                                            {isSelected && <IconCheck className="h-3.5 w-3.5 text-white" />}
                                        </button>
                                        <div className="flex-grow min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate" title={part.name}>{part.name}</div>
                                            <div className="text-xs text-gray-500 flex justify-between items-center mt-1">
                                                <span>{isRepaired ? '$0.00' : `$${part.price.toFixed(2)}`}</span>
                                                {isSelected && (
                                                    <div className="flex bg-white rounded border border-orange-200 text-[10px] overflow-hidden">
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); handleActionChange(part.id, 'replaced'); }}
                                                            className={`px-1.5 py-0.5 ${!isRepaired ? 'bg-orange-100 text-orange-800 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
                                                        >
                                                            Replace
                                                        </button>
                                                        <div className="w-px bg-orange-200"></div>
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); handleActionChange(part.id, 'repaired'); }}
                                                            className={`px-1.5 py-0.5 ${isRepaired ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
                                                        >
                                                            Repair
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Labor Cost ($)</label>
                     <input type="number" min="0" value={laborCost} onChange={e => setLaborCost(parseFloat(e.target.value) || 0)}
                         className="block w-full sm:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border" />
                </div>
            </div>
          </div>

          {/* --- STICKY FOOTER ACTIONS --- */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Total Display */}
                <div className="w-full sm:w-auto flex justify-between sm:block items-center">
                    <span className="text-xs text-gray-500 uppercase font-semibold mr-2 sm:block">Total Estimate</span>
                    <span className="text-2xl font-bold text-orange-600">${calculateTotal().toFixed(2)}</span>
                </div>

                {/* Buttons */}
                <div className="w-full sm:w-auto flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <button 
                        type="button" 
                        onClick={handleSaveProgress}
                        className="flex-1 sm:flex-none whitespace-nowrap bg-white py-2 px-4 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                        Save
                    </button>
                    <button 
                        type="button" 
                        onClick={handleGenerateQuote}
                        disabled={isGenerating}
                        className="flex-1 sm:flex-none whitespace-nowrap bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isGenerating && generatingMode === 'quote' ? '...' : 'Quote'}
                    </button>
                    <button 
                        type="submit" 
                        disabled={isGenerating}
                        className="flex-grow sm:flex-none whitespace-nowrap bg-orange-600 py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 flex justify-center items-center"
                    >
                    {isGenerating && generatingMode === 'report' ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Complete'}
                    </button>
                </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

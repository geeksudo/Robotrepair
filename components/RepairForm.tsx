import React, { useState } from 'react';
import { Customer, ProductModel, RepairRecord, PartAction, RepairActionType, Part, User } from '../types';
import { PRODUCT_MODELS, PRODUCT_AREAS } from '../constants';
import { IconArrowLeft, IconRobot } from './Icons';
import { generateRepairReport } from '../services/geminiService';

interface RepairFormProps {
  availableParts: Part[];
  currentUser: User;
  onCancel: () => void;
  onSave: (record: RepairRecord) => void;
}

export const RepairForm: React.FC<RepairFormProps> = ({ availableParts, currentUser, onCancel, onSave }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form State
  const [customer, setCustomer] = useState<Customer>({ name: '', email: '', phone: '' });
  const [productModel, setProductModel] = useState<ProductModel>(ProductModel.Luba2);
  const [productArea, setProductArea] = useState<string>('3000');
  // Pre-fill prefixes as requested
  const [productName, setProductName] = useState('Luba-');
  const [rmaNumber, setRmaNumber] = useState('RMA-');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [partsActions, setPartsActions] = useState<PartAction[]>([]);
  const [technicianNotes, setTechnicianNotes] = useState('');
  
  // UI State
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const handlePartToggle = (partId: string) => {
    setPartsActions(prev => {
      const exists = prev.find(p => p.partId === partId);
      if (exists) {
        return prev.filter(p => p.partId !== partId);
      } else {
        // Default to 'replaced' when first checked
        return [...prev, { partId, action: 'replaced' }];
      }
    });
  };

  const handleActionChange = (partId: string, action: RepairActionType) => {
    setPartsActions(prev => 
      prev.map(p => p.partId === partId ? { ...p, action } : p)
    );
  };

  // Helper to extract Name from email (e.g. sang@robomate... -> Sang)
  const getTechnicianName = (email: string) => {
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const newRecord: RepairRecord = {
      id: Date.now().toString(),
      customer,
      productModel,
      productArea,
      rmaNumber,
      productName,
      entryDate,
      partsActions,
      technicianNotes,
      status: 'Completed',
      technician: getTechnicianName(currentUser.email)
    };

    // Generate AI Report with current parts list
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

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <button onClick={onCancel} className="mb-4 flex items-center text-gray-500 hover:text-gray-900 transition-colors">
        <IconArrowLeft className="w-5 h-5 mr-1" /> Back
      </button>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="bg-orange-600 px-4 sm:px-8 py-4 sm:py-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
            <IconRobot className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-orange-100" />
            New Repair Entry
          </h2>
          <p className="text-orange-100 mt-1 text-sm sm:text-base">AI will auto-generate the customer report.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          
          {/* Section 1: Product & RMA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">RMA Number</label>
                  <input required type="text" value={rmaNumber} onChange={e => setRmaNumber(e.target.value)} 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border" 
                    placeholder="RMA-" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Date</label>
                  <input required type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border" />
                </div>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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

          <div className="border-t border-gray-200 pt-4 sm:pt-6">
             <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Customer Details</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="md:col-span-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Full Name</label>
                    <input required type="text" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} 
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
             </div>
          </div>

          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Spare Parts</h3>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 overflow-x-auto w-full sm:w-auto pb-1">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setFilterCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all whitespace-nowrap ${
                                filterCategory === cat
                                ? 'bg-orange-600 text-white shadow-md ring-2 ring-orange-600 ring-offset-1'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-orange-300'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {Object.entries(partsByCategory)
                .filter(([category]) => filterCategory === 'All' || category === filterCategory)
                .map(([category, parts]: [string, Part[]]) => (
                <div key={category} className="bg-gray-50 rounded-lg p-3 sm:p-4 transition-all duration-300">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{category}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {parts.map(part => {
                      const selectedPart = partsActions.find(p => p.partId === part.id);
                      const isSelected = !!selectedPart;

                      return (
                        <div key={part.id} className={`flex flex-col p-2 sm:p-3 rounded border transition-all ${isSelected ? 'bg-white border-orange-500 ring-1 ring-orange-500 shadow-sm' : 'bg-white border-gray-200 hover:border-orange-300'}`}>
                          <label className="flex items-start space-x-3 cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                              checked={isSelected}
                              onChange={() => handlePartToggle(part.id)}
                            />
                            <span className={`text-sm font-medium ${isSelected ? 'text-orange-900' : 'text-gray-900'}`}>{part.name}</span>
                          </label>
                          
                          {/* Action Selector */}
                          {isSelected && (
                            <div className="ml-7 flex rounded-md shadow-sm" role="group">
                                <button
                                    type="button"
                                    onClick={() => handleActionChange(part.id, 'replaced')}
                                    className={`flex-1 px-2 py-1 text-xs font-medium rounded-l-md border ${
                                        selectedPart.action === 'replaced' 
                                        ? 'bg-orange-600 text-white border-orange-600' 
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    Replace
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleActionChange(part.id, 'repaired')}
                                    className={`flex-1 px-2 py-1 text-xs font-medium rounded-r-md border-t border-r border-b ${
                                        selectedPart.action === 'repaired' 
                                        ? 'bg-blue-600 text-white border-blue-600' 
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    Repair
                                </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 sm:pt-6">
             <label className="block text-base sm:text-lg font-medium text-gray-900 mb-2">Technician Notes</label>
             <textarea 
                rows={3} 
                value={technicianNotes} 
                onChange={e => setTechnicianNotes(e.target.value)}
                placeholder="Internal notes..."
                className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full text-sm border-gray-300 rounded-md p-2 border"
             />
          </div>

          <div className="pt-4 flex justify-end items-center space-x-3 sticky bottom-0 bg-white border-t border-gray-100 p-4 -mx-4 sm:static sm:bg-transparent sm:border-0 sm:p-0 sm:mx-0">
            <button type="button" onClick={onCancel} className="flex-1 sm:flex-none px-4 sm:px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
              Cancel
            </button>
            <button 
                type="submit" 
                disabled={isGenerating}
                className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white ${isGenerating ? 'bg-orange-400' : 'bg-orange-600 hover:bg-orange-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center justify-center`}
            >
              {isGenerating ? (
                <>
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Complete & Generate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
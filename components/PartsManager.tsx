import React, { useState, useRef } from 'react';
import { Part } from '../types';
import { IconArrowLeft, IconPlus, IconList, IconTrash, IconEdit, IconCheck, IconX, IconDownload, IconUpload } from './Icons';
import { utils, read, writeFile } from 'xlsx';

interface PartsManagerProps {
  parts: Part[];
  onUpdateParts: (parts: Part[]) => void;
  onBack: () => void;
}

const CATEGORIES: Part['category'][] = ['Motor', 'Electronics', 'Chassis', 'Cutting', 'Accessories'];

export const PartsManager: React.FC<PartsManagerProps> = ({ parts, onUpdateParts, onBack }) => {
  // New Part State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Part['category']>('Motor');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Part State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  // UI State
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newPart: Part = {
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: newName.trim(),
      category: newCategory
    };

    onUpdateParts([...parts, newPart]);
    setNewName('');
  };

  const handleDeletePart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Removed window.confirm to ensure the action executes reliably in all environments
    const updatedParts = parts.filter(p => p.id !== id);
    onUpdateParts(updatedParts);
  };

  const startEditing = (part: Part) => {
    setEditingId(part.id);
    setEditName(part.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEditing = (id: string) => {
    if (!editName.trim()) return;
    const updatedParts = parts.map(p => 
      p.id === id ? { ...p, name: editName.trim() } : p
    );
    onUpdateParts(updatedParts);
    setEditingId(null);
    setEditName('');
  };

  const handleExport = () => {
    // Convert parts data to a worksheet
    const ws = utils.json_to_sheet(parts);
    
    // Create a new workbook and append the worksheet
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Spare Parts");
    
    // Save file
    writeFile(wb, `Mammotion_Spare_Parts_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        
        // Read the workbook from array buffer
        const workbook = read(data, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to JSON
        const jsonData = utils.sheet_to_json(worksheet) as any[];
        
        // Map and validate
        const validParts: Part[] = jsonData.map(item => ({
            id: item.id ? String(item.id) : `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: item.name ? String(item.name) : 'Unknown Part',
            category: (item.category ? String(item.category) : 'Accessories') as Part['category']
        })).filter(p => p.name !== 'Unknown Part');

        if (validParts.length > 0) {
            onUpdateParts(validParts);
            alert(`Successfully imported ${validParts.length} parts from Excel.`);
        } else {
            alert('No valid parts found in the Excel file. Please ensure columns are: id, name, category');
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Error parsing file. Please ensure it is a valid Excel file (.xlsx or .xls).');
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  const partsByCategory = parts.reduce((acc, part) => {
    const cat = part.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(part);
    return acc;
  }, {} as Record<string, Part[]>);
  
  const filterCategories = ['All', ...Object.keys(partsByCategory)];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={onBack} className="mb-6 flex items-center text-gray-500 hover:text-gray-900 transition-colors">
        <IconArrowLeft className="w-5 h-5 mr-1" /> Back to Dashboard
      </button>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gray-800 px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
                <IconList className="w-8 h-8 mr-3 text-gray-300" />
                Manage Spare Parts
            </h2>
            <p className="text-gray-400 mt-1">Add, remove, or rename parts available for repair technicians.</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button 
                onClick={handleExport}
                className="inline-flex items-center px-3 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
                <IconDownload className="h-4 w-4 mr-2" />
                Export Excel
            </button>
            <button 
                onClick={handleImportClick}
                className="inline-flex items-center px-3 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
                <IconUpload className="h-4 w-4 mr-2" />
                Import Excel
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".xlsx, .xls" 
                onChange={handleImportFile} 
            />
          </div>
        </div>

        <div className="p-8">
          {/* Add New Part Form */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Part</h3>
            <form onSubmit={handleAddPart} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-grow w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rear Bumper Assembly"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                  required
                />
              </div>
              <div className="md:w-1/4 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Part['category'])}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center"
              >
                <IconPlus className="w-5 h-5 mr-1" /> Add
              </button>
            </form>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filterCategories.map(cat => (
                <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all ${
                        filterCategory === cat
                        ? 'bg-gray-800 text-white shadow-md ring-2 ring-gray-600 ring-offset-1'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                >
                    {cat}
                </button>
            ))}
          </div>

          {/* List of Parts */}
          <div className="space-y-8">
            {Object.keys(partsByCategory).length === 0 ? (
                <p className="text-gray-500 text-center py-4">No parts available.</p>
            ) : (
                Object.entries(partsByCategory)
                .filter(([category]) => filterCategory === 'All' || category === filterCategory)
                .map(([category, categoryParts]: [string, Part[]]) => (
                <div key={category} className="bg-white rounded-lg">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryParts.map(part => (
                        <div key={part.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:border-green-300 transition-colors group">
                            
                            {editingId === part.id ? (
                                // Edit Mode
                                <div className="flex items-center flex-grow space-x-2">
                                    <input 
                                        type="text" 
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-1 border"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveEditing(part.id);
                                            if (e.key === 'Escape') cancelEditing();
                                        }}
                                    />
                                    <button onClick={() => saveEditing(part.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-full" title="Save">
                                        <IconCheck className="w-4 h-4" />
                                    </button>
                                    <button onClick={cancelEditing} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full" title="Cancel">
                                        <IconX className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                // Display Mode
                                <>
                                    <span className="text-sm font-medium text-gray-900">{part.name}</span>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            type="button"
                                            onClick={() => startEditing(part)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            title="Edit Name"
                                        >
                                            <IconEdit className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => handleDeletePart(e, part.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                                            title="Delete Part"
                                        >
                                            <IconTrash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useRef } from 'react';
import { RepairRecord, User } from '../types';
import { IconPlus, IconWrench, IconList, IconUser, IconLogOut, IconDownload, IconUpload, IconEdit, IconTrash } from './Icons';

interface DashboardProps {
  records: RepairRecord[];
  currentUser: User;
  onNewRepair: () => void;
  onContinueRepair: (record: RepairRecord) => void;
  onViewRecord: (record: RepairRecord) => void;
  onDeleteRecord: (id: string) => void;
  onManageParts: () => void;
  onManageUsers: () => void;
  onLogout: () => void;
  onExportRecords: () => void;
  onImportRecords: (file: File) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    records, 
    currentUser, 
    onNewRepair,
    onContinueRepair,
    onViewRecord,
    onDeleteRecord,
    onManageParts, 
    onManageUsers, 
    onLogout,
    onExportRecords,
    onImportRecords
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRecords = records.filter(r => 
    r.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.rmaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.productModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.productName && r.productName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        onImportRecords(file);
    }
    // Reset value so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this record? This action cannot be undone.')) {
        onDeleteRecord(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header Section - Stacked on Mobile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Repair Log</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome, <span className="font-semibold text-orange-600">{currentUser.email}</span></p>
        </div>
        
        {/* Action Buttons - Scrollable on very small screens */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {/* Sync Buttons */}
             <button
                onClick={onExportRecords}
                className="flex-1 sm:flex-none justify-center inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                title="Export Records to Excel"
            >
                <IconUpload className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Export</span>
            </button>
            <button
                onClick={handleImportClick}
                className="flex-1 sm:flex-none justify-center inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                title="Import Records from Excel"
            >
                <IconDownload className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Import</span>
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".xlsx, .xls" 
                onChange={handleFileChange} 
            />

            <div className="w-px h-8 bg-gray-300 mx-1 hidden sm:block"></div>

            {currentUser.isAdmin && (
                <button
                onClick={onManageUsers}
                className="flex-1 sm:flex-none justify-center inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                >
                <IconUser className="sm:-ml-1 sm:mr-2 h-5 w-5 text-gray-500" />
                <span className="hidden sm:inline">Users</span>
                </button>
            )}
            <button
            onClick={onManageParts}
            className="flex-1 sm:flex-none justify-center inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
            <IconList className="sm:-ml-1 sm:mr-2 h-5 w-5 text-gray-500" />
            <span className="hidden sm:inline">Parts</span>
            <span className="sm:hidden">Parts</span>
            </button>
            <button
            onClick={onNewRepair}
            className="flex-grow sm:flex-grow-0 justify-center inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
            <IconPlus className="-ml-1 mr-2 h-5 w-5" />
            New Repair
            </button>
            <button
            onClick={onLogout}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            title="Log Out"
            >
            <IconLogOut className="h-5 w-5" />
            </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative w-full">
                <input 
                    type="text" 
                    placeholder="Search by Name, RMA, or Model..." 
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 px-4">
            <IconWrench className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new repair record.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-orange-50 cursor-pointer" onClick={() => onViewRecord(record)}>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${record.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          record.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                          record.status === 'Quoted' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{record.rmaNumber}</div>
                        <div className="text-sm text-gray-500">{record.customer.name}</div>
                        {/* Mobile only details */}
                        <div className="md:hidden text-xs text-gray-400 mt-1">
                            {record.productModel} {record.productArea}
                        </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="font-medium block">{record.productModel} {record.productArea}</span>
                        {record.productName && <div className="text-xs text-gray-400">{record.productName}</div>}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.entryDate}</td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.technician || '-'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {record.status === 'Quoted' && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onContinueRepair(record); }}
                                className="text-blue-600 hover:text-blue-900 flex items-center bg-blue-50 px-2 py-1 rounded"
                                title="Continue Repair"
                            >
                                <IconEdit className="w-4 h-4 mr-1"/> Continue
                            </button>
                        )}
                        <button className="text-orange-600 hover:text-orange-900 flex items-center bg-orange-50 px-2 py-1 rounded">View</button>
                        
                        {/* Delete button only for Admins */}
                        {currentUser.isAdmin && (
                            <button 
                                onClick={(e) => handleDeleteClick(e, record.id)}
                                className="text-red-500 hover:text-red-700 flex items-center bg-red-50 px-2 py-1 rounded ml-2"
                                title="Delete Record"
                            >
                                <IconTrash className="w-4 h-4" />
                            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
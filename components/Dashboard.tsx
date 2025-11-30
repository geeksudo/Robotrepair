import React, { useState } from 'react';
import { RepairRecord } from '../types';
import { IconPlus, IconWrench, IconList } from './Icons';

interface DashboardProps {
  records: RepairRecord[];
  onNewRepair: () => void;
  onViewRecord: (record: RepairRecord) => void;
  onManageParts: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ records, onNewRepair, onViewRecord, onManageParts }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter(r => 
    r.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.rmaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.productModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.productName && r.productName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Repair Management</h1>
          <p className="mt-1 text-gray-500">Track and manage Mammotion product repairs.</p>
        </div>
        <div className="flex space-x-3">
            <button
            onClick={onManageParts}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
            <IconList className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Manage Parts
            </button>
            <button
            onClick={onNewRepair}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
            <IconPlus className="-ml-1 mr-2 h-5 w-5" />
            New Repair
            </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
            <div className="relative flex-grow max-w-md">
                <input 
                    type="text" 
                    placeholder="Search by Name, RMA, or Model..." 
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <IconWrench className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new repair record.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RMA #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onViewRecord(record)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${record.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          record.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.rmaNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-medium text-gray-900">{record.customer.name}</div>
                        <div className="text-gray-400 text-xs">{record.customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="font-medium">{record.productModel} {record.productArea}</span>
                        {record.productName && <div className="text-xs text-gray-400">{record.productName}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.entryDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-green-600 hover:text-green-900">View</button>
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
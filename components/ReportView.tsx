import React, { useState } from 'react';
import { RepairRecord, Part } from '../types';
import { IconArrowLeft, IconMail, IconCheck, IconSparkles, IconUser, IconCopy } from './Icons';

interface ReportViewProps {
  record: RepairRecord;
  availableParts: Part[];
  onClose: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ record, availableParts, onClose }) => {
  const [viewMode, setViewMode] = useState<'email' | 'sms' | 'quote'>('email');
  const [copied, setCopied] = useState(false);

  // If record is only Quoted, default to quote view
  React.useEffect(() => {
    if (record.status === 'Quoted' && record.aiQuote) {
        setViewMode('quote');
    }
  }, [record.status, record.aiQuote]);

  const handleSendEmail = () => {
    const content = viewMode === 'quote' ? record.aiQuote : record.aiReport;
    alert(`Simulating email sent to ${record.customer.email}\n\nContent:\n${content}`);
  };

  const handleSendSMS = () => {
    alert(`Simulating SMS sent to ${record.customer.phone}\n\nContent:\n${record.aiSms}`);
  };

  const handleCopy = () => {
    const textToCopy = viewMode === 'quote' ? record.aiQuote : (viewMode === 'sms' ? record.aiSms : record.aiReport);
    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper to visually render bold text from markdown style **Text** for the preview window
  const renderFormattedText = (text?: string) => {
    if (!text) return <span className="text-gray-400 italic">No content generated.</span>;
    
    // Split by ** to find bold sections
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            // Remove stars and wrap in strong
            return <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
      <button onClick={onClose} className="mb-4 flex items-center text-gray-500 hover:text-gray-900 transition-colors">
        <IconArrowLeft className="w-5 h-5 mr-1" /> Back
      </button>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Tech Summary */}
        <div className="bg-gray-50 p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 order-2 md:order-1">
           <div className="flex items-center justify-between mb-4">
               <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Internal Record</h3>
               <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${record.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                      record.status === 'Quoted' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {record.status}
               </span>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-0">
               <div className="mb-4 md:mb-6">
                 <span className="block text-xs text-gray-500 uppercase">RMA #</span>
                 <span className="block text-lg font-bold text-gray-900">{record.rmaNumber}</span>
               </div>

               <div className="mb-4 md:mb-6">
                 <span className="block text-xs text-gray-500 uppercase">Model</span>
                 <span className="block font-medium text-gray-900 text-sm">{record.productModel} {record.productArea}</span>
                 {record.productName && <span className="block text-xs text-gray-500 break-all">{record.productName}</span>}
               </div>
           </div>

            <div className="mb-4 md:mb-6">
                <span className="block text-xs text-gray-500 uppercase">Technician</span>
                <div className="flex items-center mt-1">
                    <IconUser className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900 text-sm">{record.technician || 'Unknown'}</span>
                </div>
            </div>

           <div className="mb-4 md:mb-6">
             <span className="block text-xs text-gray-500 uppercase">Parts & Costs</span>
             <ul className="mt-2 space-y-2">
                {record.partsActions.length > 0 ? record.partsActions.map(action => {
                    const part = availableParts.find(p => p.id === action.partId);
                    // Calculate effective price: 0 for repaired, standard price for replaced
                    const effectivePrice = action.action === 'repaired' ? 0 : (part?.price || 0);
                    
                    return (
                        <li key={action.partId} className="text-sm text-gray-700 flex flex-col items-start bg-white p-2 rounded border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between w-full font-medium">
                                <div className="flex items-center">
                                    <IconCheck className="h-4 w-4 text-orange-500 mr-2"/>
                                    {part?.name || action.partId}
                                </div>
                                <span className="text-xs text-gray-500">${effectivePrice.toFixed(2)}</span>
                            </div>
                            <span className={`text-xs ml-6 px-1.5 py-0.5 rounded ${action.action === 'replaced' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                {action.action === 'replaced' ? 'Replaced' : 'Repaired'}
                            </span>
                        </li>
                    )
                }) : <li className="text-sm text-gray-400 italic">No parts logged</li>}
             </ul>
             
             {(record.laborCost !== undefined) && (
                 <div className="mt-3 pt-3 border-t border-gray-200">
                     <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Labor Cost:</span>
                         <span className="font-medium">${record.laborCost}</span>
                     </div>
                 </div>
             )}
           </div>

           <div className="mb-0">
             <span className="block text-xs text-gray-500 uppercase">Tech Notes</span>
             <p className="text-sm text-gray-700 mt-1 bg-white p-2 rounded border border-gray-200">
                {record.technicianNotes}
             </p>
           </div>
        </div>

        {/* Right Side: Generated Report */}
        <div className="p-6 md:w-2/3 flex flex-col order-1 md:order-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {viewMode === 'quote' ? 'Quotation' : 'Repair Report'}
                </h2>
                <div className="self-start sm:self-auto flex items-center space-x-2 text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                    <IconSparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>AI Generated</span>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex mb-4 bg-gray-100 p-1 rounded-lg self-start">
                <button
                    onClick={() => setViewMode('email')}
                    disabled={!record.aiReport}
                    className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
                        viewMode === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 disabled:opacity-50'
                    }`}
                >
                    Final Report
                </button>
                <button
                    onClick={() => setViewMode('sms')}
                    disabled={!record.aiSms}
                    className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
                        viewMode === 'sms' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 disabled:opacity-50'
                    }`}
                >
                    SMS
                </button>
                <button
                    onClick={() => setViewMode('quote')}
                    disabled={!record.aiQuote}
                    className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
                        viewMode === 'quote' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 disabled:opacity-50'
                    }`}
                >
                    Quotation
                </button>
            </div>

            <div className="flex-grow bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6 shadow-inner whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-sm sm:text-base">
                {viewMode === 'email' && renderFormattedText(record.aiReport)}
                {viewMode === 'sms' && (record.aiSms || 'No SMS content generated.')}
                {viewMode === 'quote' && renderFormattedText(record.aiQuote)}
            </div>

            <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                    onClick={handleCopy}
                    className={`flex justify-center items-center w-full px-4 py-3 border rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm transition-all ${
                        copied 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-orange-500'
                    }`}
                >
                    {copied ? <IconCheck className="w-5 h-5 mr-2" /> : <IconCopy className="w-5 h-5 mr-2" />}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button 
                    onClick={handleSendEmail}
                    className="flex justify-center items-center w-full px-4 py-3 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
                >
                    <IconMail className="w-5 h-5 mr-2" />
                    {viewMode === 'quote' ? 'Send Quote' : 'Send Email'}
                </button>
                 {viewMode === 'sms' && (
                     <button 
                        onClick={handleSendSMS}
                        className="col-span-1 sm:col-span-2 flex justify-center items-center w-full px-4 py-3 bg-white border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-sm"
                    >
                        Send SMS
                    </button>
                 )}
            </div>
        </div>

      </div>
    </div>
  );
};

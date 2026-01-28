import React, { useState } from 'react';
import { Transaction } from '../types';
import { Trash2, Plus, FileSpreadsheet, Download, Link, ExternalLink } from 'lucide-react';

interface DataEntryTableProps {
  data: Transaction[];
  onUpdate: (data: Transaction[]) => void;
}

export const DataEntryTable: React.FC<DataEntryTableProps> = ({ data, onUpdate }) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [newRow, setNewRow] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    productName: '',
    revenue: 0,
    productCost: 0,
    marketingCost: 0,
    otherExpenses: 0
  });

  const handleDelete = (id: string) => {
    onUpdate(data.filter(item => item.id !== id));
  };

  const handleAdd = () => {
    if (!newRow.productName) return; 
    
    const newItem: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: newRow.date || new Date().toISOString().split('T')[0],
      productName: newRow.productName,
      revenue: Number(newRow.revenue),
      productCost: Number(newRow.productCost),
      marketingCost: Number(newRow.marketingCost),
      otherExpenses: Number(newRow.otherExpenses)
    };
    
    onUpdate([newItem, ...data]); 
    setNewRow({
        date: new Date().toISOString().split('T')[0],
        productName: '',
        revenue: 0,
        productCost: 0,
        marketingCost: 0,
        otherExpenses: 0
    });
  };

  const handleChange = (id: string, field: keyof Transaction, value: string | number) => {
    const updatedData = data.map(item => {
      if (item.id === id) {
        return { ...item, [field]: field === 'date' || field === 'productName' ? value : Number(value) };
      }
      return item;
    });
    onUpdate(updatedData);
  };

  const handleConnectSheet = () => {
    if (sheetUrl.includes('docs.google.com/spreadsheets')) {
      setIsConnected(true);
      // In a real app, this would trigger an API call.
      // Here we just simulate the connection state.
      alert('Linked to Google Sheet successfully! (Simulation Mode)');
    } else {
      alert('Please enter a valid Google Sheets URL');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Product/Service', 'Revenue', 'Product Cost', 'Marketing Cost', 'Other Expenses', 'Total Cost', 'Net Profit'];
    const csvRows = [headers.join(',')];

    data.forEach(item => {
      const totalCost = item.productCost + item.marketingCost + item.otherExpenses;
      const netProfit = item.revenue - totalCost;
      const row = [
        item.date,
        `"${item.productName.replace(/"/g, '""')}"`, // Escape quotes
        item.revenue,
        item.productCost,
        item.marketingCost,
        item.otherExpenses,
        totalCost,
        netProfit
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'bizanalytics_data_pkr.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Google Sheets Integration Bar */}
      <div className="p-4 bg-green-50 border-b border-green-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="bg-green-600 p-1.5 rounded text-white">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Google Sheets Integration</h3>
            <p className="text-xs text-gray-500">{isConnected ? 'Sync Active' : 'Link your sheet'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!isConnected ? (
             <div className="flex gap-2 w-full">
               <input 
                 type="text" 
                 placeholder="Paste Google Sheet URL..." 
                 className="text-xs border border-gray-300 rounded px-2 py-1.5 w-full sm:w-64 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                 value={sheetUrl}
                 onChange={(e) => setSheetUrl(e.target.value)}
               />
               <button 
                 onClick={handleConnectSheet}
                 className="flex items-center gap-1 bg-green-600 text-white text-xs px-3 py-1.5 rounded hover:bg-green-700 transition-colors whitespace-nowrap"
               >
                 <Link size={12} /> Connect
               </button>
             </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs text-green-700 font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Sync (Simulated)
              </span>
              <a 
                href={sheetUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 underline"
              >
                Open Sheet <ExternalLink size={10} />
              </a>
              <button 
                onClick={() => { setIsConnected(false); setSheetUrl(''); }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Disconnect
              </button>
            </div>
          )}
          
          <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
          
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-1 bg-white border border-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap"
            title="Download CSV to upload to Google Sheets"
          >
            <Download size={12} /> Export to Sheets
          </button>
        </div>
      </div>
      
      {/* Table Header */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Local Data Buffer</span>
        <span className="text-xs text-gray-500 bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Auto-Calculates Net Profit</span>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-32">Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Product / Service</th>
              <th className="px-4 py-3 text-right font-medium text-blue-600 uppercase tracking-wider">Revenue (PKR)</th>
              <th className="px-4 py-3 text-right font-medium text-red-500 uppercase tracking-wider">Prod. Cost</th>
              <th className="px-4 py-3 text-right font-medium text-red-500 uppercase tracking-wider">Mkt. Cost</th>
              <th className="px-4 py-3 text-right font-medium text-red-500 uppercase tracking-wider">Other Exp.</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700 uppercase tracking-wider bg-gray-100">Total Cost</th>
              <th className="px-4 py-3 text-right font-medium text-gray-900 uppercase tracking-wider bg-gray-100">Net Profit</th>
              <th className="px-4 py-3 text-center w-16">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Input Row */}
            <tr className="bg-blue-50/50">
              <td className="px-4 py-2">
                <input 
                  type="date" 
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-1"
                  value={newRow.date}
                  onChange={(e) => setNewRow({...newRow, date: e.target.value})}
                />
              </td>
              <td className="px-4 py-2">
                <input 
                  type="text" 
                  placeholder="New Item Name"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-1"
                  value={newRow.productName}
                  onChange={(e) => setNewRow({...newRow, productName: e.target.value})}
                />
              </td>
              <td className="px-4 py-2">
                <input 
                  type="number" 
                  min="0"
                  className="w-full text-right border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-1"
                  value={newRow.revenue}
                  onChange={(e) => setNewRow({...newRow, revenue: Number(e.target.value)})}
                />
              </td>
              <td className="px-4 py-2">
                <input 
                  type="number" 
                  min="0"
                  className="w-full text-right border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-1"
                  value={newRow.productCost}
                  onChange={(e) => setNewRow({...newRow, productCost: Number(e.target.value)})}
                />
              </td>
              <td className="px-4 py-2">
                 <input 
                  type="number" 
                  min="0"
                  className="w-full text-right border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-1"
                  value={newRow.marketingCost}
                  onChange={(e) => setNewRow({...newRow, marketingCost: Number(e.target.value)})}
                />
              </td>
              <td className="px-4 py-2">
                 <input 
                  type="number" 
                  min="0"
                  className="w-full text-right border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-1"
                  value={newRow.otherExpenses}
                  onChange={(e) => setNewRow({...newRow, otherExpenses: Number(e.target.value)})}
                />
              </td>
              <td className="px-4 py-2 text-right text-gray-400 italic">Auto</td>
              <td className="px-4 py-2 text-right text-gray-400 italic">Auto</td>
              <td className="px-4 py-2 text-center">
                <button 
                  onClick={handleAdd}
                  className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  title="Add Row"
                >
                  <Plus size={16} />
                </button>
              </td>
            </tr>

            {/* Data Rows */}
            {data.map((item) => {
               const totalCost = item.productCost + item.marketingCost + item.otherExpenses;
               const netProfit = item.revenue - totalCost;
               const profitClass = netProfit > 0 ? 'text-green-600 font-medium' : netProfit < 0 ? 'text-red-600 font-medium' : 'text-yellow-600 font-medium';

               return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2">
                    <input 
                      type="date"
                      value={item.date}
                      onChange={(e) => handleChange(item.id, 'date', e.target.value)}
                      className="bg-transparent border-none w-full focus:ring-0 p-0 text-sm"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input 
                      type="text"
                      value={item.productName}
                      onChange={(e) => handleChange(item.id, 'productName', e.target.value)}
                      className="bg-transparent border-none w-full focus:ring-0 p-0 text-sm font-medium text-gray-900"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input 
                      type="number"
                      value={item.revenue}
                      onChange={(e) => handleChange(item.id, 'revenue', e.target.value)}
                      className="bg-transparent border-none w-full focus:ring-0 p-0 text-sm text-right"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input 
                      type="number"
                      value={item.productCost}
                      onChange={(e) => handleChange(item.id, 'productCost', e.target.value)}
                      className="bg-transparent border-none w-full focus:ring-0 p-0 text-sm text-right text-gray-600"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input 
                      type="number"
                      value={item.marketingCost}
                      onChange={(e) => handleChange(item.id, 'marketingCost', e.target.value)}
                      className="bg-transparent border-none w-full focus:ring-0 p-0 text-sm text-right text-gray-600"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input 
                      type="number"
                      value={item.otherExpenses}
                      onChange={(e) => handleChange(item.id, 'otherExpenses', e.target.value)}
                      className="bg-transparent border-none w-full focus:ring-0 p-0 text-sm text-right text-gray-600"
                    />
                  </td>
                  <td className="px-4 py-2 text-right bg-gray-50 text-gray-700 font-medium">
                    {totalCost.toLocaleString()}
                  </td>
                  <td className={`px-4 py-2 text-right bg-gray-50 ${profitClass}`}>
                    {netProfit.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
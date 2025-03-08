// MainApp.js - Your main application file
import React, { useState, useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PDFDownloadButton, convertChartToImage } from './PDFGenerator';

const MainApp = () => {
  // State for your data and UI controls
  const [data, setData] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({
    department: 'all',
    timeRange: 'month',
    dataType: 'sales'
  });
  const [showPdfButton, setShowPdfButton] = useState(false);
  const [chartImageUrl, setChartImageUrl] = useState(null);
  const chartRef = useRef(null);
  
  // Sample data - In a real app, this might come from an API
  const allData = {
    sales: [
      { name: 'Jan', value: 4000, profit: 2400 },
      { name: 'Feb', value: 3000, profit: 1398 },
      { name: 'Mar', value: 2000, profit: 9800 },
      { name: 'Apr', value: 2780, profit: 3908 },
      { name: 'May', value: 1890, profit: 4800 },
      { name: 'Jun', value: 2390, profit: 3800 },
    ],
    inventory: [
      { name: 'Jan', value: 500, profit: 300 },
      { name: 'Feb', value: 450, profit: 280 },
      { name: 'Mar', value: 600, profit: 350 },
      { name: 'Apr', value: 550, profit: 320 },
      { name: 'May', value: 700, profit: 400 },
      { name: 'Jun', value: 650, profit: 380 },
    ]
  };
  
  // Filter data based on selections
  useEffect(() => {
    // In a real app, this would be more complex filtering
    setData(allData[selectedOptions.dataType] || []);
    
    // Reset PDF button and chart image when selections change
    setShowPdfButton(false);
    setChartImageUrl(null);
  }, [selectedOptions]);
  
  // Handle option changes
  const handleOptionChange = (option, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };
  
  // Handle "Generate Report" button click
  const handleGenerateReport = async () => {
    // Convert the chart to an image
    const imageUrl = await convertChartToImage(chartRef);
    setChartImageUrl(imageUrl);
    setShowPdfButton(true);
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Sales Dashboard</h1>
      
      {/* Controls section */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-3">Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Department</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedOptions.department}
              onChange={(e) => handleOptionChange('department', e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Time Range</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedOptions.timeRange}
              onChange={(e) => handleOptionChange('timeRange', e.target.value)}
            >
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="quarter">Quarterly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Data Type</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedOptions.dataType}
              onChange={(e) => handleOptionChange('dataType', e.target.value)}
            >
              <option value="sales">Sales</option>
              <option value="inventory">Inventory</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Data visualization section */}
      {data.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Performance Data</h2>
          
          <div className="bg-white border p-4 rounded" ref={chartRef}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" name="Value" />
                <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Table display */}
          <div className="mt-6 bg-white border rounded overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Month</th>
                  <th className="p-2 text-left">Value</th>
                  <th className="p-2 text-left">Profit</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">${item.value}</td>
                    <td className="p-2">${item.profit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Report generation section */}
      <div className="flex justify-between items-center mt-6">
        <button 
          onClick={handleGenerateReport}
          disabled={data.length === 0}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          Generate Report
        </button>
        
        {showPdfButton && chartImageUrl && (
          <PDFDownloadButton 
            data={data} 
            chartImageUrl={chartImageUrl} 
            fileName={`${selectedOptions.dataType}-report.pdf`}
            title={`${selectedOptions.dataType.charAt(0).toUpperCase() + selectedOptions.dataType.slice(1)} Report`}
          />
        )}
      </div>
    </div>
  );
};

export default MainApp;
import React, { useState, useEffect } from 'react';

const EnergyRetrofitCalculator = () => {
  // State for building inputs
  const [buildingData, setBuildingData] = useState({
    squareMeters: 100,
    yearBuilt: 1980,
    floors: 2,
    insulation: 'poor', // poor, average, good
    heatingSystem: 'gas', // gas, oil, electric, heat-pump
    windows: 'single', // single, double, triple
    occupants: 2,
    location: 'moderate', // cold, moderate, warm
    roofType: 'pitched', // pitched, flat
    wallType: 'brick', // brick, concrete, wood
  });

  // State for calculation results
  const [results, setResults] = useState({
    annualEnergyUsage: 0, // kWh
    annualCO2Emissions: 0, // kg
    energyCostPerYear: 0, // $

  });

  // State for selected retrofits
  const [selectedRetrofits, setSelectedRetrofits] = useState([]);
  
  // State for active page
  const [activePage, setActivePage] = useState('calculator'); // calculator, impressum, about
  
  // State to track if calculations are up to date
  const [calculationsUpToDate, setCalculationsUpToDate] = useState(false);

  // Retrofit options database
  const retrofitOptions = [
    {
      id: 1,
      name: 'Roof Insulation Upgrade',
      description: 'Add additional insulation to roof/attic',
      applicableIf: (data) => data.insulation !== 'good',
      cost: (data) => data.squareMeters * (data.roofType === 'pitched' ? 35 : 40),
      energySavingsPercent: 15,
      co2ReductionPercent: 15,
      propertyValueIncrease: (data) => data.squareMeters * 10,
      lifespan: 30,
    },
    {
      id: 2,
      name: 'Wall Insulation',
      description: 'Add external or cavity wall insulation',
      applicableIf: (data) => data.insulation !== 'good',
      cost: (data) => data.squareMeters * 60,
      energySavingsPercent: 25,
      co2ReductionPercent: 25,
      propertyValueIncrease: (data) => data.squareMeters * 15,
      lifespan: 30,
    },
    {
      id: 3,
      name: 'Window Replacement',
      description: 'Replace with high-efficiency double or triple glazing',
      applicableIf: (data) => data.windows !== 'triple',
      cost: (data) => data.squareMeters * 80,
      energySavingsPercent: 10,
      co2ReductionPercent: 10,
      propertyValueIncrease: (data) => data.squareMeters * 20,
      lifespan: 25,
    },
    {
      id: 4,
      name: 'Heat Pump Installation',
      description: 'Replace conventional heating with air-source heat pump',
      applicableIf: (data) => data.heatingSystem !== 'heat-pump',
      cost: (data) => 8000 + (data.squareMeters * 10),
      energySavingsPercent: 40,
      co2ReductionPercent: 60,
      propertyValueIncrease: (data) => data.squareMeters * 30,
      lifespan: 20,
    },
    {
      id: 5,
      name: 'Solar Panel Installation',
      description: 'Install rooftop solar PV system',
      applicableIf: (data) => true,
      cost: (data) => Math.min(data.squareMeters * 0.5, 100) * 400, // Assume 0.5 panels per sqm, max 100 panels
      energySavingsPercent: 30,
      co2ReductionPercent: 30,
      propertyValueIncrease: (data) => data.squareMeters * 25,
      lifespan: 25,
    },
  ];

  // Energy usage calculation (simplified model)
  const calculateEnergyUsage = (data) => {
    // Base energy usage based on size and age
    let baseUsage = data.squareMeters * 150; // kWh per year base
    
    // Adjust for building age
    const currentYear = new Date().getFullYear();
    const ageAdjustment = Math.max(0, (1 - (currentYear - data.yearBuilt) * 0.005));
    baseUsage *= Math.min(1.5, Math.max(0.8, ageAdjustment));
    
    // Adjust for insulation
    const insulationFactors = {
      poor: 1.3,
      average: 1.0,
      good: 0.7,
    };
    baseUsage *= insulationFactors[data.insulation];
    
    // Adjust for heating system
    const heatingFactors = {
      gas: 1.0,
      oil: 1.2,
      electric: 0.9,
      'heat-pump': 0.4,
    };
    baseUsage *= heatingFactors[data.heatingSystem];
    
    // Adjust for windows
    const windowFactors = {
      single: 1.3,
      double: 1.0,
      triple: 0.8,
    };
    baseUsage *= windowFactors[data.windows];
    
    // Adjust for location climate
    const locationFactors = {
      cold: 1.3,
      moderate: 1.0,
      warm: 0.7,
    };
    baseUsage *= locationFactors[data.location];
    
    // Adjust for occupants
    baseUsage *= (1 + (data.occupants * 0.1));
    
    return Math.round(baseUsage);
  };

  // CO2 emission calculation
  const calculateCO2Emissions = (energyUsage, data) => {
    // CO2 emission factors (kg CO2 per kWh)
    const emissionFactors = {
      gas: 0.2,
      oil: 0.27,
      electric: 0.45, // Varies greatly by country/grid
      'heat-pump': 0.15,
    };
    
    return Math.round(energyUsage * emissionFactors[data.heatingSystem]);
  };

  // Energy cost calculation
  const calculateEnergyCost = (energyUsage, data) => {
    // Energy costs per kWh in currency units
    const costFactors = {
      gas: 0.08,
      oil: 0.09,
      electric: 0.15,
      'heat-pump': 0.13,
    };
    
    return Math.round(energyUsage * costFactors[data.heatingSystem]);
  };

  // Calculate retrofit metrics
  const calculateRetrofitMetrics = (retrofit, buildingData, results) => {
    const energySavings = results.annualEnergyUsage * (retrofit.energySavingsPercent / 100);
    const co2Savings = results.annualCO2Emissions * (retrofit.co2ReductionPercent / 100);
    const costSavings = results.energyCostPerYear * (retrofit.energySavingsPercent / 100);
    const cost = retrofit.cost(buildingData);
    const paybackYears = cost / costSavings;
    const valueIncrease = retrofit.propertyValueIncrease(buildingData);
    
    return {
      ...retrofit,
      energySavings,
      co2Savings,
      costSavings,
      cost,
      paybackYears,
      valueIncrease,
    };
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBuildingData({
      ...buildingData,
      [name]: name === 'squareMeters' || name === 'yearBuilt' || name === 'floors' || name === 'occupants' 
        ? parseInt(value) 
        : value,
    });
    setCalculationsUpToDate(false);
  };

  // Toggle retrofit selection
  const toggleRetrofitSelection = (retrofitId) => {
    if (selectedRetrofits.includes(retrofitId)) {
      setSelectedRetrofits(selectedRetrofits.filter(id => id !== retrofitId));
    } else {
      setSelectedRetrofits([...selectedRetrofits, retrofitId]);
    }
  };

  // Calculate totals for selected retrofits
  const calculateSelectedRetrofitsTotals = () => {
    const applicableRetrofits = retrofitOptions
      .filter(retrofit => retrofit.applicableIf(buildingData))
      .map(retrofit => calculateRetrofitMetrics(retrofit, buildingData, results));
    
    const selectedRetrofitsData = applicableRetrofits
      .filter(retrofit => selectedRetrofits.includes(retrofit.id));
      
    if (selectedRetrofitsData.length === 0) return null;
    
    return {
      totalCost: selectedRetrofitsData.reduce((sum, r) => sum + r.cost, 0),
      totalEnergySavings: selectedRetrofitsData.reduce((sum, r) => sum + r.energySavings, 0),
      totalCO2Savings: selectedRetrofitsData.reduce((sum, r) => sum + r.co2Savings, 0),
      totalCostSavings: selectedRetrofitsData.reduce((sum, r) => sum + r.costSavings, 0),
      totalValueIncrease: selectedRetrofitsData.reduce((sum, r) => sum + r.valueIncrease, 0),
      averagePayback: selectedRetrofitsData.reduce((sum, r) => sum + r.cost, 0) / 
                      selectedRetrofitsData.reduce((sum, r) => sum + r.costSavings, 0),
    };
  };

  // Function to calculate all results
  const calculateResults = () => {
    const annualEnergyUsage = calculateEnergyUsage(buildingData);
    const annualCO2Emissions = calculateCO2Emissions(annualEnergyUsage, buildingData);
    const energyCostPerYear = calculateEnergyCost(annualEnergyUsage, buildingData);
    
    setResults({
      annualEnergyUsage,
      annualCO2Emissions,
      energyCostPerYear,
    });
    
    setCalculationsUpToDate(true);
  };

  // Initial calculation on component mount
  useEffect(() => {
    calculateResults();
  }, []);

  // Get applicable retrofits
  const applicableRetrofits = retrofitOptions
    .filter(retrofit => retrofit.applicableIf(buildingData))
    .map(retrofit => calculateRetrofitMetrics(retrofit, buildingData, results));
  
  // Calculate retrofit totals
  const retrofitTotals = calculateSelectedRetrofitsTotals();

  // Reset application to default state
  const resetApplication = () => {
    setBuildingData({
      squareMeters: 100,
      yearBuilt: 1980,
      floors: 2,
      insulation: 'poor',
      heatingSystem: 'gas',
      windows: 'single',
      occupants: 2,
      location: 'moderate',
      roofType: 'pitched',
      wallType: 'brick',
    });
    setSelectedRetrofits([]);
    setActivePage('calculator');
    setCalculationsUpToDate(false);
    calculateResults();
  };

  // Render the header component
  const Header = () => (
    <header className="bg-gradient-to-r from-green-700 to-green-500 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-3 md:mb-0">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v2h8V6H6zm0 4v2h8v-2H6zm0 4v2h3v-2H6zm5 0v2h3v-2h-3z" clipRule="evenodd"></path>
            </svg>
            <h1 className="text-2xl font-bold text-white">EcoRetrofit Calculator</h1>
          </div>
          
          <nav className="flex space-x-1">
            <button 
              onClick={() => resetApplication()}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors duration-200 ${
                activePage === 'calculator' ? 'bg-white text-green-700' : 'bg-green-600 text-white hover:bg-green-500'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => setActivePage('about')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors duration-200 ${
                activePage === 'about' ? 'bg-white text-green-700' : 'bg-green-600 text-white hover:bg-green-500'
              }`}
            >
              About
            </button>
            <button 
              onClick={() => setActivePage('impressum')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors duration-200 ${
                activePage === 'impressum' ? 'bg-white text-green-700' : 'bg-green-600 text-white hover:bg-green-500'
              }`}
            >
              Impressum
            </button>
          </nav>
        </div>
      </div>
    </header>
  );

  // Content for About page
  const AboutPage = () => (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-green-700 border-b pb-3">About EcoRetrofit Calculator</h2>
      
      <div className="space-y-6 text-gray-700">
        <p>
          The EcoRetrofit Calculator is a powerful tool designed to help homeowners and building managers understand 
          the energy efficiency of their buildings and identify cost-effective retrofit measures to reduce energy consumption 
          and carbon emissions.
        </p>
        
        <h3 className="text-xl font-semibold text-green-600 mt-4">How It Works</h3>
        <p>
          Our calculator uses building science principles and simplified energy models to estimate your building's 
          energy consumption based on key characteristics. While not as precise as a professional energy audit, 
          it provides valuable insights into potential energy-saving opportunities.
        </p>
        
        <h3 className="text-xl font-semibold text-green-600 mt-4">Understanding Results</h3>
        <p>
          The calculator provides estimates for:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Annual energy consumption in kilowatt-hours (kWh)</li>
          <li>Carbon dioxide emissions in kilograms (kg)</li>
          <li>Energy costs based on typical utility rates</li>
          <li>Potential savings from various retrofit measures</li>
          <li>Financial metrics including payback period and property value increases</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-green-600 mt-4">Next Steps</h3>
        <p>
          After identifying promising retrofit measures with this calculator, we recommend:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Consulting with a professional energy auditor for more precise analysis</li>
          <li>Obtaining quotes from qualified contractors</li>
          <li>Researching available rebates and incentives in your area</li>
          <li>Prioritizing measures with the best combination of financial and environmental returns</li>
        </ul>
      </div>
    </div>
  );

  // Content for Impressum page
  const ImpressumPage = () => (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-green-700 border-b pb-3">Impressum (Legal Notice)</h2>
      
      <div className="space-y-6 text-gray-700">
        <h3 className="text-xl font-semibold text-green-600">Responsible for Content</h3>
        <p>
          EcoRetrofit Solutions GmbH<br />
          Energiestraße 123<br />
          10115 Berlin<br />
          Germany
        </p>
        
        <h3 className="text-xl font-semibold text-green-600 mt-4">Contact</h3>
        <p>
          Email: info@ecoretrofit-solutions.example<br />
          Phone: +49 30 123456789
        </p>
        
        <h3 className="text-xl font-semibold text-green-600 mt-4">Managing Directors</h3>
        <p>
          Dr. Emma Schmidt<br />
          Dipl.-Ing. Michael Weber
        </p>
        
        <h3 className="text-xl font-semibold text-green-600 mt-4">Commercial Register</h3>
        <p>
          Registration Court: Amtsgericht Berlin-Charlottenburg<br />
          Registration Number: HRB 123456 B<br />
          VAT Identification Number: DE987654321
        </p>
        
        <h3 className="text-xl font-semibold text-green-600 mt-4">Disclaimer</h3>
        <p>
          The information provided by the EcoRetrofit Calculator is for general informational purposes only. 
          All information on the application is provided in good faith, however we make no representation or warranty of any kind, 
          express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information.
        </p>
        <p>
          The calculator provides estimates based on simplified models. Actual results may vary based on specific building 
          characteristics, local climate, energy prices, and other factors. For accurate assessments, consider consulting with a 
          professional energy auditor or building engineer.
        </p>
      </div>
    </div>
  );

  // Main application rendering
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {activePage === 'calculator' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Input Form */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-green-700 border-b pb-2">Building Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Floor Area (m²)</label>
                    <input
                      type="number"
                      name="squareMeters"
                      value={buildingData.squareMeters}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Year Built</label>
                    <input
                      type="number"
                      name="yearBuilt"
                      value={buildingData.yearBuilt}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Number of Floors</label>
                    <input
                      type="number"
                      name="floors"
                      value={buildingData.floors}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Number of Occupants</label>
                    <input
                      type="number"
                      name="occupants"
                      value={buildingData.occupants}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Insulation Quality</label>
                    <select
                      name="insulation"
                      value={buildingData.insulation}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="poor">Poor</option>
                      <option value="average">Average</option>
                      <option value="good">Good</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Heating System</label>
                    <select
                      name="heatingSystem"
                      value={buildingData.heatingSystem}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="gas">Gas Boiler</option>
                      <option value="oil">Oil Boiler</option>
                      <option value="electric">Electric Heating</option>
                      <option value="heat-pump">Heat Pump</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Window Type</label>
                    <select
                      name="windows"
                      value={buildingData.windows}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="single">Single Glazing</option>
                      <option value="double">Double Glazing</option>
                      <option value="triple">Triple Glazing</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Climate Zone</label>
                    <select
                      name="location"
                      value={buildingData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="cold">Cold</option>
                      <option value="moderate">Moderate</option>
                      <option value="warm">Warm</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Roof Type</label>
                    <select
                      name="roofType"
                      value={buildingData.roofType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="pitched">Pitched</option>
                      <option value="flat">Flat</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Wall Construction</label>
                    <select
                      name="wallType"
                      value={buildingData.wallType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="brick">Brick</option>
                      <option value="concrete">Concrete</option>
                      <option value="wood">Wood Frame</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={calculateResults}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  Calculate Results
                </button>
                
                {!calculationsUpToDate && (
                  <div className="mt-3 text-amber-600 text-sm flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    Calculations not up to date. Click 'Calculate Results' to update.
                  </div>
                )}
              </div>
              
              {/* Results Summary */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-green-700 border-b pb-2">Current Energy Profile</h2>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                    <h3 className="text-lg font-medium text-blue-800">Annual Energy Usage</h3>
                    <p className="text-3xl font-bold text-blue-600">{results.annualEnergyUsage.toLocaleString()} kWh</p>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path>
                      </svg>
                      Based on building characteristics and occupancy
                    </div>
                  </div>
                  
                  <div className="p-4 bg-red-50 rounded-md border border-red-100">
                    <h3 className="text-lg font-medium text-red-800">Annual CO₂ Emissions</h3>
                    <p className="text-3xl font-bold text-red-600">{results.annualCO2Emissions.toLocaleString()} kg</p>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1z


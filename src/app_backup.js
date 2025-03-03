import React, { useState, useEffect, useRef } from 'react';

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
    
    // Adjust for building age - old adjustment (wrong, because older building should have higher energy demand)
    {/* const currentYear = new Date().getFullYear(); */}
    {/*const ageAdjustment = Math.max(0, (1 - (currentYear - data.yearBuilt) * 0.005)); */}
    {/*baseUsage *= Math.min(1.5, Math.max(0.8, ageAdjustment)); */}    

    // new calculation
    const currentYear = new Date().getFullYear();
    const buildingAge = currentYear - data.yearBuilt;
    // Adjust so that older buildings have **higher** consumption and newer buildings have **lower** consumption
    const ageAdjustment = Math.max(0.8, Math.min(1.5, 1 + (buildingAge * 0.005)));
    baseUsage *= ageAdjustment;
    
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

  // Update calculations when inputs change
  useEffect(() => {
    const annualEnergyUsage = calculateEnergyUsage(buildingData);
    const annualCO2Emissions = calculateCO2Emissions(annualEnergyUsage, buildingData);
    const energyCostPerYear = calculateEnergyCost(annualEnergyUsage, buildingData);
    
    setResults({
      annualEnergyUsage,
      annualCO2Emissions,
      energyCostPerYear,
    });
  }, [buildingData]);

  // Get applicable retrofits
  const applicableRetrofits = retrofitOptions
    .filter(retrofit => retrofit.applicableIf(buildingData))
    .map(retrofit => calculateRetrofitMetrics(retrofit, buildingData, results));
  
  // Calculate retrofit totals
  const retrofitTotals = calculateSelectedRetrofitsTotals();

  // new stuff
  const resetValues = () => {
    setBuildingData({
      squareMeters: 100,
      yearBuilt: 1980,
      floors: 2,
      insulation: "poor",
      heatingSystem: "gas",
      windows: "single",
      occupants: 2,
      location: "moderate",
      roofType: "pitched",
      wallType: "brick",
    });
  };

  // Ref for the impressum section
  const impressumRef = useRef(null);

  // Function to scroll to the impressum section
  const scrollToImpressum = () => {
    impressumRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50">

      {/* new stuff starts here */}

      <header className="flex justify-between items-center bg-green-700 text-white p-4 rounded-lg mb-6">
        <button onClick={resetValues} className="px-4 py-2 bg-white text-green-700 font-semibold rounded-md">
          Home
        </button>
        <h1 className="text-xl font-bold">Building Energy & Retrofit Calculator</h1>
        <button onClick={scrollToImpressum} className="text-white underline">
          Impressum
        </button>
      </header>

      {/* new stuff ends here */}


      {/*<h1 className="text-3xl font-bold mb-8 text-center text-green-800">Building Energy & Retrofit Calculator</h1> */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-green-700">Building Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Floor Area (m²)</label>
              <input
                type="number"
                name="squareMeters"
                value={buildingData.squareMeters}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Year Built</label>
              <input
                type="number"
                name="yearBuilt"
                value={buildingData.yearBuilt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Number of Floors</label>
              <input
                type="number"
                name="floors"
                value={buildingData.floors}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Number of Occupants</label>
              <input
                type="number"
                name="occupants"
                value={buildingData.occupants}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Insulation Quality</label>
              <select
                name="insulation"
                value={buildingData.insulation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="poor">Poor</option>
                <option value="average">Average</option>
                <option value="good">Good</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Heating System</label>
              <select
                name="heatingSystem"
                value={buildingData.heatingSystem}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="gas">Gas Boiler</option>
                <option value="oil">Oil Boiler</option>
                <option value="electric">Electric Heating</option>
                <option value="heat-pump">Heat Pump</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Window Type</label>
              <select
                name="windows"
                value={buildingData.windows}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="single">Single Glazing</option>
                <option value="double">Double Glazing</option>
                <option value="triple">Triple Glazing</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Climate Zone</label>
              <select
                name="location"
                value={buildingData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="cold">Cold</option>
                <option value="moderate">Moderate</option>
                <option value="warm">Warm</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Roof Type</label>
              <select
                name="roofType"
                value={buildingData.roofType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="pitched">Pitched</option>
                <option value="flat">Flat</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Wall Construction</label>
              <select
                name="wallType"
                value={buildingData.wallType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="brick">Brick</option>
                <option value="concrete">Concrete</option>
                <option value="wood">Wood Frame</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-green-700">Current Energy Profile</h2>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-blue-50 rounded-md">
              <h3 className="text-lg font-medium text-blue-800">Annual Energy Usage</h3>
              <p className="text-3xl font-bold text-blue-600">{results.annualEnergyUsage.toLocaleString()} kWh</p>
              <p className="text-sm text-gray-600">Based on building characteristics and occupancy</p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-md">
              <h3 className="text-lg font-medium text-red-800">Annual CO₂ Emissions</h3>
              <p className="text-3xl font-bold text-red-600">{results.annualCO2Emissions.toLocaleString()} kg</p>
              <p className="text-sm text-gray-600">Equivalent to driving {Math.round(results.annualCO2Emissions / 170).toLocaleString()} miles in an average car</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-md">
              <h3 className="text-lg font-medium text-green-800">Annual Energy Cost</h3>
              <p className="text-3xl font-bold text-green-600">${results.energyCostPerYear.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Based on current energy prices for your heating system</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Retrofit Options */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-green-700">Recommended Retrofit Measures</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left">Measure</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-right">Cost</th>
                <th className="py-3 px-4 text-right">Annual Savings</th>
                <th className="py-3 px-4 text-right">CO₂ Reduction</th>
                <th className="py-3 px-4 text-right">Payback Period</th>
                <th className="py-3 px-4 text-right">Property Value Increase</th>
                <th className="py-3 px-4 text-center">Select</th>
              </tr>
            </thead>
            <tbody>
              {applicableRetrofits.map((retrofit) => (
                <tr key={retrofit.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{retrofit.name}</td>
                  <td className="py-3 px-4 text-sm">{retrofit.description}</td>
                  <td className="py-3 px-4 text-right">${Math.round(retrofit.cost).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">${Math.round(retrofit.costSavings).toLocaleString()}/yr</td>
                  <td className="py-3 px-4 text-right">{Math.round(retrofit.co2Savings).toLocaleString()} kg/yr</td>
                  <td className="py-3 px-4 text-right">{retrofit.paybackYears.toFixed(1)} years</td>
                  <td className="py-3 px-4 text-right">${Math.round(retrofit.valueIncrease).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRetrofits.includes(retrofit.id)}
                      onChange={() => toggleRetrofitSelection(retrofit.id)}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Selected Retrofits Summary */}
      {retrofitTotals && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-green-700">Selected Retrofits Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-md">
              <h3 className="text-md font-medium text-green-800">Total Investment</h3>
              <p className="text-2xl font-bold text-green-600">${Math.round(retrofitTotals.totalCost).toLocaleString()}</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-md">
              <h3 className="text-md font-medium text-blue-800">Annual Energy Savings</h3>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(retrofitTotals.totalEnergySavings).toLocaleString()} kWh 
                <span className="text-lg ml-1 text-blue-400">(${Math.round(retrofitTotals.totalCostSavings).toLocaleString()}/yr)</span>
              </p>
            </div>
            
            <div className="p-4 bg-indigo-50 rounded-md">
              <h3 className="text-md font-medium text-indigo-800">Average Payback Period</h3>
              <p className="text-2xl font-bold text-indigo-600">{retrofitTotals.averagePayback.toFixed(1)} years</p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-md">
              <h3 className="text-md font-medium text-red-800">Annual CO₂ Reduction</h3>
              <p className="text-2xl font-bold text-red-600">
                {Math.round(retrofitTotals.totalCO2Savings).toLocaleString()} kg
                <span className="text-lg ml-1 text-red-400">
                  ({Math.round(retrofitTotals.totalCO2Savings / results.annualCO2Emissions * 100)}%)
                </span>
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-md">
              <h3 className="text-md font-medium text-purple-800">Property Value Increase</h3>
              <p className="text-2xl font-bold text-purple-600">${Math.round(retrofitTotals.totalValueIncrease).toLocaleString()}</p>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-md">
              <h3 className="text-md font-medium text-amber-800">Return on Investment</h3>
              <p className="text-2xl font-bold text-amber-600">
                {Math.round((retrofitTotals.totalValueIncrease + (retrofitTotals.totalCostSavings * 10)) / retrofitTotals.totalCost * 100)}%
              </p>
              <p className="text-xs text-gray-500">Based on value increase and 10 years of savings</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium mb-2">After Retrofits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">New Annual Energy Usage</p>
                <p className="text-xl font-bold text-green-600">
                  {Math.round(results.annualEnergyUsage - retrofitTotals.totalEnergySavings).toLocaleString()} kWh
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">New Annual CO₂ Emissions</p>
                <p className="text-xl font-bold text-green-600">
                  {Math.round(results.annualCO2Emissions - retrofitTotals.totalCO2Savings).toLocaleString()} kg
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">New Annual Energy Cost</p>
                <p className="text-xl font-bold text-green-600">
                  ${Math.round(results.energyCostPerYear - retrofitTotals.totalCostSavings).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      

      {/* New Stuff starts here */}
      {/* Footer with Impressum */}
      <footer ref={impressumRef} className="mt-8 text-center text-sm text-gray-500">
        <p>Note: This calculator provides estimates based on simplified models. Actual results may vary based on specific building characteristics, local climate, and energy prices.</p>
        <p>For accurate assessments, consider consulting with a professional energy auditor or building engineer.</p>
        <div className="mt-4 text-xs text-gray-400">© 2024 Energy Retrofit Calculator. All rights reserved.</div>
      </footer>
      {/* New Stuff ends here */}

    </div>
  );
};

export default EnergyRetrofitCalculator;
import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import "../styles/layout.css";

const URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [plotData, setPlotData] = useState({
    date: [],
    z: [],
    position: [],
    velocity: [],
    acceleration: []
  });

  const [tickerSymbol, setTickerSymbol] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [q, setQ] = useState('');

  const fetchData = () => {    
    fetch(`${URL}/fit_results?ticker=${tickerSymbol}&start_date=${startDate}&end_date=${endDate}&q=${q}`)
      .then(response => response.json())      
      .then(data => {        
        setPlotData({
          date: data.date,
          z: data.measurements,
          position: data.position,
          velocity: data.velocity,
          acceleration: data.acceleration
        });
      })
      .catch(error => console.error('Error fetching data:', error));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h2>KCA Fit Results</h2>
      <div className="input-container">
        <div className="input-group">
          <label htmlFor="ticker">Ticker Symbol:</label>
          <input
            type="text"
            id="ticker"
            value={tickerSymbol}
            onChange={(e) => setTickerSymbol(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="q">q:</label>
          <input
            type="text"
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <button onClick={fetchData}>Fetch Data</button>
      <Plot
        data={[
          {
            x: plotData.date,
            y: plotData.z,
            mode: 'markers',
            type: 'scatter',
            name: 'Measurements',
            marker: { size: 6, symbol: 'x' } 
          },
          {
            x: plotData.date,
            y: plotData.position,
            mode: 'lines',
            type: 'scatter',
            name: 'Position',
            line: { color: 'blue' },
          },
          {
            x: plotData.date,
            y: plotData.velocity,
            mode: 'lines+markers',
            type: 'scatter',
            name: 'Velocity',
            line: { color: 'green' },
            marker: { size: 1 }
          },
          {
            x: plotData.date,
            y: plotData.acceleration,
            mode: 'lines+markers',
            type: 'scatter',
            name: 'Acceleration',
            line: { color: 'red' },
            marker: { size: 1 }
          }
        ]}
        layout={{ width: 800, height: 600, title: 'KCA Fit Results' }}
      />
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import "../styles/layout.css";
import { useTheme } from '../context/ThemeContext';
import themeCssText from '../styles/theme.css?raw';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Parses the --color-background/--color-surface/--color-text values theme.css
// defines per data-theme, so the Plotly layout uses the same palette without
// duplicating the hex literals here.
const readThemeVar = (block, varName) => {
  const match = block.match(new RegExp(`${varName}:\\s*([^;]+);`));
  return match ? match[1].trim() : '';
};

const parseChartColors = (themeName) => {
  const blockMatch = themeCssText.match(
    new RegExp(`:root\\[data-theme=["']${themeName}["']\\]\\s*{([^}]*)}`)
  );
  const block = blockMatch ? blockMatch[1] : '';
  return {
    paper_bgcolor: readThemeVar(block, '--color-background'),
    plot_bgcolor: readThemeVar(block, '--color-surface'),
    fontColor: readThemeVar(block, '--color-text'),
  };
};

const PLOTLY_THEME_COLORS = {
  light: parseChartColors('light'),
  dark: parseChartColors('dark'),
};

const Dashboard = () => {
  const { theme } = useTheme();
  const chartColors = PLOTLY_THEME_COLORS[theme];

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
  const [q, setQ] = useState(1);

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
          <label htmlFor="q">q: {q}</label>
          <input
            type="range"
            id="q"
            min="0"
            max="100"
            step="1"
            value={q}
            onChange={(e) => setQ(Number(e.target.value))}
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
        layout={{
          width: 800,
          height: 600,
          title: 'KCA Fit Results',
          paper_bgcolor: chartColors.paper_bgcolor,
          plot_bgcolor: chartColors.plot_bgcolor,
          font: { color: chartColors.fontColor },
        }}
      />
    </div>
  );
};

export default Dashboard;

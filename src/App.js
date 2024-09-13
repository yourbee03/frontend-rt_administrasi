import React, { useState } from 'react';
import './App.css';
import Penghuni from './components/Penghuni';
import Rumah from './components/Rumah';
import Pembayaran from './components/Pembayaran';
import Pengeluaran from './components/Pengeluaran';
import Report from './components/Report';

function App() {
  const [activeComponent, setActiveComponent] = useState('Penghuni'); // Default to 'Penghuni'

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Penghuni':
        return <Penghuni />;
      case 'Rumah':
        return <Rumah />;
      case 'Pembayaran':
        return <Pembayaran />;
      case 'Pengeluaran':
        return <Pengeluaran />;
      case 'Report':
        return <Report />;
      default:
        return <Penghuni />;
    }
  };

  return (
    <div className="App">
      <h1>Manajemen Perumahan</h1>
      <nav>
        <ul className="menu">
          <li onClick={() => setActiveComponent('Penghuni')}>Penghuni</li>
          <li onClick={() => setActiveComponent('Rumah')}>Rumah</li>
          <li onClick={() => setActiveComponent('Pembayaran')}>Pembayaran</li>
          <li onClick={() => setActiveComponent('Pengeluaran')}>Pengeluaran</li>
          <li onClick={() => setActiveComponent('Report')}>Report</li>
        </ul>
      </nav>

      <div className="content">
        {renderComponent()}
      </div>
    </div>
  );
}

export default App;

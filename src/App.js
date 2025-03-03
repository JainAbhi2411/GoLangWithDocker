import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContainerList } from './components/ContainerList';
import { Sidebar } from './components/Sidebar';
import { Terminal } from './components/Terminal';
import { ContainerDetails } from './components/ContainerDetails';
import { ImageList } from './components/Imagelist'
import KubernetesDashboard from './components/kubernetes';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flexGrow: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<ContainerList />} />
            <Route path="/terminal" element={<Terminal />} />
            <Route path="/images" element={<ImageList /> } />
            <Route path="/kubernetes" element={<KubernetesDashboard />} />
            <Route path="/container/:name" element={<ContainerDetails />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

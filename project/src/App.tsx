import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ClassificationDetail from './pages/ClassificationDetail';
import Layout from './components/Layout';
import { WasteDataProvider } from './context/WasteDataContext';

function App() {
  return (
    <WasteDataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/classification/:id" element={<ClassificationDetail />} />
          </Route>
        </Routes>
      </Router>
    </WasteDataProvider>
  );
}

export default App;
// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import MateriasPage from './pages/MateriasPage';
import DisponibilidadPage from './pages/DisponibilidadPage';
import PlanPage from './pages/PlanPage';
import HobbiesPage from './pages/HobbiesPage';
import RuletaPage from './pages/RuletaPage';
import './styles/global.css';

function AppLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0E1A' }}>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
        <Route path="/materias" element={<AppLayout><MateriasPage /></AppLayout>} />
        <Route path="/disponibilidad" element={<AppLayout><DisponibilidadPage /></AppLayout>} />
        <Route path="/plan" element={<AppLayout><PlanPage /></AppLayout>} />
        <Route path="/hobbies" element={<AppLayout><HobbiesPage /></AppLayout>} />
        <Route path="/ruleta" element={<AppLayout><RuletaPage /></AppLayout>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

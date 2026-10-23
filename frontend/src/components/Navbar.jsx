// components/Navbar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { path: '/dashboard',     label: 'Inicio',      icon: '⚡' },
    { path: '/materias',      label: 'Materias',    icon: '📚' },
    { path: '/disponibilidad',label: 'Horarios',    icon: '🗓' },
    { path: '/plan',          label: 'Mi Plan',     icon: '📋' },
    { path: '/hobbies',       label: 'Actividades', icon: '🎯' },
    { path: '/ruleta',        label: 'Ruleta',      icon: '🎰' },
  ];

  return (
    <nav style={{
      background: '#111827',
      borderBottom: '1px solid #1F2D4A',
      padding: '0 16px',
      gap: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate('/dashboard')}
        title="Ir al inicio"
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          cursor: 'pointer', userSelect: 'none', flexShrink: 0,
        }}
      >
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, #4F8EF7, #7C3AED)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px',
        }}>
          🎯
        </div>
        <span className="nav-brand" style={{ fontWeight: 700, fontSize: '15px', color: '#E8EDF5', letterSpacing: '-0.02em' }}>
          Planificador
        </span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '2px', overflowX: 'auto', minWidth: 0 }}>
        {links.map(link => {
          const active = location.pathname === link.path;
          const isRuleta = link.path === '/ruleta';
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              title={link.label}
              aria-label={link.label}
              aria-current={active ? 'page' : undefined}
              style={{
                background: active
                  ? isRuleta ? 'rgba(245,158,11,0.12)' : 'rgba(79,142,247,0.12)'
                  : 'transparent',
                color: active
                  ? isRuleta ? '#F59E0B' : '#4F8EF7'
                  : '#8A9BC0',
                border: active
                  ? `1px solid ${isRuleta ? 'rgba(245,158,11,0.25)' : 'rgba(79,142,247,0.25)'}`
                  : '1px solid transparent',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px',
                transition: 'all 0.2s',
                fontFamily: 'Sora, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              <span aria-hidden="true">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

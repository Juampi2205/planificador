// components/UI.jsx
// Componentes reutilizables de interfaz

import React from 'react';

// ── Botón principal ──────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, loading, type = 'button', style }) {
  const styles = {
    primary: { background: '#4F8EF7', color: '#fff' },
    secondary: { background: '#1F2D4A', color: '#E8EDF5', border: '1px solid #2A3A5C' },
    danger: { background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' },
    success: { background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' },
    ghost: { background: 'transparent', color: '#8A9BC0', border: '1px solid #1F2D4A' },
  };
  const sizes = {
    sm: { padding: '6px 14px', fontSize: '13px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '13px 28px', fontSize: '15px' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...styles[variant],
        ...sizes[size],
        borderRadius: '8px',
        fontWeight: 600,
        fontFamily: 'Sora, sans-serif',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s',
        border: styles[variant].border || 'none',
        ...style,
      }}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}

// ── Spinner de carga ─────────────────────────────────────────
export function Spinner({ size = 20, color = '#4F8EF7' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid rgba(79,142,247,0.2)`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0,
    }} />
  );
}

// ── Mensaje de error ─────────────────────────────────────────
export function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: '8px',
      padding: '10px 14px',
      color: '#EF4444',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <span>⚠</span> {msg}
    </div>
  );
}

// ── Mensaje de éxito ─────────────────────────────────────────
export function SuccessMsg({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      background: 'rgba(16,185,129,0.1)',
      border: '1px solid rgba(16,185,129,0.3)',
      borderRadius: '8px',
      padding: '10px 14px',
      color: '#10B981',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <span>✓</span> {msg}
    </div>
  );
}

// ── Input con label ──────────────────────────────────────────
export function Field({ label, hint, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: 600, color: '#8A9BC0', letterSpacing: '0.03em' }}>
          {label}
        </label>
      )}
      {children}
      {hint && !error && <span style={{ fontSize: '12px', color: '#4A5568' }}>{hint}</span>}
      {error && <span style={{ fontSize: '12px', color: '#EF4444' }}>{error}</span>}
    </div>
  );
}

// ── Card contenedor ──────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <div style={{
      background: '#161D2F',
      border: '1px solid #1F2D4A',
      borderRadius: '12px',
      padding: '24px',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Indicador de dificultad (estrellitas) ─────────────────────
export function Dificultad({ valor, max = 5 }) {
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{
          width: 8, height: 8,
          borderRadius: '50%',
          background: i < valor ? '#F59E0B' : '#1F2D4A',
          display: 'inline-block',
        }} />
      ))}
    </div>
  );
}

// ── Badge de días restantes ──────────────────────────────────
export function BadgeDias({ dias }) {
  const color = dias <= 3 ? '#EF4444' : dias <= 7 ? '#F59E0B' : '#10B981';
  const bg = dias <= 3 ? 'rgba(239,68,68,0.12)' : dias <= 7 ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)';
  return (
    <span style={{
      background: bg, color,
      border: `1px solid ${color}40`,
      borderRadius: '20px',
      padding: '2px 10px',
      fontSize: '12px',
      fontWeight: 700,
      fontFamily: 'JetBrains Mono, monospace',
    }}>
      {dias > 0 ? `${dias}d` : 'HOY'}
    </span>
  );
}

// ── Empty state ──────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '48px 24px',
      color: '#4A5568',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <div style={{ fontSize: '16px', fontWeight: 600, color: '#8A9BC0', marginBottom: '8px' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '14px' }}>{subtitle}</div>}
    </div>
  );
}

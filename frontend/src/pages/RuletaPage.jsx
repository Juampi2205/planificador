// pages/RuletaPage.jsx
import React, { useState, useRef, useEffect } from 'react';

const SEGMENTOS_DEFAULT = [
  { label: 'Guitarra',  color: '#A855F7', icon: '🎸' },
  { label: 'Lectura',   color: '#3B82F6', icon: '📖' },
  { label: 'Paseo',     color: '#10B981', icon: '🐾' },
  { label: 'Estudio',   color: '#4F8EF7', icon: '📚' },
  { label: 'Descanso',  color: '#F59E0B', icon: '😴' },
  { label: 'Arte',      color: '#EF4444', icon: '🎨' },
  { label: 'Ejercicio', color: '#06B6D4', icon: '🏃' },
  { label: 'Serie',     color: '#EC4899', icon: '🎬' },
];

const TAU = 2 * Math.PI;
const CX = 200, CY = 200, R = 170, INNER = 60;

function getSegmentPath(i, total) {
  const angle = TAU / total;
  const start = i * angle - Math.PI / 2;
  const end = start + angle;
  const x1 = CX + R * Math.cos(start);
  const y1 = CY + R * Math.sin(start);
  const x2 = CX + R * Math.cos(end);
  const y2 = CY + R * Math.sin(end);
  const xi1 = CX + INNER * Math.cos(start);
  const yi1 = CY + INNER * Math.sin(start);
  const xi2 = CX + INNER * Math.cos(end);
  const yi2 = CY + INNER * Math.sin(end);
  const large = angle > Math.PI ? 1 : 0;
  return `M ${xi1} ${yi1} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${INNER} ${INNER} 0 ${large} 0 ${xi1} ${yi1} Z`;
}

function getLabelPos(i, total) {
  const angle = TAU / total;
  const mid = i * angle - Math.PI / 2 + angle / 2;
  const dist = INNER + (R - INNER) * 0.6;
  return {
    x: CX + dist * Math.cos(mid),
    y: CY + dist * Math.sin(mid),
    angle: (mid * 180) / Math.PI + 90,
  };
}

export default function RuletaPage() {
  const [girando, setGirando] = useState(false);
  const [rotacion, setRotacion] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [segmentos, setSegmentos] = useState(SEGMENTOS_DEFAULT);
  const [nuevoItem, setNuevoItem] = useState('');
  const [velocidad, setVelocidad] = useState(0);
  const animRef = useRef(null);
  const rotRef = useRef(0);
  const velRef = useRef(0);

  const girar = () => {
    if (girando) return;
    setGirando(true);
    setResultado(null);
    velRef.current = 20 + Math.random() * 20;
    animRef.current = requestAnimationFrame(tick);
  };

  const tick = () => {
    velRef.current *= 0.985;
    rotRef.current += velRef.current;
    setRotacion(rotRef.current % 360);
    setVelocidad(velRef.current);

    if (velRef.current < 0.3) {
      cancelAnimationFrame(animRef.current);
      setGirando(false);
      setVelocidad(0);
      calcularResultado(rotRef.current % 360);
    } else {
      animRef.current = requestAnimationFrame(tick);
    }
  };

  const calcularResultado = (rot) => {
    const total = segmentos.length;
    const anglePerSeg = 360 / total;
    // El puntero está en la parte superior (270° desde el centro derecho = -90°)
    // Normalizamos cuál segmento queda apuntado
    const adjusted = (360 - (rot % 360)) % 360;
    const idx = Math.floor(adjusted / anglePerSeg) % total;
    const seg = segmentos[idx];
    setResultado(seg);
    setHistorial(h => [{ ...seg, ts: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) }, ...h].slice(0, 8));
  };

  const agregarItem = () => {
    const nombre = nuevoItem.trim();
    if (!nombre || segmentos.length >= 12) return;
    const COLORES = ['#8B5CF6','#0EA5E9','#F97316','#84CC16','#F43F5E','#14B8A6'];
    const ICONOS  = ['⭐','🎯','💫','🌟','🔥','💎'];
    const i = segmentos.length;
    setSegmentos(s => [...s, {
      label: nombre,
      color: COLORES[i % COLORES.length],
      icon: ICONOS[i % ICONOS.length],
    }]);
    setNuevoItem('');
  };

  const eliminarItem = (i) => {
    if (segmentos.length <= 2) return;
    setSegmentos(s => s.filter((_, idx) => idx !== i));
  };

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  return (
    <div className="page" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px', animation: 'fadeIn 0.35s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#E8EDF5', marginBottom: 6 }}>
          Ruleta
        </h1>
        <p style={{ color: '#8A9BC0', fontSize: 14 }}>
          ¿No sabés qué hacer ahora? Girá la ruleta y dejá que elija por vos.
        </p>
      </div>

      <div className="grid-ruleta" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Ruleta central */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 400, filter: girando ? 'drop-shadow(0 0 30px rgba(79,142,247,0.4))' : 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}>
            {/* Puntero */}
            <div style={{
              position: 'absolute', top: -12, left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              width: 0, height: 0,
              borderLeft: '14px solid transparent',
              borderRight: '14px solid transparent',
              borderTop: '28px solid #F59E0B',
              filter: 'drop-shadow(0 2px 6px rgba(245,158,11,0.6))',
            }} />

            <svg
              viewBox="0 0 400 400"
              style={{
                width: '100%', height: 'auto',
                transform: `rotate(${rotacion}deg)`,
                transition: girando ? 'none' : 'transform 0.1s ease-out',
                display: 'block',
              }}
            >
              {/* Sombra exterior */}
              <circle cx={CX} cy={CY} r={R + 8} fill="none" stroke="#0A0E1A" strokeWidth={16} opacity={0.5} />
              <circle cx={CX} cy={CY} r={R + 2} fill="none" stroke="#1F2D4A" strokeWidth={3} />

              {segmentos.map((seg, i) => (
                <g key={i}>
                  <path
                    d={getSegmentPath(i, segmentos.length)}
                    fill={seg.color}
                    opacity={0.85}
                    stroke="#0A0E1A"
                    strokeWidth={1.5}
                  />
                  {/* Label girado */}
                  <text
                    x={getLabelPos(i, segmentos.length).x}
                    y={getLabelPos(i, segmentos.length).y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${getLabelPos(i, segmentos.length).angle}, ${getLabelPos(i, segmentos.length).x}, ${getLabelPos(i, segmentos.length).y})`}
                    fill="white"
                    fontSize={segmentos.length > 8 ? 9 : 11}
                    fontWeight="700"
                    fontFamily="Sora, sans-serif"
                    style={{ userSelect: 'none' }}
                  >
                    <tspan x={getLabelPos(i, segmentos.length).x} dy="-7">{seg.icon}</tspan>
                    <tspan x={getLabelPos(i, segmentos.length).x} dy="16">{seg.label.length > 8 ? seg.label.slice(0, 7) + '…' : seg.label}</tspan>
                  </text>
                </g>
              ))}

              {/* Hub central */}
              <circle cx={CX} cy={CY} r={INNER} fill="#111827" stroke="#1F2D4A" strokeWidth={2} />
              <circle cx={CX} cy={CY} r={INNER - 8} fill="#0A0E1A" />
              <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize={22} style={{ userSelect: 'none' }}>🎯</text>
            </svg>
          </div>

          {/* Botón girar */}
          <button
            onClick={girar}
            disabled={girando}
            style={{
              background: girando
                ? 'rgba(79,142,247,0.15)'
                : 'linear-gradient(135deg, #4F8EF7, #7C3AED)',
              color: girando ? '#4F8EF7' : 'white',
              border: girando ? '2px solid rgba(79,142,247,0.3)' : '2px solid transparent',
              borderRadius: 14, padding: '14px 48px',
              fontSize: 16, fontWeight: 800,
              cursor: girando ? 'not-allowed' : 'pointer',
              fontFamily: 'Sora, sans-serif',
              transition: 'all 0.2s',
              letterSpacing: '0.02em',
              boxShadow: girando ? 'none' : '0 4px 20px rgba(79,142,247,0.35)',
            }}
          >
            {girando ? 'Girando…' : 'Girar'}
          </button>

          {/* Resultado */}
          {resultado && !girando && (
            <div style={{
              background: `${resultado.color}18`,
              border: `2px solid ${resultado.color}50`,
              borderRadius: 16, padding: '18px 36px',
              textAlign: 'center', animation: 'fadeIn 0.4s ease',
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{resultado.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: resultado.color, marginBottom: 4 }}>
                {resultado.label}
              </div>
              <div style={{ fontSize: 13, color: '#8A9BC0' }}>La ruleta eligió esta opción</div>
            </div>
          )}
        </div>

        {/* Panel derecho */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Agregar item */}
          <div style={{ background: '#161D2F', border: '1px solid #1F2D4A', borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#E8EDF5', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Personalizar
            </h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input
                value={nuevoItem}
                onChange={e => setNuevoItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && agregarItem()}
                placeholder="Nueva opción..."
                style={{ flex: 1, fontSize: 13 }}
              />
              <button
                onClick={agregarItem}
                disabled={segmentos.length >= 12}
                title="Agregar opción"
                aria-label="Agregar opción"
                style={{
                  background: 'rgba(79,142,247,0.15)', color: '#4F8EF7',
                  border: '1px solid rgba(79,142,247,0.3)',
                  borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 700,
                  cursor: segmentos.length >= 12 ? 'not-allowed' : 'pointer',
                  fontFamily: 'Sora, sans-serif', flexShrink: 0,
                }}
              >+</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
              {segmentos.map((seg, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: `${seg.color}10`, border: `1px solid ${seg.color}30`,
                  borderRadius: 8, padding: '6px 10px',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, flex: 1 }}>{seg.icon}</span>
                  <span style={{ fontSize: 13, color: '#E8EDF5', flex: 1, fontWeight: 600 }}>{seg.label}</span>
                  {segmentos.length > 2 && (
                    <button onClick={() => eliminarItem(i)} title="Quitar" aria-label={`Quitar ${seg.label}`} style={{
                      background: 'transparent', color: '#4A5568',
                      border: 'none', fontSize: 14, cursor: 'pointer',
                      padding: '0 4px', lineHeight: 1,
                    }}>×</button>
                  )}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#4A5568', marginTop: 10 }}>
              {segmentos.length}/12 opciones
            </div>
          </div>

          {/* Historial */}
          {historial.length > 0 && (
            <div style={{ background: '#161D2F', border: '1px solid #1F2D4A', borderRadius: 14, padding: 18 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#E8EDF5', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Historial
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {historial.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    opacity: 1 - i * 0.1,
                  }}>
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: i === 0 ? '#E8EDF5' : '#8A9BC0', fontWeight: i === 0 ? 700 : 400, flex: 1 }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: 11, color: '#4A5568' }}>{item.ts}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// pages/HobbiesPage.jsx
import React, { useEffect, useState } from 'react';
import { hobbiesAPI } from '../utils/mockStore';
import { Btn, Card, Spinner } from '../components/UI';

const CATEGORIAS = [
  { id: 'musica',   label: 'Música',      icon: '🎸', color: '#A855F7' },
  { id: 'lectura',  label: 'Lectura',     icon: '📖', color: '#3B82F6' },
  { id: 'deporte',  label: 'Deporte',     icon: '🏃', color: '#10B981' },
  { id: 'mascota',  label: 'Mascota',     icon: '🐾', color: '#F59E0B' },
  { id: 'arte',     label: 'Arte',        icon: '🎨', color: '#EF4444' },
  { id: 'otro',     label: 'Otro',        icon: '✨', color: '#8A9BC0' },
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIAS_COMPLETOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function getCat(id) {
  return CATEGORIAS.find(c => c.id === id) || CATEGORIAS[5];
}

export default function HobbiesPage() {
  const [hobbies, setHobbies]     = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editando, setEditando]   = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [tab, setTab]             = useState('lista'); // 'lista' | 'semana'

  const vacioForm = {
    nombre: '', categoria: 'musica', dias: [], horas_por_sesion: 1,
    descripcion: '', color: '#A855F7',
  };
  const [form, setForm] = useState(vacioForm);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await hobbiesAPI.listar();
      setHobbies(res.data);
    } finally {
      setCargando(false);
    }
  };

  const abrirNuevo = () => {
    setEditando(null);
    setForm(vacioForm);
    setShowForm(true);
  };

  const abrirEditar = (h) => {
    setEditando(h.id);
    setForm({ ...h });
    setShowForm(true);
  };

  const toggleDia = (dia) => {
    setForm(f => ({
      ...f,
      dias: f.dias.includes(dia) ? f.dias.filter(d => d !== dia) : [...f.dias, dia],
    }));
  };

  const handleCategoria = (cat) => {
    setForm(f => ({ ...f, categoria: cat.id, color: cat.color }));
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) return;
    setGuardando(true);
    try {
      if (editando) {
        await hobbiesAPI.actualizar(editando, form);
      } else {
        await hobbiesAPI.crear(form);
      }
      await cargar();
      setShowForm(false);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta actividad?')) return;
    await hobbiesAPI.eliminar(id);
    await cargar();
  };

  const toggleCompletadoHoy = async (id) => {
    await hobbiesAPI.toggleHoy(id);
    await cargar();
  };

  // Vista semanal: agrupar por días
  const vistaSemana = DIAS_COMPLETOS.map((dia, idx) => ({
    dia,
    idx,
    actividades: hobbies.filter(h => h.dias.includes(idx)),
  }));

  const hoyDia = new Date().getDay();

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <Spinner />
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px', animation: 'fadeIn 0.35s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#E8EDF5', marginBottom: 6 }}>
            Mis actividades
          </h1>
          <p style={{ color: '#8A9BC0', fontSize: 14 }}>
            Organizá tu tiempo libre: música, lectura, mascota y más
          </p>
        </div>
        <Btn onClick={abrirNuevo}>+ Nueva actividad</Btn>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[{ id: 'lista', label: 'Lista' }, { id: 'semana', label: 'Semana' }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: tab === t.id ? 'rgba(79,142,247,0.15)' : 'transparent',
              color: tab === t.id ? '#4F8EF7' : '#8A9BC0',
              border: `1px solid ${tab === t.id ? 'rgba(79,142,247,0.35)' : '#1F2D4A'}`,
              borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Sora, sans-serif',
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* Stats strip */}
      {hobbies.length > 0 && (
        <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Actividades', value: hobbies.length, icon: '🎯', color: '#4F8EF7' },
            {
              label: 'Horas por semana',
              value: hobbies.reduce((s, h) => s + h.dias.length * h.horas_por_sesion, 0),
              icon: '⏱', color: '#10B981',
            },
            {
              label: 'Completadas hoy',
              value: hobbies.filter(h => h.dias.includes(hoyDia) && h.completadoHoy).length,
              icon: '✅', color: '#A855F7',
            },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#161D2F', border: '1px solid #1F2D4A',
              borderRadius: 12, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <span style={{ fontSize: 22 }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: '#8A9BC0' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista */}
      {tab === 'lista' && (
        hobbies.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: '#161D2F', borderRadius: 16, border: '1px dashed #1F2D4A',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#E8EDF5', marginBottom: 8 }}>
              Sin actividades todavía
            </div>
            <div style={{ fontSize: 14, color: '#8A9BC0', marginBottom: 20 }}>
              Agregá tus hobbies y pasatiempos para organizarlos junto al estudio
            </div>
            <Btn onClick={abrirNuevo}>Agregar primera actividad</Btn>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {hobbies.map(h => <HobbieCard key={h.id} h={h} onEditar={abrirEditar} onEliminar={handleEliminar} onToggle={toggleCompletadoHoy} hoyDia={hoyDia} />)}
          </div>
        )
      )}

      {/* Semana */}
      {tab === 'semana' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {vistaSemana.map(({ dia, idx, actividades }) => (
            <div key={dia} style={{
              background: idx === hoyDia ? 'rgba(79,142,247,0.06)' : '#161D2F',
              border: `1px solid ${idx === hoyDia ? 'rgba(79,142,247,0.3)' : '#1F2D4A'}`,
              borderRadius: 12, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{ width: 52, textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: '#8A9BC0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{DIAS_SEMANA[idx]}</div>
                {idx === hoyDia && <div style={{ fontSize: 9, color: '#4F8EF7', fontWeight: 700, marginTop: 2 }}>HOY</div>}
              </div>
              {actividades.length === 0 ? (
                <span style={{ fontSize: 13, color: '#4A5568' }}>Día libre</span>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {actividades.map(h => {
                    const cat = getCat(h.categoria);
                    return (
                      <div key={h.id} style={{
                        background: `${h.color}18`,
                        border: `1px solid ${h.color}40`,
                        borderRadius: 8, padding: '5px 12px',
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 13, color: '#E8EDF5',
                      }}>
                        <span>{cat.icon}</span>
                        <span style={{ fontWeight: 600 }}>{h.nombre}</span>
                        <span style={{ color: '#8A9BC0', fontSize: 11 }}>{h.horas_por_sesion}h</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 20,
        }} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={{
            background: '#161D2F', border: '1px solid #1F2D4A',
            borderRadius: 16, padding: 28, width: '100%', maxWidth: 520,
            maxHeight: 'calc(100vh - 40px)', overflowY: 'auto',
            animation: 'fadeIn 0.2s ease',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#E8EDF5', marginBottom: 22 }}>
              {editando ? 'Editar actividad' : 'Nueva actividad'}
            </h2>

            {/* Nombre */}
            <label style={{ fontSize: 12, color: '#8A9BC0', fontWeight: 600, display: 'block', marginBottom: 6 }}>NOMBRE</label>
            <input
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej: Guitarra, Leer novelas, Paseo con Rocky..."
              style={{ marginBottom: 18 }}
            />

            {/* Categoría */}
            <label style={{ fontSize: 12, color: '#8A9BC0', fontWeight: 600, display: 'block', marginBottom: 8 }}>CATEGORÍA</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {CATEGORIAS.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoria(cat)}
                  style={{
                    background: form.categoria === cat.id ? `${cat.color}20` : 'transparent',
                    color: form.categoria === cat.id ? cat.color : '#8A9BC0',
                    border: `1px solid ${form.categoria === cat.id ? cat.color + '60' : '#1F2D4A'}`,
                    borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Sora, sans-serif',
                  }}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Días */}
            <label style={{ fontSize: 12, color: '#8A9BC0', fontWeight: 600, display: 'block', marginBottom: 8 }}>DÍAS DE LA SEMANA</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
              {DIAS_SEMANA.map((d, i) => (
                <button
                  key={i}
                  onClick={() => toggleDia(i)}
                  style={{
                    background: form.dias.includes(i) ? `${form.color}25` : 'transparent',
                    color: form.dias.includes(i) ? form.color : '#8A9BC0',
                    border: `1px solid ${form.dias.includes(i) ? form.color + '60' : '#1F2D4A'}`,
                    borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Sora, sans-serif',
                    minWidth: 36,
                  }}
                >{d}</button>
              ))}
            </div>

            {/* Horas por sesión */}
            <label style={{ fontSize: 12, color: '#8A9BC0', fontWeight: 600, display: 'block', marginBottom: 8 }}>
              HORAS POR SESIÓN: <span style={{ color: form.color }}>{form.horas_por_sesion}h</span>
            </label>
            <input
              type="range" min={0.5} max={4} step={0.5}
              value={form.horas_por_sesion}
              onChange={e => setForm(f => ({ ...f, horas_por_sesion: parseFloat(e.target.value) }))}
              style={{ marginBottom: 18, accentColor: form.color }}
            />

            {/* Descripción */}
            <label style={{ fontSize: 12, color: '#8A9BC0', fontWeight: 600, display: 'block', marginBottom: 6 }}>DESCRIPCIÓN (opcional)</label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Notas o metas para esta actividad..."
              rows={2}
              style={{ marginBottom: 22, resize: 'vertical' }}
            />

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: 'transparent', color: '#8A9BC0',
                  border: '1px solid #1F2D4A', borderRadius: 8,
                  padding: '9px 18px', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Sora, sans-serif',
                }}
              >Cancelar</button>
              <Btn onClick={handleGuardar} loading={guardando} disabled={!form.nombre.trim()}>
                {editando ? 'Guardar cambios' : 'Crear actividad'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HobbieCard({ h, onEditar, onEliminar, onToggle, hoyDia }) {
  const cat = getCat(h.categoria);
  const esHoy = h.dias.includes(hoyDia);

  return (
    <div style={{
      background: '#161D2F',
      border: `1px solid ${esHoy ? h.color + '40' : '#1F2D4A'}`,
      borderRadius: 14, padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 12,
      transition: 'border-color 0.2s',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3, background: h.color, borderRadius: '14px 0 0 14px',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingLeft: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 20 }}>{cat.icon}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#E8EDF5' }}>{h.nombre}</span>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 600, color: cat.color,
            background: `${cat.color}15`, borderRadius: 6,
            padding: '2px 8px',
          }}>{cat.label}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onEditar(h)} title="Editar" aria-label={`Editar ${h.nombre}`} style={{
            background: 'transparent', color: '#8A9BC0', border: '1px solid #1F2D4A',
            borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer',
            fontFamily: 'Sora, sans-serif',
          }}>✏️</button>
          <button onClick={() => onEliminar(h.id)} title="Eliminar" aria-label={`Eliminar ${h.nombre}`} style={{
            background: 'transparent', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer',
            fontFamily: 'Sora, sans-serif',
          }}>🗑</button>
        </div>
      </div>

      {/* Días */}
      <div style={{ display: 'flex', gap: 4, paddingLeft: 8 }}>
        {['D','L','M','X','J','V','S'].map((d, i) => (
          <div key={i} style={{
            width: 26, height: 26, borderRadius: 6,
            background: h.dias.includes(i) ? `${h.color}25` : 'transparent',
            border: `1px solid ${h.dias.includes(i) ? h.color + '50' : '#1F2D4A'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700,
            color: h.dias.includes(i) ? h.color : '#4A5568',
          }}>{d}</div>
        ))}
      </div>

      {/* Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 8 }}>
        <span style={{ fontSize: 12, color: '#8A9BC0' }}>
          {h.horas_por_sesion}h por sesión · {h.dias.length * h.horas_por_sesion}h por semana
        </span>
        {esHoy && (
          <button
            onClick={() => onToggle(h.id)}
            style={{
              background: h.completadoHoy ? 'rgba(16,185,129,0.15)' : 'rgba(79,142,247,0.1)',
              color: h.completadoHoy ? '#10B981' : '#4F8EF7',
              border: `1px solid ${h.completadoHoy ? 'rgba(16,185,129,0.3)' : 'rgba(79,142,247,0.3)'}`,
              borderRadius: 7, padding: '4px 10px', fontSize: 11, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Sora, sans-serif',
            }}
          >
            {h.completadoHoy ? '✓ Hecho' : 'Marcar como hecho'}
          </button>
        )}
      </div>

      {h.descripcion && (
        <p style={{ fontSize: 12, color: '#8A9BC0', paddingLeft: 8, fontStyle: 'italic' }}>
          {h.descripcion}
        </p>
      )}
    </div>
  );
}

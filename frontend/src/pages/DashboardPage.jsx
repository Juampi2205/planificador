// pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { materiasAPI, planAPI } from '../utils/mockStore';
import { hoyISO } from '../utils/fechas';
import { Btn, Card, Dificultad, BadgeDias, Spinner, EmptyState, ErrorMsg } from '../components/UI';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [materias, setMaterias] = useState([]);
  const [planHoy, setPlanHoy] = useState([]);
  const [generando, setGenerando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [mRes, pRes] = await Promise.all([
        materiasAPI.listar(),
        planAPI.obtener({ desde: hoyISO(), hasta: hoyISO() }),
      ]);
      setMaterias(mRes.data);
      setPlanHoy(pRes.data.plan || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleGenerar = async () => {
    setGenerando(true);
    setError('');
    try {
      await planAPI.generar({ dias_adelante: 30, max_horas_dia: 6 });
      await cargarDatos();
      navigate('/plan');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'No se pudo generar el plan. Verificá que tengas materias y disponibilidad cargadas.');
    } finally {
      setGenerando(false);
    }
  };

  const materiasProximas = materias
    .filter(m => m.dias_restantes >= 0)
    .sort((a, b) => a.dias_restantes - b.dias_restantes)
    .slice(0, 4);

  const fechaHoy = new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const totalHorasHoy = planHoy.reduce((sum, b) => sum + parseFloat(b.horas_asignadas), 0);

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <Spinner size={32} />
    </div>
  );

  return (
    <div className="page" style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '6px' }}>
          Buen día
        </h1>
        <p style={{ color: '#8A9BC0', fontSize: '15px' }}>
          {fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1)}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Materias activas', value: materias.filter(m => m.dias_restantes >= 0).length, icon: '📚', color: '#4F8EF7' },
          { label: 'Horas hoy', value: totalHorasHoy ? `${totalHorasHoy}h` : '—', icon: '⏱', color: '#10B981' },
          { label: 'Bloques hoy', value: planHoy.length || '—', icon: '🗂', color: '#F59E0B' },
        ].map(stat => (
          <Card key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '10px',
              background: `${stat.color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', flexShrink: 0,
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, lineHeight: 1, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#8A9BC0', marginTop: '4px', fontWeight: 500 }}>{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Plan de hoy */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700 }}>📋 Plan de hoy</h2>
            <Btn variant="ghost" size="sm" onClick={() => navigate('/plan')}>Ver todo</Btn>
          </div>
          {planHoy.length === 0 ? (
            <EmptyState icon="🗓" title="Sin plan para hoy" subtitle="Generá tu plan para ver las materias asignadas" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {planHoy.map(bloque => (
                <div key={bloque.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px',
                  background: '#0A0E1A',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${bloque.color}`,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{bloque.materia_nombre}</div>
                    <div style={{ color: '#8A9BC0', fontSize: '12px' }}>
                      Examen en {bloque.dias_hasta_examen} {bloque.dias_hasta_examen === 1 ? 'día' : 'días'}
                    </div>
                  </div>
                  <div style={{
                    background: `${bloque.color}20`, color: bloque.color,
                    borderRadius: '6px', padding: '4px 10px',
                    fontSize: '13px', fontWeight: 700,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    {bloque.horas_asignadas}h
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Próximos exámenes */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700 }}>🎯 Próximos exámenes</h2>
            <Btn variant="ghost" size="sm" onClick={() => navigate('/materias')}>Gestionar</Btn>
          </div>
          {materiasProximas.length === 0 ? (
            <EmptyState icon="📚" title="Sin materias" subtitle="Agregá tus materias para empezar" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {materiasProximas.map(m => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px',
                  background: '#0A0E1A',
                  borderRadius: '8px',
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: m.color, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{m.nombre}</div>
                    <Dificultad valor={m.dificultad} />
                  </div>
                  <BadgeDias dias={parseInt(m.dias_restantes)} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* CTA generar plan */}
      {error && <div style={{ marginTop: '24px' }}><ErrorMsg msg={error} /></div>}
      <div className="cta" style={{
        marginTop: '24px',
        background: 'linear-gradient(135deg, rgba(79,142,247,0.08) 0%, rgba(124,58,237,0.08) 100%)',
        border: '1px solid rgba(79,142,247,0.2)',
        borderRadius: '12px',
        padding: '24px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
            ¿Actualizaste tus materias o disponibilidad?
          </div>
          <div style={{ color: '#8A9BC0', fontSize: '14px' }}>
            Regenerá tu plan para que refleje los últimos cambios.
          </div>
        </div>
        <Btn onClick={handleGenerar} loading={generando} size="lg">
          Generar plan
        </Btn>
      </div>
    </div>
  );
}

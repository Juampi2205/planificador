// pages/DisponibilidadPage.jsx
import React, { useEffect, useState } from 'react';
import { disponibilidadAPI } from '../utils/mockStore';
import { Btn, Card, ErrorMsg, SuccessMsg, Spinner } from '../components/UI';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DIAS_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const INICIAL = Array.from({ length: 7 }, (_, i) => ({
  dia_semana: i,
  horas_disponibles: [1, 2, 3, 4, 5].includes(i) ? 2 : 0,
  hora_inicio: '09:00',
  hora_fin: '11:00',
}));

export default function DisponibilidadPage() {
  const [disponibilidad, setDisponibilidad] = useState(INICIAL);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await disponibilidadAPI.obtener();
      if (res.data && res.data.length > 0) {
        const mapeado = Array.from({ length: 7 }, (_, i) => {
          const d = res.data.find(r => r.dia_semana === i);
          return d ? {
            dia_semana: i,
            horas_disponibles: parseFloat(d.horas_disponibles),
            hora_inicio: d.hora_inicio?.slice(0, 5) || '09:00',
            hora_fin: d.hora_fin?.slice(0, 5) || '11:00',
          } : { dia_semana: i, horas_disponibles: 0, hora_inicio: '09:00', hora_fin: '11:00' };
        });
        setDisponibilidad(mapeado);
      }
    } catch (err) {
      setError('No se pudo cargar la disponibilidad');
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (dia, campo, valor) => {
    setDisponibilidad(prev => prev.map(d =>
      d.dia_semana === dia ? { ...d, [campo]: campo === 'horas_disponibles' ? parseFloat(valor) : valor } : d
    ));
  };

  const handleGuardar = async () => {
    setError(''); setOk('');
    setGuardando(true);
    try {
      await disponibilidadAPI.guardarBulk({ disponibilidad });
      setOk('Disponibilidad guardada');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const totalHorasSemanales = disponibilidad.reduce((s, d) => s + d.horas_disponibles, 0);

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <Spinner size={28} />
    </div>
  );

  return (
    <div className="page" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '8px' }}>
        Disponibilidad horaria
      </h1>
      <p style={{ color: '#8A9BC0', fontSize: '14px', marginBottom: '8px' }}>
        Indicá cuántas horas podés estudiar cada día. El algoritmo distribuirá las materias según esta configuración.
      </p>

      {/* Total semanal */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)',
        borderRadius: '8px', padding: '6px 16px', marginBottom: '28px',
        fontSize: '14px', fontWeight: 600,
      }}>
        <span style={{ color: '#4F8EF7' }}>Total semanal:</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#E8EDF5' }}>
          {totalHorasSemanales}h
        </span>
      </div>

      {/* Grid de días */}
      <div className="grid-dias" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: '24px' }}>
        {disponibilidad.map(d => {
          const activo = d.horas_disponibles > 0;
          const esFinde = d.dia_semana === 0 || d.dia_semana === 6;
          return (
            <Card key={d.dia_semana} style={{
              padding: '16px 12px',
              textAlign: 'center',
              border: activo ? '1px solid rgba(79,142,247,0.3)' : '1px solid #1F2D4A',
              background: activo ? 'rgba(79,142,247,0.06)' : '#111827',
              transition: 'all 0.2s',
            }}>
              <div style={{
                fontSize: '12px', fontWeight: 700,
                color: esFinde ? '#F59E0B' : '#8A9BC0',
                marginBottom: '10px',
              }}>
                {DIAS_CORTO[d.dia_semana]}
              </div>
              <div style={{
                fontSize: '22px', fontWeight: 800,
                color: activo ? '#4F8EF7' : '#4A5568',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: '8px',
              }}>
                {d.horas_disponibles}h
              </div>
              <input
                type="range" min={0} max={10} step={0.5}
                value={d.horas_disponibles}
                onChange={e => handleChange(d.dia_semana, 'horas_disponibles', e.target.value)}
                aria-label={`Horas disponibles el ${DIAS[d.dia_semana]}`}
                style={{
                  width: '100%', appearance: 'none',
                  background: '#1F2D4A', height: 4,
                  borderRadius: 2, accentColor: '#4F8EF7',
                  border: 'none', padding: 0, cursor: 'pointer',
                }}
              />
            </Card>
          );
        })}
      </div>

      {/* Horarios detallados */}
      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
          Franjas horarias por día
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {disponibilidad.filter(d => d.horas_disponibles > 0).map(d => (
            <div key={d.dia_semana} style={{
              display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
              padding: '12px 16px',
              background: '#0A0E1A', borderRadius: '8px',
            }}>
              <div style={{ width: '80px', fontWeight: 600, fontSize: '14px' }}>{DIAS[d.dia_semana]}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ fontSize: '12px', color: '#8A9BC0' }}>De</span>
                <input
                  type="time" value={d.hora_inicio}
                  onChange={e => handleChange(d.dia_semana, 'hora_inicio', e.target.value)}
                  style={{ width: '110px', padding: '6px 10px', fontSize: '13px' }}
                />
                <span style={{ fontSize: '12px', color: '#8A9BC0' }}>a</span>
                <input
                  type="time" value={d.hora_fin}
                  onChange={e => handleChange(d.dia_semana, 'hora_fin', e.target.value)}
                  style={{ width: '110px', padding: '6px 10px', fontSize: '13px' }}
                />
              </div>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px', color: '#4F8EF7', fontWeight: 700,
              }}>
                {d.horas_disponibles}h
              </span>
            </div>
          ))}
          {disponibilidad.every(d => d.horas_disponibles === 0) && (
            <p style={{ color: '#4A5568', fontSize: '14px', textAlign: 'center', padding: '12px' }}>
              Mové los controles de arriba para asignar horas a cada día.
            </p>
          )}
        </div>
      </Card>

      <ErrorMsg msg={error} />
      <SuccessMsg msg={ok} />

      <div style={{ marginTop: '16px' }}>
        <Btn onClick={handleGuardar} loading={guardando} size="lg">
          Guardar disponibilidad
        </Btn>
      </div>
    </div>
  );
}

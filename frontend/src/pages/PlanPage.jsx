// pages/PlanPage.jsx
import React, { useEffect, useState } from 'react';
import { planAPI } from '../utils/mockStore';
import { aISO, hoyISO, desdeISO, lunesDe } from '../utils/fechas';
import { Btn, Card, Spinner, EmptyState, BadgeDias } from '../components/UI';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export default function PlanPage() {
  const [plan, setPlan] = useState([]);
  const [porFecha, setPorFecha] = useState({});
  const [vista, setVista] = useState('lista'); // 'lista' | 'semana'
  const [cargando, setCargando] = useState(true);
  const [semanaOffset, setSemanaOffset] = useState(0);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await planAPI.obtener();
      setPlan(res.data.plan || []);
      setPorFecha(res.data.por_fecha || {});
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const marcarCompletado = async (id, estado) => {
    try {
      await planAPI.marcarCompletado(id, { completado: estado });
      await cargar();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Vista Semana ──────────────────────────────────────────
  const getSemana = () => {
    const lunes = lunesDe(new Date());
    lunes.setDate(lunes.getDate() + semanaOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      return d;
    });
  };

  const semana = getSemana();
  const hoyStr = hoyISO();

  // ── Vista Lista: agrupar por semanas ─────────────────────
  const agruparPorSemana = () => {
    const grupos = {};
    for (const bloque of plan) {
      const key = aISO(lunesDe(desdeISO(bloque.fecha)));
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(bloque);
    }
    return grupos;
  };

  const semanaLabel = (fechaKey) => {
    const d = desdeISO(fechaKey);
    const fin = new Date(d);
    fin.setDate(d.getDate() + 6);
    return `${d.getDate()} ${MESES[d.getMonth()]} — ${fin.getDate()} ${MESES[fin.getMonth()]}`;
  };

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <Spinner size={28} />
    </div>
  );

  return (
    <div className="page" style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '6px' }}>
            Mi plan de estudio
          </h1>
          <p style={{ color: '#8A9BC0', fontSize: '14px' }}>
            {plan.length} bloques generados · {Object.keys(porFecha).length} días planificados
          </p>
        </div>
        {/* Toggle de vista */}
        <div style={{
          display: 'flex', background: '#0A0E1A',
          border: '1px solid #1F2D4A', borderRadius: '10px', padding: '4px',
        }}>
          {[['lista', 'Lista'], ['semana', 'Semana']].map(([v, label]) => (
            <button key={v} onClick={() => setVista(v)} style={{
              padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              background: vista === v ? '#4F8EF7' : 'transparent',
              color: vista === v ? '#fff' : '#8A9BC0',
              border: 'none', cursor: 'pointer', fontFamily: 'Sora, sans-serif',
              transition: 'all 0.2s',
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {plan.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Todavía no hay un plan generado"
          subtitle='Andá a Inicio y presioná "Generar plan" para crear tu plan de estudio.'
        />
      ) : vista === 'semana' ? (
        // ── Vista SEMANA ─────────────────────────────────────
        <>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <Btn variant="secondary" size="sm" onClick={() => setSemanaOffset(o => o - 1)}>← Anterior</Btn>
            <span style={{ fontWeight: 600, fontSize: '14px', minWidth: '180px', textAlign: 'center' }}>
              {semanaLabel(aISO(semana[0]))}
            </span>
            <Btn variant="secondary" size="sm" onClick={() => setSemanaOffset(o => o + 1)}>Siguiente →</Btn>
            {semanaOffset !== 0 && (
              <Btn variant="ghost" size="sm" onClick={() => setSemanaOffset(0)}>Hoy</Btn>
            )}
          </div>

          <div className="grid-semana" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {semana.map(dia => {
              const fechaStr = aISO(dia);
              const bloques = porFecha[fechaStr] || [];
              const esHoy = fechaStr === hoyStr;
              return (
                <div key={fechaStr} style={{
                  background: esHoy ? 'rgba(79,142,247,0.08)' : '#111827',
                  border: esHoy ? '1px solid rgba(79,142,247,0.3)' : '1px solid #1F2D4A',
                  borderRadius: '10px',
                  padding: '12px',
                  minHeight: '160px',
                }}>
                  <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#8A9BC0', fontWeight: 600 }}>
                      {DIAS_SEMANA[dia.getDay()]}
                    </div>
                    <div style={{
                      fontSize: '20px', fontWeight: 800,
                      color: esHoy ? '#4F8EF7' : '#E8EDF5',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      {dia.getDate()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {bloques.map(b => (
                      <div key={b.id} style={{
                        background: `${b.color}20`,
                        borderLeft: `3px solid ${b.color}`,
                        borderRadius: '4px',
                        padding: '4px 6px',
                        fontSize: '11px',
                        opacity: b.completado ? 0.5 : 1,
                        textDecoration: b.completado ? 'line-through' : 'none',
                      }}>
                        <div style={{ fontWeight: 600, color: b.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.materia_nombre}
                        </div>
                        <div style={{ color: '#8A9BC0' }}>{b.horas_asignadas}h</div>
                      </div>
                    ))}
                    {bloques.length === 0 && (
                      <div style={{ fontSize: '11px', color: '#2A3A5C', textAlign: 'center', paddingTop: '8px' }}>—</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        // ── Vista LISTA ──────────────────────────────────────
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(agruparPorSemana()).map(([semKey, bloques]) => (
            <div key={semKey}>
              <div style={{
                fontSize: '13px', fontWeight: 700, color: '#8A9BC0',
                letterSpacing: '0.05em', textTransform: 'uppercase',
                marginBottom: '10px', paddingBottom: '8px',
                borderBottom: '1px solid #1F2D4A',
              }}>
                Semana del {semanaLabel(semKey)}
              </div>
              {/* Agrupar por fecha */}
              {Object.entries(
                bloques.reduce((acc, b) => {
                  if (!acc[b.fecha]) acc[b.fecha] = [];
                  acc[b.fecha].push(b);
                  return acc;
                }, {})
              ).map(([fecha, bloquesDelDia]) => {
                const fechaObj = desdeISO(fecha);
                const esHoy = fecha === hoyStr;
                const totalH = bloquesDelDia.reduce((s, b) => s + parseFloat(b.horas_asignadas), 0);
                return (
                  <div key={fecha} style={{
                    background: esHoy ? 'rgba(79,142,247,0.05)' : '#111827',
                    border: esHoy ? '1px solid rgba(79,142,247,0.2)' : '1px solid #1F2D4A',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>
                          {DIAS_SEMANA[fechaObj.getDay()]} {fechaObj.getDate()} {MESES[fechaObj.getMonth()]}
                        </span>
                        {esHoy && (
                          <span style={{
                            background: '#4F8EF7', color: '#fff',
                            borderRadius: '4px', padding: '1px 8px', fontSize: '11px', fontWeight: 700,
                          }}>HOY</span>
                        )}
                      </div>
                      <span style={{ fontSize: '13px', color: '#8A9BC0', fontFamily: 'JetBrains Mono, monospace' }}>
                        {totalH}h total
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {bloquesDelDia.map(b => (
                        <div key={b.id} style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '10px 12px',
                          background: '#0A0E1A', borderRadius: '8px',
                          borderLeft: `3px solid ${b.color}`,
                          opacity: b.completado ? 0.6 : 1,
                        }}>
                          <input
                            type="checkbox"
                            checked={b.completado}
                            onChange={e => marcarCompletado(b.id, e.target.checked)}
                            aria-label={`Marcar ${b.materia_nombre} como completada`}
                            style={{ width: 16, height: 16, accentColor: '#10B981', cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1 }}>
                            <span style={{
                              fontWeight: 600, fontSize: '14px',
                              textDecoration: b.completado ? 'line-through' : 'none',
                              color: b.completado ? '#4A5568' : '#E8EDF5',
                            }}>
                              {b.materia_nombre}
                            </span>
                          </div>
                          <span style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '13px', fontWeight: 700,
                            color: b.color,
                          }}>
                            {b.horas_asignadas}h
                          </span>
                          <BadgeDias dias={parseInt(b.dias_hasta_examen)} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

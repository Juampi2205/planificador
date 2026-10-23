// pages/MateriasPage.jsx
import React, { useEffect, useState } from 'react';
import { materiasAPI } from '../utils/mockStore';
import { hoyISO, desdeISO } from '../utils/fechas';
import { Btn, Card, Field, Dificultad, BadgeDias, ErrorMsg, SuccessMsg, Spinner, EmptyState } from '../components/UI';

const INICIAL = { nombre: '', fecha_examen: '', dificultad: 3 };

export default function MateriasPage() {
  const [materias, setMaterias] = useState([]);
  const [form, setForm] = useState(INICIAL);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await materiasAPI.listar();
      setMaterias(res.data);
    } catch (err) {
      setError('No se pudieron cargar las materias');
    } finally {
      setCargando(false);
    }
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setOk('');
    setGuardando(true);
    try {
      if (editando) {
        await materiasAPI.actualizar(editando, form);
        setOk('Materia actualizada');
      } else {
        await materiasAPI.crear(form);
        setOk('Materia agregada');
      }
      setForm(INICIAL);
      setEditando(null);
      await cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (m) => {
    setEditando(m.id);
    setForm({
      nombre: m.nombre,
      fecha_examen: m.fecha_examen?.split('T')[0] || m.fecha_examen,
      dificultad: m.dificultad,
    });
    setError(''); setOk('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta materia y sus bloques del plan?')) return;
    try {
      await materiasAPI.eliminar(id);
      await cargar();
    } catch {
      setError('Error al eliminar');
    }
  };

  const cancelarEdicion = () => { setEditando(null); setForm(INICIAL); setError(''); };

  const hoy = hoyISO();

  return (
    <div className="page" style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '8px' }}>
        Materias
      </h1>
      <p style={{ color: '#8A9BC0', fontSize: '14px', marginBottom: '28px' }}>
        Registrá tus materias con su fecha de examen y dificultad. El algoritmo las priorizará automáticamente.
      </p>

      {/* Formulario */}
      <Card style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>
          {editando ? 'Editar materia' : 'Agregar materia'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <Field label="NOMBRE DE LA MATERIA">
              <input
                name="nombre" type="text"
                placeholder="Ej: Cálculo II"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </Field>

            <Field label="FECHA DE EXAMEN">
              <input
                name="fecha_examen" type="date"
                min={hoy}
                value={form.fecha_examen}
                onChange={handleChange}
                required
              />
            </Field>
          </div>

          <Field label={`DIFICULTAD: ${form.dificultad} / 5`} hint="1 = fácil · 5 = muy difícil">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                name="dificultad" type="range"
                min={1} max={5} step={1}
                value={form.dificultad}
                onChange={handleChange}
                style={{
                  flex: 1, appearance: 'none', background: '#1F2D4A',
                  height: 6, borderRadius: 3, border: 'none', padding: 0,
                  accentColor: '#F59E0B',
                }}
              />
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1,2,3,4,5].map(n => (
                  <div key={n} style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: n <= form.dificultad ? '#F59E0B' : '#1F2D4A',
                    cursor: 'pointer',
                  }} title={`Dificultad ${n}`} onClick={() => setForm(f => ({ ...f, dificultad: n }))} />
                ))}
              </div>
            </div>
          </Field>

          <div style={{ marginTop: '16px' }}>
            <ErrorMsg msg={error} />
            <SuccessMsg msg={ok} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <Btn type="submit" loading={guardando}>
              {editando ? 'Guardar cambios' : 'Agregar materia'}
            </Btn>
            {editando && (
              <Btn variant="ghost" onClick={cancelarEdicion}>Cancelar</Btn>
            )}
          </div>
        </form>
      </Card>

      {/* Lista de materias */}
      {cargando ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Spinner size={28} />
        </div>
      ) : materias.length === 0 ? (
        <EmptyState icon="📚" title="Sin materias aún" subtitle="Completá el formulario de arriba para agregar tu primera materia." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {materias.map(m => {
            const dias = parseInt(m.dias_restantes);
            const pasada = dias < 0;
            return (
              <Card key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                opacity: pasada ? 0.5 : 1,
                borderLeft: `3px solid ${m.color}`,
                padding: '16px 20px',
              }}>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>{m.nombre}</span>
                    {pasada && <span style={{ fontSize: '11px', color: '#EF4444', background: 'rgba(239,68,68,0.1)', borderRadius: '4px', padding: '1px 7px' }}>Finalizada</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', color: '#8A9BC0' }}>
                      {desdeISO(m.fecha_examen).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <Dificultad valor={m.dificultad} />
                  </div>
                </div>
                {!pasada && <BadgeDias dias={dias} />}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Btn variant="secondary" size="sm" onClick={() => handleEditar(m)}>Editar</Btn>
                  <Btn variant="danger" size="sm" onClick={() => handleEliminar(m.id)}>Eliminar</Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// utils/mockStore.js
// Estado global — simula la base de datos sin backend.
// Se guarda en localStorage, así los datos sobreviven al recargar la página.

import { aISO, desdeISO, hoyISO } from './fechas';

const COLORES = [
  '#4F8EF7', '#7C3AED', '#DB2777', '#D97706',
  '#059669', '#DC2626', '#0891B2', '#7C2D12',
];

// ── Estado inicial con datos de ejemplo ────────────────────────
let state = {
  hobbies: [
    { id: 101, nombre: 'Guitarra',       categoria: 'musica',  dias: [1,3,5], horas_por_sesion: 1,   descripcion: 'Practicar acordes y escalas', color: '#A855F7', completadoHoy: false },
    { id: 102, nombre: 'Leer libros',    categoria: 'lectura', dias: [2,4,6], horas_por_sesion: 0.5, descripcion: 'Cultura general y novelas',    color: '#3B82F6', completadoHoy: false },
    { id: 103, nombre: 'Paseo con Rocky',categoria: 'mascota', dias: [1,2,3,4,5], horas_por_sesion: 0.5, descripcion: '',                         color: '#F59E0B', completadoHoy: false },
  ],
  materias: [
    { id: 1, nombre: 'Cálculo II',     fecha_examen: fechaRelativa(18), dificultad: 4, color: '#4F8EF7' },
    { id: 2, nombre: 'Física II',      fecha_examen: fechaRelativa(26), dificultad: 3, color: '#7C3AED' },
    { id: 3, nombre: 'Álgebra',        fecha_examen: fechaRelativa(12), dificultad: 5, color: '#DB2777' },
    { id: 4, nombre: 'Programación',   fecha_examen: fechaRelativa(40), dificultad: 2, color: '#059669' },
  ],
  disponibilidad: [
    { dia_semana: 0, horas_disponibles: 0, hora_inicio: '09:00', hora_fin: '09:00' },
    { dia_semana: 1, horas_disponibles: 2, hora_inicio: '18:00', hora_fin: '20:00' },
    { dia_semana: 2, horas_disponibles: 3, hora_inicio: '18:00', hora_fin: '21:00' },
    { dia_semana: 3, horas_disponibles: 3, hora_inicio: '18:00', hora_fin: '21:00' },
    { dia_semana: 4, horas_disponibles: 3, hora_inicio: '18:00', hora_fin: '21:00' },
    { dia_semana: 5, horas_disponibles: 2, hora_inicio: '10:00', hora_fin: '12:00' },
    { dia_semana: 6, horas_disponibles: 0, hora_inicio: '09:00', hora_fin: '09:00' },
  ],
  plan: [],
  nextId: 10,
};

// Genera una fecha N días desde hoy en formato YYYY-MM-DD
function fechaRelativa(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return aISO(d);
}

function diasRestantes(fechaStr) {
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const ex  = desdeISO(fechaStr);
  return Math.round((ex - hoy) / 86400000);
}

// ── Algoritmo de generación del plan ────────────────────────
function generarPlan(diasAdelante = 30, maxHorasDia = 6) {
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const dispMap = {};
  state.disponibilidad.forEach(d => { dispMap[d.dia_semana] = d.horas_disponibles; });

  const bloques = [];
  let idPlan = 1;

  for (let i = 1; i <= diasAdelante; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    const ds = fecha.getDay();
    const hrsDisp = dispMap[ds] ?? 0;
    if (!hrsDisp) continue;

    const fechaStr = aISO(fecha);
    const materiasActivas = state.materias.filter(m => {
      return desdeISO(m.fecha_examen) > fecha;
    });
    if (!materiasActivas.length) continue;

    // Calcular prioridad relativa para este día
    const conPrio = materiasActivas.map(m => {
      const dr = Math.max((desdeISO(m.fecha_examen) - fecha) / 86400000, 0.5);
      return { ...m, prio: m.dificultad / dr };
    });
    const totalPrio = conPrio.reduce((s, m) => s + m.prio, 0);
    const hrsEfectivas = Math.min(hrsDisp, maxHorasDia);
    let restantes = hrsEfectivas;

    for (const m of conPrio) {
      if (restantes <= 0) break;
      const proporcion = m.prio / totalPrio;
      let hrs = Math.round((hrsEfectivas * proporcion) * 2) / 2;
      hrs = Math.max(0.5, Math.min(hrs, restantes));
      bloques.push({
        id: idPlan++,
        materia_id: m.id,
        materia_nombre: m.nombre,
        color: m.color,
        fecha: fechaStr,
        horas_asignadas: hrs,
        dias_hasta_examen: Math.round((desdeISO(m.fecha_examen) - fecha) / 86400000),
        completado: false,
        notas: null,
      });
      restantes -= hrs;
    }
  }

  state.plan = bloques;
  return bloques;
}

// ── Persistencia en localStorage ────────────────────────────
const STORAGE_KEY = 'planificador:v1';

function guardar() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, guardadoEl: hoyISO() }));
  } catch {
    // Sin acceso a localStorage (modo privado, cuota llena): se sigue en memoria
  }
}

function cargarGuardado() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    // usuario/sesionCerrada: restos del login que ya no existe
    const { guardadoEl, usuario, sesionCerrada, ...guardado } = JSON.parse(raw);
    state = { ...state, ...guardado };
    // "Hecho hoy" de las actividades vale solo para el día en que se marcó
    if (guardadoEl !== hoyISO()) {
      state.hobbies = state.hobbies.map(h => ({ ...h, completadoHoy: false }));
    }
    return true;
  } catch {
    return false;
  }
}

// Restaurar los datos guardados; la primera vez se arranca con los de ejemplo
if (!cargarGuardado()) generarPlan();

// ── API mock ─────────────────────────────────────────────────
const delay = (ms = 120) => new Promise(r => setTimeout(r, ms));

export const materiasAPI = {
  listar: async () => {
    await delay();
    const data = state.materias.map(m => ({
      ...m,
      dias_restantes: diasRestantes(m.fecha_examen),
    }));
    return { data };
  },
  crear: async ({ nombre, fecha_examen, dificultad, color }) => {
    await delay();
    if (!nombre || !fecha_examen || !dificultad) throw { response: { data: { error: 'Completá todos los campos' } } };
    const materia = {
      id: state.nextId++,
      nombre: nombre.trim(),
      fecha_examen,
      dificultad: parseInt(dificultad),
      color: color || COLORES[state.materias.length % COLORES.length],
    };
    state.materias.push(materia);
    guardar();
    return { data: { materia, mensaje: 'Materia creada' } };
  },
  actualizar: async (id, campos) => {
    await delay();
    const idx = state.materias.findIndex(m => m.id === parseInt(id));
    if (idx === -1) throw { response: { data: { error: 'Materia no encontrada' } } };
    state.materias[idx] = { ...state.materias[idx], ...campos };
    guardar();
    return { data: { materia: state.materias[idx] } };
  },
  eliminar: async (id) => {
    await delay();
    state.materias = state.materias.filter(m => m.id !== parseInt(id));
    state.plan = state.plan.filter(b => b.materia_id !== parseInt(id));
    guardar();
    return { data: { mensaje: 'Eliminada' } };
  },
};

export const disponibilidadAPI = {
  obtener: async () => {
    await delay();
    const DIAS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const data = Array.from({ length: 7 }, (_, i) => {
      const found = state.disponibilidad.find(d => d.dia_semana === i);
      return found
        ? { ...found, dia_nombre: DIAS[i] }
        : { dia_semana: i, dia_nombre: DIAS[i], horas_disponibles: 0, hora_inicio: '09:00', hora_fin: '11:00' };
    });
    return { data };
  },
  guardarBulk: async ({ disponibilidad }) => {
    await delay();
    state.disponibilidad = disponibilidad;
    guardar();
    return { data: { mensaje: 'Guardado' } };
  },
};

export const planAPI = {
  generar: async ({ dias_adelante = 30, max_horas_dia = 6 } = {}) => {
    await delay(300);
    if (state.materias.length === 0) throw { response: { data: { error: 'No hay materias registradas' } } };
    const plan = generarPlan(dias_adelante, max_horas_dia);
    guardar();
    return { data: { plan, total_bloques: plan.length, mensaje: `Plan generado: ${plan.length} bloques` } };
  },
  obtener: async ({ desde, hasta } = {}) => {
    await delay();
    let plan = [...state.plan];
    if (desde) plan = plan.filter(b => b.fecha >= desde);
    if (hasta) plan = plan.filter(b => b.fecha <= hasta);
    const porFecha = plan.reduce((acc, b) => {
      if (!acc[b.fecha]) acc[b.fecha] = [];
      acc[b.fecha].push(b);
      return acc;
    }, {});
    return { data: { plan, por_fecha: porFecha, total_bloques: plan.length } };
  },
  marcarCompletado: async (id, { completado, notas }) => {
    await delay();
    const bloque = state.plan.find(b => b.id === parseInt(id));
    if (!bloque) throw { response: { data: { error: 'Bloque no encontrado' } } };
    bloque.completado = completado ?? true;
    bloque.notas = notas ?? null;
    guardar();
    return { data: { bloque } };
  },
};

const COLORES_HOBBY = ['#A855F7','#3B82F6','#10B981','#F59E0B','#EF4444','#06B6D4','#EC4899','#8B5CF6'];

export const hobbiesAPI = {
  listar: async () => {
    await delay();
    return { data: [...state.hobbies] };
  },
  crear: async (campos) => {
    await delay();
    if (!campos.nombre?.trim()) throw { response: { data: { error: 'El nombre es requerido' } } };
    const hobby = {
      id: state.nextId++,
      nombre: campos.nombre.trim(),
      categoria: campos.categoria || 'otro',
      dias: campos.dias || [],
      horas_por_sesion: parseFloat(campos.horas_por_sesion) || 1,
      descripcion: campos.descripcion || '',
      color: campos.color || COLORES_HOBBY[state.hobbies.length % COLORES_HOBBY.length],
      completadoHoy: false,
    };
    state.hobbies.push(hobby);
    guardar();
    return { data: { hobby } };
  },
  actualizar: async (id, campos) => {
    await delay();
    const idx = state.hobbies.findIndex(h => h.id === parseInt(id));
    if (idx === -1) throw { response: { data: { error: 'Actividad no encontrada' } } };
    state.hobbies[idx] = { ...state.hobbies[idx], ...campos };
    guardar();
    return { data: { hobby: state.hobbies[idx] } };
  },
  eliminar: async (id) => {
    await delay();
    state.hobbies = state.hobbies.filter(h => h.id !== parseInt(id));
    guardar();
    return { data: { mensaje: 'Eliminado' } };
  },
  toggleHoy: async (id) => {
    await delay();
    const h = state.hobbies.find(h => h.id === parseInt(id));
    if (!h) throw { response: { data: { error: 'No encontrado' } } };
    h.completadoHoy = !h.completadoHoy;
    guardar();
    return { data: { hobby: h } };
  },
};

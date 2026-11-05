import { Activity, AlertTriangle, Beaker, Clock3, Coffee, Rotate3D, Thermometer, Waves } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getBioreactorSnapshot } from '@/api/ditto'
import { BioreactorScene } from '@/components/bioreactor/bioreactor-scene'

const dittoEnabled = import.meta.env.VITE_DITTO_ENABLED === 'true'
const fmt = (n?: number, digits = 2) =>
  typeof n === 'number' && Number.isFinite(n)
    ? n.toLocaleString('es-CO', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : '—'

const stateLabel = (value: string) => {
  if (value === 'CRITICO') return 'Crítico'
  if (value === 'ALERTA') return 'Alerta'
  if (value === 'NORMAL') return 'Normal'
  return value
}

export const MainPage = () => {
  const query = useQuery({
    queryKey: ['ditto', 'org.cafe:biorreactor-kg'],
    queryFn: getBioreactorSnapshot,
    enabled: dittoEnabled,
    refetchInterval: 5000,
    retry: 1
  })
  const snapshot = query.data
  const ctx = snapshot?.contextoKg
  const sensor = snapshot?.sensores
  const actuator = snapshot?.actuador
  const ready = Boolean(snapshot)
  const metrics = [
    { label: 'pH', value: sensor?.ph, unit: '', digits: 2, Icon: Activity },
    { label: '°Brix', value: sensor?.brix, unit: '', digits: 2, Icon: Beaker },
    { label: 'Temperatura', value: sensor?.temperature, unit: '°C', digits: 1, Icon: Thermometer }
  ]
  // Presentación preparada por Kestra y almacenada en Ditto; React no infiere asociaciones.
  const info = ctx?.resumen_interpretativo?.info_usuario
  const sensory = info?.atributos_sensoriales ?? []
  const microbes = info?.microorganismos_relacionados ?? []
  const defects = info?.defectos_a_vigilar ?? []
  const status = ctx?.estado_proceso ?? 'SIN_DATOS'
  const isCritical = status === 'CRITICO'
  const isAlert = status === 'ALERTA'
  const isReferenceScenario = String(sensor?.escenario ?? '') === '1'
  // Solo se presentan códigos de acción; no se decide ni ejecuta ninguna intervención aquí.
  const actuatorLabels: Record<string, string> = {
    NINGUNA: 'Sin intervención · Continuar seguimiento',
    DETENER_FERMENTACION_SIMULADA: 'Detener fermentación',
    ACTIVAR_ENFRIAMIENTO_SIMULADO: 'Activar enfriamiento'
  }
  const actuatorAction = actuator ? (actuatorLabels[actuator.accion] ?? actuator.accion.replace(/_/g, ' ')) : 'Sin datos'
  const connection = !dittoEnabled ? 'DITTO DESHABILITADO'
    : query.isError ? 'DITTO SIN CONEXIÓN'
    : ready ? 'DITTO CONECTADO' : 'CONECTANDO CON DITTO'

  return (
    <main className='bioreactor-app'>
      <header className='topbar'>
        <div className='brand-lockup'>
          <span className='brand-mark'><Coffee size={19} /></span>
          <div><p className='eyebrow'>GEMELO DIGITAL · CDT</p><h1>CDT · Fermentación de café</h1></div>
        </div>
        <div className='topbar-status'>
          <span className={`status-pill ${isCritical ? 'status-critical' : isAlert ? 'status-warning' : ready ? 'status-ok' : 'status-unknown'}`}>
            <span className='status-dot' />{ready ? stateLabel(status) : 'Sin datos'}
          </span>
          <span className='process-clock'><Clock3 size={15} /> Escenario {sensor?.escenario ?? '—'} · Hora {fmt(sensor?.hora_simulada, 2)}</span>
          <span className={`connection-pill ${ready ? 'connection-live' : ''}`}><span className='connection-dot' />{connection}</span>
        </div>
      </header>

      {!ready && <div className='data-unavailable' role='status'>
        {dittoEnabled ? 'Esperando datos actuales de Ditto. No se muestran ejemplos locales como lecturas del proceso.' : 'Habilita VITE_DITTO_ENABLED=true para consultar el gemelo digital.'}
      </div>}

      <div className='dashboard-grid'>
        <aside className='readings-panel' aria-label='Lecturas del proceso'>
          <div className='section-heading'><div><span className='eyebrow'>VARIABLES</span><h2>Lecturas</h2></div><Waves size={18}/></div>
          <div className='metric-list'>
            {metrics.map(({label,value,unit,digits,Icon}) => (
              <article className='metric-row' key={label}>
                <div className='metric-icon'><Icon size={17}/></div>
                <div className='metric-content'><h3>{label}</h3><div className='metric-value'>{fmt(value,digits)}<span>{unit}</span></div></div>
              </article>
            ))}
          </div>
          <p className='reading-footnote'>Actualización cada 5 s</p>
        </aside>

        <section className='scene-panel' aria-label='Modelo 3D esquemático del biorreactor'>
          <div className='scene-heading'><div><span className='eyebrow'>VISTA DEL EQUIPO</span><h2>Biorreactor</h2></div><span className='schematic-tag'><Rotate3D size={14}/> ESQUEMÁTICO</span></div>
          <div className='scene-model-frame'><BioreactorScene estado={status} ph={sensor?.ph ?? 4.5}/></div>
          <div className='scene-caption'><span>Modelo conceptual, no a escala</span><span>Arrastra para orbitar · rueda para zoom</span></div>
          <div className='actuator-section'>
            <div className='actuator-title-row'>
              <h2>ACTUADOR SIMULADO</h2>
              <span
                className={`actuator-state ${
                  actuator?.estado === 'ACTIVO' ? 'actuator-active' : ''
                }`}
              >
                {actuator?.estado === 'ACTIVO'
                  ? 'Activo'
                  : actuator?.estado === 'INACTIVO'
                    ? 'Inactivo'
                    : 'Sin datos'}
              </span>
            </div>

            <p className='actuator-action'>
              {ready ? actuatorAction : 'Sin datos'}
            </p>
        </div>
        </section>

        <aside className='alerts-panel' aria-label='Interpretación y seguimiento'>
          <section className='interpretation-panel' aria-labelledby='interpretation-title'>
            <div className='section-heading'>
              <div><span className='eyebrow'>LECTURA DEL PROCESO</span><h2 id='interpretation-title'>Interpretación del proceso</h2></div>
            </div>
            {!info && ready && <p className='info-pending'>Esta ejecución aún no contiene info_usuario. Ejecuta el flujo actualizado en Kestra.</p>}
            <div className='interpretation-grid'>
              <article className='interpretation-item'>
                <h3>Atributos sensoriales relacionados</h3>
                {sensory.length ? <div className='attribute-tags'>{sensory.map(item => <span className='attribute-tag' key={item}>{item}</span>)}</div> : <p>No hay asociaciones disponibles.</p>}
                <small>{info?.nota_sensorial ?? 'Asociaciones potenciales, no atributos medidos.'}</small>
              </article>
              <article className='interpretation-item'>
                <h3>Microorganismos relacionados</h3>
                {microbes.length ? <div className='attribute-tags'>{microbes.map(item => <span className='attribute-tag' key={item}>{item}</span>)}</div> : <p>No hay asociaciones disponibles.</p>}
              </article>

              {isReferenceScenario && (
                <article className='interpretation-item'>
                  <h3>Puntaje SCA de referencia</h3>
                  <strong className='sca-value'>{fmt(sensor?.sca_estimado, 2)}</strong>
                  <small>Tomado de la trayectoria del experimento de referencia. No es una medición.</small>
                </article>
              )}
              <article className='interpretation-item'>
                <h3>Defectos a vigilar</h3>
                {defects.length ? <div className='attribute-tags'>{defects.map(item => <span className='attribute-tag' key={item}>{item}</span>)}</div> : <p>No hay asociaciones contextualizadas de defectos.</p>}
                <small>{info?.nota_defectos ?? 'Asociaciones potenciales, no defectos confirmados.'}</small>
              </article>
            </div>
          </section>
          <div className='section-heading'><div><span className='eyebrow'>SEGUIMIENTO</span><h2>Alertas</h2></div><span className='alert-count'>{ctx?.alertas?.length ?? 0}</span></div>
          {ready && (ctx?.alertas?.length ?? 0) === 0 && <p className='no-alerts'>Sin alertas operativas.</p>}
          {(ctx?.alertas ?? []).map((a, i) => (
            <article className='alert-row' key={`${a.variable}-${i}`}>
              <div className='alert-row-heading'><AlertTriangle size={16}/><strong>{a.variable}</strong><span>{a.nivel}</span></div>
              <p>{a.descripcion}</p>
            </article>
          ))}
        </aside>
      </div>


    </main>
  )
}

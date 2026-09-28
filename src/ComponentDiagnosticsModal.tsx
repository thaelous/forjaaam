import React, { useState, useEffect } from 'react';
import { ComponentDiagnostics } from './diagnosticsData';

interface ComponentDiagnosticsModalProps {
  componentKey: string;
  componentName: string;
  componentTag: string;
  data: ComponentDiagnostics;
  onClose: () => void;
  onNavigateComponent: (key: string) => void;
  allComponents: Record<string, { name: string; tag: string }>;
}

export const ComponentDiagnosticsModal: React.FC<ComponentDiagnosticsModalProps> = ({
  componentKey,
  componentName,
  componentTag,
  data,
  onClose,
  onNavigateComponent,
  allComponents
}) => {
  // Live simulated micro-jitter for realistic industrial sensor feedback
  const [liveVib, setLiveVib] = useState(data.vibrationActual);
  const [liveTemp, setLiveTemp] = useState(data.temperature);
  const [activeTab, setActiveTab] = useState<'overview' | 'tolerances' | 'vibration' | 'maintenance'>('overview');

  useEffect(() => {
    setLiveVib(data.vibrationActual);
    setLiveTemp(data.temperature);

    const interval = setInterval(() => {
      // Subtle sensor flutter (±0.08 mm/s, ±0.4°C)
      setLiveVib(prev => +(data.vibrationActual + (Math.random() - 0.5) * 0.16).toFixed(2));
      setLiveTemp(prev => +(data.temperature + (Math.random() - 0.5) * 0.8).toFixed(1));
    }, 450);

    return () => clearInterval(interval);
  }, [componentKey, data]);

  // Calculate percentage of vibration threshold (alarm at 4.5 mm/s according to ISO 10816 Class IV)
  const maxVibScale = 7.0;
  const nominalVibPercent = Math.min(100, (data.vibrationNominal / maxVibScale) * 100);
  const actualVibPercent = Math.min(100, (liveVib / maxVibScale) * 100);
  const peakVibPercent = Math.min(100, (data.vibrationPeak / maxVibScale) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-slate-900/95 border border-red-600/60 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.25)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border-b border-red-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 shadow-inner">
              <i className="fa-solid fa-microchip text-lg animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60">
                  {componentTag}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${data.maintenanceStatusClass}`}>
                  ESTADO: {data.maintenanceStatus}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-100 tech-font tracking-wide mt-0.5">
                {componentName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-mono">SALUD GENERAL</span>
              <span className="tech-font text-xl font-bold text-emerald-400">
                {data.healthScore}%
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-red-600 hover:text-white border border-slate-700 text-slate-400 flex items-center justify-center transition"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 font-semibold tech-font tracking-wider border-b-2 transition flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-gauge-high" /> Diagnóstico Integral
          </button>
          <button
            onClick={() => setActiveTab('tolerances')}
            className={`pb-3 px-3 font-semibold tech-font tracking-wider border-b-2 transition flex items-center gap-2 ${
              activeTab === 'tolerances'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-ruler-combined" /> Tolerancias &amp; Holguras
          </button>
          <button
            onClick={() => setActiveTab('vibration')}
            className={`pb-3 px-3 font-semibold tech-font tracking-wider border-b-2 transition flex items-center gap-2 ${
              activeTab === 'vibration'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-wave-square" /> Espectro de Vibración
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`pb-3 px-3 font-semibold tech-font tracking-wider border-b-2 transition flex items-center gap-2 ${
              activeTab === 'maintenance'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-wrench" /> Mantenimiento &amp; Vida Útil
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-sm">
          {activeTab === 'overview' && (
            <>
              {/* 3 Key KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tolerancia KPI */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Tolerancia Actual
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      data.toleranceStatus === 'optimal'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {data.toleranceActual}
                    </span>
                  </div>
                  <div className="tech-font text-2xl font-bold text-slate-100">
                    {data.toleranceNominal}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <i className="fa-solid fa-arrows-left-right text-red-400" />
                    Margen nominal de diseño
                  </div>
                  <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${data.toleranceStatus === 'optimal' ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                      style={{ width: `${Math.min(100, Math.max(15, 100 - Math.abs(data.toleranceDeviationPercent)))}%` }} 
                    />
                  </div>
                </div>

                {/* Vibración KPI */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Vibración RMS (Live)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-900 border border-slate-700 text-cyan-400">
                      ISO 10816
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`tech-font text-2xl font-bold ${
                      data.vibrationStatus === 'optimal' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {liveVib}
                    </span>
                    <span className="text-xs text-slate-400">mm/s</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      (Nominal: {data.vibrationNominal})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <i className="fa-solid fa-bolt text-amber-400" />
                    Pico máx: {data.vibrationPeak} mm/s
                  </div>
                  <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        liveVib > data.vibrationNominal * 1.3 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`} 
                      style={{ width: `${actualVibPercent}%` }} 
                    />
                  </div>
                </div>

                {/* Mantenimiento KPI */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Horas a Inspección
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-900 border border-slate-700 text-purple-400">
                      PM-AAM
                    </span>
                  </div>
                  <div className="tech-font text-2xl font-bold text-slate-100 flex items-baseline gap-1.5">
                    <span>{data.hoursUntilInspection}</span>
                    <span className="text-xs text-slate-400 font-sans">horas de ciclo</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <i className="fa-solid fa-clock-rotate-left text-purple-400" />
                    Acumuladas: {data.operatingHours.toLocaleString()} hrs
                  </div>
                  <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500" 
                      style={{ width: `${Math.min(100, Math.max(10, 100 - (data.hoursUntilInspection / 500) * 100))}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Live Telemetry Sensor Points */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="tech-font font-bold text-xs uppercase text-slate-300 tracking-wider">
                      Telemetría en Vivo de Sensores Industriales
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Muestreo: 2.2 kHz</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {data.sensorPoints.map((sensor, idx) => (
                    <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                      <span className="text-[10px] text-slate-400 block truncate" title={sensor.name}>
                        {sensor.name}
                      </span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="tech-font font-bold text-slate-100 text-sm">
                          {sensor.value}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${sensor.status === 'ok' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance Summary Box */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-red-400 font-semibold mb-1">
                    <i className="fa-solid fa-bell" />
                    Próxima Intervención Preventiva Programada:
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {data.nextScheduledTask}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                    Última inspección certificada: {data.lastInspectionDate}
                  </span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase">Desgaste Estimado</span>
                    <span className="tech-font font-bold text-sm text-slate-200">{(data.wearFactor * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-10 h-10 relative flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-red-500"
                        strokeDasharray={`${data.wearFactor * 100}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'tolerances' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-slate-100 tech-font mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-ruler-horizontal text-red-500" />
                  Especificación de Tolerancia Dimensional y Geométrica (GD&amp;T)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {data.toleranceDescription}
                </p>

                {/* Tolerance Comparison Bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Valor Nominal de Plano:</span>
                    <span className="tech-font font-bold text-slate-200">{data.toleranceNominal}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Lectura Actual (Galgas / Láser):</span>
                    <span className={`tech-font font-bold ${
                      data.toleranceStatus === 'optimal' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {data.toleranceActual}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Desviación Porcentual:</span>
                    <span className="tech-font font-bold text-slate-300">
                      {data.toleranceDeviationPercent > 0 ? `+${data.toleranceDeviationPercent}%` : `${data.toleranceDeviationPercent}%`}
                    </span>
                  </div>

                  {/* Visual gauge */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Límite Inferior</span>
                      <span className="text-emerald-400 font-bold">Zona Nominal Segura</span>
                      <span>Límite Superior (Alarma)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-3 rounded-full relative overflow-hidden border border-slate-800">
                      <div className="absolute inset-y-0 left-1/4 right-1/4 bg-emerald-950/60 border-x border-emerald-500/40" />
                      <div 
                        className="absolute top-0 bottom-0 w-2 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]" 
                        style={{ left: `${Math.min(95, Math.max(5, 50 + data.toleranceDeviationPercent * 0.6))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vibration' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-100 tech-font flex items-center gap-2">
                    <i className="fa-solid fa-chart-line text-cyan-400" />
                    Análisis Espectral de Vibración (ISO 10816-3 Grupo 1)
                  </h3>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                    {data.vibrationDominantFreq}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4">
                  Monitoreo de velocidad eficaz (RMS) en bancada y chumaceras para detección temprana de holguras dinámicas, cavitación de lubricación o desalineación axial de impacto.
                </p>

                {/* Animated Vibration Waveform Canvas Simulation */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
                  <div className="flex justify-between text-xs text-slate-400 mb-2 font-mono">
                    <span>SEÑAL SENSOR ACELERÓMETRO TRI-AXIAL</span>
                    <span className="text-cyan-400 font-bold">{liveVib} mm/s RMS</span>
                  </div>

                  {/* SVG Waveform Simulation */}
                  <div className="w-full h-24 relative flex items-center justify-center">
                    <svg className="w-full h-full text-cyan-500/80" preserveAspectRatio="none" viewBox="0 0 400 80">
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        d={`M 0 40 Q 25 ${40 - liveVib * 6}, 50 40 T 100 40 T 150 40 T 200 40 T 250 40 T 300 40 T 350 40 T 400 40`}
                      />
                      <path
                        fill="none"
                        stroke="rgba(239, 68, 68, 0.4)"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                        d="M 0 15 L 400 15"
                      />
                      <path
                        fill="none"
                        stroke="rgba(239, 68, 68, 0.4)"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                        d="M 0 65 L 400 65"
                      />
                    </svg>
                    <span className="absolute top-1 right-2 text-[9px] font-mono text-red-400/80">Límite Alarma (4.5 mm/s)</span>
                  </div>

                  {/* Levels comparison */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">RMS Nominal</span>
                      <span className="font-bold text-slate-200 tech-font">{data.vibrationNominal} mm/s</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">RMS Actual</span>
                      <span className="font-bold text-cyan-400 tech-font">{liveVib} mm/s</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Pico de Impacto</span>
                      <span className="font-bold text-amber-400 tech-font">{data.vibrationPeak} mm/s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-slate-100 tech-font mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-clipboard-list text-purple-400" />
                  Historial y Protocolo de Mantenimiento Preventivo AAM Guanajuato
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Registro de horas de fatiga mecánica, estado de desgaste predictivo según normas de mantenimiento automotriz IATF 16949 y procedimientos internos de planta.
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-200 block">Horas Totales de Operación en Línea</span>
                      <span className="text-slate-500 text-[11px]">Desde puesta en marcha / último overhaul</span>
                    </div>
                    <span className="tech-font font-bold text-slate-100 text-sm">
                      {data.operatingHours.toLocaleString()} hrs
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-200 block">Ciclos Restantes para Próxima Inspección</span>
                      <span className="text-slate-500 text-[11px]">Monitoreo automático con contador de golpes</span>
                    </div>
                    <span className="tech-font font-bold text-amber-400 text-sm">
                      {data.hoursUntilInspection} hrs
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-200 block">Próxima Actividad Programada</span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">{data.nextScheduledTask}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      PROGRAMADA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Component Switcher Footer */}
        <div className="px-6 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            <span className="text-slate-500 font-mono text-[10px] uppercase">Cambiar Pieza:</span>
            {Object.keys(allComponents).map(key => (
              <button
                key={key}
                onClick={() => onNavigateComponent(key)}
                className={`px-2.5 py-1 rounded text-[11px] transition font-medium whitespace-nowrap ${
                  key === componentKey
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {allComponents[key].name.split('(')[0].trim()}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs tech-font uppercase tracking-wider shadow-lg shadow-red-600/30 transition shrink-0 ml-4"
          >
            Cerrar Diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
};

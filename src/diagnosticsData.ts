export interface ComponentDiagnostics {
  // Tolerances
  toleranceNominal: string;
  toleranceActual: string;
  toleranceStatus: 'optimal' | 'warning' | 'critical';
  toleranceDeviationPercent: number; // e.g. +8%
  toleranceDescription: string;

  // Vibrations (ISO 10816-3 Machinery Vibration Standard)
  vibrationNominal: number; // mm/s RMS (nominal baseline)
  vibrationActual: number;  // mm/s RMS (live sensor reading)
  vibrationPeak: number;    // mm/s Peak
  vibrationStatus: 'optimal' | 'warning' | 'critical';
  vibrationDominantFreq: string; // e.g., '1x RPM (45 Hz)'

  // Maintenance & Health
  healthScore: number; // 0 - 100%
  maintenanceStatus: 'OPTIMO' | 'ATENCION' | 'CRITICO';
  maintenanceStatusClass: string;
  operatingHours: number;
  hoursUntilInspection: number;
  lastInspectionDate: string;
  nextScheduledTask: string;
  wearFactor: number; // 0.0 - 1.0 (0% - 100% wear)

  // Real-time Sensor Telemetry
  temperature: number; // °C
  sensorPoints: { name: string; value: string; status: 'ok' | 'warn' }[];
}

export const DIAGNOSTICS_DATA: Record<string, ComponentDiagnostics> = {
  frame: {
    toleranceNominal: '≤ 0.100 mm',
    toleranceActual: '0.042 mm',
    toleranceStatus: 'optimal',
    toleranceDeviationPercent: -58,
    toleranceDescription: 'Deflexión axial elástica bajo carga máxima de 4,000 Ton medida en el centro de claros de columnas.',
    vibrationNominal: 1.8,
    vibrationActual: 2.1,
    vibrationPeak: 3.4,
    vibrationStatus: 'optimal',
    vibrationDominantFreq: '0.75 Hz (Frec. de Golpe)',
    healthScore: 96,
    maintenanceStatus: 'OPTIMO',
    maintenanceStatusClass: 'text-emerald-400 border-emerald-600/70 bg-emerald-950/80',
    operatingHours: 8420,
    hoursUntilInspection: 380,
    lastInspectionDate: '15/Sep/2026',
    nextScheduledTask: 'Ajuste Ultrasónico de Tensión en Tirantes Tensores #3 y #4',
    wearFactor: 0.12,
    temperature: 38.5,
    sensorPoints: [
      { name: 'Galga Extensiométrica Col. Izq', value: '184 MPa', status: 'ok' },
      { name: 'Galga Extensiométrica Col. Der', value: '189 MPa', status: 'ok' },
      { name: 'Sensor de Carga Celda A', value: '985 Ton', status: 'ok' },
      { name: 'Sensor de Carga Celda B', value: '1,012 Ton', status: 'ok' }
    ]
  },
  ram: {
    toleranceNominal: '0.050 - 0.080 mm',
    toleranceActual: '0.068 mm',
    toleranceStatus: 'optimal',
    toleranceDeviationPercent: 12,
    toleranceDescription: 'Huelgo diametral de guías prismáticas de bronce fosforoso en 8 caras deslizantes.',
    vibrationNominal: 2.2,
    vibrationActual: 3.8,
    vibrationPeak: 6.2,
    vibrationStatus: 'warning',
    vibrationDominantFreq: '45 Hz (Frecuencia de Ciclo)',
    healthScore: 84,
    maintenanceStatus: 'ATENCION',
    maintenanceStatusClass: 'text-amber-400 border-amber-600/70 bg-amber-950/80',
    operatingHours: 6240,
    hoursUntilInspection: 120,
    lastInspectionDate: '02/Ago/2026',
    nextScheduledTask: 'Compensación de Lainas de Cuñas Guiadas y Purga de Aceite ISO VG 460',
    wearFactor: 0.28,
    temperature: 52.3,
    sensorPoints: [
      { name: 'Juego Frontal Cuña Inf', value: '0.068 mm', status: 'ok' },
      { name: 'Juego Posterior Cuña Sup', value: '0.079 mm', status: 'warn' },
      { name: 'Presión Línea Lubricación', value: '18.2 bar', status: 'ok' },
      { name: 'Temp. Superficie de Fricción', value: '52.3 °C', status: 'ok' }
    ]
  },
  crankshaft: {
    toleranceNominal: '< 0.030 mm',
    toleranceActual: '0.024 mm',
    toleranceStatus: 'optimal',
    toleranceDeviationPercent: -20,
    toleranceDescription: 'Excentricidad y cabeceo dinámico (runout radial) en muñones de biela con bujes Babbit.',
    vibrationNominal: 2.5,
    vibrationActual: 2.7,
    vibrationPeak: 4.8,
    vibrationStatus: 'optimal',
    vibrationDominantFreq: '1x RPM (45 Hz)',
    healthScore: 92,
    maintenanceStatus: 'OPTIMO',
    maintenanceStatusClass: 'text-emerald-400 border-emerald-600/70 bg-emerald-950/80',
    operatingHours: 9150,
    hoursUntilInspection: 450,
    lastInspectionDate: '28/Jul/2026',
    nextScheduledTask: 'Inspección Espectrométrica de Aceite (Partículas Fe/Cu)',
    wearFactor: 0.18,
    temperature: 58.1,
    sensorPoints: [
      { name: 'Chumacera Izq (Termopar)', value: '58.1 °C', status: 'ok' },
      { name: 'Chumacera Der (Termopar)', value: '56.4 °C', status: 'ok' },
      { name: 'Acelerómetro Axial Biela', value: '2.7 mm/s', status: 'ok' },
      { name: 'Flujo de Caudal de Aceite', value: '14.5 L/min', status: 'ok' }
    ]
  },
  flywheel: {
    toleranceNominal: 'Balance G2.5 (≤ 0.025 mm)',
    toleranceActual: '0.018 mm',
    toleranceStatus: 'optimal',
    toleranceDeviationPercent: -28,
    toleranceDescription: 'Desbalance residual dinámico en plano de inercia y concentricidad de embrague neumático.',
    vibrationNominal: 1.5,
    vibrationActual: 1.6,
    vibrationPeak: 2.3,
    vibrationStatus: 'optimal',
    vibrationDominantFreq: '240 RPM (4 Hz)',
    healthScore: 95,
    maintenanceStatus: 'OPTIMO',
    maintenanceStatusClass: 'text-emerald-400 border-emerald-600/70 bg-emerald-950/80',
    operatingHours: 11400,
    hoursUntilInspection: 600,
    lastInspectionDate: '10/May/2026',
    nextScheduledTask: 'Medición de Espesor en Pastillas de Fricción del Freno Neumático',
    wearFactor: 0.15,
    temperature: 42.0,
    sensorPoints: [
      { name: 'Presión Válvula Embrague', value: '6.2 bar', status: 'ok' },
      { name: 'Tiempo de Frenado Emergencia', value: '182 ms', status: 'ok' },
      { name: 'Sensor Óptico RPM Volante', value: '238 RPM', status: 'ok' },
      { name: 'Vibración Cojinete Externo', value: '1.6 mm/s', status: 'ok' }
    ]
  },
  dies: {
    toleranceNominal: '± 0.20 mm',
    toleranceActual: '± 0.14 mm',
    toleranceStatus: 'optimal',
    toleranceDeviationPercent: -30,
    toleranceDescription: 'Desgaste por erosión y lavado térmico en cavidades Blocker y Finisher de dados H13.',
    vibrationNominal: 4.5,
    vibrationActual: 5.8,
    vibrationPeak: 9.8,
    vibrationStatus: 'warning',
    vibrationDominantFreq: 'Transitorio de Impacto PMI',
    healthScore: 78,
    maintenanceStatus: 'ATENCION',
    maintenanceStatusClass: 'text-amber-400 border-amber-600/70 bg-amber-950/80',
    operatingHours: 1450,
    hoursUntilInspection: 50,
    lastInspectionDate: '22/Sep/2026',
    nextScheduledTask: 'Rectificado y Pulido de Filetes Finisher + Capa Antidesgaste Nitrurada',
    wearFactor: 0.42,
    temperature: 245.0,
    sensorPoints: [
      { name: 'Termopar Inserto Finisher', value: '245 °C', status: 'warn' },
      { name: 'Presión Aspersión Grafito', value: '4.8 bar', status: 'ok' },
      { name: 'Ciclos Acumulados Cavidad', value: '18,450 pzs', status: 'warn' },
      { name: 'Altura de Cierre (Shut Height)', value: '640.12 mm', status: 'ok' }
    ]
  },
  billet: {
    toleranceNominal: '± 0.35 mm (Ø ext)',
    toleranceActual: '+0.18 mm',
    toleranceStatus: 'optimal',
    toleranceDeviationPercent: -48,
    toleranceDescription: 'Concentricidad y espesor de rebaba (*flash thickness*) en pieza forjada a 1,180 °C.',
    vibrationNominal: 0.5,
    vibrationActual: 0.6,
    vibrationPeak: 1.2,
    vibrationStatus: 'optimal',
    vibrationDominantFreq: 'Flujo Plástico Uniforme',
    healthScore: 98,
    maintenanceStatus: 'OPTIMO',
    maintenanceStatusClass: 'text-emerald-400 border-emerald-600/70 bg-emerald-950/80',
    operatingHours: 24,
    hoursUntilInspection: 8,
    lastInspectionDate: 'Turno Actual',
    nextScheduledTask: 'Inspección de Descascarillado con Pirómetro Infrarrojo Óptico',
    wearFactor: 0.05,
    temperature: 1180.0,
    sensorPoints: [
      { name: 'Pirómetro Infrarrojo Zona 1', value: '1,182 °C', status: 'ok' },
      { name: 'Pirómetro Zona Deformación', value: '1,178 °C', status: 'ok' },
      { name: 'Peso Tocho en Báscula', value: '9.21 kg', status: 'ok' },
      { name: 'Eficiencia Descalcificado', value: '99.4 %', status: 'ok' }
    ]
  },
  trim_press: {
    toleranceNominal: '± 0.050 mm',
    toleranceActual: '0.038 mm',
    toleranceStatus: 'optimal',
    toleranceDeviationPercent: -24,
    toleranceDescription: 'Alineación concéntrica de punzón cortador de alma central y cuchilla de cizallado exterior.',
    vibrationNominal: 2.8,
    vibrationActual: 3.1,
    vibrationPeak: 5.0,
    vibrationStatus: 'optimal',
    vibrationDominantFreq: '30 SPM (Cizalle)',
    healthScore: 90,
    maintenanceStatus: 'OPTIMO',
    maintenanceStatusClass: 'text-emerald-400 border-emerald-600/70 bg-emerald-950/80',
    operatingHours: 4890,
    hoursUntilInspection: 280,
    lastInspectionDate: '18/Ago/2026',
    nextScheduledTask: 'Reafilado de Filo en Anillo de Recorte D2 Templado',
    wearFactor: 0.22,
    temperature: 64.0,
    sensorPoints: [
      { name: 'Presión Botador Neumático', value: '5.8 bar', status: 'ok' },
      { name: 'Fuerza Pico Cizallado', value: '480 Ton', status: 'ok' },
      { name: 'Sensor Detección de Scrap', value: 'OK (Libre)', status: 'ok' },
      { name: 'Temp. Troquel Recortador', value: '64.0 °C', status: 'ok' }
    ]
  },
  coining_line: {
    toleranceNominal: '< 0.200 mm',
    toleranceActual: '0.095 mm',
    toleranceStatus: 'optimal',
    toleranceDeviationPercent: -52,
    toleranceDescription: 'Planicidad superficial y alabeo térmico post-calibrado antes de túnel de enfriamiento.',
    vibrationNominal: 0.8,
    vibrationActual: 0.9,
    vibrationPeak: 1.4,
    vibrationStatus: 'optimal',
    vibrationDominantFreq: '60 Hz (Motor Transportador)',
    healthScore: 94,
    maintenanceStatus: 'OPTIMO',
    maintenanceStatusClass: 'text-emerald-400 border-emerald-600/70 bg-emerald-950/80',
    operatingHours: 7800,
    hoursUntilInspection: 420,
    lastInspectionDate: '05/Sep/2026',
    nextScheduledTask: 'Calibración de Sensores Pirómetros en Túnel Isotérmico',
    wearFactor: 0.16,
    temperature: 750.0,
    sensorPoints: [
      { name: 'Velocidad Cama Rodillos', value: '1.2 m/min', status: 'ok' },
      { name: 'Temp. Entrada Túnel', value: '750 °C', status: 'ok' },
      { name: 'Temp. Salida Túnel', value: '280 °C', status: 'ok' },
      { name: 'Sensor Planicidad Láser', value: '0.095 mm', status: 'ok' }
    ]
  }
};

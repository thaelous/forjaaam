import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ComponentDiagnosticsModal } from './ComponentDiagnosticsModal';
import { DIAGNOSTICS_DATA } from './diagnosticsData';
import { forgeAudio } from './soundEngine';
import {
  createAAMGreenTexture,
  createBrushedSteelBump,
  createCastIronTexture,
  createDiamondPlateTexture,
  createHazardStripesTexture,
  createHotBilletTexture
} from './textureGenerator';

interface ComponentData {
  id: string;
  name: string;
  tag: string;
  desc: string;
  mat: string;
  weight: string;
  tolerance: string;
  monitoring: string;
  checks: string[];
}

const FORGE_COMPONENTS: Record<string, ComponentData> = {
  frame: {
    id: 'frame',
    name: 'Bastidor Monobloque de Alta Rigidez',
    tag: 'ESTRUCTURA',
    desc: 'Estructura colosal en acero fundido pretensada con 4 tirantes gigantescos (*tie rods*). Absorbe las 4,000 toneladas de reacción dinámica en cada carrera evitando deflexiones que comprometerían el espesor y la concentricidad de la forja.',
    mat: 'Acero Fundido ASTM A27 / Tie-Rods 4340',
    weight: '185 Toneladas',
    tolerance: 'Deflexión máx: 0.10 mm',
    monitoring: 'Celdas de Carga y Galgas Strain',
    checks: [
      'Calibración y apriete hidráulico en tuercas de tirantes.',
      'Nivelación transversal y paralelismo de la cama.',
      'Inspección ultrasónica no destructiva contra grietas en garganta.'
    ]
  },
  ram: {
    id: 'ram',
    name: 'Corredera / Carro Móvil (Ram / Slide)',
    tag: 'CINEMÁTICA',
    desc: 'Elemento móvil macizo guiado en 8 caras con cuñas cónicas de bronce al fósforo lubricadas a presión. Soporta los troqueles superiores y entrega el impacto vertical con máxima rigidez geométrica.',
    mat: 'Acero Forjado de Alto Rendimiento',
    weight: '38 Toneladas',
    tolerance: 'Juego de Guías: 0.05 - 0.08 mm',
    monitoring: 'Presión Hidráulica de Cuñas & Temp',
    checks: [
      'Verificación de claro en lainas de ajuste de cuñas.',
      'Consumo y retorno de aceite del sistema centralizado de lubricación.',
      'Alineación ortogonal respecto al plano del troquel inferior.'
    ]
  },
  crankshaft: {
    id: 'crankshaft',
    name: 'Cigüeñal Excéntrico & Biela Principal',
    tag: 'TRANSMISIÓN',
    desc: 'Mecanismo que convierte el movimiento rotativo continuo del volante de inercia en la carrera alternativa de la corredera. Mecanizado con muñones excéntricos masivos capaces de soportar 40,000 kN de fuerza de impacto.',
    mat: 'Acero Aleado Forjado 4340 Ni-Cr-Mo',
    weight: '24 Toneladas',
    tolerance: 'Runout excéntrico: < 0.03 mm',
    monitoring: 'Termopares en Cojinetes de Babbit',
    checks: [
      'Temperatura en chumaceras de bronce fosforoso (límite 65°C).',
      'Monitoreo de vibración espectral durante el impacto de forja.',
      'Análisis de aceite lubricante ISO VG 460 para partículas de desgaste metálico.'
    ]
  },
  flywheel: {
    id: 'flywheel',
    name: 'Volante de Inercia & Embrague Neumático',
    tag: 'ENERGÍA',
    desc: 'Rueda de inercia conectada al motor principal. Almacena la energía cinética necesaria para transferirla instantáneamente al tocho durante la ventana de deformación (menos de 0.15 segundos).',
    mat: 'Fundición Nodular GGG-60',
    weight: '18 Toneladas',
    tolerance: 'Balanceo Dinámico Grado G2.5',
    monitoring: 'Presión de Embrague (6.2 bar)',
    checks: [
      'Desgaste de pastillas de fricción en embrague/freno neumático.',
      'Tensión en el tren de bandas de transmisión.',
      'Tiempo de respuesta de la válvula de seguridad de freno dual.'
    ]
  },
  dies: {
    id: 'dies',
    name: 'Juego de Matrices / Troqueles Multi-Cavidad',
    tag: 'HERRAMENTAL',
    desc: 'Bloques de dados calientes con insertos de acero grado herramienta H13 tratados térmicamente. Alojan las 3 cavidades simultáneas (Buster, Blocker, Finisher) con canales de rebaba (*flash gutter*).',
    mat: 'Acero Grado Herramienta AISI H13 / DIN 1.2344',
    weight: '6.5 Toneladas',
    tolerance: 'Dureza: 44-48 HRC',
    monitoring: 'Sensores de Temperatura en Insertos',
    checks: [
      'Lavado y erosión por flujo térmico en filetes de cavidad.',
      'Cobertura y presión de los aspersores de grafito coloidal.',
      'Control de altura de cierre (Shut Height) para evitar sobrecarga.'
    ]
  },
  billet: {
    id: 'billet',
    name: 'Tocho de Acero Caliente (Billet / Forging Stock)',
    tag: 'MATERIA PRIMA',
    desc: 'Tocho de acero aleado al cromo-níquel previamente calentado por inducción a 1,180 °C. Se transforma plásticamente en una corona dentada con dirección de grano orientada para máxima resistencia a la fatiga.',
    mat: 'Acero Automotriz 8620H / 4320H para Engranes',
    weight: '9.2 kg (por corona)',
    tolerance: 'Temperatura entrada: 1150 - 1200 °C',
    monitoring: 'Pirómetros Infrarrojos Ópticos en Línea',
    checks: [
      'Descalcificación completa por agua a alta presión previa a forja.',
      'Peso y corte ortogonal del tocho de barra.',
      'Control de temperatura antes del primer golpe en estación Buster.'
    ]
  },
  trim_press: {
    id: 'trim_press',
    name: 'Prensa de Recorte de Rebaba (Trimming Press)',
    tag: 'OPERACIÓN 3',
    desc: 'Prensa mecánica vertical de 600 toneladas instalada inmediatamente después de la prensa de 4000T. Separa la rebaba perimetral (*flash*) y perfora el alma central de la corona caliente.',
    mat: 'Troqueles D2 / H11 templados',
    weight: '32 Toneladas',
    tolerance: 'Alineación de cuchilla: ± 0.05 mm',
    monitoring: 'Sensor de eyección neumática',
    checks: [
      'Filo de corte en anillos de cizallado.',
      'Caída libre del scrap hacia la tolva de reciclaje.',
      'Presión del botador neumático de despegue.'
    ]
  },
  coining_line: {
    id: 'coining_line',
    name: 'Estación de Calibrado & Túnel de Enfriamiento',
    tag: 'OPERACIÓN 4',
    desc: 'Prensa calibradora para corregir ovalamiento térmico seguida de túnel transportador de enfriamiento isotérmico controlado para conferir la microestructura metalúrgica adecuada antes de maquinado.',
    mat: 'Insertos de carburo / Rodillos refractarios',
    weight: '22 Toneladas',
    tolerance: 'Planicidad y alabeo: < 0.20 mm',
    monitoring: 'Pirómetros de zona multicanal',
    checks: [
      'Velocidad de avance de la cama de rodillos.',
      'Curva de enfriamiento (evitar temple indeseado por corriente de aire).',
      'Verificación dimensional de planicidad en frío.'
    ]
  }
};

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const annotationsOverlayRef = useRef<HTMLDivElement>(null);

  // Application State
  const [isRunning, setIsRunning] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [spm, setSpm] = useState(45);
  const [explosionVal, setExplosionVal] = useState(0);
  const [showLabels, setShowLabels] = useState(true);
  const [isXray, setIsXray] = useState(false);
  const [isThermal, setIsThermal] = useState(false);
  const [crankDegText, setCrankDegText] = useState('0° (PMS)');
  const [crankPercent, setCrankPercent] = useState(0);
  const [cycleBadgeText, setCycleBadgeText] = useState('RUNNING');
  const [tempDisplay, setTempDisplay] = useState('1,180 °C');
  const [activeCellStage, setActiveCellStage] = useState<'induction' | 'forging' | 'trimming' | 'coining'>('forging');
  const [selectedKey, setSelectedKey] = useState<string>('frame');

  // Diagnostics overlay feature state
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  // Mutable refs to bridge Three.js animation loop with React state & audio
  const stateRef = useRef({
    isRunning: true,
    spm: 45,
    explosionFactor: 0.0,
    showLabels: true,
    isXray: false,
    isThermal: false,
    crankAngle: 0,
    singleStrokeActive: false,
    selectedComponent: 'frame',
    hasTriggeredImpactThisCycle: false
  });

  // Keep stateRef synced with React state
  useEffect(() => {
    stateRef.current.isRunning = isRunning;
    forgeAudio.updateMotorSpeed(spm, isRunning);
  }, [isRunning, spm]);

  useEffect(() => {
    stateRef.current.spm = spm;
    forgeAudio.updateMotorSpeed(spm, isRunning);
  }, [spm, isRunning]);

  useEffect(() => {
    stateRef.current.explosionFactor = explosionVal / 100.0;
  }, [explosionVal]);

  useEffect(() => {
    stateRef.current.showLabels = showLabels;
    if (annotationsOverlayRef.current) {
      annotationsOverlayRef.current.style.display = showLabels ? 'block' : 'none';
    }
  }, [showLabels]);

  useEffect(() => {
    stateRef.current.selectedComponent = selectedKey;
  }, [selectedKey]);

  useEffect(() => {
    forgeAudio.setMuted(isAudioMuted);
  }, [isAudioMuted]);

  // Three.js controllers ref
  const threeRef = useRef<{
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    materials: {
      aamGreen: THREE.MeshStandardMaterial;
      steelDark: THREE.MeshStandardMaterial;
      dieSteelMat: THREE.MeshStandardMaterial;
      hotBilletMat: THREE.MeshStandardMaterial;
    };
    cameraTween: {
      active: boolean;
      startPos: THREE.Vector3;
      endPos: THREE.Vector3;
      startTarget: THREE.Vector3;
      endTarget: THREE.Vector3;
      progress: number;
    };
  } | null>(null);

  const gsapCameraMove = (px: number, py: number, pz: number, tx: number, ty: number, tz: number) => {
    if (!threeRef.current) return;
    const { camera, controls, cameraTween } = threeRef.current;
    cameraTween.startPos.copy(camera.position);
    cameraTween.endPos.set(px, py, pz);
    cameraTween.startTarget.copy(controls.target);
    cameraTween.endTarget.set(tx, ty, tz);
    cameraTween.progress = 0;
    cameraTween.active = true;
  };

  const handleSelectComponent = (key: string, openDiagnostics: boolean = false) => {
    forgeAudio.init();
    forgeAudio.playUiClick();
    if (FORGE_COMPONENTS[key]) {
      setSelectedKey(key);
      stateRef.current.selectedComponent = key;
      if (openDiagnostics) {
        setIsDiagnosticsOpen(true);
      }
    }
  };

  const handleSetCellStage = (stage: 'induction' | 'forging' | 'trimming' | 'coining') => {
    forgeAudio.init();
    forgeAudio.playUiClick();
    setActiveCellStage(stage);
    if (stage === 'induction') {
      setTempDisplay('1,200 °C');
      handleSelectComponent('billet');
      gsapCameraMove(-13, 6, 8, -13, 3.2, 0);
    } else if (stage === 'forging') {
      setTempDisplay('1,180 °C');
      handleSelectComponent('dies');
      gsapCameraMove(6, 6, 7, 0, 4.0, 0);
    } else if (stage === 'trimming') {
      setTempDisplay('950 °C');
      handleSelectComponent('trim_press');
      gsapCameraMove(12, 5.5, 7.5, 12, 3.0, 0);
    } else if (stage === 'coining') {
      setTempDisplay('750 °C');
      handleSelectComponent('coining_line');
      gsapCameraMove(22, 5.5, 7.5, 22, 1.8, 0);
    }
  };

  const toggleRun = () => {
    forgeAudio.init();
    forgeAudio.playClutchClick();
    setIsRunning(prev => {
      const next = !prev;
      stateRef.current.singleStrokeActive = false;
      stateRef.current.isRunning = next;
      setCycleBadgeText(next ? 'RUNNING' : 'HOLD / STOPPED');
      forgeAudio.updateMotorSpeed(spm, next);
      return next;
    });
  };

  const triggerSingleStroke = () => {
    forgeAudio.init();
    forgeAudio.playClutchClick();
    stateRef.current.crankAngle = 0;
    stateRef.current.hasTriggeredImpactThisCycle = false;
    stateRef.current.singleStrokeActive = true;
    stateRef.current.isRunning = false;
    setIsRunning(false);
    setCycleBadgeText('SINGLE STROKE');
    forgeAudio.updateMotorSpeed(spm, true);
  };

  const toggleXray = () => {
    forgeAudio.init();
    forgeAudio.playUiClick();
    const next = !isXray;
    setIsXray(next);
    stateRef.current.isXray = next;
    if (threeRef.current) {
      const { aamGreen, steelDark } = threeRef.current.materials;
      aamGreen.transparent = next;
      aamGreen.opacity = next ? 0.22 : 1.0;
      aamGreen.needsUpdate = true;

      steelDark.transparent = next;
      steelDark.opacity = next ? 0.35 : 1.0;
      steelDark.needsUpdate = true;
    }
  };

  const toggleThermal = () => {
    forgeAudio.init();
    forgeAudio.playUiClick();
    const next = !isThermal;
    setIsThermal(next);
    stateRef.current.isThermal = next;
    if (threeRef.current) {
      const { dieSteelMat, hotBilletMat } = threeRef.current.materials;
      if (next) {
        dieSteelMat.emissive.setHex(0x661100);
        dieSteelMat.emissiveIntensity = 0.6;
        hotBilletMat.emissiveIntensity = 2.2;
      } else {
        dieSteelMat.emissive.setHex(0x000000);
        dieSteelMat.emissiveIntensity = 0.0;
        hotBilletMat.emissiveIntensity = 1.2;
      }
    }
  };

  const setCameraPreset = (preset: 'isometric' | 'dies' | 'drive') => {
    forgeAudio.init();
    forgeAudio.playUiClick();
    if (preset === 'isometric') {
      gsapCameraMove(24, 15, 28, 0, 7.5, 0);
    } else if (preset === 'dies') {
      gsapCameraMove(5, 5.5, 5, 0, 4.0, 0);
    } else if (preset === 'drive') {
      gsapCameraMove(16, 17, 10, 0, 12, 0);
    }
  };

  // Setup Three.js scene with advanced textures and lighting
  useEffect(() => {
    const container = canvasContainerRef.current;
    const annotationsOverlay = annotationsOverlayRef.current;
    if (!container || !annotationsOverlay) return;

    // First user gesture initializes audio
    const handleFirstGesture = () => {
      forgeAudio.init();
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
    window.addEventListener('pointerdown', handleFirstGesture);
    window.addEventListener('keydown', handleFirstGesture);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c111d);
    scene.fog = new THREE.FogExp2(0x0c111d, 0.012);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 1000);
    camera.position.set(24, 15, 28);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 4;
    controls.maxDistance = 110;
    controls.target.set(0, 7.5, 0);

    // Industrial Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.45);
    dirLight1.position.set(25, 35, 25);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    dirLight1.shadow.camera.near = 0.5;
    dirLight1.shadow.camera.far = 120;
    const d = 35;
    dirLight1.shadow.camera.left = -d;
    dirLight1.shadow.camera.right = d;
    dirLight1.shadow.camera.top = d;
    dirLight1.shadow.camera.bottom = -d;
    dirLight1.shadow.bias = -0.0005;
    scene.add(dirLight1);

    const blueRimLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
    blueRimLight.position.set(-30, 20, -25);
    scene.add(blueRimLight);

    const hotForgeGlow = new THREE.PointLight(0xff4500, 2.5, 18);
    hotForgeGlow.position.set(0, 4.5, 0);
    scene.add(hotForgeGlow);

    // Procedural industrial textures
    const castIronMap = createCastIronTexture();
    const brushedSteelBump = createBrushedSteelBump();
    const diamondFloorMap = createDiamondPlateTexture();
    const hotBilletMap = createHotBilletTexture();
    const aamGreenMap = createAAMGreenTexture();
    const hazardMap = createHazardStripesTexture();

    // Floor with Diamond Plate
    const floorGeo = new THREE.PlaneGeometry(160, 160);
    const floorMat = new THREE.MeshStandardMaterial({
      map: diamondFloorMap,
      bumpMap: diamondFloorMap,
      bumpScale: 0.08,
      roughness: 0.8,
      metalness: 0.35
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(160, 80, 0xdc2626, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    // Materials Palette
    const steelDark = new THREE.MeshStandardMaterial({
      color: 0x272e3b,
      map: castIronMap,
      bumpMap: castIronMap,
      bumpScale: 0.05,
      metalness: 0.82,
      roughness: 0.35
    });

    const aamGreen = new THREE.MeshStandardMaterial({
      color: 0x1e3a34,
      map: aamGreenMap,
      bumpMap: aamGreenMap,
      bumpScale: 0.04,
      metalness: 0.45,
      roughness: 0.55
    });

    const chromeSilver = new THREE.MeshStandardMaterial({
      color: 0xeff1f5,
      bumpMap: brushedSteelBump,
      bumpScale: 0.02,
      metalness: 0.95,
      roughness: 0.18
    });

    const bronzeGuides = new THREE.MeshStandardMaterial({
      color: 0xc8963e,
      bumpMap: brushedSteelBump,
      bumpScale: 0.03,
      metalness: 0.85,
      roughness: 0.28
    });

    const safetyYellow = new THREE.MeshStandardMaterial({
      map: hazardMap,
      metalness: 0.3,
      roughness: 0.4
    });

    const dieSteelMat = new THREE.MeshStandardMaterial({
      color: 0x515f75,
      bumpMap: brushedSteelBump,
      bumpScale: 0.04,
      metalness: 0.9,
      roughness: 0.22
    });

    const trimBlueMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      map: castIronMap,
      metalness: 0.65,
      roughness: 0.45
    });

    const conveyorMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      map: castIronMap,
      metalness: 0.7,
      roughness: 0.35
    });

    const hotBilletMat = new THREE.MeshStandardMaterial({
      map: hotBilletMap,
      color: 0xff4400,
      emissive: 0xff3300,
      emissiveIntensity: 1.25,
      roughness: 0.35,
      metalness: 0.15
    });

    // Master Hierarchy
    const cellRoot = new THREE.Group();
    scene.add(cellRoot);

    const pressRoot = new THREE.Group();
    cellRoot.add(pressRoot);

    // Sub-assemblies for 4000T Press
    const groups = {
      baseFrame: new THREE.Group(),
      crownGroup: new THREE.Group(),
      ram: new THREE.Group(),
      crankshaft: new THREE.Group(),
      flywheel: new THREE.Group(),
      dies: new THREE.Group(),
      billet: new THREE.Group()
    };
    Object.values(groups).forEach(g => pressRoot.add(g));

    // Groups for external line stations
    const inductionStation = new THREE.Group();
    const trimmingStation = new THREE.Group();
    const coiningStation = new THREE.Group();
    cellRoot.add(inductionStation);
    cellRoot.add(trimmingStation);
    cellRoot.add(coiningStation);

    // ==========================================
    // 1. BASE FRAME & COLUMNS
    // ==========================================
    const baseBedGeo = new THREE.BoxGeometry(8.4, 2.2, 6.2);
    const baseBed = new THREE.Mesh(baseBedGeo, aamGreen);
    baseBed.position.set(0, 1.1, 0);
    baseBed.castShadow = true;
    baseBed.receiveShadow = true;
    groups.baseFrame.add(baseBed);

    const bolsterGeo = new THREE.BoxGeometry(5.8, 0.5, 4.4);
    const bolster = new THREE.Mesh(bolsterGeo, steelDark);
    bolster.position.set(0, 2.45, 0);
    bolster.castShadow = true;
    groups.baseFrame.add(bolster);

    const columnGeo = new THREE.BoxGeometry(1.6, 9.8, 4.8);
    const colLeft = new THREE.Mesh(columnGeo, aamGreen);
    colLeft.position.set(-3.4, 7.1, 0);
    colLeft.castShadow = true;
    groups.baseFrame.add(colLeft);

    const colRight = new THREE.Mesh(columnGeo, aamGreen);
    colRight.position.set(3.4, 7.1, 0);
    colRight.castShadow = true;
    groups.baseFrame.add(colRight);

    const guideGeo = new THREE.BoxGeometry(0.18, 6.8, 0.7);
    [-2.52, 2.52].forEach(x => {
      [-1.7, 1.7].forEach(z => {
        const guide = new THREE.Mesh(guideGeo, bronzeGuides);
        guide.position.set(x, 7.2, z);
        groups.baseFrame.add(guide);
      });
    });

    const tieRodGeo = new THREE.CylinderGeometry(0.24, 0.24, 16.5, 24);
    const tieNutGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.7, 6);
    const tiePositions: [number, number][] = [
      [-3.6, 2.4], [3.6, 2.4],
      [-3.6, -2.4], [3.6, -2.4]
    ];
    tiePositions.forEach(([x, z]) => {
      const rod = new THREE.Mesh(tieRodGeo, chromeSilver);
      rod.position.set(x, 8.2, z);
      rod.castShadow = true;
      groups.baseFrame.add(rod);

      const bottomNut = new THREE.Mesh(tieNutGeo, chromeSilver);
      bottomNut.position.set(x, 0.4, z);
      groups.baseFrame.add(bottomNut);
    });

    // ==========================================
    // 2. CROWN
    // ==========================================
    const crownGeo = new THREE.BoxGeometry(8.6, 2.8, 6.2);
    const crown = new THREE.Mesh(crownGeo, aamGreen);
    crown.position.set(0, 13.4, 0);
    crown.castShadow = true;
    groups.crownGroup.add(crown);

    tiePositions.forEach(([x, z]) => {
      const topNut = new THREE.Mesh(tieNutGeo, chromeSilver);
      topNut.position.set(x, 15.0, z);
      groups.crownGroup.add(topNut);
    });

    // ==========================================
    // 3. RAM / CORREDERA MÓVIL
    // ==========================================
    const ramGeo = new THREE.BoxGeometry(4.4, 2.2, 3.4);
    const ramBody = new THREE.Mesh(ramGeo, steelDark);
    ramBody.castShadow = true;
    groups.ram.add(ramBody);

    const ramPlateGeo = new THREE.BoxGeometry(4.6, 0.35, 3.6);
    const ramPlate = new THREE.Mesh(ramPlateGeo, chromeSilver);
    ramPlate.position.y = -1.25;
    ramPlate.castShadow = true;
    groups.ram.add(ramPlate);

    const wristPinGeo = new THREE.CylinderGeometry(0.45, 0.45, 2.8, 24);
    wristPinGeo.rotateZ(Math.PI / 2);
    const wristPin = new THREE.Mesh(wristPinGeo, chromeSilver);
    wristPin.position.y = 0.9;
    groups.ram.add(wristPin);

    const upperDieShoeGeo = new THREE.BoxGeometry(4.2, 0.4, 2.6);
    const upperDieShoe = new THREE.Mesh(upperDieShoeGeo, dieSteelMat);
    upperDieShoe.position.y = -1.6;
    upperDieShoe.castShadow = true;
    groups.ram.add(upperDieShoe);

    [-1.3, 0.0, 1.3].forEach(x => {
      const cavUpperGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.3, 24);
      const cavUpper = new THREE.Mesh(cavUpperGeo, chromeSilver);
      cavUpper.position.set(x, -1.95, 0);
      groups.ram.add(cavUpper);
    });

    const RAM_NEUTRAL_Y = 6.4;
    groups.ram.position.y = RAM_NEUTRAL_Y;

    // ==========================================
    // 4. CRANKSHAFT & BIELA
    // ==========================================
    const crankPivot = new THREE.Group();
    crankPivot.position.set(0, 12.0, 0);
    groups.crankshaft.add(crankPivot);

    const crankShaftGeo = new THREE.CylinderGeometry(0.65, 0.65, 7.6, 32);
    crankShaftGeo.rotateZ(Math.PI / 2);
    const crankShaft = new THREE.Mesh(crankShaftGeo, chromeSilver);
    crankShaft.castShadow = true;
    crankPivot.add(crankShaft);

    const eccentricGeo = new THREE.CylinderGeometry(1.05, 1.05, 2.0, 32);
    eccentricGeo.rotateZ(Math.PI / 2);
    const eccentricCam = new THREE.Mesh(eccentricGeo, steelDark);
    eccentricCam.position.set(0, 0.45, 0);
    crankPivot.add(eccentricCam);

    const conRodGeo = new THREE.BoxGeometry(1.2, 3.4, 1.6);
    const conRod = new THREE.Mesh(conRodGeo, steelDark);
    conRod.position.set(0, -1.7, 0);
    conRod.castShadow = true;

    const conRodHolder = new THREE.Group();
    conRodHolder.position.copy(eccentricCam.position);
    conRodHolder.add(conRod);
    crankPivot.add(conRodHolder);

    // ==========================================
    // 5. FLYWHEEL & DRIVE MOTOR
    // ==========================================
    const flywheelOuterGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.95, 48);
    flywheelOuterGeo.rotateZ(Math.PI / 2);
    const flywheelMesh = new THREE.Mesh(flywheelOuterGeo, steelDark);
    flywheelMesh.position.set(4.9, 12.0, 0);
    flywheelMesh.castShadow = true;
    groups.flywheel.add(flywheelMesh);

    const ringGeo = new THREE.TorusGeometry(2.65, 0.12, 16, 48);
    ringGeo.rotateY(Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, safetyYellow);
    ringMesh.position.copy(flywheelMesh.position);
    groups.flywheel.add(ringMesh);

    const motorGeo = new THREE.CylinderGeometry(1.0, 1.0, 2.4, 32);
    motorGeo.rotateZ(Math.PI / 2);
    const motor = new THREE.Mesh(motorGeo, aamGreen);
    motor.position.set(4.3, 3.0, 3.0);
    motor.castShadow = true;
    groups.flywheel.add(motor);

    const guardGeo = new THREE.BoxGeometry(0.65, 9.2, 3.4);
    const guard = new THREE.Mesh(guardGeo, safetyYellow);
    guard.position.set(5.1, 7.5, 1.5);
    groups.flywheel.add(guard);

    // ==========================================
    // 6. MATRICES INFERIORES FIJAS
    // ==========================================
    const lowerDieShoeGeo = new THREE.BoxGeometry(4.2, 0.45, 2.6);
    const lowerDieShoe = new THREE.Mesh(lowerDieShoeGeo, dieSteelMat);
    lowerDieShoe.position.set(0, 2.9, 0);
    lowerDieShoe.castShadow = true;
    groups.dies.add(lowerDieShoe);

    [-1.3, 0.0, 1.3].forEach(x => {
      const cavLowerGeo = new THREE.CylinderGeometry(0.44, 0.38, 0.3, 24);
      const cavLower = new THREE.Mesh(cavLowerGeo, chromeSilver);
      cavLower.position.set(x, 3.2, 0);
      groups.dies.add(cavLower);
    });

    // ==========================================
    // 7. TOCHOS CALIENTES MULTI-CAVIDAD
    // ==========================================
    const busterBilletGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.55, 24);
    const busterBillet = new THREE.Mesh(busterBilletGeo, hotBilletMat);
    busterBillet.position.set(-1.3, 3.55, 0);
    groups.billet.add(busterBillet);

    const blockerBilletGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.32, 24);
    const blockerBillet = new THREE.Mesh(blockerBilletGeo, hotBilletMat);
    blockerBillet.position.set(0.0, 3.48, 0);
    groups.billet.add(blockerBillet);

    const finisherGroup = new THREE.Group();
    const ringForgedGeo = new THREE.TorusGeometry(0.42, 0.14, 16, 32);
    ringForgedGeo.rotateX(Math.PI / 2);
    const ringForged = new THREE.Mesh(ringForgedGeo, hotBilletMat);
    finisherGroup.add(ringForged);

    const flashGeo = new THREE.RingGeometry(0.46, 0.72, 32);
    flashGeo.rotateX(Math.PI / 2);
    const flashMesh = new THREE.Mesh(flashGeo, hotBilletMat);
    finisherGroup.add(flashMesh);

    finisherGroup.position.set(1.3, 3.48, 0);
    groups.billet.add(finisherGroup);

    // ==========================================
    // ESTACIÓN 1: HORNO / INDUCTOR
    // ==========================================
    inductionStation.position.set(-13, 0, 0);
    const indBaseGeo = new THREE.BoxGeometry(4, 2.5, 3.5);
    const indBase = new THREE.Mesh(indBaseGeo, steelDark);
    indBase.position.y = 1.25;
    inductionStation.add(indBase);

    const coilGeo = new THREE.TorusGeometry(0.9, 0.15, 16, 32);
    for (let i = -1.0; i <= 1.0; i += 0.5) {
      const coil = new THREE.Mesh(coilGeo, bronzeGuides);
      coil.position.set(i, 3.2, 0);
      coil.rotation.y = Math.PI / 2;
      inductionStation.add(coil);
    }

    const hotIndBillet = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.2, 24), hotBilletMat);
    hotIndBillet.rotation.z = Math.PI / 2;
    hotIndBillet.position.set(0, 3.2, 0);
    inductionStation.add(hotIndBillet);

    // ==========================================
    // ESTACIÓN 3: PRENSA DE RECORTE (TRIMMING)
    // ==========================================
    trimmingStation.position.set(12, 0, 0);
    const trimBase = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 3.2), trimBlueMat);
    trimBase.position.y = 1.1;
    trimmingStation.add(trimBase);

    const trimCrown = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.8, 3.2), trimBlueMat);
    trimCrown.position.y = 6.2;
    trimmingStation.add(trimCrown);

    [-1.4, 1.4].forEach(x => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.8, 1.8), trimBlueMat);
      col.position.set(x, 3.8, 0);
      trimmingStation.add(col);
    });

    const trimDie = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.6, 32), chromeSilver);
    trimDie.position.set(0, 2.45, 0);
    trimmingStation.add(trimDie);

    const trimmedRingMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      map: castIronMap,
      roughness: 0.35,
      metalness: 0.8
    });
    const trimmedRing = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.14, 16, 32), trimmedRingMat);
    trimmedRing.rotation.x = Math.PI / 2;
    trimmedRing.position.set(0, 2.85, 0);
    trimmingStation.add(trimmedRing);

    const scrapRing = new THREE.Mesh(new THREE.RingGeometry(0.48, 0.72, 32), steelDark);
    scrapRing.rotation.x = -Math.PI / 2 + 0.3;
    scrapRing.position.set(1.2, 1.4, 0.6);
    trimmingStation.add(scrapRing);

    // ==========================================
    // ESTACIÓN 4: CALIBRADO Y MESA DE ENFRIAMIENTO
    // ==========================================
    coiningStation.position.set(22, 0, 0);
    const conveyorTable = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 2.4), conveyorMat);
    conveyorTable.position.y = 0.6;
    coiningStation.add(conveyorTable);

    const rollerGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.2, 16);
    rollerGeo.rotateX(Math.PI / 2);
    for (let rx = -3.5; rx <= 3.5; rx += 0.8) {
      const roller = new THREE.Mesh(rollerGeo, chromeSilver);
      roller.position.set(rx, 1.3, 0);
      coiningStation.add(roller);
    }

    const cool1 = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.14, 16, 32), new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.4 }));
    cool1.rotation.x = Math.PI / 2;
    cool1.position.set(-2, 1.55, 0);
    coiningStation.add(cool1);

    const cool2 = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.14, 16, 32), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 }));
    cool2.rotation.x = Math.PI / 2;
    cool2.position.set(1.5, 1.55, 0);
    coiningStation.add(cool2);

    // Raycast user data mappings
    baseBed.userData = { componentKey: 'frame' };
    colLeft.userData = { componentKey: 'frame' };
    colRight.userData = { componentKey: 'frame' };
    crown.userData = { componentKey: 'frame' };
    ramBody.userData = { componentKey: 'ram' };
    ramPlate.userData = { componentKey: 'ram' };
    crankShaft.userData = { componentKey: 'crankshaft' };
    eccentricCam.userData = { componentKey: 'crankshaft' };
    conRod.userData = { componentKey: 'crankshaft' };
    flywheelMesh.userData = { componentKey: 'flywheel' };
    lowerDieShoe.userData = { componentKey: 'dies' };
    busterBillet.userData = { componentKey: 'billet' };
    blockerBillet.userData = { componentKey: 'billet' };
    ringForged.userData = { componentKey: 'billet' };
    trimBase.userData = { componentKey: 'trim_press' };
    conveyorTable.userData = { componentKey: 'coining_line' };

    // Annotations config with diagnosis icon
    const annotationsConfig = [
      { id: 'tag-crown', title: 'Cabezal / Cigüeñal', targetGroup: groups.crownGroup, offset: new THREE.Vector3(0, 2.2, 0), key: 'crankshaft' },
      { id: 'tag-ram', title: 'Corredera Móvil (Ram)', targetGroup: groups.ram, offset: new THREE.Vector3(0, 1.8, 1.8), key: 'ram' },
      { id: 'tag-dies', title: 'Matrices de Forja', targetGroup: groups.dies, offset: new THREE.Vector3(0, 1.2, 1.6), key: 'dies' },
      { id: 'tag-flywheel', title: 'Volante 2.8m / Embrague', targetGroup: groups.flywheel, offset: new THREE.Vector3(5.0, 4.2, 0), key: 'flywheel' },
      { id: 'tag-billet', title: 'Tochos (Buster/Blocker/Finisher)', targetGroup: groups.billet, offset: new THREE.Vector3(0, 1.2, 0), key: 'billet' },
      { id: 'tag-frame', title: 'Bastidor 4000T', targetGroup: groups.baseFrame, offset: new THREE.Vector3(-3.8, 3.0, 2.4), key: 'frame' },
      { id: 'tag-trim', title: 'Prensa de Recorte 600T', targetGroup: trimmingStation, offset: new THREE.Vector3(0, 5.0, 0), key: 'trim_press' },
      { id: 'tag-cool', title: 'Calibrado & Enfriamiento', targetGroup: coiningStation, offset: new THREE.Vector3(0, 3.0, 0), key: 'coining_line' }
    ];

    annotationsOverlay.innerHTML = '';
    const annotationDoms = annotationsConfig.map(item => {
      const el = document.createElement('div');
      el.id = item.id;
      el.className = 'annotation-tag';
      el.innerHTML = `
        <div class="annotation-box cursor-pointer select-none group flex items-center gap-1.5 hover:border-red-400 hover:text-white transition">
          <i class="fa-solid fa-crosshairs text-red-500 group-hover:rotate-90 transition-transform"></i>
          <span>${item.title}</span>
          <span class="text-[9px] bg-red-950 text-red-300 px-1 py-0.2 rounded border border-red-800/80 font-mono ml-0.5">DIAG</span>
        </div>
        <div class="annotation-pin"></div>
        <div class="annotation-dot"></div>
      `;
      const box = el.querySelector('.annotation-box');
      if (box) {
        box.addEventListener('click', (e) => {
          e.stopPropagation();
          handleSelectComponent(item.key, true);
        });
      }
      annotationsOverlay.appendChild(el);
      return { ...item, domElement: el };
    });

    const tempVec = new THREE.Vector3();
    const updateAnnotations = () => {
      if (!stateRef.current.showLabels) {
        annotationsOverlay.style.display = 'none';
        return;
      }
      annotationsOverlay.style.display = 'block';

      annotationDoms.forEach(item => {
        item.targetGroup.getWorldPosition(tempVec);
        tempVec.add(item.offset);
        tempVec.project(camera);

        if (tempVec.z > 1) {
          item.domElement.style.opacity = '0';
        } else {
          const x = (tempVec.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-(tempVec.y * 0.5) + 0.5) * window.innerHeight;
          item.domElement.style.left = `${x}px`;
          item.domElement.style.top = `${y}px`;
          item.domElement.style.opacity = '1';
        }
      });
    };

    // Camera animation state
    const cameraTween = {
      active: false,
      startPos: new THREE.Vector3(),
      endPos: new THREE.Vector3(),
      startTarget: new THREE.Vector3(),
      endTarget: new THREE.Vector3(),
      progress: 0
    };

    threeRef.current = {
      camera,
      controls,
      materials: {
        aamGreen,
        steelDark,
        dieSteelMat,
        hotBilletMat
      },
      cameraTween
    };

    // Animation loop variables
    const STROKE_AMPLITUDE = 0.65;
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Camera tween interpolation
      if (cameraTween.active) {
        cameraTween.progress += delta * 2.2;
        if (cameraTween.progress >= 1) {
          camera.position.copy(cameraTween.endPos);
          controls.target.copy(cameraTween.endTarget);
          cameraTween.active = false;
        } else {
          camera.position.lerpVectors(cameraTween.startPos, cameraTween.endPos, cameraTween.progress);
          controls.target.lerpVectors(cameraTween.startTarget, cameraTween.endTarget, cameraTween.progress);
        }
      }

      // Kinematics & Sound triggers
      const s = stateRef.current;
      if (s.isRunning || s.singleStrokeActive) {
        const rotSpeed = (s.spm / 60) * Math.PI * 2;
        s.crankAngle += rotSpeed * delta;

        if (s.singleStrokeActive && s.crankAngle >= Math.PI * 2) {
          s.crankAngle = 0;
          s.singleStrokeActive = false;
          s.isRunning = false;
          s.hasTriggeredImpactThisCycle = false;
          setIsRunning(false);
          setCycleBadgeText('HOLD / STOPPED');
          forgeAudio.updateMotorSpeed(s.spm, false);
        }

        if (s.crankAngle > Math.PI * 2) {
          s.crankAngle -= Math.PI * 2;
          s.hasTriggeredImpactThisCycle = false;
        }

        flywheelMesh.rotation.x += rotSpeed * delta;
        crankPivot.rotation.x = s.crankAngle;

        const strokeOffset = Math.sin(s.crankAngle - Math.PI / 2) * STROKE_AMPLITUDE;
        groups.ram.position.y = (RAM_NEUTRAL_Y + strokeOffset) + (s.explosionFactor * 2.2);

        // PMI Impact Zone (Bottom Dead Center around PI radians = 180 degrees)
        const isNearBDC = Math.abs(s.crankAngle - Math.PI) < 0.35;
        if (isNearBDC && s.explosionFactor < 0.1) {
          hotForgeGlow.intensity = 4.2;
          const squash = 1 - (Math.cos(s.crankAngle) + 1) * 0.12;
          groups.billet.scale.set(1 + (1 - squash) * 0.25, squash, 1 + (1 - squash) * 0.25);

          // Disparar sonido del golpe de forja de 4000T justo al cruzar el PMI
          if (!s.hasTriggeredImpactThisCycle && s.crankAngle >= Math.PI - 0.15) {
            forgeAudio.playForgeImpact(s.spm);
            s.hasTriggeredImpactThisCycle = true;
          }
        } else {
          hotForgeGlow.intensity = 2.0;
          groups.billet.scale.set(1, 1, 1);
        }

        const degrees = Math.round((s.crankAngle * 180) / Math.PI);
        const percent = Math.round((degrees / 360) * 100);
        setCrankPercent(percent);

        let positionName = 'Descenso';
        if (degrees >= 345 || degrees <= 15) positionName = 'PMS (Punto Muerto Sup.)';
        else if (degrees >= 165 && degrees <= 195) positionName = 'PMI (GOLPE DE IMPACTO)';
        else if (degrees > 195) positionName = 'Carrera de Retorno';

        setCrankDegText(`${degrees}° - ${positionName}`);
      } else {
        groups.ram.position.y = RAM_NEUTRAL_Y + (s.explosionFactor * 2.2);
      }

      // Explosion factor lerp
      const targetFactor = s.explosionFactor;
      groups.crownGroup.position.y = THREE.MathUtils.lerp(groups.crownGroup.position.y, targetFactor * 4.5, 0.1);
      groups.crankshaft.position.y = THREE.MathUtils.lerp(groups.crankshaft.position.y, targetFactor * 5.2, 0.1);
      groups.flywheel.position.x = THREE.MathUtils.lerp(groups.flywheel.position.x, targetFactor * 4.2, 0.1);
      groups.dies.position.z = THREE.MathUtils.lerp(groups.dies.position.z, targetFactor * 2.5, 0.1);
      groups.billet.position.z = THREE.MathUtils.lerp(groups.billet.position.z, targetFactor * 2.5, 0.1);
      groups.billet.position.y = THREE.MathUtils.lerp(groups.billet.position.y, targetFactor * 1.2, 0.1);

      updateAnnotations();

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Raycast click: Al hacer clic en una pieza 3D se selecciona y abre automáticamente la superposición de diagnóstico
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.closest('aside') || 
        target?.closest('header') || 
        target?.closest('footer') || 
        target?.closest('.annotation-box') ||
        target?.closest('#diagnostics-modal')
      ) {
        return;
      }

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cellRoot.children, true);

      if (intersects.length > 0) {
        let hit: THREE.Object3D | null = intersects[0].object;
        while (hit && !hit.userData?.componentKey && hit.parent) {
          hit = hit.parent;
        }
        if (hit && hit.userData && hit.userData.componentKey) {
          handleSelectComponent(hit.userData.componentKey, true);
        }
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const activePart = FORGE_COMPONENTS[selectedKey] || FORGE_COMPONENTS.frame;
  const activeDiagnostics = DIAGNOSTICS_DATA[selectedKey] || DIAGNOSTICS_DATA.frame;

  return (
    <div className="relative h-screen w-screen select-none overflow-hidden bg-[#0b0f19] text-slate-200">
      {/* 3D WebGL Canvas Layer */}
      <div ref={canvasContainerRef} id="canvas-container" className="canvas-container" />

      {/* HTML 3D Annotation Overlay Layer */}
      <div ref={annotationsOverlayRef} id="annotations-overlay" className="absolute inset-0 pointer-events-none z-10" />

      {/* TOP HEADER / STATUS BAR */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-3.5 bg-slate-950/85 backdrop-blur-md border-b border-red-900/40">
        <div className="flex items-center space-x-4">
          <div className="bg-red-600 px-3 py-1 rounded text-white font-bold tracking-widest tech-font text-sm flex items-center shadow-lg shadow-red-600/30">
            <i className="fa-solid fa-industry mr-2" />AAM GUANAJUATO
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-slate-100 tech-font uppercase flex items-center gap-2">
              Prensa Mecánica de Forja en Caliente 4000T
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/60 font-sans normal-case">
                Línea Forja Pesada
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Modelo Educativo &amp; Entrenamiento Técnico Operativo | Bastidor Monobloque 4,000 Ton
            </p>
          </div>
        </div>

        {/* Live Telemetry Tickers + Audio Toggle + Quick Diagnostics Button */}
        <div className="flex items-center space-x-3 text-sm">
          {/* Quick Diagnostics Trigger Button */}
          <button
            onClick={() => {
              forgeAudio.init();
              forgeAudio.playUiClick();
              setIsDiagnosticsOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/70 bg-red-950/80 text-red-300 hover:bg-red-900/90 text-xs font-semibold shadow-lg shadow-red-950/50 transition group"
            title="Abrir superposición interactiva de diagnóstico del componente seleccionado"
          >
            <i className="fa-solid fa-stethoscope text-red-400 group-hover:scale-110 transition-transform" />
            <span className="tech-font">DIAGNÓSTICO EN VIVO</span>
          </button>

          {/* Audio toggle button */}
          <button
            onClick={() => {
              forgeAudio.init();
              setIsAudioMuted(prev => !prev);
            }}
            title={isAudioMuted ? 'Activar Sonido Industrial' : 'Silenciar Sonido'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              isAudioMuted
                ? 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                : 'bg-red-950/80 text-red-300 border-red-600/80 shadow-md shadow-red-950/50'
            }`}
          >
            <i className={`fa-solid ${isAudioMuted ? 'fa-volume-xmark text-slate-500' : 'fa-volume-high text-red-400 animate-pulse'}`} />
            <span className="tech-font">{isAudioMuted ? 'AUDIO MUTED' : 'SONIDO 4000T'}</span>
          </button>

          <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 uppercase">Capacidad:</span>
            <span className="tech-font font-bold text-red-400">4,000 Ton</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 uppercase">Temp. Forja:</span>
            <span id="temp-display" className="tech-font font-bold text-amber-400">{tempDisplay}</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 uppercase">Ciclo (SPM):</span>
            <span id="spm-display" className="tech-font font-bold text-emerald-400">{spm} SPM</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="tech-font text-xs text-emerald-400 font-semibold tracking-wider">LÍNEA ACTIVA</span>
          </div>
        </div>
      </header>

      {/* LEFT CONTROL DOCK */}
      <aside className="absolute left-5 top-20 z-20 w-84 flex flex-col gap-4">
        {/* Visual Modes Panel */}
        <div className="bg-slate-950/90 backdrop-blur-md rounded-xl p-4 border border-slate-800 shadow-2xl">
          <div className="text-xs font-bold text-red-500 uppercase tracking-widest tech-font mb-3 flex items-center justify-between">
            <span><i className="fa-solid fa-eye mr-2" />Controles de Inspección</span>
            <span className="text-[10px] text-slate-500 font-mono">Visualizer v2.6</span>
          </div>

          {/* GRADUAL EXPLOSION SLIDER */}
          <div className="mb-4 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <i className="fa-solid fa-arrows-split-up-and-left text-red-400" /> Desglose Progresivo:
              </span>
              <span className={`tech-font font-bold text-xs ${explosionVal === 0 ? 'text-slate-400' : explosionVal === 100 ? 'text-red-500' : 'text-red-400'}`}>
                {explosionVal === 0 ? '0% (Ensamble)' : explosionVal === 100 ? '100% (Despiece Total)' : `${explosionVal}%`}
              </span>
            </div>
            <input
              type="range"
              id="explode-slider"
              min={0}
              max={100}
              value={explosionVal}
              onChange={(e) => {
                forgeAudio.init();
                setExplosionVal(parseInt(e.target.value));
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0% Compacto</span>
              <span>50% Despiece</span>
              <span>100% Máximo</span>
            </div>
          </div>

          {/* TOGGLE BUTTONS */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                forgeAudio.init();
                forgeAudio.playUiClick();
                setShowLabels(prev => !prev);
              }}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                showLabels
                  ? 'bg-red-950/80 border border-red-600 text-red-200 shadow-md shadow-red-950/50'
                  : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300'
              }`}
            >
              <i className="fa-solid fa-tags text-red-400" />
              <span>{showLabels ? 'Ocultar Etiquetas' : 'Mostrar Etiquetas'}</span>
            </button>

            <button
              onClick={toggleXray}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                isXray
                  ? 'bg-cyan-950/70 border border-cyan-500 text-cyan-200'
                  : 'bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500 text-slate-200'
              }`}
            >
              <i className="fa-solid fa-radiation text-cyan-400" /> Rayos X (Corte)
            </button>

            <button
              onClick={toggleThermal}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                isThermal
                  ? 'bg-amber-950/70 border border-amber-500 text-amber-200'
                  : 'bg-slate-900 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-500 text-slate-200'
              }`}
            >
              <i className="fa-solid fa-fire text-amber-500" /> Flujo Térmico
            </button>

            <button
              onClick={() => setCameraPreset('isometric')}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition"
            >
              <i className="fa-solid fa-arrows-rotate text-slate-400" /> Reset Cámara
            </button>
          </div>

          {/* Presets de Cámara */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <label className="text-[11px] text-slate-400 block mb-2 font-medium">Vistas Rápidas:</label>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                onClick={() => setCameraPreset('isometric')}
                className="py-1.5 px-2 bg-slate-900/80 hover:bg-slate-800 rounded border border-slate-800 text-center text-slate-300 transition"
              >
                General
              </button>
              <button
                onClick={() => setCameraPreset('dies')}
                className="py-1.5 px-2 bg-slate-900/80 hover:bg-slate-800 rounded border border-slate-800 text-center text-slate-300 transition"
              >
                Matrices
              </button>
              <button
                onClick={() => setCameraPreset('drive')}
                className="py-1.5 px-2 bg-slate-900/80 hover:bg-slate-800 rounded border border-slate-800 text-center text-slate-300 transition"
              >
                Corona/Motor
              </button>
            </div>
          </div>
        </div>

        {/* Kinematics & Stroke Control Panel */}
        <div className="bg-slate-950/90 backdrop-blur-md rounded-xl p-4 border border-slate-800 shadow-2xl">
          <div className="text-xs font-bold text-red-500 uppercase tracking-widest tech-font mb-3 flex items-center justify-between">
            <span><i className="fa-solid fa-gears mr-2" />Cinemática de Golpe</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded border ${
                cycleBadgeText === 'RUNNING'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                  : cycleBadgeText === 'SINGLE STROKE'
                  ? 'bg-amber-950 text-amber-300 border-amber-600'
                  : 'bg-amber-950 text-amber-400 border-amber-700'
              }`}
            >
              {cycleBadgeText}
            </span>
          </div>

          {/* Master Run/Stop Button */}
          <button
            onClick={toggleRun}
            className={`w-full mb-3 py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider text-white shadow-lg flex items-center justify-center gap-2 transition ${
              isRunning
                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/40'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/40'
            }`}
          >
            <i className={isRunning ? 'fa-solid fa-pause' : 'fa-solid fa-play'} />
            <span>{isRunning ? 'Detener Ciclo de Prensa' : 'Iniciar Ciclo Continuo'}</span>
          </button>

          {/* SPM Speed Slider */}
          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Velocidad de Forja:</span>
              <span className="font-bold text-red-400 tech-font">{spm} SPM</span>
            </div>
            <input
              type="range"
              min={5}
              max={75}
              value={spm}
              onChange={(e) => setSpm(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>

          {/* Single Stroke Trigger */}
          <button
            onClick={triggerSingleStroke}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium flex items-center justify-center gap-2 transition"
          >
            <i className="fa-solid fa-circle-dot text-amber-400" /> Ejecutar Golpe Único (Single Stroke)
          </button>

          {/* Position Gauge */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-400">Ángulo de Excéntrico:</span>
              <span className="tech-font font-bold text-red-400">{crankDegText}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-red-600 to-amber-500 h-full transition-all duration-75"
                style={{ width: `${crankPercent}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT TECHNICAL INSPECTION PANEL */}
      <aside id="inspector-panel" className="absolute right-5 top-20 z-20 w-96 bg-slate-950/90 backdrop-blur-md rounded-xl p-5 border border-slate-800 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest tech-font">Componente Seleccionado</span>
            <h2 className="text-lg font-bold text-slate-100 tech-font">{activePart.name}</h2>
          </div>
          <span className="text-[10px] font-mono bg-red-950 text-red-400 border border-red-800/80 px-2 py-0.5 rounded">
            {activePart.tag}
          </span>
        </div>

        {/* Action Button: Open Full Component Diagnostics Overlay */}
        <button
          onClick={() => {
            forgeAudio.init();
            forgeAudio.playUiClick();
            setIsDiagnosticsOpen(true);
          }}
          className="w-full py-2.5 px-3 rounded-lg bg-red-600/90 hover:bg-red-600 border border-red-500 text-white font-bold text-xs uppercase tracking-wider tech-font flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition hover:scale-[1.01]"
        >
          <i className="fa-solid fa-chart-pie" />
          <span>Ver Diagnóstico de Tolerancias &amp; Vibración</span>
        </button>

        {/* Live Diagnostics Card Preview */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 tech-font flex items-center gap-1.5">
              <i className="fa-solid fa-heart-pulse text-red-400" />
              Estado de Salud y Desgaste
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${activeDiagnostics.maintenanceStatusClass}`}>
              {activeDiagnostics.maintenanceStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 p-2 rounded border border-slate-850">
              <span className="text-slate-500 text-[10px] block">Vibración Live / Nom.</span>
              <span className="tech-font font-bold text-cyan-400">{activeDiagnostics.vibrationActual} mm/s</span>
              <span className="text-[10px] text-slate-500 block">Nom: {activeDiagnostics.vibrationNominal} mm/s</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-850">
              <span className="text-slate-500 text-[10px] block">Tolerancia Medida</span>
              <span className="tech-font font-bold text-emerald-400">{activeDiagnostics.toleranceActual}</span>
              <span className="text-[10px] text-slate-500 block">Nom: {activeDiagnostics.toleranceNominal}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-300 mb-1">Descripción de Ingeniería:</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{activePart.desc}</p>
        </div>

        <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-850 space-y-2">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wide border-b border-slate-800 pb-1.5">
            Parámetros Críticos de Operación
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Material / Acero:</span>
              <span className="font-semibold text-slate-300">{activePart.mat}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Masa Aprox.:</span>
              <span className="font-semibold text-slate-300">{activePart.weight}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Tolerancia Axial:</span>
              <span className="font-semibold text-slate-300">{activePart.tolerance}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Monitoreo:</span>
              <span className="font-semibold text-slate-300">{activePart.monitoring}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <i className="fa-solid fa-clipboard-check text-red-500" /> Puntos de Inspección en AAM:
          </h3>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            {activePart.checks.map((check, idx) => (
              <li key={idx}>{check}</li>
            ))}
          </ul>
        </div>

        <div className="pt-3 border-t border-slate-800">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Desglose de Sub-ensambles:</h3>
          <div className="space-y-1 text-xs">
            {Object.keys(FORGE_COMPONENTS).map(key => {
              const comp = FORGE_COMPONENTS[key];
              const isSelected = key === selectedKey;
              return (
                <div
                  key={key}
                  onClick={() => handleSelectComponent(key)}
                  className={`p-2 rounded flex items-center justify-between cursor-pointer border transition ${
                    isSelected
                      ? 'bg-red-950/60 border-red-600 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-cube text-[10px] text-red-400" /> {comp.name.split('(')[0]}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">{comp.tag}</span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* COMPONENT DIAGNOSTICS OVERLAY MODAL */}
      {isDiagnosticsOpen && (
        <ComponentDiagnosticsModal
          componentKey={selectedKey}
          componentName={activePart.name}
          componentTag={activePart.tag}
          data={activeDiagnostics}
          onClose={() => setIsDiagnosticsOpen(false)}
          onNavigateComponent={(key) => handleSelectComponent(key, true)}
          allComponents={FORGE_COMPONENTS}
        />
      )}

      {/* BOTTOM WORKFLOW BAR (Hot Forging Stage Navigator) */}
      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-slate-950/90 backdrop-blur-md px-6 py-2.5 rounded-full border border-slate-800 shadow-2xl">
        <span className="text-xs font-bold tech-font text-red-500 uppercase tracking-widest mr-2">Flujo de Celda AAM:</span>

        <button
          onClick={() => handleSetCellStage('induction')}
          className={`stage-btn px-3.5 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition ${
            activeCellStage === 'induction'
              ? 'bg-red-950 text-red-300 border-red-600/70 shadow-md shadow-red-900/30'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" /> 1. Inducción (1200°C)
        </button>

        <i className="fa-solid fa-chevron-right text-[10px] text-slate-600" />

        <button
          onClick={() => handleSetCellStage('forging')}
          className={`stage-btn px-3.5 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition ${
            activeCellStage === 'forging'
              ? 'bg-red-950 text-red-300 border-red-600/70 shadow-md shadow-red-900/30'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500" /> 2. Forja Mecánica 4000T
        </button>

        <i className="fa-solid fa-chevron-right text-[10px] text-slate-600" />

        <button
          onClick={() => handleSetCellStage('trimming')}
          className={`stage-btn px-3.5 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition ${
            activeCellStage === 'trimming'
              ? 'bg-red-950 text-red-300 border-red-600/70 shadow-md shadow-red-900/30'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" /> 3. Recorte de Rebaba (Trim)
        </button>

        <i className="fa-solid fa-chevron-right text-[10px] text-slate-600" />

        <button
          onClick={() => handleSetCellStage('coining')}
          className={`stage-btn px-3.5 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition ${
            activeCellStage === 'coining'
              ? 'bg-red-950 text-red-300 border-red-600/70 shadow-md shadow-red-900/30'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> 4. Calibrado y Enfriamiento
        </button>
      </footer>
    </div>
  );
}

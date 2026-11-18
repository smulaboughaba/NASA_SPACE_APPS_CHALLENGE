import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  Activity,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Columns2,
  Crosshair,
  Eye,
  Film,
  Info,
  MapPin,
  Minus,
  MoveHorizontal,
  Plus,
  Radio,
  RotateCcw,
  Sigma,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import AnimatedStarfield from './AnimatedStarfield';
import { GIBS_LAYERS, getGibsLayer, getDatasetDailyDates, fetchGibsFrame } from '../utils/gibsLayers';
import {
  computeInstantImpactSummary,
  computeSpatialDetectiveMaps,
  getTemporalObservationStatus,
} from '../utils/sarMath';

const PLANE_SIZE = 12;
const BASE_RELIEF = 2.05;
const DEFAULT_TERRAIN_CAM = new THREE.Vector3(8.8, 7.6, 10.0);

const SCENARIO_GEO_LAYERS = {
  'los-angeles': {
    pois: [
      { name: 'Pacific Palisades', lat: 34.048, lon: -118.526 },
      { name: 'Topanga Canyon', lat: 34.091, lon: -118.603 },
      { name: 'Malibú', lat: 34.036, lon: -118.685 },
      { name: 'Mandeville', lat: 34.088, lon: -118.502 },
      { name: 'Skull Rock', lat: 34.095, lon: -118.56 },
    ],
    studyBox: [34.032, -118.685, 34.129, -118.502],
  },
  earthquake: {
    pois: [
      { name: 'Petropavlovsk', lat: 53.025, lon: 158.65 },
      { name: 'Bahía de Avacha', lat: 52.89, lon: 158.58 },
      { name: 'Cabo Shipunsky', lat: 53.105, lon: 159.985 },
      { name: 'Foco InSAR (+170 cm)', lat: 53.26, lon: 159.986 },
      { name: 'Costa Pacífica', lat: 52.62, lon: 159.75 },
    ],
    studyBox: [52.54, 158.42, 53.39, 160.22],
  },
  malaga: {
    pois: [
      { name: 'Cártama', lat: 36.712, lon: -4.585 },
      { name: 'Campanillas', lat: 36.725, lon: -4.535 },
      { name: 'Alhaurín de la Torre', lat: 36.663, lon: -4.56 },
      { name: 'Aeropuerto AGP', lat: 36.675, lon: -4.499 },
      { name: 'Desembocadura', lat: 36.668, lon: -4.455 },
    ],
    studyBox: [36.648, -4.53, 36.722, -4.415],
  },
};

function getGeoConfig(dataset) {
  if (dataset?.is_live) {
    const bbox = dataset?.bbox || [-1, -1, 1, 1];
    const cLat = (bbox[1] + bbox[3]) * 0.5;
    const cLon = (bbox[0] + bbox[2]) * 0.5;
    return {
      pois: [{ name: dataset?.nombre || 'Centro regional', lat: cLat, lon: cLon }],
      studyBox: null,
    };
  }
  const id = dataset?.id || '';
  if (id.includes('los-angeles')) return SCENARIO_GEO_LAYERS['los-angeles'];
  if (id.includes('earthquake')) return SCENARIO_GEO_LAYERS.earthquake;
  return SCENARIO_GEO_LAYERS.malaga;
}

function createFallbackTexture(r = 38, g = 52, b = 66) {
  const tex = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function computeVertexZ(dataset, _phenomenonMode, exaggeration, idx) {
  const clamped = Math.min(4, Math.max(1, Number(exaggeration) || 2));
  const elevScale = 0.7 + ((clamped - 1) / 3) * 1.3;
  const rawNorm = dataset?.base_elevation?.[idx] || 0;
  if (dataset?.is_live && Array.isArray(dataset?.bbox) && Array.isArray(dataset?.elev_range_m)) {
    const [lon0, lat0, lon1, lat1] = dataset.bbox;
    const midLat = (lat0 + lat1) * 0.5;
    const spanKm = Math.max(8, Math.abs(lon1 - lon0) * 111.32 * Math.cos((midLat * Math.PI) / 180));
    const reliefKm = Math.max(0.04, (dataset.elev_range_m[1] - dataset.elev_range_m[0]) / 1000);
    // Escala fisica realista (relieve/ancho * PLANE_SIZE) con un minimo legible para llanuras costeras
    const physicalRelief = Math.max(0.32, Math.min(BASE_RELIEF, (reliefKm / spanKm) * PLANE_SIZE * 2.4));
    return rawNorm * physicalRelief * elevScale;
  }
  return rawNorm * BASE_RELIEF * elevScale;
}

function latLonToTerrainWorld(dataset, grid, exaggeration, phenomenonMode, buffers, lat, lon, yOffset = 0) {
  const bbox = dataset?.bbox || [-1, -1, 1, 1];
  const [lonMin, latMin, lonMax, latMax] = bbox;
  const colFrac = Math.max(0, Math.min(1, (lon - lonMin) / Math.max(1e-6, lonMax - lonMin)));
  const rowFrac = Math.max(0, Math.min(1, (latMax - lat) / Math.max(1e-6, latMax - latMin)));
  const row = Math.round(rowFrac * (grid - 1));
  const col = Math.round(colFrac * (grid - 1));
  const idx = row * grid + col;
  const defVal = buffers?.deformacion?.[idx] ?? 0;
  const zVal = computeVertexZ(dataset, phenomenonMode, exaggeration, idx, defVal) + yOffset;
  const wx = -PLANE_SIZE / 2 + colFrac * PLANE_SIZE;
  const wz = -(PLANE_SIZE / 2 - rowFrac * PLANE_SIZE);
  return [wx, zVal, wz];
}

const TERRAIN_VERTEX_SHADER = /* glsl */ `
  // Empaquetado en 3 vec4 para respetar el limite de 16 atributos de Mesa/WebGL
  attribute vec4 aState0; // x: def, y: conf, z: colorVal, w: front
  attribute vec4 aState1; // x: accum, y: defPre, z: colorPre, w: elev
  attribute vec4 aSurf;   // x: slope, y: pValue, z: driverNorm, w: cover

  uniform int uPhenomenonMode;
  uniform float uExaggeration;
  uniform float uCompareMode;
  uniform float uSplitX;
  uniform float uTime;

  varying vec2 vUv;
  varying float vDef;
  varying float vDefPre;
  varying float vConf;
  varying float vColorVal;
  varying float vColorPre;
  varying float vElev;
  varying float vFront;
  varying float vAccum;
  varying float vCover;
  varying float vSlope;
  varying float vPValue;
  varying float vDriverNorm;
  varying vec3 vNormalW;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vDef = aState0.x;
    vConf = aState0.y;
    vColorVal = aState0.z;
    vFront = aState0.w;

    vAccum = aState1.x;
    vDefPre = aState1.y;
    vColorPre = aState1.z;
    vElev = aState1.w;

    vSlope = aSurf.x;
    vPValue = aSurf.y;
    vDriverNorm = aSurf.z;
    vCover = aSurf.w;

    // Topografía 3D real firme (MDE sin efecto goma): los cambios se proyectan en textura y análisis físico
    vec3 displaced = position;

    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vWorldPos = worldPosition.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const TERRAIN_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uBaseTex;
  uniform sampler2D uOptTexA;
  uniform sampler2D uOptTexB;
  uniform float uTexMix;
  uniform float uHasBaseTex;
  uniform float uHasOptTex;
  uniform int uRenderMode; // 0 = hybrid 3D + SAR, 1 = optical HD, 2 = cross driver, 3 = significance p < 0.05
  uniform float uCompareMode;
  uniform float uSplitX;
  uniform int uPhenomenonMode; // 0 = fire/thermal, 1 = earthquake, 2 = flood
  uniform float uIsLive;
  uniform float uShowFringes;
  uniform float uTime;
  uniform sampler2D uGibsA;
  uniform sampler2D uGibsB;
  uniform sampler2D uGibsPre;
  uniform float uGibsMix;
  uniform float uHasGibs;
  uniform float uGibsOverlay;
  uniform float uGibsOpacity;

  varying vec2 vUv;
  varying float vDef;
  varying float vDefPre;
  varying float vConf;
  varying float vColorVal;
  varying float vColorPre;
  varying float vElev;
  varying float vFront;
  varying float vAccum;
  varying float vCover;
  varying float vSlope;
  varying float vPValue;
  varying float vDriverNorm;
  varying vec3 vNormalW;
  varying vec3 vWorldPos;

  vec3 composeFireLayer(vec3 satCol, float intensity, float frontVal, float accumVal, float conf, float isSea, float isHybrid) {
    if (isSea > 0.5) return satCol;
    float sig = clamp(max(intensity, accumVal * 0.88) * mix(0.72, 1.12, conf), 0.0, 1.0);
    float activeFront = clamp(frontVal * 3.1, 0.0, 1.0);
    if (sig < 0.03 && activeFront < 0.04) return satCol;

    // En modo Híbrido conservamos todo el micro-detalle de la ortofoto ya carbonizada y reforzamos el contraste SAR exacto
    vec3 charredTarget = mix(satCol * 0.34, vec3(0.06, 0.05, 0.05), 0.58);
    float charStrength = isHybrid > 0.5 ? smoothstep(0.06, 0.60, sig) * 0.55 : smoothstep(0.04, 0.55, sig) * 0.90;
    vec3 outCol = mix(satCol, charredTarget, charStrength);

    // Frente térmico incandescente vivo sincronizado con el avance real de T en cada fotograma
    float pulse = 0.84 + 0.16 * sin(uTime * 5.2 + vUv.x * 46.0 + vUv.y * 42.0);
    vec3 flameEdge = mix(vec3(0.98, 0.32, 0.04), vec3(1.0, 0.78, 0.18), clamp(activeFront * pulse, 0.0, 1.0));
    float borderMask = smoothstep(0.06, 0.22, sig) * (1.0 - smoothstep(0.28, 0.58, sig));
    float frontMix = max(activeFront * 0.85, borderMask * (isHybrid > 0.5 ? 0.38 : 0.55));
    outCol = mix(outCol, flameEdge, clamp(frontMix, 0.0, 0.88));
    return outCol;
  }

  vec3 composeLiveThermalLayer(vec3 satCol, float intensity, float isSea) {
    if (isSea > 0.5) return satCol;
    float sig = clamp(intensity, 0.0, 1.0);
    if (sig < 0.04) return satCol;
    vec3 warmMid = vec3(0.96, 0.62, 0.14);
    vec3 warmHot = vec3(0.90, 0.22, 0.28);
    vec3 tint = mix(warmMid, warmHot, smoothstep(0.25, 0.90, sig));
    float alpha = smoothstep(0.04, 0.85, sig) * 0.42;
    return mix(satCol, tint, alpha);
  }

  vec3 composeEarthquakeLayer(vec3 satCol, float def, float frontVal, float conf, float isSea, float isHybrid) {
    if (isSea > 0.5) return satCol;
    float mag = clamp(abs(def) * mix(0.70, 1.25, conf), 0.0, 1.0);
    float rupture = clamp(abs(frontVal) * 2.5, 0.0, 1.0);
    if (mag < 0.025 && rupture < 0.04) return satCol;

    vec3 subside = vec3(0.05, 0.52, 0.92);
    vec3 uplift = vec3(0.98, 0.44, 0.08);
    vec3 tint = def >= 0.0 ? uplift : subside;

    float tintAlpha = isHybrid > 0.5 ? clamp(mag * 0.28, 0.0, 0.34) : clamp(mag * 0.62, 0.0, 0.68);
    vec3 overlay = mix(satCol, tint, tintAlpha);
    if (uShowFringes > 0.5 && abs(def) > 0.035) {
      float phase = abs(def) * 20.0 - uTime * 0.45 * step(0.05, rupture);
      float fringe = 0.5 + 0.5 * cos(phase * 3.14159265);
      vec3 cycleCol = vec3(
        0.5 + 0.5 * sin(phase),
        0.5 + 0.5 * sin(phase + 2.094),
        0.5 + 0.5 * sin(phase + 4.188)
      );
      overlay = mix(overlay, cycleCol, (isHybrid > 0.5 ? 0.28 : 0.40) * smoothstep(0.04, 0.35, abs(def)));
      overlay = mix(overlay, vec3(0.98, 0.99, 1.0), pow(fringe, 6.0) * (0.14 * mag + 0.24 * rupture));
    }
    overlay += vec3(1.0, 0.86, 0.55) * rupture * 0.20;
    return overlay;
  }

  vec3 composeFloodLayer(vec3 satCol, float waterSignal, float frontVal, float accumVal, float conf, float isSea, float isHybrid) {
    if (isSea > 0.5) {
      return satCol;
    }
    float sig = clamp(waterSignal * mix(0.70, 1.15, conf), 0.0, 1.0);
    float retreatedMud = clamp((accumVal - waterSignal) * 1.4, 0.0, 1.0);

    vec3 outCol = satCol;
    if (retreatedMud > 0.08 && sig < 0.18 && isHybrid < 0.5) {
      vec3 wetMud = mix(satCol * 0.46, vec3(0.14, 0.18, 0.15), 0.62);
      outCol = mix(outCol, wetMud, smoothstep(0.08, 0.48, retreatedMud));
    }
    if (sig < 0.05) return outCol;

    float ripple = 0.5 + 0.5 * sin(vUv.x * 135.0 + uTime * 2.8) * cos(vUv.y * 135.0 - uTime * 2.3);
    vec3 shallow = vec3(0.05, 0.46, 0.66);
    vec3 deepFlood = vec3(0.03, 0.72, 0.92);
    vec3 waterCol = mix(shallow, deepFlood, smoothstep(0.18, 0.85, sig));
    waterCol += vec3(0.16, 0.38, 0.52) * ripple * 0.22;

    float frontCrest = clamp(frontVal * 3.2, 0.0, 1.0);
    waterCol = mix(waterCol, vec3(0.55, 0.94, 1.0), frontCrest * 0.48);
    float waterAlpha = isHybrid > 0.5 ? clamp(0.18 + sig * 0.36, 0.0, 0.54) : clamp(0.45 + sig * 0.45, 0.0, 0.90);
    return mix(outCol, waterCol, waterAlpha);
  }

  void main() {
    float isSea = vElev < 0.002 ? 1.0 : 0.0;
    float isLand = 1.0 - isSea;
    bool isPreSide = (uCompareMode > 0.5) && (vUv.x < uSplitX);

    float activeColor = isPreSide ? vColorPre : vColorVal;
    float activeDef = isPreSide ? vDefPre : vDef;
    float activeFront = isPreSide ? 0.0 : vFront;
    float activeAccum = isPreSide ? vColorPre : vAccum;

    // Coordenadas fotogramétricas fieles al ortomosaico para conservar nitidez sin distorsión geométrica
    vec2 warpedUv = vUv;

    vec3 baseOrtho = uHasBaseTex > 0.5 ? texture2D(uBaseTex, vUv).rgb : vec3(0.12, 0.16, 0.20);
    vec3 interpOpt = baseOrtho;
    if (!isPreSide && uHasOptTex > 0.5) {
      vec3 optA = texture2D(uOptTexA, warpedUv).rgb;
      vec3 optB = texture2D(uOptTexB, warpedUv).rgb;
      interpOpt = mix(optA, optB, clamp(uTexMix, 0.0, 1.0));
    }

    // Perturbación micro-topográfica suave solo en modos ortofoto/simulación (no en capas GIBS para evitar efecto grabado)
    vec3 N = normalize(vNormalW);
    if (uHasBaseTex > 0.5 && isLand > 0.5 && uRenderMode != 4) {
      float tx = 1.0 / 1024.0;
      float lC = dot(texture2D(uBaseTex, warpedUv).rgb, vec3(0.299, 0.587, 0.114));
      float lX = dot(texture2D(uBaseTex, min(warpedUv + vec2(tx, 0.0), vec2(0.999))).rgb, vec3(0.299, 0.587, 0.114));
      float lZ = dot(texture2D(uBaseTex, min(warpedUv + vec2(0.0, tx), vec2(0.999))).rgb, vec3(0.299, 0.587, 0.114));
      N = normalize(N + vec3((lC - lX) * 0.14, 0.0, (lC - lZ) * 0.14));
    }

    vec3 L = normalize(vec3(0.58, 0.78, 0.42));
    vec3 V = normalize(cameraPosition - vWorldPos);
    float diff = max(dot(N, L), 0.0);
    float skyFill = 0.5 + 0.5 * N.y;
    float light = 0.24 + 0.84 * diff + 0.14 * skyFill;

    vec3 H = normalize(L + V);
    float floodWaterSpec = (uPhenomenonMode == 2 && !isPreSide) ? smoothstep(0.20, 0.75, activeColor) * isLand * 0.45 : 0.0;
    float spec = pow(max(dot(N, H), 0.0), 46.0) * (isSea * 0.34 + floodWaterSpec);

    vec3 surfaceCol;
    if (uRenderMode == 4) {
      // Capa real GIBS del día: relieve natural por normales DEM + opacidad calibrada en capas gruesas
      vec4 g = isPreSide ? texture2D(uGibsPre, vUv) : mix(texture2D(uGibsA, vUv), texture2D(uGibsB, vUv), clamp(uGibsMix, 0.0, 1.0));
      if (uHasGibs < 0.5) {
        surfaceCol = baseOrtho;
        light = 0.68 + 0.36 * diff;
      } else if (uGibsOverlay > 0.5) {
        float cov = smoothstep(0.02, 0.25, g.a);
        float alpha = cov * clamp(uGibsOpacity, 0.25, 0.85);
        surfaceCol = mix(baseOrtho, g.rgb, alpha);
        light = 0.62 + 0.44 * diff;
      } else {
        float stepUv = 1.0 / 1024.0;
        float baseLum = dot(baseOrtho, vec3(0.299, 0.587, 0.114));
        float b1 = dot(texture2D(uBaseTex, min(vUv + vec2(stepUv, 0.0), vec2(0.999))).rgb, vec3(0.299, 0.587, 0.114));
        float b2 = dot(texture2D(uBaseTex, max(vUv - vec2(stepUv, 0.0), vec2(0.001))).rgb, vec3(0.299, 0.587, 0.114));
        float b3 = dot(texture2D(uBaseTex, min(vUv + vec2(0.0, stepUv), vec2(0.999))).rgb, vec3(0.299, 0.587, 0.114));
        float b4 = dot(texture2D(uBaseTex, max(vUv - vec2(0.0, stepUv), vec2(0.001))).rgb, vec3(0.299, 0.587, 0.114));
        float subtleDetail = baseLum - 0.25 * (b1 + b2 + b3 + b4);
        float gLum = dot(g.rgb, vec3(0.299, 0.587, 0.114));
        float cloudFree = (1.0 - smoothstep(0.48, 0.72, gLum)) * uHasBaseTex;
        surfaceCol = clamp(g.rgb + vec3(subtleDetail * 0.15 * cloudFree), 0.0, 1.0);
        light = 0.68 + 0.38 * diff;
      }
      float l2 = dot(surfaceCol, vec3(0.299, 0.587, 0.114));
      surfaceCol = clamp(mix(vec3(l2), surfaceCol, 1.08), 0.0, 1.0);
      spec = 0.0;
    } else if (isPreSide || uRenderMode == 1) {
      // Lado "Antes" en comparador o modo "Satelital HD (T)": ortofoto multi-temporal pura
      surfaceCol = isPreSide ? baseOrtho : interpOpt;
    } else if (uRenderMode == 2) {
      // Modo "Variable Cruzada": gradiente térmico/hídrico/esfuerzo + isolíneas sobre ortofoto
      if (isSea > 0.5) {
        surfaceCol = baseOrtho;
      } else {
        float d = clamp(vDriverNorm, 0.0, 1.0);
        vec3 cLow = vec3(0.08, 0.52, 0.72);
        vec3 cMid = vec3(0.95, 0.68, 0.16);
        vec3 cHigh = vec3(0.92, 0.18, 0.24);
        vec3 heat = d < 0.5 ? mix(cLow, cMid, d * 2.0) : mix(cMid, cHigh, (d - 0.5) * 2.0);
        float iso = smoothstep(0.06, 0.0, abs(fract(d * 7.0) - 0.5));
        float blendAmt = 0.28 + 0.52 * smoothstep(0.12, 0.95, d);
        surfaceCol = mix(baseOrtho, heat, blendAmt);
        surfaceCol = mix(surfaceCol, vec3(1.0, 0.96, 0.88), iso * 0.22);
      }
    } else if (uRenderMode == 3) {
      // Modo "Significancia (p < 0.05)": atenúa fondo no significativo y resalta tendencias reales
      float lum = dot(baseOrtho, vec3(0.299, 0.587, 0.114));
      vec3 mutedGray = vec3(lum * 0.72);
      if (isSea > 0.5 || vPValue >= 0.05) {
        surfaceCol = mutedGray;
      } else {
        vec3 sigCol = vSlope < 0.0 ? vec3(0.98, 0.36, 0.16) : vec3(0.10, 0.88, 0.72);
        float strength = vPValue < 0.01 ? 0.80 : 0.60;
        surfaceCol = mix(vec3(lum * 0.85), sigCol, strength);
      }
    } else {
      vec3 layerInput = interpOpt;
      if (uPhenomenonMode == 0) {
        surfaceCol = uIsLive > 0.5
          ? composeLiveThermalLayer(layerInput, activeColor, isSea)
          : composeFireLayer(layerInput, activeColor, activeFront, activeAccum, vConf, isSea, 1.0);
      } else if (uPhenomenonMode == 1) {
        surfaceCol = composeEarthquakeLayer(layerInput, activeDef, activeFront, vConf, isSea, 1.0);
      } else {
        surfaceCol = composeFloodLayer(layerInput, activeColor, activeFront, activeAccum, vConf, isSea, 1.0);
      }
    }

    vec3 finalCol = surfaceCol * light + vec3(0.75, 0.88, 1.0) * spec;

    if (uCompareMode > 0.5) {
      float distSplit = abs(vUv.x - uSplitX);
      if (distSplit < 0.0035) {
        finalCol = mix(finalCol, vec3(0.96, 0.97, 0.99), 0.94);
      }
    }

    gl_FragColor = vec4(finalCol, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function CameraRig({ storyModeActive, focusSubzone, zoomCommand, dataset, buffers, exaggeration }) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const animRef = useRef({ active: false, progress: 0, startPos: new THREE.Vector3(), startTarget: new THREE.Vector3(), endPos: new THREE.Vector3(), endTarget: new THREE.Vector3() });

  useEffect(() => {
    if (!focusSubzone?.nonce) return;
    const grid = dataset?.grid_size || 128;
    const id = dataset?.id || '';
    const phenomenonMode =
    id.includes('los-angeles') || id.includes('thermal')
      ? 0
      : id.includes('earthquake') || id.includes('seismic')
      ? 1
      : 2;
    let endTarget = new THREE.Vector3(0, 0.5, 0);
    let endPos = DEFAULT_TERRAIN_CAM.clone();

    if (focusSubzone.lat != null && focusSubzone.lon != null) {
      const [wx, wy, wz] = latLonToTerrainWorld(
        dataset,
        grid,
        exaggeration,
        phenomenonMode,
        buffers,
        focusSubzone.lat,
        focusSubzone.lon,
        0
      );
      endTarget = new THREE.Vector3(wx, wy, wz);
      const offset = focusSubzone.offset || [4.4, 4.2, 5.2];
      endPos = new THREE.Vector3(wx + offset[0], wy + offset[1], wz + offset[2]);
    }

    animRef.current = {
      active: true,
      progress: 0,
      startPos: camera.position.clone(),
      startTarget: controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3(),
      endPos,
      endTarget,
    };
  }, [focusSubzone, dataset, camera]);

  useEffect(() => {
    if (!zoomCommand?.nonce || !controlsRef.current) return;
    animRef.current.active = false;
    if (zoomCommand.type === 'reset') {
      camera.position.copy(DEFAULT_TERRAIN_CAM);
      controlsRef.current.target.set(0, 0.4, 0);
      controlsRef.current.update();
      return;
    }
    const offset = camera.position.clone().sub(controlsRef.current.target);
    const dist = offset.length();
    const nextDist =
      zoomCommand.type === 'in'
        ? Math.max(4.8, dist * 0.8)
        : Math.min(23, dist * 1.25);
    offset.normalize().multiplyScalar(nextDist);
    camera.position.copy(controlsRef.current.target).add(offset);
    controlsRef.current.update();
  }, [zoomCommand, camera]);

  useFrame((_, delta) => {
    if (animRef.current.active && controlsRef.current) {
      animRef.current.progress = Math.min(1, animRef.current.progress + delta * 1.45);
      const p = animRef.current.progress;
      const ease = 1 - Math.pow(1 - p, 3);
      camera.position.lerpVectors(animRef.current.startPos, animRef.current.endPos, ease);
      controlsRef.current.target.lerpVectors(animRef.current.startTarget, animRef.current.endTarget, ease);
      controlsRef.current.update();
      if (p >= 1) animRef.current.active = false;
    } else if (storyModeActive && controlsRef.current) {
      const angle = delta * 0.16;
      const x = camera.position.x;
      const z = camera.position.z;
      camera.position.x = x * Math.cos(angle) - z * Math.sin(angle);
      camera.position.z = x * Math.sin(angle) + z * Math.cos(angle);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.07}
      minDistance={4.8}
      maxDistance={23}
      maxPolarAngle={Math.PI * 0.47}
      onStart={() => {
        animRef.current.active = false;
      }}
    />
  );
}

function getWorldPositionAtVertex(grid, row, col, zVal) {
  const wx = -PLANE_SIZE / 2 + (col / (grid - 1)) * PLANE_SIZE;
  const wy = zVal;
  const wz = -(PLANE_SIZE / 2 - (row / (grid - 1)) * PLANE_SIZE);
  return [wx, wy, wz];
}

function StudyZoneBox3D({ dataset, grid, exaggeration, phenomenonMode, box }) {
  const [latMin, lonMin, latMax, lonMax] = box;

  const lineObj = useMemo(() => {
    const pts = [];
    const segs = 14;
    const sample = (la, lo) => {
      const [x, y, z] = latLonToTerrainWorld(dataset, grid, exaggeration, phenomenonMode, null, la, lo, 0.18);
      pts.push(new THREE.Vector3(x, y, z));
    };
    for (let i = 0; i < segs; i++) sample(latMax, lonMin + (i / segs) * (lonMax - lonMin));
    for (let i = 0; i < segs; i++) sample(latMax - (i / segs) * (latMax - latMin), lonMax);
    for (let i = 0; i < segs; i++) sample(latMin, lonMax - (i / segs) * (lonMax - lonMin));
    for (let i = 0; i < segs; i++) sample(latMin + (i / segs) * (latMax - latMin), lonMin);

    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineDashedMaterial({
      color: '#22d3ee',
      dashSize: 0.28,
      gapSize: 0.16,
      transparent: true,
      opacity: 0.92,
    });
    const loop = new THREE.LineLoop(geo, mat);
    loop.computeLineDistances();
    return loop;
  }, [dataset, grid, exaggeration, phenomenonMode, latMin, lonMin, latMax, lonMax]);

  useEffect(() => {
    return () => {
      lineObj.geometry.dispose();
      lineObj.material.dispose();
    };
  }, [lineObj]);

  const badgePos = useMemo(
    () =>
      latLonToTerrainWorld(
        dataset,
        grid,
        exaggeration,
        phenomenonMode,
        null,
        (latMin + latMax) / 2,
        (lonMin + lonMax) / 2,
        0.58
      ),
    [dataset, grid, exaggeration, phenomenonMode, latMin, lonMin, latMax, lonMax]
  );

  return (
    <group>
      <primitive object={lineObj} />
      <Html position={badgePos} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
        <div className="px-2.5 py-1 rounded-lg bg-zinc-950/90 border border-cyan-400/60 text-cyan-200 text-[10px] font-mono uppercase tracking-[0.1em] whitespace-nowrap shadow-xl">
          Zona de estudio
        </div>
      </Html>
    </group>
  );
}

function TerrainMeshSurface({
  dataset,
  buffers,
  renderMode,
  compareMode,
  splitX,
  exaggeration,
  selectedVertex,
  onSelectVertex,
  showLabels,
  showStudyBox,
  onFpsUpdate,
  isPlaying,
  gibsState,
}) {
  const meshRef = useRef();
  const sigRef = useRef('');
  const fpsAccRef = useRef({ frames: 0, elapsed: 0 });
  const { gl } = useThree();

  const grid = dataset.grid_size || 128;
  const id = dataset.id || '';
  const phenomenonMode =
    id.includes('los-angeles') || id.includes('thermal')
      ? 0
      : id.includes('earthquake') || id.includes('seismic')
      ? 1
      : 2;
  const renderModeInt =
    renderMode === 'optical'
      ? 1
      : renderMode === 'driver'
      ? 2
      : renderMode === 'significance'
      ? 3
      : renderMode === 'gibs'
      ? 4
      : 0;
  const geoConfig = useMemo(() => getGeoConfig(dataset), [dataset]);
  const detectiveMaps = useMemo(() => computeSpatialDetectiveMaps(dataset), [dataset]);

  const fallbackTex = useMemo(() => createFallbackTexture(38, 52, 66), []);
  useEffect(() => () => fallbackTex.dispose(), [fallbackTex]);

  const texturesRef = useRef({ baseTexture: null, opticalTextures: [] });
  const exaggerationRef = useRef(exaggeration);
  exaggerationRef.current = exaggeration;

  const uniformsRef = useRef(null);
  if (!uniformsRef.current) {
    uniformsRef.current = {
      uBaseTex: { value: fallbackTex },
      uOptTexA: { value: fallbackTex },
      uOptTexB: { value: fallbackTex },
      uTexMix: { value: 0.0 },
      uHasBaseTex: { value: 0.0 },
      uHasOptTex: { value: 0.0 },
      uRenderMode: { value: renderModeInt },
      uCompareMode: { value: 0.0 },
      uSplitX: { value: 0.5 },
      uPhenomenonMode: { value: phenomenonMode },
      uIsLive: { value: dataset?.is_live ? 1.0 : 0.0 },
      uExaggeration: { value: exaggeration },
      uShowFringes: { value: phenomenonMode === 1 ? 1.0 : 0.0 },
      uTime: { value: 0.0 },
      uGibsA: { value: fallbackTex },
      uGibsB: { value: fallbackTex },
      uGibsPre: { value: fallbackTex },
      uGibsMix: { value: 0.0 },
      uHasGibs: { value: 0.0 },
      uGibsOverlay: { value: 0.0 },
      uGibsOpacity: { value: 0.50 },
    };
  }

  // Carga segura compatible con StrictMode de las ortofotos HD (1536px / 1024px)
  useEffect(() => {
    fallbackTex.needsUpdate = true;
    const loader = new THREE.TextureLoader();
    const maxAniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
    let disposed = false;

    const resolveTexUrl = (p) =>
      p.startsWith('/') || p.startsWith('http') || p.startsWith('data:') || p.startsWith('blob:') ? p : `/data/${p}`;
    const loadedToDispose = [];
    const baseTex = dataset.base_texture
      ? loader.load(resolveTexUrl(dataset.base_texture), () => {
          if (!disposed) sigRef.current = '';
        })
      : fallbackTex;
    if (baseTex !== fallbackTex) {
      baseTex.colorSpace = THREE.SRGBColorSpace;
      baseTex.anisotropy = maxAniso;
      baseTex.minFilter = THREE.LinearMipmapLinearFilter;
      baseTex.magFilter = THREE.LinearFilter;
      loadedToDispose.push(baseTex);
    }

    const optList = (dataset.timeline || []).map((step) => {
      if (!step?.textura_optica) return baseTex;
      const tex = loader.load(resolveTexUrl(step.textura_optica), () => {
        if (!disposed) sigRef.current = '';
      });
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      loadedToDispose.push(tex);
      return tex;
    });

    texturesRef.current = { baseTexture: baseTex, opticalTextures: optList };
    sigRef.current = '';

    return () => {
      disposed = true;
      uniformsRef.current.uBaseTex.value = fallbackTex;
      uniformsRef.current.uOptTexA.value = fallbackTex;
      uniformsRef.current.uOptTexB.value = fallbackTex;
      loadedToDispose.forEach((t) => t.dispose());
    };
  }, [dataset, gl, fallbackTex]);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE, grid - 1, grid - 1);
    const total = grid * grid;
    const preFrame = dataset.timeline?.[0] || {};
    const preDef = preFrame.deformacion_z || [];
    const preCol = preFrame.intensidad_color || [];

    const aState0 = new Float32Array(total * 4);
    const aState1 = new Float32Array(total * 4);
    const aSurf = new Float32Array(total * 4);
    const slopes = detectiveMaps?.slopeMap;
    const pVals = detectiveMaps?.pValueMap;
    const drvNorms = detectiveMaps?.driverNormMap;

    const posAttr = geo.attributes.position;
    const initExag = exaggerationRef.current;
    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        const i = r * grid + c;
        const i4 = i * 4;
        const def0 = preDef[i] ?? 0;
        const col0 = preCol[i] ?? 0;
        const eCenter = dataset.base_elevation?.[i] ?? 0;

        aState0[i4] = def0;
        aState0[i4 + 1] = 1.0;
        aState0[i4 + 2] = col0;
        aState0[i4 + 3] = 0.0;

        aState1[i4] = col0;
        aState1[i4 + 1] = def0;
        aState1[i4 + 2] = col0;
        aState1[i4 + 3] = eCenter;

        aSurf[i4] = slopes?.[i] ?? 0;
        aSurf[i4 + 1] = pVals?.[i] ?? 1;
        aSurf[i4 + 2] = drvNorms?.[i] ?? 0;
        aSurf[i4 + 3] = dataset.cobertura_superficial?.[i] ?? 0;

        if (i < posAttr.count) {
          posAttr.setZ(i, computeVertexZ(dataset, phenomenonMode, initExag, i, def0));
        }
      }
    }
    posAttr.needsUpdate = true;

    geo.setAttribute('aState0', new THREE.BufferAttribute(aState0, 4));
    geo.setAttribute('aState1', new THREE.BufferAttribute(aState1, 4));
    geo.setAttribute('aSurf', new THREE.BufferAttribute(aSurf, 4));
    geo.computeVertexNormals();
    return geo;
  }, [dataset, grid, phenomenonMode, detectiveMaps]);

  useEffect(() => {
    sigRef.current = '';
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((_, delta) => {
    if (isPlaying) {
      uniformsRef.current.uTime.value += Math.min(0.05, delta);
    }

    if (onFpsUpdate) {
      fpsAccRef.current.frames += 1;
      fpsAccRef.current.elapsed += delta;
      if (fpsAccRef.current.elapsed >= 0.45) {
        const currentFps = Math.round(fpsAccRef.current.frames / Math.max(0.05, fpsAccRef.current.elapsed));
        fpsAccRef.current.frames = 0;
        fpsAccRef.current.elapsed = 0;
        onFpsUpdate(Math.min(120, Math.max(1, currentFps)));
      }
    }

    {
      const u = uniformsRef.current;
      const g = gibsState || {};
      u.uGibsA.value = g.texA || fallbackTex;
      u.uGibsB.value = g.texB || g.texA || fallbackTex;
      u.uGibsPre.value = g.texPre || g.texA || fallbackTex;
      u.uGibsMix.value = Number.isFinite(g.mix) ? g.mix : 0;
      u.uHasGibs.value = g.texA ? 1.0 : 0.0;
      u.uGibsOverlay.value = g.overlay ? 1.0 : 0.0;
      u.uGibsOpacity.value = Number.isFinite(g.opacity) ? g.opacity : 0.50;
      u.uRenderMode.value = renderModeInt;
    }

    if (!buffers || !geometry) return;
    const uIdx1 = Number.isFinite(buffers.i1) ? buffers.i1 : 0;
    const uIdx2 = Number.isFinite(buffers.i2) ? buffers.i2 : 0;
    const uMix = Number.isFinite(buffers.u) ? buffers.u : 0;
    const safeSplit = Number.isFinite(splitX) ? splitX : 0.5;
    const sig = `${dataset.id}_${uIdx1}_${uIdx2}_${uMix.toFixed(4)}_${exaggeration}_${renderModeInt}_${compareMode}_${safeSplit.toFixed(3)}`;
    if (sigRef.current === sig) return;
    sigRef.current = sig;

    const posAttr = geometry.attributes.position;
    const state0Attr = geometry.attributes.aState0;
    const state1Attr = geometry.attributes.aState1;
    const { deformacion, intensidad, confianza, frente, acumulado } = buffers;

    for (let i = 0; i < posAttr.count; i++) {
      const defVal = deformacion[i] ?? 0;
      posAttr.setZ(i, computeVertexZ(dataset, phenomenonMode, exaggeration, i, defVal));
      state0Attr.setXYZW(
        i,
        defVal,
        confianza[i] ?? 0.9,
        intensidad[i] ?? 0,
        frente?.[i] ?? 0
      );
      state1Attr.setX(i, acumulado?.[i] ?? 0);
    }

    posAttr.needsUpdate = true;
    state0Attr.needsUpdate = true;
    state1Attr.needsUpdate = true;
    geometry.computeVertexNormals();

    const { baseTexture, opticalTextures } = texturesRef.current;
    const safeBase = baseTexture || fallbackTex;
    const texA = opticalTextures[uIdx1] || opticalTextures[0] || safeBase;
    const texB = opticalTextures[uIdx2] || texA || safeBase;
    const uniforms = uniformsRef.current;

    uniforms.uBaseTex.value = safeBase;
    uniforms.uHasBaseTex.value = safeBase !== fallbackTex ? 1.0 : 0.0;
    uniforms.uOptTexA.value = texA;
    uniforms.uOptTexB.value = texB;
    uniforms.uTexMix.value = uMix;
    uniforms.uHasOptTex.value = texA !== fallbackTex || safeBase !== fallbackTex ? 1.0 : 0.0;
    uniforms.uRenderMode.value = renderModeInt;
    uniforms.uExaggeration.value = exaggeration;
    uniforms.uCompareMode.value = compareMode ? 1.0 : 0.0;
    uniforms.uSplitX.value = safeSplit;
    uniforms.uPhenomenonMode.value = phenomenonMode;
    uniforms.uIsLive.value = dataset?.is_live ? 1.0 : 0.0;
    uniforms.uShowFringes.value = phenomenonMode === 1 ? 1.0 : 0.0;
  });

  const markerPos = useMemo(() => {
    if (selectedVertex == null || !buffers) return null;
    const r = Math.floor(selectedVertex / grid);
    const c = selectedVertex % grid;
    const zVal = computeVertexZ(dataset, phenomenonMode, exaggeration, selectedVertex, buffers.deformacion?.[selectedVertex] || 0);
    return getWorldPositionAtVertex(grid, r, c, zVal);
  }, [selectedVertex, buffers, grid, exaggeration, phenomenonMode, dataset]);

  const poiPositions = useMemo(() => {
    if (!showLabels) return [];
    return geoConfig.pois.map((poi) => ({
      ...poi,
      pos: latLonToTerrainWorld(dataset, grid, exaggeration, phenomenonMode, buffers, poi.lat, poi.lon, 0.14),
    }));
  }, [showLabels, geoConfig, dataset, grid, exaggeration, phenomenonMode, buffers]);

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (e.face && typeof e.face.a === 'number') {
            onSelectVertex(e.face.a);
          }
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'crosshair';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <shaderMaterial
          vertexShader={TERRAIN_VERTEX_SHADER}
          fragmentShader={TERRAIN_FRAGMENT_SHADER}
          uniforms={uniformsRef.current}
        />
      </mesh>

      {/* Base arquitectónica discreta bajo la cota 0 m */}
      <mesh position={[0, -0.09, 0]}>
        <boxGeometry args={[PLANE_SIZE + 0.04, 0.16, PLANE_SIZE + 0.04]} />
        <meshStandardMaterial color="#09090b" metalness={0.25} roughness={0.82} />
      </mesh>

      {/* Etiquetas geográficas reales ancladas sobre el relieve 3D */}
      {poiPositions.map((poi) => (
        <group key={poi.name} position={poi.pos}>
          <mesh>
            <sphereGeometry args={[0.042, 12, 12]} />
            <meshBasicMaterial color="#f4f4f5" />
          </mesh>
          <Html distanceFactor={14} position={[0, 0.22, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[5, 0]}>
            <div className="px-2 py-0.5 rounded bg-zinc-950/85 border border-zinc-700/90 text-[10px] font-medium text-zinc-100 whitespace-nowrap shadow-md">
              {poi.name}
            </div>
          </Html>
        </group>
      ))}

      {/* Recuadro discontinuo "Zona de estudio" en Paso 3 */}
      {showStudyBox && geoConfig.studyBox && (
        <StudyZoneBox3D
          dataset={dataset}
          grid={grid}
          exaggeration={exaggeration}
          phenomenonMode={phenomenonMode}
          box={geoConfig.studyBox}
        />
      )}

      {/* Marcador limpio del vértice inspeccionado */}
      {markerPos && (
        <group position={markerPos}>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.84, 12]} />
            <meshBasicMaterial color="#e4e4e7" transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0.88, 0]}>
            <sphereGeometry args={[0.075, 20, 20]} />
            <meshStandardMaterial color="#f4f4f5" roughness={0.25} metalness={0.15} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
            <ringGeometry args={[0.13, 0.19, 32]} />
            <meshBasicMaterial color="#f4f4f5" transparent opacity={0.75} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function TerrainViewer3D({
  dataset,
  tFloat,
  renderMode = 'hybrid',
  setRenderMode,
  opticalMode,
  setOpticalMode,
  compareMode,
  setCompareMode,
  splitX,
  setSplitX,
  exaggeration,
  selectedVertex,
  onSelectVertex,
  storyModeActive,
  onBackToGlobe,
  buffers,
  activeStep,
  focusSubzone,
  isPlaying = false,
  gibsLayerId = 'truecolor',
  setGibsLayerId,
  dailyDates: propDailyDates,
  onGibsStatusesChange,
}) {
  const containerRef = useRef(null);
  const [draggingSplit, setDraggingSplit] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [zoomCommand, setZoomCommand] = useState({ type: '', nonce: 0 });
  const [fps, setFps] = useState(60);
  const [controlsOpen, setControlsOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [layerCardOpen, setLayerCardOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : false
  );

  // ===== Timelapse diario satelital real GIBS (cargado en el navegador) =====
  const gibsLayer = getGibsLayer(gibsLayerId);
  const dailyDates = useMemo(
    () => (Array.isArray(propDailyDates) && propDailyDates.length ? propDailyDates : getDatasetDailyDates(dataset, 36)),
    [propDailyDates, dataset]
  );
  const [gibsFrames, setGibsFrames] = useState([]); // [{ date, tex } | null]
  const [gibsInfo, setGibsInfo] = useState({ loaded: 0, empty: 0, total: 0, nativePx: 0 });
  const statusesCbRef = useRef(onGibsStatusesChange);
  statusesCbRef.current = onGibsStatusesChange;

  useEffect(() => {
    const bbox = dataset?.bbox;
    if (!Array.isArray(bbox) || bbox.length !== 4 || !dailyDates.length) {
      setGibsFrames([]);
      setGibsInfo({ loaded: 0, empty: 0, total: 0, nativePx: 0 });
      statusesCbRef.current?.([]);
      return undefined;
    }
    const ctrl = new AbortController();
    const created = [];
    const frames = new Array(dailyDates.length).fill(null);
    const statuses = new Array(dailyDates.length).fill('pending');
    setGibsFrames([...frames]);
    setGibsInfo({ loaded: 0, empty: 0, total: dailyDates.length, nativePx: 0 });
    statusesCbRef.current?.([...statuses]);

    let next = 0;
    let loaded = 0;
    let empty = 0;
    const worker = async () => {
      while (!ctrl.signal.aborted && next < dailyDates.length) {
        const idx = next++;
        const date = dailyDates[idx];
        const res = await fetchGibsFrame(gibsLayer, bbox, date, { outSize: 1024, signal: ctrl.signal });
        if (ctrl.signal.aborted) return;
        if (res?.canvas) {
          const tex = new THREE.CanvasTexture(res.canvas);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          created.push(tex);
          frames[idx] = { date, tex };
          statuses[idx] = 'loaded';
          loaded += 1;
          setGibsInfo((p) => ({ ...p, loaded, nativePx: res.nativePx }));
        } else {
          statuses[idx] = 'empty';
          empty += 1;
          setGibsInfo((p) => ({ ...p, empty }));
        }
        setGibsFrames([...frames]);
        statusesCbRef.current?.([...statuses]);
      }
    };
    Promise.all([worker(), worker(), worker(), worker()]);

    return () => {
      ctrl.abort();
      created.forEach((t) => t.dispose());
    };
  }, [dataset, dailyDates, gibsLayer]);

  // Sincroniza el timelapse diario con la línea temporal T (0..N-1)
  const gibsState = useMemo(() => {
    const n = gibsFrames.length;
    if (!n) return { texA: null, overlay: gibsLayer.overlay, date: '' };
    const steps = Math.max(1, (dataset?.timeline?.length || 1) - 1);
    const frac = Math.max(0, Math.min(1, (Number(tFloat) || 0) / steps));
    const pos = frac * (n - 1);
    const findLoaded = (start, dir) => {
      for (let k = start; k >= 0 && k < n; k += dir) if (gibsFrames[k]) return k;
      return -1;
    };
    let a = findLoaded(Math.floor(pos), -1);
    let b = findLoaded(Math.ceil(pos), 1);
    if (a < 0) a = b;
    if (b < 0) b = a;
    const first = findLoaded(0, 1);
    if (a < 0) return { texA: null, overlay: gibsLayer.overlay, date: dailyDates[Math.round(pos)] || '' };
    const mix = b > a ? Math.max(0, Math.min(1, (pos - a) / (b - a))) : 0;
    return {
      texA: gibsFrames[a].tex,
      texB: gibsFrames[b].tex,
      texPre: first >= 0 ? gibsFrames[first].tex : null,
      mix,
      overlay: gibsLayer.overlay,
      opacity: gibsLayer.overlayOpacity ?? (gibsLayer.maxLevel <= 6 ? 0.50 : 0.68),
      date: mix < 0.5 ? gibsFrames[a].date : gibsFrames[b].date,
      preDate: first >= 0 ? gibsFrames[first].date : '',
    };
  }, [gibsFrames, tFloat, dataset, gibsLayer, dailyDates]);

  const effectiveRenderMode = renderMode || (opticalMode ? 'optical' : 'hybrid');
  const selectRenderMode = (mode) => {
    if (typeof setRenderMode === 'function') {
      setRenderMode(mode);
    } else if (typeof setOpticalMode === 'function') {
      setOpticalMode(mode === 'optical');
    }
  };

  const status = useMemo(
    () => getTemporalObservationStatus(dataset?.timeline, tFloat, buffers?.confianza),
    [dataset?.timeline, tFloat, buffers?.confianza]
  );
  const impactSummary = useMemo(
    () => computeInstantImpactSummary(dataset, buffers, tFloat),
    [dataset, buffers, tFloat]
  );
  const preDate = dataset?.timeline?.[0]?.fecha || '';
  const safeSplit = Number.isFinite(splitX) ? Math.max(0.06, Math.min(0.94, splitX)) : 0.5;
  const showStudyBox = activeStep === 3;

  const updateSplitFromClientX = useRef(null);
  updateSplitFromClientX.current = (clientX) => {
    if (!containerRef.current || typeof setSplitX !== 'function') return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = (clientX - rect.left) / rect.width;
    setSplitX(Math.max(0.06, Math.min(0.94, pct)));
  };

  useEffect(() => {
    if (!draggingSplit) return;
    const onMove = (e) => updateSplitFromClientX.current?.(e.clientX);
    const onUp = () => setDraggingSplit(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [draggingSplit]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#050508] select-none">
      <Canvas
        camera={{ position: [DEFAULT_TERRAIN_CAM.x, DEFAULT_TERRAIN_CAM.y, DEFAULT_TERRAIN_CAM.z], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[10, 14, 8]} intensity={1.35} color="#f8fafc" />
        <AnimatedStarfield radius={55} count={3600} speed={0.85} />

        <React.Suspense fallback={null}>
          <TerrainMeshSurface
            dataset={dataset}
            buffers={buffers}
            renderMode={effectiveRenderMode}
            compareMode={compareMode}
            splitX={splitX}
            exaggeration={exaggeration}
            selectedVertex={selectedVertex}
            onSelectVertex={onSelectVertex}
            showLabels={showLabels}
            showStudyBox={showStudyBox}
            onFpsUpdate={setFps}
            isPlaying={isPlaying}
            gibsState={gibsState}
          />
        </React.Suspense>

        <CameraRig
          storyModeActive={storyModeActive}
          focusSubzone={focusSubzone}
          zoomCommand={zoomCommand}
          dataset={dataset}
          buffers={buffers}
          exaggeration={exaggeration}
        />
      </Canvas>

      {/* Cortinilla Interactiva Arrastrable Antes/Después (solo línea vertical sobre el canvas) */}
      {compareMode && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
          <div
            className="absolute top-0 bottom-0 -translate-x-1/2 pointer-events-auto cursor-ew-resize group"
            style={{ left: `${safeSplit * 100}%` }}
            onPointerDown={(e) => {
              e.stopPropagation();
              setDraggingSplit(true);
              updateSplitFromClientX.current?.(e.clientX);
            }}
          >
            <div className="w-[2px] h-full bg-white/85 shadow-[0_0_12px_rgba(255,255,255,0.45)] mx-auto" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-zinc-100 text-zinc-950 border-2 border-zinc-900 shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <MoveHorizontal className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Barra Superior Flotante Única (en flujo flex-col para cero solapamientos en móvil y escritorio) */}
      <div className="pointer-events-none absolute top-2.5 sm:top-4 left-2.5 right-2.5 sm:left-4 sm:right-4 z-20 flex flex-col gap-2">
        {/* Fila 1: Navegación + Título + Toggle plegable de menú */}
        <div className="flex items-center justify-between gap-2">
          <div className="pointer-events-auto flex items-center gap-2 min-w-0">
            <button
              onClick={onBackToGlobe}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-zinc-900/90 backdrop-blur-xl hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-xs font-medium text-zinc-100 transition-all shadow-xl shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-zinc-300" />
              <span className="hidden xs:inline sm:inline">Globo</span>
            </button>

            <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/80 rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 shadow-xl min-w-0 max-w-[175px] sm:max-w-[280px] md:max-w-md">
              <div className="text-[11px] sm:text-xs font-semibold text-zinc-100 leading-tight truncate">{dataset.titulo}</div>
              <div className="hidden md:block text-[11px] font-mono tabular-nums text-zinc-400 mt-0.5 truncate">
                {dataset.sensor} · DEM {dataset.elev_range_m?.[0] ?? 0}–{dataset.elev_range_m?.[1] ?? 0} m · Texturas HD
              </div>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
            {/* En escritorio cuando está expandido muestra el selector inline; botón plegable siempre accesible */}
            <button
              type="button"
              onClick={() => setControlsOpen((v) => !v)}
              aria-expanded={controlsOpen}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border backdrop-blur-xl text-xs transition-all shadow-xl ${
                controlsOpen
                  ? 'bg-zinc-800/95 border-cyan-400/50 text-cyan-200 font-medium'
                  : 'bg-zinc-900/90 border-zinc-700/80 text-zinc-200 hover:border-zinc-500 font-medium'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span className="truncate max-w-[115px] sm:max-w-none">
                {effectiveRenderMode === 'gibs' ? gibsLayer.short : effectiveRenderMode === 'hybrid' ? 'Simulación' : 'Var. Cruzada'}
              </span>
              {controlsOpen ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
            </button>
          </div>
        </div>

        {/* Panel Plegable de Modos, Toggles y 13 Capas Satelitales */}
        {controlsOpen && (
          <div className="pointer-events-auto flex flex-col gap-2 bg-zinc-950/85 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border border-white/10 md:border-0 rounded-2xl md:rounded-none p-2.5 md:p-0 shadow-2xl md:shadow-none max-h-[54dvh] md:max-h-none overflow-y-auto md:overflow-visible">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/80 p-1 rounded-xl flex flex-wrap items-center gap-1 shadow-xl w-full sm:w-auto">
                <button
                  onClick={() => selectRenderMode('gibs')}
                  title="Observación satelital real día a día (MODIS, VIIRS, GPM IMERG, SMAP, OMI, AIRS, OCO-2)"
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs transition-all ${
                    effectiveRenderMode === 'gibs' ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm' : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  Vista Satélite
                </button>
                <button
                  onClick={() => selectRenderMode('hybrid')}
                  title="Modelo físico 3D sobre el relieve (frente de fuego, lámina de inundación o deformación sísmica)"
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs transition-all ${
                    effectiveRenderMode === 'hybrid' ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm' : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <Film className="w-3.5 h-3.5 shrink-0" />
                  Simulación
                </button>
                <button
                  onClick={() => selectRenderMode('driver')}
                  title="Mapa espacial estimado de la variable secundaria (térmica, esfuerzo o lluvia)"
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs transition-all ${
                    effectiveRenderMode === 'driver' ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm' : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 shrink-0" />
                  <span className="sm:hidden">Cruzada</span>
                  <span className="hidden sm:inline">Variable Cruzada</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setShowLabels((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border backdrop-blur-xl text-[11px] sm:text-xs transition-all shadow-xl ${
                    showLabels
                      ? 'bg-zinc-800/95 border-zinc-500 text-zinc-100 font-medium'
                      : 'bg-zinc-900/90 border-zinc-700/80 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Etiquetas
                </button>

                <button
                  onClick={() => setCompareMode((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border backdrop-blur-xl text-[11px] sm:text-xs transition-all shadow-xl ${
                    compareMode
                      ? 'bg-zinc-100 border-zinc-100 text-zinc-950 font-semibold'
                      : 'bg-zinc-900/90 border-zinc-700/80 text-zinc-200 hover:border-zinc-500 hover:text-white font-medium'
                  }`}
                >
                  <Columns2 className="w-3.5 h-3.5" />
                  {compareMode ? 'Comparador' : 'Antes/Después'}
                </button>

                {effectiveRenderMode === 'gibs' && (
                  <button
                    type="button"
                    onClick={() => setLayerCardOpen((v) => !v)}
                    title="Mostrar u ocultar ficha de capa satelital"
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-xl border backdrop-blur-xl text-[11px] sm:text-xs transition-all shadow-xl ${
                      layerCardOpen
                        ? 'bg-cyan-400/15 border-cyan-400/50 text-cyan-200 font-medium'
                        : 'bg-zinc-900/90 border-zinc-700/80 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Leyenda</span>
                  </button>
                )}
              </div>
            </div>

            {/* Píldoras rápidas de las 13 capas satelitales reales GIBS */}
            {effectiveRenderMode === 'gibs' && (
              <div className="flex flex-wrap md:flex-nowrap items-center gap-1.5 md:overflow-x-auto bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/80 rounded-xl px-2 py-1.5 shadow-xl">
                {GIBS_LAYERS.map((l) => {
                  const active = gibsLayer.id === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setGibsLayerId?.(l.id)}
                      title={`${l.label} (${l.resolution})`}
                      className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all border ${
                        active
                          ? 'bg-cyan-400 text-zinc-950 border-cyan-300 font-semibold shadow-sm'
                          : 'bg-zinc-950/75 text-zinc-300 border-zinc-800 hover:border-zinc-600 hover:text-white'
                      }`}
                    >
                      {l.short}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Badges de Cortinilla Antes/Después en el flujo normal */}
        {compareMode && (
          <div className="flex items-center justify-between gap-2">
            <div className="bg-zinc-950/90 border border-zinc-700 rounded-lg px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-mono text-zinc-200 shadow-lg">
              Antes · {effectiveRenderMode === 'gibs' ? gibsState.preDate || preDate : preDate}
            </div>
            <div className="bg-zinc-950/90 border border-zinc-700 rounded-lg px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-mono text-zinc-100 shadow-lg">
              Después · {effectiveRenderMode === 'gibs' ? gibsState.date : status.interpolatedDate}
            </div>
          </div>
        )}

        {/* Ficha plegable de la capa satelital real activa */}
        {effectiveRenderMode === 'gibs' && layerCardOpen && (
          <div className="pointer-events-auto max-w-[330px] bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/80 rounded-xl px-3 py-2 shadow-xl space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-100 truncate">{gibsLayer.label}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-mono tabular-nums text-cyan-300">{gibsState.date || '—'}</span>
                <button
                  type="button"
                  onClick={() => setLayerCardOpen(false)}
                  aria-label="Cerrar leyenda de capa"
                  className="p-0.5 rounded text-zinc-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-zinc-300 leading-snug">{gibsLayer.description}</p>
            {gibsLayer.legend && (
              <div>
                <div
                  className={`h-2 rounded-full ${gibsLayer.legend.css ? '' : `bg-gradient-to-r ${gibsLayer.legend.grad}`}`}
                  style={gibsLayer.legend.css ? { background: gibsLayer.legend.css } : undefined}
                />
                <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5">
                  <span>{gibsLayer.legend.left}</span>
                  <span>{gibsLayer.legend.right}</span>
                </div>
              </div>
            )}
            <div className="text-[10px] font-mono text-zinc-400 flex flex-wrap gap-x-2">
              <span>Satélite WMTS · {gibsLayer.resolution}</span>
              <span>
                Días {gibsInfo.loaded}/{gibsInfo.total}
                {gibsInfo.empty > 0 ? ` · ${gibsInfo.empty} sin datos` : ''}
              </span>
              {gibsInfo.nativePx > 0 && <span>{gibsInfo.nativePx} px nativos</span>}
            </div>
            {gibsInfo.total > 0 && gibsInfo.loaded === 0 && gibsInfo.empty === gibsInfo.total && (
              <div className="text-[11px] text-amber-300">Sin datos de esta capa para estas fechas en la zona.</div>
            )}
          </div>
        )}
      </div>

      {/* Botones de zoom de cámara (+, -, Restablecer) */}
      <div className="absolute bottom-3 right-3 sm:right-4 z-20 flex flex-col gap-1.5">
        <button
          onClick={() => setZoomCommand((z) => ({ type: 'in', nonce: z.nonce + 1 }))}
          title="Acercar terreno"
          className="w-8 h-8 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 flex items-center justify-center shadow-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoomCommand((z) => ({ type: 'out', nonce: z.nonce + 1 }))}
          title="Alejar terreno"
          className="w-8 h-8 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 flex items-center justify-center shadow-lg transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoomCommand((z) => ({ type: 'reset', nonce: z.nonce + 1 }))}
          title="Vista general 3D"
          className="w-8 h-8 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 flex items-center justify-center shadow-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Telemetry HUD compacto sincronizado con TimelineControl inferior */}
      <div className="pointer-events-none absolute bottom-3 left-3 right-14 sm:left-4 sm:right-16 z-20 flex flex-wrap items-end justify-between gap-2">
        <div className="pointer-events-auto bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/80 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-xl flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-700 text-[10px] font-mono tabular-nums text-zinc-200">
            <Radio className="w-3 h-3 text-emerald-400" />
            {fps} FPS
          </span>
          <div className="text-[11px] font-mono tabular-nums text-zinc-200 flex flex-wrap items-center gap-2">
            <span className="text-zinc-300">{effectiveRenderMode === 'gibs' && gibsState.date ? gibsState.date : status.interpolatedDate}</span>
            {impactSummary && effectiveRenderMode !== 'gibs' && (
              <>
                <span className="text-zinc-600">·</span>
                <span className="text-emerald-300 font-semibold">
                  {impactSummary.transformedPct.toFixed(1)}% ({impactSummary.transformedKm2.toFixed(1)} km²)
                </span>
                <span className="hidden sm:inline text-zinc-600">·</span>
                <span className="hidden sm:inline text-cyan-300">{impactSummary.spatialShiftValue}</span>
              </>
            )}
          </div>
        </div>

        <div className="hidden xl:flex bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/80 rounded-xl px-3 py-1.5 text-[11px] text-zinc-300 items-center gap-1.5 shadow-lg">
          <Crosshair className="w-3.5 h-3.5 text-zinc-400" />
          Clic terreno = analizar tendencia · Arrastra = orbitar
        </div>
      </div>
    </div>
  );
}

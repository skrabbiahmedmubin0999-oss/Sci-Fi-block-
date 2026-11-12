/**
 * Sci-Fi Block Puzzle - Visual Presets Configuration
 * Authoritative styling mapping for the 3 visual presets, with ADVANCED SCI-FI
 * derived directly from Image 2 (public/assets/aistudio/file_000000003f008208a9fc8b8c2afaff5c_7608d90b.png).
 */

export const PRESET_IDS = {
  ADVANCED: 'advanced_sci_fi',
  ULTRA: 'ultra_sci_fi',
  NORMAL: 'normal_sci_fi'
};

export const PRESETS = Object.freeze({
  [PRESET_IDS.ADVANCED]: Object.freeze({
    id: PRESET_IDS.ADVANCED,
    name: 'Advanced Sci-Fi',
    referenceImage: '/assets/aistudio/file_000000003f008208a9fc8b8c2afaff5c_7608d90b.png',
    description: 'Industrial gunmetal chassis, orbital citadel backdrop, jade composite blocks & brushed steel jewel sockets.',
    background: {
      type: 'space_station',
      skyGradient: ['#040810', '#0a121c', '#0d1824'],
      showOrbitalStation: true,
      showPlanetaryLimb: true,
      stationColor: '#121f2d',
      atmosphereGlow: 'rgba(56, 189, 248, 0.12)'
    },
    chassis: {
      outerBorder: '#37475a',
      innerBorder: '#1c2836',
      panelBg: '#0f1722',
      cornerAccent: '#64748b',
      boltColor: '#94a3b8',
      sideIndicatorColor: '#f59e0b', // Amber status light bars from Image 2
      sideIndicatorGlow: 'rgba(245, 158, 11, 0.45)',
      trayAccentColor: '#06b6d4', // Cyan energy lines on tray
      trayAccentGlow: 'rgba(6, 182, 212, 0.4)'
    },
    grid: {
      wellColor: '#101722',
      cellBorder: '#1c2635',
      centerDotColor: '#253549',
      highlightColor: 'rgba(56, 189, 248, 0.25)'
    },
    blocks: {
      // Signature Jade Green beveled composite blocks from Image 2
      standard: {
        base: '#0f766e',
        light: '#14b8a6',
        dark: '#042f2e',
        border: '#0d9488',
        surfaceGradient: ['#14b8a6', '#0f766e', '#115e59']
      },
      // Brushed Titanium / Silver socket block for gems
      socket: {
        base: '#64748b',
        light: '#cbd5e1',
        dark: '#334155',
        border: '#475569',
        surfaceGradient: ['#94a3b8', '#64748b', '#475569'],
        recessBg: '#1e293b'
      }
    },
    gems: {
      blueDiamond: {
        primary: '#0284c7',
        highlight: '#7dd3fc',
        shadow: '#0369a1',
        glow: 'rgba(2, 132, 199, 0.5)'
      },
      redTriangle: {
        primary: '#dc2626',
        highlight: '#fca5a5',
        shadow: '#991b1b',
        glow: 'rgba(220, 38, 38, 0.5)'
      },
      purpleHexagon: {
        primary: '#9333ea',
        highlight: '#d8b4fe',
        shadow: '#6b21a8',
        glow: 'rgba(147, 51, 234, 0.5)'
      },
      amberOctagon: {
        primary: '#d97706',
        highlight: '#fde68a',
        shadow: '#92400e',
        glow: 'rgba(217, 119, 6, 0.5)'
      },
      greenEmerald: {
        primary: '#059669',
        highlight: '#6ee7b7',
        shadow: '#064e3b',
        glow: 'rgba(5, 150, 105, 0.5)'
      }
    },
    hud: {
      podBg: '#131d2a',
      podBorder: '#2e3f54',
      buttonBg: '#182433',
      buttonBorder: '#3b4f66',
      iconColor: '#cbd5e1',
      counterText: '#f8fafc'
    }
  }),

  [PRESET_IDS.ULTRA]: Object.freeze({
    id: PRESET_IDS.ULTRA,
    name: 'Ultra Sci-Fi',
    referenceImage: '/assets/aistudio/file_000000008ae08208974de6f42008c326_1c20dff9.png',
    description: 'Gold-trimmed matrix, vertical reactor columns, rich multi-colored jewel blocks & cosmic nebula.',
    background: {
      type: 'deep_nebula',
      skyGradient: ['#050814', '#0d1326', '#121a35'],
      showOrbitalStation: true,
      showPlanetaryLimb: true,
      stationColor: '#1a243d',
      atmosphereGlow: 'rgba(168, 85, 247, 0.18)'
    },
    chassis: {
      outerBorder: '#d97706',
      innerBorder: '#f59e0b',
      panelBg: '#0f172a',
      cornerAccent: '#fbbf24',
      boltColor: '#fde68a',
      sideIndicatorColor: '#f59e0b',
      sideIndicatorGlow: 'rgba(245, 158, 11, 0.6)',
      trayAccentColor: '#eab308',
      trayAccentGlow: 'rgba(234, 179, 8, 0.5)'
    },
    grid: {
      wellColor: '#0b1120',
      cellBorder: '#1e293b',
      centerDotColor: '#334155',
      highlightColor: 'rgba(245, 158, 11, 0.3)'
    },
    blocks: {
      standard: {
        base: '#0284c7',
        light: '#38bdf8',
        dark: '#0369a1',
        border: '#0ea5e9',
        surfaceGradient: ['#38bdf8', '#0284c7', '#0369a1']
      },
      socket: {
        base: '#d97706',
        light: '#fde68a',
        dark: '#78350f',
        border: '#f59e0b',
        surfaceGradient: ['#fcd34d', '#d97706', '#92400e'],
        recessBg: '#1e1b4b'
      }
    },
    gems: {
      blueDiamond: { primary: '#0ea5e9', highlight: '#bae6fd', shadow: '#0369a1', glow: 'rgba(14, 165, 233, 0.6)' },
      redTriangle: { primary: '#ef4444', highlight: '#fecaca', shadow: '#991b1b', glow: 'rgba(239, 68, 68, 0.6)' },
      purpleHexagon: { primary: '#a855f7', highlight: '#e9d5ff', shadow: '#6b21a8', glow: 'rgba(168, 85, 247, 0.6)' },
      amberOctagon: { primary: '#f59e0b', highlight: '#fef3c7', shadow: '#b45309', glow: 'rgba(245, 158, 11, 0.6)' },
      greenEmerald: { primary: '#10b981', highlight: '#a7f3d0', shadow: '#047857', glow: 'rgba(16, 185, 129, 0.6)' }
    },
    hud: {
      podBg: '#1e1b4b',
      podBorder: '#f59e0b',
      buttonBg: '#312e81',
      buttonBorder: '#fbbf24',
      iconColor: '#fef08a',
      counterText: '#ffffff'
    }
  }),

  [PRESET_IDS.NORMAL]: Object.freeze({
    id: PRESET_IDS.NORMAL,
    name: 'Normal Sci-Fi',
    referenceImage: '/assets/aistudio/file_00000000eea88208b91a299f9c2e3f02_c94075d5.png',
    description: 'Clean tactical slate console, minimalist chassis, sharp high-contrast jade blocks.',
    background: {
      type: 'command_console',
      skyGradient: ['#070d14', '#0c1520', '#101b29'],
      showOrbitalStation: false,
      showPlanetaryLimb: false,
      stationColor: '#121f2d',
      atmosphereGlow: 'rgba(148, 163, 184, 0.08)'
    },
    chassis: {
      outerBorder: '#334155',
      innerBorder: '#1e293b',
      panelBg: '#0f172a',
      cornerAccent: '#475569',
      boltColor: '#64748b',
      sideIndicatorColor: '#0ea5e9',
      sideIndicatorGlow: 'rgba(14, 165, 233, 0.3)',
      trayAccentColor: '#38bdf8',
      trayAccentGlow: 'rgba(56, 189, 248, 0.25)'
    },
    grid: {
      wellColor: '#0b131e',
      cellBorder: '#1e293b',
      centerDotColor: '#334155',
      highlightColor: 'rgba(56, 189, 248, 0.2)'
    },
    blocks: {
      standard: {
        base: '#10b981',
        light: '#34d399',
        dark: '#047857',
        border: '#059669',
        surfaceGradient: ['#34d399', '#10b981', '#059669']
      },
      socket: {
        base: '#475569',
        light: '#94a3b8',
        dark: '#1e293b',
        border: '#334155',
        surfaceGradient: ['#64748b', '#475569', '#334155'],
        recessBg: '#0f172a'
      }
    },
    gems: {
      blueDiamond: { primary: '#0284c7', highlight: '#7dd3fc', shadow: '#0369a1', glow: 'rgba(2, 132, 199, 0.4)' },
      redTriangle: { primary: '#dc2626', highlight: '#fca5a5', shadow: '#991b1b', glow: 'rgba(220, 38, 38, 0.4)' },
      purpleHexagon: { primary: '#9333ea', highlight: '#d8b4fe', shadow: '#6b21a8', glow: 'rgba(147, 51, 234, 0.4)' },
      amberOctagon: { primary: '#d97706', highlight: '#fde68a', shadow: '#92400e', glow: 'rgba(217, 119, 6, 0.4)' },
      greenEmerald: { primary: '#059669', highlight: '#6ee7b7', shadow: '#064e3b', glow: 'rgba(5, 150, 105, 0.4)' }
    },
    hud: {
      podBg: '#0f172a',
      podBorder: '#334155',
      buttonBg: '#1e293b',
      buttonBorder: '#475569',
      iconColor: '#94a3b8',
      counterText: '#f1f5f9'
    }
  })
});

/** Default active preset is ADVANCED SCI-FI based on user direction */
export const DEFAULT_PRESET_ID = PRESET_IDS.ADVANCED;

// COLORS
export const COLORS: Record<string, string> = {
  white: '#FFF',
  black: '#000',
  grey: '#F5F5F5',
};

export const MATERIAL_COLORS: Record<string, Record<string, string>> = {
  500: {
    amber: '#FFC107',
    blue_grey: '#607D8B',
    blue: '#2196F3',
    brown: '#795548',
    cyan: '#00BCD4',
    deep_orange: '#FF5722',
    deep_purple: '#673AB7',
    green: '#4CAF50',
    grey: '#9E9E9E',
    indigo: '#3F51B5',
    light_blue: '#03A9F4',
    light_green: '#8BC34A',
    lime: '#CDDC39',
    orange: '#FF9800',
    pink: '#E91E63',
    purple: '#9C27B0',
    red: '#F44336',
    teal: '#009688',
    yellow: '#FFEB3B'
  }
};

export const PRIMARY_COLOR: Record<string, string> = {
  // main: '#28292D',
  main: COLORS.white,
  // alt: '#2E2F33',
  alt: MATERIAL_COLORS['500'].indigo,
  // icon: '#C2C2C2',
  icon: MATERIAL_COLORS['500'].indigo,
  border: '1px solid #555',
  text_main: MATERIAL_COLORS['500'].indigo,
  text_alt: '#EBEBEB',
  input: '#55595C'
};

export const SECONDARY_COLOR: Record<string, string> = {
  main: '#1CA6FC',
  alt: '#005FAF',
  icon: '#1CA6FC',
  border: '1px solid #FFF'
};

export const MESH_SELECTED: string = '#7FA8F0';

export const AREA_MESH_COLOR: Record<string, string> = {
  selected: '#C7DAF8',
  unselected: '#E9E7E2'
};

export const LINE_MESH_COLOR: Record<string, string> = {
  selected: '#3B82F6',
  unselected: '#565E6C'
};

/**
 * 2D drafting canvas palette — a light "paper" surface framed by the dark
 * app chrome. Single source of truth for the Viewer2D components and the
 * catalog factories' 2D renders.
 */
export const CANVAS: Record<string, string> = {
  // Surfaces
  paper: '#F6F7F9',
  chrome: '#16181D',

  // Grid
  gridMajor: '#D5D9E0',
  gridMinor: '#E8EAEF',

  // Walls
  wallFill: '#343A46',
  wallStroke: '#4A5160',
  wallFillSelected: '#3D4657',
  wallStrokeSelected: '#3B82F6',

  // Selection / handles
  accent: '#3B82F6',
  handleStroke: '#FFFFFF',

  // Labels
  label: '#7C8494',
  labelStrong: '#565E6C',

  // Rulers
  rulerText: '#8A93A6',
  rulerMarker: '#3B82F6'
};

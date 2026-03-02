export interface NormalMapConfig {
  uri: string;
  normalScaleX: number;
  normalScaleY: number;
  lengthRepeatScale: number;
  heightRepeatScale: number;
}

export interface TextureConfig {
  name: string;
  uri: string;
  lengthRepeatScale: number;
  heightRepeatScale: number;
  normal?: NormalMapConfig;
}

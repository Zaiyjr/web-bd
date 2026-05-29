import * as THREE from 'three';

export interface FlameData {
  light: THREE.PointLight;
  mesh: THREE.Mesh;
}

export interface Cake3DActions {
  blowCandles: () => void;
  launchFireworks: () => void;
  sendHeart: () => void;
}
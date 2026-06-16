export type Resources = Record<string, number>;

export interface Spacecraft {
  name: string;
  propulsionType: string;
  mass: string;
  cargo: string;
  fuel: string;
  thrust: string;
  exhaustV: string;
  lifeSupport: string;
  reusable: string;
  builtAt: string;
  requiresLV: string;
  buildCost: Resources;
  buildTime: number;
  description: string;
}

export interface LaunchVehicle {
  name: string;
  propulsionType: string;
  payload: string;
  reusable: string;
  crew: string;
  maxG: string;
  launchCost: string;
  maintenance: string;
  workers: string;
  energy: string;
  launchBonus: string;
  prereq: string;
  buildCost: Resources;
  buildTime: number;
  description: string;
}

export interface GroundFacility {
  name: string;
  type: string;
  role: string;
  workers: string;
  energy: string;
  maintenance: string;
  launchBonus: string;
  terraforming: string;
  habitatReq: string;
  prereq: string;
  buildCost: Resources;
  buildTime: number;
  description: string;
}

export interface OrbitalModule {
  name: string;
  type: string;
  role: string;
  workers: string;
  energy: string;
  buildCost: Resources;
  buildTime: number;
  description: string;
}

export interface TransportableModule {
  name: string;
  type: string;
  mass: string;
  role: string;
  maintenance: string;
  buildCost: Resources;
  buildTime: number;
  description: string;
}

export const ALL_RESOURCES = [
  'Metals',
  'Alloy',
  'Glass',
  'Polymers',
  'Electronics',
  'Rare Metals',
  'Exotic Alloys',
  'Fissiles',
  'Supplies',
  'Silicon',
  'Water',
  'Helium-3',
] as const;

export type ResourceName = (typeof ALL_RESOURCES)[number];

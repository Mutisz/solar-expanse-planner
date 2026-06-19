export type Resources = Record<string, number>;

export interface Spacecraft {
  id: string;
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
  id: string;
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
  id: string;
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
  id: string;
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
  id: string;
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

export interface CelestialBody {
  name: string;
  type: 'planet' | 'moon' | 'asteroid' | 'comet' | 'exoplanet';
  group: string;
  mass: number | null;
}

export interface Location {
  name: string;
  locationType: 'surface' | 'orbit';
}

export interface Mission {
  id: string;
  name: string;
  origin: string;
  target: string;
  manualResources: Record<string, number>;
  constructions: Record<string, number>;
  transportableModules: Record<string, number>;
  spacecraft: Record<string, number>;
  launchVehicles: Record<string, number>;
}

export function createMission(id: string): Mission {
  return {
    id,
    name: '',
    origin: '',
    target: '',
    manualResources: {},
    constructions: {},
    transportableModules: {},
    spacecraft: {},
    launchVehicles: {},
  };
}

export function locationsFromBodies(bodies: CelestialBody[]): Location[] {
  const result: Location[] = [];
  for (const body of bodies) {
    result.push({ name: body.name, locationType: 'surface' });
    if (body.mass !== null) {
      result.push({ name: `${body.name} [Orbit]`, locationType: 'orbit' });
    }
  }
  return result;
}

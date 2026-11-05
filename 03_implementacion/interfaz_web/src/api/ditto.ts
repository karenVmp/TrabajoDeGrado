import type {
  ActuatorState,
  BioreactorKgContext,
  SensorReadings
} from '@/api/types/bioreactor'

const THING_PATH = '/api/ditto/api/2/things/org.cafe:biorreactor-kg'

interface DittoFeature<T> {
  properties?: T
}

interface DittoThing {
  features?: {
    sensores?: DittoFeature<SensorReadings>
    contexto_kg?: DittoFeature<BioreactorKgContext>
    actuador?: DittoFeature<ActuatorState>
  }
}

export interface BioreactorSnapshot {
  sensores: SensorReadings
  contextoKg: BioreactorKgContext
  actuador: ActuatorState
}

export const getBioreactorSnapshot = async (): Promise<BioreactorSnapshot> => {
  const response = await fetch(THING_PATH, {
    headers: { Accept: 'application/json' }
  })

  if (!response.ok) {
    throw new Error(`Ditto respondio con HTTP ${response.status}`)
  }

  const thing = (await response.json()) as DittoThing
  const features = thing.features

  if (!features?.sensores?.properties || !features.contexto_kg?.properties || !features.actuador?.properties) {
    throw new Error('La Thing no contiene las propiedades esperadas en sus tres features')
  }

  return {
    sensores: features.sensores.properties,
    contextoKg: features.contexto_kg.properties,
    actuador: features.actuador.properties
  }
}
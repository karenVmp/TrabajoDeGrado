export interface ProcessAlert {
  variable: string
  valor_actual: number
  umbral_operacional?: number
  umbral_critico_absoluto?: number
  umbral_critico?: number
  rango_optimo: string
  descripcion: string
  defectos_relacionados_kg?: string[]
  nivel: string
}

export interface FarmerText {
  como_esta_la_fermentacion?: string
  que_relaciona_el_sistema_con_este_momento?: string[]
  relacion_con_la_taza?: string[]
  que_vigilar?: string[]
  ten_en_cuenta?: string
}
export interface SensoryAssociation {
  atributo?: string
  nombre?: string
  label?: string
  entidad?: string
}
export interface BioreactorKgContext {
  estado_proceso: string
  fase_proceso: string
  resumen: string
  atributos_sensoriales_potenciales: string[]
  defectos_en_riesgo: string[]
  alertas: ProcessAlert[]
  recomendacion: string
  ph_evaluado: number
  brix_evaluado: number
  temp_evaluada: number
  hora_proceso: number
  escenario?: string
  resumen_interpretativo?: {
    info_usuario?: {
      atributos_sensoriales: string[]
      microorganismos_relacionados: string[]
      defectos_a_vigilar: string[]
      nota_sensorial: string
      nota_sca: string
      nota_defectos: string
      fuentes?: Record<string, string>
    }
    texto_para_caficultor?: FarmerText
    posibles_implicaciones_sensoriales?: {
      generales_bfpo?: unknown
      priorizadas_por_estado?: unknown
    }
    contexto_microbiologico_bioquimico?: unknown
    aspectos_a_vigilar?: unknown
    estado_del_proceso?: { etapa?: string; texto?: string }
  }
  interpretacion_contextual?: {
    defectos_potenciales?: unknown[]
    atributos_sensoriales_relacionados?: unknown[]
  }
}
export interface ActuatorState {
  estado: string
  accion: string
  modo: string
  timestamp: string
}
export interface SensorReadings {
  ph?: number
  brix?: number
  temperature?: number
  hora_simulada?: number
  sca_estimado?: number
  escenario?: string
  timestamp_lectura?: string
}

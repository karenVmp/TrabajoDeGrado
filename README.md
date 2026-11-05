
# Gemelos digitales con capacidades de contexto para bioprocesos de fermentación

Trabajo de grado - Ingeniería Electrónica y Telecomunicaciones, Universidad del Cauca (2026).
Autora: Karen Viviana Muñoz Portilla.

Este repositorio contiene los recursos desarrollados durante el trabajo de grado, orientado a la incorporación de capacidades de contexto en un prototipo de gemelo digital para la fermentación anaeróbica autoinducida (SIAF) de café.

## Contenido del repositorio

| Carpeta | Contenido |
|---|---|
| [`01_ontologia`](01_ontologia) | Ontología BFPO y su matriz de formalización. La ontología está publicada en BioPortal. |
| [`02_grafo`](02_grafo) | Relaciones del dominio, mapeo RML y el repositorio del KG en GraphDB. |
| [`03_implementacion`](03_implementacion) | Simulador, flujo de Kestra, entidad de Eclipse Ditto, interfaz web y configuración de los servicios. |
| [`04_consultas`](04_consultas) | Consultas SPARQL utilizadas para recuperar información del grafo de conocimiento. |
| [`05_evidencias`](05_evidencias) | Registros de las ejecuciones de Kestra y lecturas simuladas de los escenarios E1 a E4. |

## Uso de las consultas

- `Q1_estado_variables`, `Q2_rutas_contextuales`, `Q2_categorias_entidades` y `KG_relaciones_subPropertyOf` se ejecutan sin inferencias (`infer=false`).
- `Q3_relaciones_fuera_de_rango` y `KG_relaciones_influences` se ejecutan con y sin inferencias (`infer=false` e `infer=true`) para comparar los resultados.

## Tecnologías utilizadas

- GraphDB
- Eclipse Ditto
- InfluxDB
- Kestra
- Python
- React, TypeScript y Vite


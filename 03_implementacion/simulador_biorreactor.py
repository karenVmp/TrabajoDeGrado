import json
import time
import random
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS




INFLUX_URL = "http://localhost:8086"
INFLUX_TOKEN = "nombre_token"
INFLUX_ORG = "cafe"
INFLUX_BUCKET = "biorreactor"


DATOS_YINA = [
    {"h": 0,  "ph": 5.473, "brix": 15.633, "sca": 81.65, "acidez": 0.45},
    {"h": 12, "ph": 4.519, "brix": 14.400, "sca": 83.40, "acidez": 0.62},
    {"h": 24, "ph": 4.415, "brix": 13.833, "sca": 84.26, "acidez": 0.78},
    {"h": 36, "ph": 4.063, "brix": 13.400, "sca": 85.28, "acidez": 0.89},
    {"h": 48, "ph": 4.126, "brix": 12.333, "sca": 86.13, "acidez": 0.94},
    {"h": 60, "ph": 4.067, "brix":  9.733, "sca": 85.28, "acidez": 0.98},
    {"h": 72, "ph": 3.920, "brix":  9.300, "sca": 84.14, "acidez": 1.05},
    {"h": 84, "ph": 3.854, "brix":  9.233, "sca": 82.75, "acidez": 1.12},
    {"h": 96, "ph": 3.848, "brix":  8.900, "sca": 81.00, "acidez": 1.18},
]

ESCENARIO = 1
INTERVALO_SEGUNDOS = 10
AVANCE_HORAS = 0.167
FACTOR_ACELERACION_E2 = 1.5   
PH_FINAL_E2 = 3.5   
INICIO_PERTURBACION_E3 = 24.0  
DURACION_RAMPA_E3 = 6.0        
TEMP_PERTURBADA_E3 = 27.0      


FACTOR_ACELERACION_E4 = 1.5    
INICIO_PERTURBACION_E4 = 24.0   

def interpolar(hora):
    if hora >= 96:
        return DATOS_YINA[-1].copy()
    idx = min(int(hora / 12), len(DATOS_YINA) - 2)
    base = DATOS_YINA[idx]
    siguiente = DATOS_YINA[idx + 1]
    t = (hora % 12) / 12
    return {
        "ph": base["ph"] + (siguiente["ph"] - base["ph"]) * t,
        "brix": base["brix"] + (siguiente["brix"] - base["brix"]) * t,
        "sca": base["sca"] + (siguiente["sca"] - base["sca"]) * t,
        "acidez": base["acidez"] + (siguiente["acidez"] - base["acidez"]) * t,
    }


def generar_dato(hora, escenario):
    base = interpolar(hora)

   
    if escenario == 2:
        h_ref = hora * FACTOR_ACELERACION_E2
        if h_ref <= 96:
            ph_base = interpolar(h_ref)["ph"]
        else:
            
            h_fin = 96 / FACTOR_ACELERACION_E2          
            avance = (hora - h_fin) / (96 - h_fin)
            ph_base = DATOS_YINA[-1]["ph"] + (PH_FINAL_E2 - DATOS_YINA[-1]["ph"]) * avance
        ph = ph_base + random.uniform(-0.03, 0.03)
    elif escenario == 4:
        ph = interpolar(min(hora * FACTOR_ACELERACION_E4, 96))["ph"] + random.uniform(-0.03, 0.03)
    else:
        ph = base["ph"] + random.uniform(-0.03, 0.03)

    brix = base["brix"] + random.uniform(-0.15, 0.15)
    sca = base["sca"] + random.uniform(-0.5, 0.5)
    acidez = base["acidez"] + random.uniform(-0.02, 0.02)
    temp = 23.0 + random.uniform(-0.2, 0.2)
    o2 = max(0.1, 2.0 - (hora / 96) * 1.8 + random.uniform(-0.1, 0.1))
    redox = -100 + (ph - 3.5) * 80 + random.uniform(-5, 5)
    presion = max(10.0, 10.0 + (hora / 96) * 3.0 + random.uniform(-0.3, 0.5))
    alcohol = max(0.0, min(2.5, (hora / 96) * 2.0 + random.uniform(-0.05, 0.1)))
    humedad = 85.0 - (hora / 96) * 5.0 + random.uniform(-0.5, 0.5)

    
    inicio = INICIO_PERTURBACION_E3 if escenario == 3 else INICIO_PERTURBACION_E4
    if escenario in (3, 4) and hora >= inicio:
        avance = min((hora - inicio) / DURACION_RAMPA_E3, 1.0)
        temp = 23.0 + (TEMP_PERTURBADA_E3 - 23.0) * avance + random.uniform(-0.2, 0.2)

    return {
        "hora_simulada": round(hora, 2),
        "escenario": escenario,
        "temperature": round(temp, 2),
        "ph": round(ph, 3),
        "brix": round(brix, 3),
        "pressure": round(presion, 2),
        "alcohol": round(alcohol, 3),
        "dissolved_oxygen": round(o2, 3),
        "redox_potential": round(redox, 1),
        "total_acidity": round(acidez, 3),
        "substrate_humidity": round(humedad, 1),
        "sca_estimado": round(sca, 2)
    }



client = InfluxDBClient(
    url=INFLUX_URL,
    token=INFLUX_TOKEN,
    org=INFLUX_ORG
)
write_api = client.write_api(write_options=SYNCHRONOUS)
print("Conectado a InfluxDB correctamente.")


# EJECUCION PRINCIPAL

print("=" * 50)
print("SIMULADOR CDT — BIORREACTOR FERMENTACION")
print(f"Escenario: {ESCENARIO}")
print(f"Intervalo: {INTERVALO_SEGUNDOS}s = "
      f"{AVANCE_HORAS*60:.0f}min simulados")
print("=" * 50)

hora = 0.0
contador = 0

while hora <= 96:
    dato = generar_dato(hora, ESCENARIO)
    contador += 1

    # Crear punto para InfluxDB
    point = Point("fermentacion") \
        .tag("escenario", str(dato["escenario"])) \
        .field("temperature", dato["temperature"]) \
        .field("ph", dato["ph"]) \
        .field("brix", dato["brix"]) \
        .field("pressure", dato["pressure"]) \
        .field("alcohol", dato["alcohol"]) \
        .field("dissolved_oxygen", dato["dissolved_oxygen"]) \
        .field("redox_potential", dato["redox_potential"]) \
        .field("total_acidity", dato["total_acidity"]) \
        .field("substrate_humidity", dato["substrate_humidity"]) \
        .field("sca_estimado", dato["sca_estimado"]) \
        .field("hora_simulada", dato["hora_simulada"])

    
    write_api.write(
        bucket=INFLUX_BUCKET,
        org=INFLUX_ORG,
        record=point
    )

    print(f"[Dato #{contador}] h={dato['hora_simulada']} "
          f"pH={dato['ph']} Brix={dato['brix']} "
          f"Temp={dato['temperature']} → enviado a InfluxDB")

    time.sleep(INTERVALO_SEGUNDOS)
    hora += AVANCE_HORAS

print("Simulacion completada.")
client.close()

# Fase 1 — To-Dos: Investigación, Reto y Datos NASA

> **Código:** `TODO-F1`  
> **Estado:** En preparación  
> **Documento objetivo:** [`../research/`](../research/README.md), [`../research/04_plan_de_research_y_evidencias_fusion.md`](../research/04_plan_de_research_y_evidencias_fusion.md) y [`../anotaciones/01_brainstorming_ideas.md`](../anotaciones/01_brainstorming_ideas.md)  

---

## 1. Tareas Generales del Equipo (Plan de Research `R1`–`R4`)

- [ ] **Verificación de accesos**: Confirmar que `@smulaboughaba`, `@hviciana`, `@ItsYarosun` y `@jesusorellanagil2002` han clonado el repo y pueden hacer `git push` únicamente en su rama asignada.
- [ ] **Etapa `R1` — Acotación Espaciotemporal (*BBox + Fechas*)**: Definir coordenadas y fechas `T0` / `T1` / `T2` en `RES-04` para el **Caso Local 1 (DANA Valencia Oct–Nov 2024)**, **Caso Local 2 (Incendio)** y **Caso Global (Ciclón / El Niño / Terremoto)**.
- [ ] **Etapa `R2` — Auditoría SAR en `NASA ASF DAAC / OPERA`**: Localizar y verificar la descarga de `Granule IDs` reales (`Sentinel-1`, `ALOS PALSAR`, `UAVSAR`, `OPERA DSWx / DISP / DIST / RTC`) en `RES-02` / `RES-04`.
- [ ] **Etapa `R3` — Extracción de Capas `Open Data (+)`**: Descargar para el mismo *Bounding Box* datos de lluvia (`AEMET`/`ERA5`/`GPM`), relieve (`SRTM`/`Copernicus DEM`), cobertura (`CORINE`/`WorldCover`), focos (`FIRMS`) o sismos (`USGS`).
- [ ] **Etapa `R4` — Experimento Demostrativo de Validez (*Proof of Validity*)**: Ejecutar en `dev/data_science/` la comparativa **Solo SAR vs. SAR + DEM + Land Cover** (reducción de falsos positivos) y la **correlación física SAR vs. Open Data** para respaldar el criterio *Validity*.
- [ ] **Cierre del MVP y consolidación en `main`**: Aprobar alcance MVP (`ANO-01` / `RES-03`) y consolidar toda la investigación en `main` mediante Pull Request.

---

## 2. Asignación por Integrante

### Samu (`@smulaboughaba` — rama `samu`)
- [ ] Confirmar reglas de protección y colaboradores en GitHub.
- [ ] Coordinar el plan de research (`RES-04`), validar productos `NASA OPERA / ASF DAAC` (`R2`) y definir métricas del experimento `R4`.
- [ ] Revisar y aprobar los Pull Requests de Fase 1 hacia `main`.

### Hugo (`@hviciana` — rama `hugo`)
- [ ] Probar `git checkout hugo` y subir su primera aportación de investigación.
- [ ] Liderar investigación del **Caso Local 1 (DANA Valencia / Inundaciones)**: escenas SAR (`EMSR773` / Sentinel-1 / `OPERA DSWx`) + pluviometría (`AEMET`/`ERA5`) + `DEM` + infraestructuras (`OSM`).
- [ ] Registrar sus propuestas de MVP en `ANO-01` (`anotaciones/01_brainstorming_ideas.md`).

### Yaro (`@ItsYarosun` — rama `yaro`)
- [ ] Probar `git checkout yaro` y subir su primera aportación de investigación.
- [ ] Liderar investigación del **Caso Local 2 (Incendios / Deforestación / Cultivos)**: respuesta polarimétrica Banda L/C (`OPERA DIST`) + focos `NASA FIRMS` + cobertura (`CORINE`/`WorldCover`).
- [ ] Registrar sus propuestas de MVP en `ANO-01` (`anotaciones/01_brainstorming_ideas.md`).

### Jesús (`@jesusorellanagil2002` — rama `jesus`)
- [ ] Probar `git checkout jesus` y subir su primera aportación de investigación.
- [ ] Liderar investigación del **Caso Global (Ciclón / El Niño / Terremoto `InSAR`)**: datos `OPERA DISP`, `NOAA IBTrACS / ONI`, catálogo sísmico `USGS` y narrativa *Local ➔ Global* en `RES-03`.
- [ ] Registrar sus propuestas de MVP en `ANO-01` (`anotaciones/01_brainstorming_ideas.md`).

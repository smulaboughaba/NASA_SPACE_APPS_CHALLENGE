<p align="center">
  <img src="public/assets/geo-wave-logo.png" alt="GEO-WAVE logo" width="240">
</p>

# GEO-WAVE

**Interactive 3D Earth Observation, Multi-Sensor Climate Analysis & Terrain Visualization Platform**

---

## 1. Overview

**GEO-WAVE** turns multi-mission satellite imagery, elevation models, and atmospheric/seismic records into an interactive 3D terrain experience directly in the browser—with no mandatory backend required.

Users can search any city, coordinate pair, or Earth-observation variable, frame a study box (`20–60 km`) and date window (`7–180 days`), and inspect what is changing on real 3D topography:

- **Where** changes occur on real Digital Elevation Models (`~30 m` Terrarium DEM).
- **What** satellites observe day by day across 13 real WMTS layers.
- **How much** meteorological, air-quality, or seismic variables shift over the selected window.
- **How reliable** trends are (`Mann-Kendall`, linear slope, `p`-value, observed timestamps vs. interpolated frames).

---

## 2. Workspaces & Navigation

GEO-WAVE is organized into three switchable modes from the persistent top bar (`ES` / `EN` bilingual UI, desktop & responsive mobile collapsible drawers):

1. **Search Mode (`Modo Buscador`)**
   - Clean spotlight entry (`Ge[Logo]Wave`) with instant query resolution across:
     - **Decimal & cardinal coordinates** (`39.47, -0.38`, `34.07N 118.58W`).
     - **Place names** via OpenStreetMap Nominatim (`limit=5` with session cache & rate limiting).
     - **Satellite layers & physical variables** (e.g. `"rain"`, `"NO2"`, `"CO2"`, `"NDVI"`).
   - Validated study-area preparation (`7–180 days`, latency notices, resolution warnings, `20–60 km` box slider) with one-click launch into **3D Terrain** or **3D Globe**.

2. **Earth Engine Mode (`Modo Earth Engine`)**
   - **3D Orbital Globe**: interactive `MapLibre GL JS` globe with a centered framing reticle, `20–60 km` analysis box, and direct access to prebuilt case studies.
   - **3D Terrain Viewer**: real-time `Three.js` / React Three Fiber 3D mesh with:
     - **`Vista Satélite` (Real WMTS Observation)**: up to 36 daily satellite frames draped over real terrain across **13 layers**: True Color (`MODIS Terra`, `VIIRS Suomi-NPP`), False Color `7-2-1`, Precipitation (`GPM IMERG`), Land Surface Temperature (`MODIS LST`), Vegetation (`MODIS NDVI`), Root-Zone Soil Moisture (`SMAP L4`), Aerosol Optical Depth (`MODIS AOD`), `CO` (`AIRS`), `CO₂` (`OCO-2`), `NO₂` & Total Ozone `O₃` (`OMI`), and Snow Cover (`MODIS NDSI`).
     - **`Simulación` & `Variable Cruzada`**: parametric physical overlays for flood runoff, thermal stress, or crustal seismic models (`USGS` / `MERRA-2` / `NIFC` / `InSAR`).
     - **Draggable `Antes / Después` Split**: compare initial state vs. active date directly on the 3D surface.
     - **Clear View vs. Scientific Data Panel**: plain-language guided steps alongside statistical trend inspection (`Mann-Kendall`, vertex readout, `CSV`/`JSON` export & official CSV import).

3. **Agent Mode (Roadmap · Phases 4–5)**
   - Architectural blueprint documented in [`docs/ARQUITECTURA_UI_UX.md`](./docs/ARQUITECTURA_UI_UX.md) for sandboxed multi-agent scientific workflows, streaming `thinking` traces, and dual `BYOAK` / managed API access.

---

## 3. Built-In Demonstration Case Studies

- **Los Angeles Wildfire (Jan 2025)**: `NIFC WFIGS` `23,448 ac` fire perimeter, `MERRA-2` gusts (`86 km/h`), and SAR backscatter drop over Santa Monica Mountains.
- **Kamchatka Megathrust Earthquake (2025)**: `USGS` `Mw 8.8` event + `NISAR` L-band `InSAR` interferometric ground displacement (`±170 cm`) and fringes.
- **Málaga Guadalhorce DANA Flood (Nov 2024)**: torrential rainfall (`315 mm`) mapped via `OPERA DSWx` flood extent below `23 m` elevation despite cloud cover.

---

## 4. Data Sources & Sensors

All sources are integrated via public CORS endpoints directly in the browser (plus an optional local Python server [`live_api.py`](./live_api.py)):

- **Daily Satellite Imagery & Grids**: `MODIS Terra/Aqua`, `VIIRS Suomi-NPP`, `GPM IMERG`, `SMAP L4`, `OMI (Aura)`, `AIRS`, `OCO-2` via `GIBS WMTS` (`EPSG:3857`).
- **Terrain & Optical Base**: `AWS Terrain Tiles (Terrarium DEM)` + `Esri ArcGIS World Imagery`.
- **Meteorology & Atmospheric Reanalysis**: `POWER` (`MERRA-2`, `CERES`, `GPM`) with `Open-Meteo ERA5` fallback and `Copernicus CAMS` air quality.
- **Seismic & Geocoding**: `USGS Earthquake Hazards` (`FDSN Event API`) & `OpenStreetMap Nominatim (ODbL)`.

> Detailed technical specifications, native pixel resolutions, and cadence checks are documented in [`docs/ESPECIFICACIONES_SATELITES_Y_FUENTES.md`](./docs/ESPECIFICACIONES_SATELITES_Y_FUENTES.md).

---

## 5. Local Development & Build

### Frontend (Static Web · Works Standalone)

```bash
npm install
npm run dev      # Start Vite dev server
npm run build    # Build production bundle into dist/
npm run preview  # Preview production bundle locally
```

### Optional Local Backend (`live_api.py`)

```bash
pip install -r requirements.txt
python3 live_api.py
```

---

## 6. Architecture & Documentation

- UI/UX Architecture, Phase Roadmap & Future `Rust`/`Python` Hybrid Plan: [`docs/ARQUITECTURA_UI_UX.md`](./docs/ARQUITECTURA_UI_UX.md)
- Satellite & Provider Official Specs Audit: [`docs/ESPECIFICACIONES_SATELITES_Y_FUENTES.md`](./docs/ESPECIFICACIONES_SATELITES_Y_FUENTES.md)
- Flow Audit & Technical Debt Matrix: [`docs/AUDITORIA_Y_ROADMAP.md`](./docs/AUDITORIA_Y_ROADMAP.md)

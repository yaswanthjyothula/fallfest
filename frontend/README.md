# AgriQuantum Frontend Application

The Next.js 16 web frontend for the **AgriQuantum Precision Agriculture Intelligence Platform**.

## Technology Stack
- **Framework**: Next.js 16.3.4 (App Router) with Turbopack
- **UI Library**: React 19
- **Styling**: TailwindCSS 4
- **Charts**: Apache ECharts (`echarts-for-react`)
- **Maps**: MapLibre GL
- **Icons**: Lucide React
- **Typography**: Inter (UI font) and Geist Mono (Technical specifications)

## Key Modules
- `/dashboard`: Main control center with live weather and crop health widgets
- `/dashboard/farms`: Form-driven farm setup and precision agricultural analysis
- `/dashboard/predict`: 4-Qubit Quantum Support Vector Regression yield prediction
- `/dashboard/benchmarks`: Classical ML vs. Quantum ML zero-leakage model evaluation suite
- `/dashboard/scenarios`: What-If decision laboratory for fertilizer and irrigation planning
- `/dashboard/twin`: 360-degree Farm Digital Twin
- `/dashboard/weather`: Hyperlocal weather telemetry and sensitivity curves
- `/dashboard/crop-health`: Copernicus Sentinel-2 satellite NDVI vegetation vigor
- `/dashboard/recommendations`: Precision agronomic advisory for N-P-K dosage
- `/dashboard/reports`: Certified PDF report generator with cryptographic validation

## Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

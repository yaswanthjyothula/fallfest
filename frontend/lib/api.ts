/**
 * AgriQuantum Centralized Typed API Client
 * Connects Next.js Frontend directly to FastAPI Gateway (/api/v1/)
 * Featuring client-side memory caching with TTL to eliminate duplicate/sequential request waterfalls.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export interface Farm {
  id: number;
  name: string;
  location: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  total_area_hectares: number;
  created_at: string;
  fields?: Field[];
}

export interface Field {
  id: number;
  farm_id: number;
  name: string;
  area_hectares: number;
  soil_type: string;
  boundary_geojson?: string;
  created_at: string;
}

export interface Crop {
  id: number;
  field_id: number;
  name: string;
  variety?: string;
  season: string;
  growth_stage: string;
  planting_date?: string;
  expected_harvest_date?: string;
  created_at: string;
}

export interface YieldPredictionInput {
  field_id?: number;
  soil_nitrogen: number;
  soil_phosphorus?: number;
  soil_potassium?: number;
  soil_moisture: number;
  soil_ph?: number;
  rainfall: number;
  temperature?: number;
  ndvi: number;
  crop_type?: string;
  cultivated_area_hectares?: number;
}

export interface YieldPredictionOutput {
  prediction_id: number;
  predicted_yield_quintals_acre: number;
  predicted_yield_tonnes_hectare: number;
  model_version: string;
  quantum_backend: string;
  circuit_qubits: number;
  confidence_score: number;
  status: string;
  prediction_timestamp: string;
  input_summary: Record<string, number>;
  historical_comparison: string;
}

export interface RecommendationOutput {
  recommendation_id?: number;
  baseline_yield_q_acre: number;
  optimized_yield_q_acre: number;
  yield_improvement_pct: number;
  current_nitrogen_kg_ha: number;
  recommended_nitrogen_kg_ha: number;
  delta_nitrogen_kg_ha: number;
  current_moisture_pct: number;
  recommended_moisture_pct: number;
  supplemental_irrigation_mm: number;
  cost_savings_inr_acre: number;
  net_economic_benefit_inr_acre: number;
  nitrogen_advisory: string;
  irrigation_advisory: string;
  advisory_summary: string;
  disclaimer: string;
}

export interface QuantumKernelMatrix {
  dimension: number;
  sample_ids: string[];
  matrix: number[][];
  min_kernel_value: number;
  max_kernel_value: number;
  qubit_count: number;
  feature_map: string;
  backend: string;
  generated_at: string;
}

export interface WeatherCurrent {
  latitude: number;
  longitude: number;
  temperature_c: number;
  feels_like_c: number;
  humidity_pct: number;
  precipitation_mm: number;
  precip_prob_pct: number;
  wind_speed_kmh: number;
  pressure_hpa: number;
  cloud_coverage_pct: number;
  solar_radiation_wm2: number;
  conditions: string;
  weather_provider: string;
  cached: boolean;
}

export interface WeatherForecastDay {
  date: string;
  temp_max_c: number;
  temp_min_c: number;
  precipitation_mm: number;
  precip_prob_pct: number;
  humidity_pct: number;
  solar_radiation_wm2: number;
  conditions: string;
}

export interface HourlyForecastItem {
  time: string;
  temperature_c: number;
  precipitation_mm: number;
  pop_pct: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  conditions: string;
}

export interface DailyForecastItem {
  date: string;
  temp_max_c: number;
  temp_min_c: number;
  temp_mean_c: number;
  precipitation_mm: number;
  precip_prob_pct: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  wind_direction_deg?: number;
  conditions: string;
  uv_index?: number;
  sunrise?: string;
  sunset?: string;
}

export interface RainfallIntelligenceItem {
  recent_observed_mm: number;
  forecast_7d_cumulative_mm: number;
  baseline_30d_normal_mm: number;
  deviation_pct: number;
  trend_direction: "Deficit" | "Normal" | "Surplus";
  interpretation: string;
}

export interface FarmWeatherStatusItem {
  status: "Favorable" | "Watch" | "Attention" | "High Risk" | "Insufficient Data";
  headline: string;
  rationale: string;
  checklist: string[];
}

export interface WeatherImpactCurvePoint {
  variable_val: number;
  yield_t_ha: number;
}

export interface WeatherImpactCurves {
  rainfall_vs_yield: WeatherImpactCurvePoint[];
  temp_vs_yield: WeatherImpactCurvePoint[];
  optimal_rainfall_range_mm: string;
  optimal_temp_range_c: string;
  r2_rainfall: number;
  r2_temperature: number;
}

export interface WeatherIntelligenceResponse {
  farm_id: number;
  farm_name: string;
  latitude: number;
  longitude: number;
  weather_provider: string;
  data_provenance: string;
  last_updated: string;
  current: Record<string, any>;
  daily_forecast: DailyForecastItem[];
  hourly_forecast: HourlyForecastItem[];
  rainfall_intelligence: RainfallIntelligenceItem;
  farm_weather_status: FarmWeatherStatusItem;
  weather_impact_curves: WeatherImpactCurves;
  operational_advisories: Record<string, string>;
}

export interface QuantumWeatherScenarioRequest {
  farm_id?: number;
  crop?: string;
  rainfall_delta_pct?: number;
  temperature_delta_c?: number;
  irrigation_adjustment_mm?: number;
  scenario_type?: string;
  scenario_name?: string;
}

export interface QuantumWeatherScenarioResponse {
  scenario_id: string;
  scenario_name: string;
  scenario_type: string;
  simulated_rainfall_mm: number;
  simulated_temperature_c: number;
  simulated_moisture_pct: number;
  simulated_yield_t_ha: number;
  baseline_yield_t_ha: number;
  yield_delta_t_ha: number;
  yield_delta_pct: number;
  water_requirement_mm: number;
  water_stress_tier: string;
  economic_estimate: Record<string, number>;
  decision_score: number;
  model_name: string;
  model_version: string;
  quantum_configuration: Record<string, any>;
  why_it_changed: Array<{
    feature: string;
    factor_role: string;
    influence: string;
    description: string;
  }>;
  is_simulation_disclaimer: string;
  timestamp: string;
}


export interface BenchmarkScatterPoint {
  sample_id: string;
  actual: number;
  predicted: number;
}

export interface BenchmarkResidualPoint {
  sample_id: string;
  predicted: number;
  residual: number;
}

export interface ModelEvaluationMetricItem {
  model_id: string;
  model: string;
  type: string;
  framework: string;
  r2: number;
  rmse: number;
  mae: number;
  mape: number;
  train_time_sec: number;
  inf_time_sec: number;
  rank: number;
}

export interface HeadlineComparisonModel {
  name: string;
  r2: number;
  rmse: number;
  mae: number;
  mape: number;
  train_time_sec: number;
  inf_time_sec: number;
}

export interface HeadlineComparisonData {
  quantum_model: HeadlineComparisonModel;
  best_classical_model: HeadlineComparisonModel;
  r2_delta: number;
  rmse_delta: number;
  mae_delta: number;
  winner: string;
  summary_statement: string;
}

export interface EvaluationDatasetInfo {
  name: string;
  version: string;
  sample_count: number;
  train_count: number;
  test_count: number;
  features: string[];
  target: string;
  train_split: number;
  test_split: number;
  validation_method: string;
  random_seed: number;
}

export interface EvaluationEnvironmentInfo {
  cpu: string;
  cores: number;
  memory_gb: number;
  python_version: string;
  qiskit_version: string;
  qiskit_aer_version: string;
  os: string;
}

export interface QuantumModelTechnicalDetails {
  model_name: string;
  feature_map: string;
  kernel_type: string;
  entanglement: string;
  num_qubits: number;
  reps: number;
  circuit_depth: number;
  total_gates: number;
  backend: string;
  regularization_c: number;
  epsilon: number;
  disclosed_limitations: string;
}

export interface ResidualDistributionBin {
  bin_range: string;
  bin_center: number;
  count: number;
}

export interface RobustnessAnalysisItem {
  perturbation: string;
  quantum_svr_delta_pct: number;
  random_forest_delta_pct: number;
  rbf_svr_delta_pct: number;
  ridge_delta_pct: number;
  most_stable_model: string;
}

export interface BenchmarkResponse {
  benchmark_id: string;
  timestamp: string;
  models: ModelEvaluationMetricItem[];
  headline_comparison: HeadlineComparisonData;
  dataset: EvaluationDatasetInfo;
  evaluation_environment: EvaluationEnvironmentInfo;
  quantum_details: QuantumModelTechnicalDetails;
  actual_vs_predicted: Record<string, BenchmarkScatterPoint[]>;
  residuals: Record<string, BenchmarkResidualPoint[]>;
  residual_distributions?: Record<string, ResidualDistributionBin[]>;
  robustness_analysis?: RobustnessAnalysisItem[];
}

// Backward compatibility alias
export type BenchmarkModelMetrics = ModelEvaluationMetricItem;

// ---------------------------------------------------------------------------
// In-Memory Staged Cache System
// ---------------------------------------------------------------------------
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string, ttlMs: number): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttlMs) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T): void {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

export function clearApiCache(prefix?: string): void {
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `API Error (${res.status})`;
    try {
      const err = await res.json();
      errorDetail = err.detail || err.message || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // System & Health
  async getHealth(forceRefresh = false): Promise<any> {
    const cacheKey = "health";
    if (!forceRefresh) {
      const cached = getCached<any>(cacheKey, 30_000); // 30 sec TTL
      if (cached) return cached;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      const data = await handleResponse<any>(res);
      setCached(cacheKey, data);
      return data;
    } catch (e) {
      return { status: "degraded", error: String(e) };
    }
  },

  async getSupabaseStatus(forceRefresh = false): Promise<any> {
    const cacheKey = "supabase_status";
    if (!forceRefresh) {
      const cached = getCached<any>(cacheKey, 60_000);
      if (cached) return cached;
    }
    const res = await fetch(`${API_BASE_URL}/supabase/status`);
    const data = await handleResponse<any>(res);
    setCached(cacheKey, data);
    return data;
  },

  // Farms
  async getFarms(forceRefresh = false): Promise<Farm[]> {
    const cacheKey = "farms_list";
    if (!forceRefresh) {
      const cached = getCached<Farm[]>(cacheKey, 120_000); // 2 min TTL
      if (cached) return cached;
    }
    const res = await fetch(`${API_BASE_URL}/farms`);
    const data = await handleResponse<Farm[]>(res);
    setCached(cacheKey, data);
    return data;
  },

  async getFarm(id: number, forceRefresh = false): Promise<Farm> {
    const cacheKey = `farm_${id}`;
    if (!forceRefresh) {
      const cached = getCached<Farm>(cacheKey, 120_000);
      if (cached) return cached;
    }
    const res = await fetch(`${API_BASE_URL}/farms/${id}`);
    const data = await handleResponse<Farm>(res);
    setCached(cacheKey, data);
    return data;
  },

  async createFarm(payload: Partial<Farm>): Promise<Farm> {
    const res = await fetch(`${API_BASE_URL}/farms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<Farm>(res);
    clearApiCache("farm");
    return data;
  },

  async updateFarm(id: number, payload: Partial<Farm>): Promise<Farm> {
    const res = await fetch(`${API_BASE_URL}/farms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<Farm>(res);
    clearApiCache("farm");
    return data;
  },

  async deleteFarm(id: number): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/farms/${id}`, { method: "DELETE" });
    const data = await handleResponse<{ status: string; message: string }>(res);
    clearApiCache("farm");
    return data;
  },

  // Fields
  async getFields(farmId?: number, forceRefresh = false): Promise<Field[]> {
    const cacheKey = farmId ? `fields_farm_${farmId}` : "fields_all";
    if (!forceRefresh) {
      const cached = getCached<Field[]>(cacheKey, 120_000);
      if (cached) return cached;
    }
    const url = farmId ? `${API_BASE_URL}/fields?farm_id=${farmId}` : `${API_BASE_URL}/fields`;
    const res = await fetch(url);
    const data = await handleResponse<Field[]>(res);
    setCached(cacheKey, data);
    return data;
  },

  async createField(farmId: number, payload: Partial<Field>): Promise<Field> {
    const res = await fetch(`${API_BASE_URL}/farms/${farmId}/fields`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<Field>(res);
    clearApiCache("fields");
    return data;
  },

  async updateField(id: number, payload: Partial<Field>): Promise<Field> {
    const res = await fetch(`${API_BASE_URL}/fields/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<Field>(res);
    clearApiCache("fields");
    return data;
  },

  async deleteField(id: number): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/fields/${id}`, { method: "DELETE" });
    const data = await handleResponse<{ status: string; message: string }>(res);
    clearApiCache("fields");
    return data;
  },

  // Crops
  async getCrops(fieldId?: number, forceRefresh = false): Promise<Crop[]> {
    const cacheKey = fieldId ? `crops_field_${fieldId}` : "crops_all";
    if (!forceRefresh) {
      const cached = getCached<Crop[]>(cacheKey, 120_000);
      if (cached) return cached;
    }
    const url = fieldId ? `${API_BASE_URL}/fields/${fieldId}/crops` : `${API_BASE_URL}/crops`;
    const res = await fetch(url);
    const data = await handleResponse<Crop[]>(res);
    setCached(cacheKey, data);
    return data;
  },

  async addCrop(fieldId: number, payload: Partial<Crop>): Promise<Crop> {
    const res = await fetch(`${API_BASE_URL}/fields/${fieldId}/crops`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<Crop>(res);
    clearApiCache("crops");
    return data;
  },

  // Prediction
  async predictYield(payload: YieldPredictionInput): Promise<YieldPredictionOutput> {
    const res = await fetch(`${API_BASE_URL}/predictions/yield`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<YieldPredictionOutput>(res);
    clearApiCache("pred_history");
    return data;
  },

  async getPredictionHistory(limit: number = 10, forceRefresh = false): Promise<YieldPredictionOutput[]> {
    const cacheKey = `pred_history_${limit}`;
    if (!forceRefresh) {
      const cached = getCached<YieldPredictionOutput[]>(cacheKey, 30_000); // 30 sec TTL
      if (cached) return cached;
    }
    const res = await fetch(`${API_BASE_URL}/predictions/history?limit=${limit}`);
    const data = await handleResponse<YieldPredictionOutput[]>(res);
    setCached(cacheKey, data);
    return data;
  },

  // Recommendations
  async getRecommendations(payload: any): Promise<RecommendationOutput> {
    const res = await fetch(`${API_BASE_URL}/recommendations/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<RecommendationOutput>(res);
  },

  // Weather (Visual Crossing) - 5 min cache
  async getCurrentWeather(latitude: number, longitude: number, forceRefresh = false): Promise<WeatherCurrent> {
    const cacheKey = `weather_cur_${latitude.toFixed(3)}_${longitude.toFixed(3)}`;
    if (!forceRefresh) {
      const cached = getCached<WeatherCurrent>(cacheKey, 300_000); // 5 min TTL
      if (cached) return cached;
    }
    const res = await fetch(`${API_BASE_URL}/weather/current?latitude=${latitude}&longitude=${longitude}`);
    const data = await handleResponse<WeatherCurrent>(res);
    setCached(cacheKey, data);
    return data;
  },

  async getWeatherForecast(latitude: number, longitude: number, days: number = 7, forceRefresh = false): Promise<{ forecast: WeatherForecastDay[] }> {
    const cacheKey = `weather_fc_${latitude.toFixed(3)}_${longitude.toFixed(3)}_${days}`;
    if (!forceRefresh) {
      const cached = getCached<{ forecast: WeatherForecastDay[] }>(cacheKey, 600_000); // 10 min TTL
      if (cached) return cached;
    }
    const res = await fetch(`${API_BASE_URL}/weather/forecast?latitude=${latitude}&longitude=${longitude}&days=${days}`);
    const data = await handleResponse<{ forecast: WeatherForecastDay[] }>(res);
    setCached(cacheKey, data);
    return data;
  },

  async getFarmWeather(farmId: number, forceRefresh = false): Promise<any> {
    const cacheKey = `weather_farm_${farmId}`;
    if (!forceRefresh) {
      const cached = getCached<any>(cacheKey, 300_000);
      if (cached) return cached;
    }
    const res = await fetch(`${API_BASE_URL}/weather/farm/${farmId}`);
    const data = await handleResponse<any>(res);
    setCached(cacheKey, data);
    return data;
  },

  async getWeatherIntelligence(farmId: number, forceRefresh = false): Promise<WeatherIntelligenceResponse> {
    const cacheKey = `weather_intel_${farmId}`;
    if (!forceRefresh) {
      const cached = getCached<WeatherIntelligenceResponse>(cacheKey, 180_000); // 3 min TTL
      if (cached) return cached;
    }
    const res = await fetch(`${API_BASE_URL}/weather/intelligence/${farmId}`);
    const data = await handleResponse<WeatherIntelligenceResponse>(res);
    setCached(cacheKey, data);
    return data;
  },

  async runQuantumWeatherScenario(payload: QuantumWeatherScenarioRequest): Promise<QuantumWeatherScenarioResponse> {
    const res = await fetch(`${API_BASE_URL}/quantum/weather-scenario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<QuantumWeatherScenarioResponse>(res);
  },

  async getWeatherRadar(farmId: number, forceRefresh = false): Promise<any> {
    const cacheKey = `weather_radar_${farmId}`;
    if (!forceRefresh) {
      const cached = getCached<any>(cacheKey, 180_000);
      if (cached) return cached;
    }
    const res = await fetch(`${API_BASE_URL}/weather/radar/${farmId}`);
    const data = await handleResponse<any>(res);
    setCached(cacheKey, data);
    return data;
  },


  // Satellite & Crop Health - 10 min cache
  async getSatelliteCropHealth(fieldId: number, forceRefresh = false): Promise<any> {
    const cacheKey = `sat_crop_${fieldId}`;
    if (!forceRefresh) {
      const cached = getCached<any>(cacheKey, 600_000); // 10 min TTL
      if (cached) return cached;
    }
    const res = await fetch(`${API_BASE_URL}/satellite/crop-health/${fieldId}`);
    const data = await handleResponse<any>(res);
    setCached(cacheKey, data);
    return data;
  },

  // Benchmarks & Quantum - 15 min cache
  async getBenchmarks(forceRefresh = false): Promise<BenchmarkResponse> {
    const cacheKey = "benchmarks_data";
    if (!forceRefresh) {
      const cached = getCached<BenchmarkResponse>(cacheKey, 900_000);
      if (cached) return cached;
    }
    const res = await fetch(`${API_BASE_URL}/models/benchmark`);
    const data = await handleResponse<BenchmarkResponse>(res);
    setCached(cacheKey, data);
    return data;
  },

  async runBenchmark(sampleCount: number = 130, randomSeed: number = 42): Promise<BenchmarkResponse> {
    const res = await fetch(`${API_BASE_URL}/models/benchmark/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sample_count: sampleCount, random_seed: randomSeed, test_size: 0.25 }),
    });
    const data = await handleResponse<BenchmarkResponse>(res);
    setCached("benchmarks_data", data);
    return data;
  },

  async getModelPredictions(modelId: string): Promise<BenchmarkScatterPoint[]> {
    const res = await fetch(`${API_BASE_URL}/models/${encodeURIComponent(modelId)}/predictions`);
    return handleResponse<BenchmarkScatterPoint[]>(res);
  },

  async getModelResiduals(modelId: string): Promise<BenchmarkResidualPoint[]> {
    const res = await fetch(`${API_BASE_URL}/models/${encodeURIComponent(modelId)}/residuals`);
    return handleResponse<BenchmarkResidualPoint[]>(res);
  },

  async getQuantumCircuit(forceRefresh = false): Promise<any> {
    const cacheKey = "quantum_circuit";
    if (!forceRefresh) {
      const cached = getCached<any>(cacheKey, 1_800_000); // 30 min TTL
      if (cached) return cached;
    }
    const res = await fetch(`${API_BASE_URL}/models/quantum-circuit`);
    const data = await handleResponse<any>(res);
    setCached(cacheKey, data);
    return data;
  },

  async getQuantumKernelMatrix(samples: number = 16, forceRefresh = false): Promise<QuantumKernelMatrix> {
    const cacheKey = `quantum_kernel_${samples}`;
    if (!forceRefresh) {
      const cached = getCached<QuantumKernelMatrix>(cacheKey, 900_000); // 15 min TTL
      if (cached) return cached;
    }
    const res = await fetch(`${API_BASE_URL}/models/kernel-matrix?samples=${samples}`);
    const data = await handleResponse<QuantumKernelMatrix>(res);
    setCached(cacheKey, data);
    return data;
  },

  // Agricultural Data
  async getDataPreview(page: number = 1, pageSize: number = 15, crop?: string): Promise<any> {
    const cropParam = crop ? `&crop=${encodeURIComponent(crop)}` : "";
    const res = await fetch(`${API_BASE_URL}/data/preview?page=${page}&page_size=${pageSize}${cropParam}`);
    return handleResponse<any>(res);
  },

  async uploadCSV(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE_URL}/data/upload-csv`, {
      method: "POST",
      body: formData,
    });
    return handleResponse<any>(res);
  },

  // Reports
  async generateReport(farmId: number, crop: string = "Winter Wheat"): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/reports/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farm_id: farmId, crop }),
    });
    return handleResponse<any>(res);
  },

  // User & Profile
  async getMe(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/me`);
    return handleResponse<any>(res);
  },

  // Unified Farm Setup & Analysis
  async setupFarm(payload: {
    farm_name: string;
    location: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    latitude: number;
    longitude: number;
    total_area_hectares: number;
    area_unit?: string;
    crop_name: string;
    crop_variety?: string;
    season?: string;
    planting_date?: string;
    expected_harvest_date?: string;
    growth_stage?: string;
    cultivated_area_hectares?: number;
    soil_nitrogen: number;
    soil_phosphorus: number;
    soil_potassium: number;
    soil_ph: number;
    soil_moisture: number;
    organic_matter?: number;
    soil_type?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/farms/setup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  async getFarmAnalysis(farmId: number): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/farms/${farmId}/analysis`);
    return handleResponse<any>(res);
  },

  async getFarmCropHealth(farmId: number): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/crop-health/${farmId}`);
    return handleResponse<any>(res);
  },

  async getFarmRisk(farmId: number): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/risk/${farmId}`);
    return handleResponse<any>(res);
  },

  async getFarmRecommendations(farmId: number): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/recommendations/${farmId}`);
    return handleResponse<any>(res);
  },

  async getFarmLatestSatellite(farmId: number): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/satellite/latest/${farmId}`);
    return handleResponse<any>(res);
  },

  async getFarmHistory(farmId: number): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/history/${farmId}`);
    return handleResponse<any>(res);
  },

  async recordHarvestResult(payload: {
    farm_id: number;
    field_id?: number;
    crop_name: string;
    season_year: string;
    actual_yield: number;
    predicted_yield?: number;
    actual_nitrogen?: number;
    actual_water_mm?: number;
    notes?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/harvest-results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  async getHarvestHistory(farmId: number): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/harvest-results/${farmId}`);
    return handleResponse<any[]>(res);
  },

  async runOptimizationScenario(payload: OptimizationScenarioRequest): Promise<OptimizationScenarioResponse> {
    const res = await fetch(`${API_BASE_URL}/optimization/scenario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<OptimizationScenarioResponse>(res);
  },

  async getFarmWeatherImpact(farmId: number): Promise<FarmWeatherImpactResponse> {
    const res = await fetch(`${API_BASE_URL}/farms/${farmId}/weather-impact`);
    return handleResponse<FarmWeatherImpactResponse>(res);
  },
};

// ---------------------------------------------------------------------------
// Optimization & Weather Impact Data Models
// ---------------------------------------------------------------------------
export interface OptimizationScenarioRequest {
  objective_type?: "maximum_yield" | "minimum_cost" | "minimum_water" | "balanced_plan";
  current_nitrogen: number;
  current_phosphorus: number;
  current_potassium: number;
  soil_moisture: number;
  rainfall: number;
  ndvi: number;
  budget_limit_usd_ha?: number;
  target_yield_q_acre?: number;
}

export interface OptimizationSolutionItem {
  method: string;
  nitrogen_kg_ha: number;
  phosphorus_kg_ha: number;
  potassium_kg_ha: number;
  irrigation_mm: number;
  predicted_yield_q_acre: number;
  predicted_yield_t_ha: number;
  input_cost_usd_ha: number;
  objective_score: number;
  runtime_ms: number;
  iterations?: number;
  tunneling_steps?: number;
  status: string;
}

export interface OptimizationScenarioResponse {
  objective: string;
  classical_solution: OptimizationSolutionItem;
  quantum_inspired_solution: OptimizationSolutionItem;
  objective_delta: number;
  runtime_ratio: number;
  superior_method: string;
  scientific_assessment: string;
  constraints: Record<string, any>;
  timestamp: string;
}

export interface WeatherImpactScenarioItem {
  scenario_id: string;
  name: string;
  description: string;
  temperature_shift_c: number;
  rainfall_shift_pct: number;
  classical_yield_q_acre: number;
  quantum_yield_q_acre: number;
  yield_delta_q_acre: number;
  risk_level: string;
  scientific_rationale: string;
}

export interface FarmWeatherImpactResponse {
  farm_id: number;
  farm_name: string;
  observed_weather: {
    temperature_c: number;
    precipitation_mm: number;
    conditions: string;
  };
  baseline_classical_yield: number;
  baseline_quantum_yield: number;
  stress_simulations: WeatherImpactScenarioItem[];
  model_type_disclaimer: string;
  timestamp: string;
}


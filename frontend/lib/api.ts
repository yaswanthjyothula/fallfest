/**
 * AgriQuantum Centralized Typed API Client
 * Connects Next.js Frontend directly to FastAPI Gateway (/api/v1/)
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

export interface BenchmarkModelMetrics {
  r2_score: number;
  rmse: number;
  mae: number;
  training_time_seconds: number;
  inference_time_seconds: number;
  circuit_qubits?: number;
  circuit_depth?: number;
  feature_map?: string;
  n_estimators?: number;
  kernel_type?: string;
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
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    return handleResponse<any>(res);
  },

  async getSupabaseStatus() {
    const res = await fetch(`${API_BASE_URL}/supabase/status`);
    return handleResponse<any>(res);
  },

  // Farms
  async getFarms(): Promise<Farm[]> {
    const res = await fetch(`${API_BASE_URL}/farms`);
    return handleResponse<Farm[]>(res);
  },

  async getFarm(id: number): Promise<Farm> {
    const res = await fetch(`${API_BASE_URL}/farms/${id}`);
    return handleResponse<Farm>(res);
  },

  async createFarm(payload: Partial<Farm>): Promise<Farm> {
    const res = await fetch(`${API_BASE_URL}/farms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<Farm>(res);
  },

  async updateFarm(id: number, payload: Partial<Farm>): Promise<Farm> {
    const res = await fetch(`${API_BASE_URL}/farms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<Farm>(res);
  },

  async deleteFarm(id: number): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/farms/${id}`, { method: "DELETE" });
    return handleResponse(res);
  },

  // Fields
  async getFields(farmId?: number): Promise<Field[]> {
    const url = farmId ? `${API_BASE_URL}/fields?farm_id=${farmId}` : `${API_BASE_URL}/fields`;
    const res = await fetch(url);
    return handleResponse<Field[]>(res);
  },

  async createField(farmId: number, payload: Partial<Field>): Promise<Field> {
    const res = await fetch(`${API_BASE_URL}/farms/${farmId}/fields`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<Field>(res);
  },

  async updateField(id: number, payload: Partial<Field>): Promise<Field> {
    const res = await fetch(`${API_BASE_URL}/fields/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<Field>(res);
  },

  async deleteField(id: number): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/fields/${id}`, { method: "DELETE" });
    return handleResponse(res);
  },

  // Crops
  async getCrops(fieldId?: number): Promise<Crop[]> {
    const url = fieldId ? `${API_BASE_URL}/fields/${fieldId}/crops` : `${API_BASE_URL}/crops`;
    const res = await fetch(url);
    return handleResponse<Crop[]>(res);
  },

  async addCrop(fieldId: number, payload: Partial<Crop>): Promise<Crop> {
    const res = await fetch(`${API_BASE_URL}/fields/${fieldId}/crops`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<Crop>(res);
  },

  // Prediction
  async predictYield(payload: YieldPredictionInput): Promise<YieldPredictionOutput> {
    const res = await fetch(`${API_BASE_URL}/predictions/yield`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<YieldPredictionOutput>(res);
  },

  async getPredictionHistory(limit: number = 10): Promise<YieldPredictionOutput[]> {
    const res = await fetch(`${API_BASE_URL}/predictions/history?limit=${limit}`);
    return handleResponse<YieldPredictionOutput[]>(res);
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

  // Weather (Visual Crossing)
  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherCurrent> {
    const res = await fetch(`${API_BASE_URL}/weather/current?latitude=${latitude}&longitude=${longitude}`);
    return handleResponse<WeatherCurrent>(res);
  },

  async getWeatherForecast(latitude: number, longitude: number, days: number = 7): Promise<{ forecast: WeatherForecastDay[] }> {
    const res = await fetch(`${API_BASE_URL}/weather/forecast?latitude=${latitude}&longitude=${longitude}&days=${days}`);
    return handleResponse<{ forecast: WeatherForecastDay[] }>(res);
  },

  async getFarmWeather(farmId: number): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/weather/farm/${farmId}`);
    return handleResponse<any>(res);
  },

  // Satellite & Crop Health
  async getSatelliteCropHealth(fieldId: number): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/satellite/crop-health/${fieldId}`);
    return handleResponse<any>(res);
  },

  // Benchmarks & Quantum
  async getBenchmarks(): Promise<Record<string, BenchmarkModelMetrics>> {
    const res = await fetch(`${API_BASE_URL}/models/benchmark`);
    return handleResponse<Record<string, BenchmarkModelMetrics>>(res);
  },

  async getQuantumCircuit(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/models/quantum-circuit`);
    return handleResponse<any>(res);
  },

  async getQuantumKernelMatrix(samples: number = 16): Promise<QuantumKernelMatrix> {
    const res = await fetch(`${API_BASE_URL}/models/kernel-matrix?samples=${samples}`);
    return handleResponse<QuantumKernelMatrix>(res);
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
};

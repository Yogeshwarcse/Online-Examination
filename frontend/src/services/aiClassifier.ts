import { wasteApi } from "../api/wasteApi";
import type { WastePrediction, CategoryDetails } from "../types";

export async function classifyWaste(imageFile: File): Promise<WastePrediction> {
  const predictedCategory: string = await wasteApi.classifyWaste(imageFile);

  const confidence = 0.9; // Placeholder until backend sends real confidence

  // Fetch the actual category details from backend API
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const resp = await fetch(`${API_BASE}/waste_categories?name=${encodeURIComponent(predictedCategory)}`);
  let categoryData = null;
  if (resp.ok) {
    categoryData = await resp.json();
  } else {
    // fallback empty category
    categoryData = {
      name: predictedCategory,
      description: '',
      environmental_impact: 0,
      points_value: 0,
      co2_impact_kg: 0,
      icon_name: '',
      color: '',
      created_at: new Date().toISOString()
    };
  }

  const categoryDetails: CategoryDetails = {
    id: categoryData._id || categoryData.id || null,
    name: categoryData.name,
    description: categoryData.description,
    environmental_impact: categoryData.environmental_impact,
    points_value: categoryData.points_value,
    co2_impact_kg: categoryData.co2_impact_kg,
    icon_name: categoryData.icon_name,
    color: categoryData.color,
    created_at: categoryData.created_at,
  };

  return {
    category: predictedCategory,
    confidence,
    categoryDetails,
  };
}

// Enhanced AI Natural Language Car Assistant & Specification Service (Backend Integrated)
import businessApi from "./businessApi";

let liveCatalogCache = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export const getLiveCatalogModels = async () => {
  const now = Date.now();
  if (liveCatalogCache && (now - cacheTimestamp < CACHE_TTL_MS)) {
    return liveCatalogCache;
  }

  try {
    const response = await businessApi.get("/vehicles", { params: { page: 0, size: 100 } });
    const content = response?.data?.content || [];

    // Group variants by modelId
    const modelMap = new Map();
    content.forEach((v) => {
      const modelId = v.modelId || v.variantId;
      if (!modelMap.has(modelId)) {
        const priceNum = Number(v.basePrice || 0);
        const priceFormatted = priceNum >= 100000
          ? `₹ ${(priceNum / 100000).toFixed(2)} Lakh*`
          : `₹ ${priceNum.toLocaleString("en-IN")}`;

        modelMap.set(modelId, {
          id: modelId,
          name: v.model || v.variant,
          brandName: v.brand,
          bodyType: v.bodyType || "SUV",
          engine: "1.2L - 2.0L Engine",
          power: "85 - 170 bhp",
          torque: "110 - 250 Nm",
          mileage: "16.5 - 24.8 kmpl",
          seating: "5 Seater",
          safety: "5 Star NCAP",
          minPrice: priceNum,
          priceFormatted,
          image: v.thumbnail || `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#1e293b"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="32">🚘</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Vehicle Preview</text></svg>')}`,
          description: `${v.brand} ${v.model || v.variant} with modern features and premium safety.`
        });
      }
    });

    liveCatalogCache = Array.from(modelMap.values());
    cacheTimestamp = now;
    return liveCatalogCache;
  } catch (err) {
    console.error("Failed to fetch live catalog models:", err);
    return liveCatalogCache || [];
  }
};

export const parseNaturalLanguageCarQuery = async (query, history = [], lastFilters = null) => {
  if (!query || !query.trim()) return null;

  try {
    const payload = {
      query: query.trim(),
      history: (history || []).slice(-6).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        text: (m.text || "").substring(0, 300)
      })),
      lastFilters: lastFilters || null
    };

    const res = await businessApi.post("/ai/search-vehicles", payload);
    if (res && res.data) {
      const data = res.data;
      const filters = data.extractedFilters || {};
      const confidence = data.confidence !== undefined ? data.confidence : 0.8;
      const explanation = data.reply || data.explanation || data.message;
      const backendVehicles = data.vehicles || [];
      const intent = data.intent || "UNKNOWN";
      const quickReplies = data.quickReplies || [];
      const status = data.status || "SUCCESS";

      return await enrichResult(
        {
          ...filters,
          extractedFilters: filters,
          confidence,
          aiExplanation: explanation,
          reply: explanation,
          backendVehicles,
          intent,
          quickReplies,
          status
        },
        query
      );
    }
  } catch (err) {
    console.warn("Backend AI endpoint call failed, using client fallback parser:", err);
  }

  // Client-side Fallback Parser
  const ruleResult = fallbackRuleParser(query);
  return await enrichResult({
    ...ruleResult,
    extractedFilters: ruleResult,
    intent: ruleResult.confidence > 0 ? "SEARCH" : "UNKNOWN",
    reply: ruleResult.confidence > 0 ? "Searching vehicles based on your criteria:" : "I am an AutoCart Car Advisor. How can I help you find a vehicle?",
    quickReplies: [
      { label: "🚙 SUVs under 15 Lakh", query: "SUVs under 15 Lakh" },
      { label: "💰 Cars under 10 Lakh", query: "Cars under 10 Lakh" },
      { label: "⚡ Electric Cars", query: "Electric cars" }
    ],
    status: "SUCCESS"
  }, query);
};

const enrichResult = async (result, query) => {
  const isSearchIntent = result.intent === "SEARCH" || result.intent === "FOLLOW_UP";
  const hasVehicles = Array.isArray(result.backendVehicles) && result.backendVehicles.length > 0;
  let matchedModel = null;

  // Show the model spec card only when the intent is SEARCH or FOLLOW_UP
  // and the response contains at least one real matched vehicle. Never fall back to a default model.
  if (isSearchIntent && hasVehicles) {
    const liveModels = await getLiveCatalogModels();
    const firstVehicle = result.backendVehicles[0];
    matchedModel = liveModels.find((m) => m.id === firstVehicle.modelId || m.name.toLowerCase() === firstVehicle.model?.toLowerCase());
    if (!matchedModel && firstVehicle) {
      const priceNum = Number(firstVehicle.basePrice || 0);
      matchedModel = {
        id: firstVehicle.modelId || firstVehicle.variantId,
        name: firstVehicle.model || firstVehicle.variant,
        brandName: firstVehicle.brand,
        bodyType: firstVehicle.bodyType || "SUV",
        engine: "1.2L Engine",
        power: "88.5 bhp",
        torque: "110 Nm",
        mileage: "18.5 kmpl",
        seating: "5 Seater",
        safety: "5 Star NCAP",
        minPrice: priceNum,
        priceFormatted: priceNum >= 100000 ? `₹ ${(priceNum / 100000).toFixed(2)} Lakh*` : `₹ ${priceNum.toLocaleString("en-IN")}`,
        image: firstVehicle.thumbnail || `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#1e293b"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="32">🚘</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Vehicle Preview</text></svg>')}`
      };
    }
  }

  const finalReply = result.reply || result.aiExplanation || "Here is what I found for you.";

  return {
    ...result,
    matchedModel,
    reply: finalReply,
    aiExplanation: finalReply
  };
};

const fallbackRuleParser = (query) => {
  const q = query.toLowerCase();
  let brand = null;
  let bodyType = null;
  let fuelType = null;
  let transmission = null;
  let minPrice = null;
  let maxPrice = null;
  let confidence = 0.0;
  let matchesCount = 0;

  if (q.includes("honda")) { brand = "Honda"; matchesCount++; }
  else if (q.includes("mahindra")) { brand = "Mahindra"; matchesCount++; }
  else if (q.includes("mg")) { brand = "MG Motor"; matchesCount++; }
  else if (q.includes("toyota")) { brand = "Toyota"; matchesCount++; }
  else if (q.includes("volkswagen") || q.includes("vw") || q.includes("volkswagon")) { brand = "Volkswagen"; matchesCount++; }
  else if (q.includes("maruti") || q.includes("suzuki") || q.includes("swift")) { brand = "Maruti Suzuki"; matchesCount++; }
  else if (q.includes("hyundai") || q.includes("creta")) { brand = "Hyundai"; matchesCount++; }
  else if (q.includes("tata") || q.includes("nexon")) { brand = "Tata"; matchesCount++; }
  else if (q.includes("bmw")) { brand = "BMW"; matchesCount++; }
  else if (q.includes("mercedes")) { brand = "Mercedes-Benz"; matchesCount++; }

  if (q.includes("suv")) { bodyType = "SUV"; matchesCount++; }
  else if (q.includes("sedan")) { bodyType = "SEDAN"; matchesCount++; }
  else if (q.includes("hatchback")) { bodyType = "HATCHBACK"; matchesCount++; }
  else if (q.includes("muv") || q.includes("mpv")) { bodyType = "MUV"; matchesCount++; }

  if (q.includes("petrol")) { fuelType = "PETROL"; matchesCount++; }
  else if (q.includes("diesel")) { fuelType = "DIESEL"; matchesCount++; }
  else if (q.includes("cng")) { fuelType = "CNG"; matchesCount++; }
  else if (q.includes("electric") || q.includes("ev")) { fuelType = "ELECTRIC"; matchesCount++; }

  if (q.includes("automatic") || q.includes("auto") || q.includes("cvt") || q.includes("amt")) {
    transmission = "AUTOMATIC";
    matchesCount++;
  } else if (q.includes("manual") || q.includes("mt")) {
    transmission = "MANUAL";
    matchesCount++;
  }

  const lakhUnderMatch = q.match(/(?:under|below|less than|max|up to)\s*₹?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l)/i);
  if (lakhUnderMatch) {
    maxPrice = parseFloat(lakhUnderMatch[1]) * 100000;
    matchesCount++;
  }

  if (matchesCount > 0) {
    confidence = Math.min(1.0, 0.4 + matchesCount * 0.2);
  }

  return {
    brand,
    bodyType,
    fuelType,
    transmission,
    minPrice,
    maxPrice,
    confidence
  };
};

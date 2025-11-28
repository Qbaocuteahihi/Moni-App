import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyBHguKTgTM5StzXIXTXFA7-sbJOoUeyE-4";

export const getGeminiAnalysis = async (summaryData) => {
  try {
    console.log("Sending to Gemini:", summaryData);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Thử model names theo thứ tự ưu tiên
    const modelNames = ["gemini-1.5-flash", "gemini-1.5", "gemini-1.0"];

    let lastError = null;

    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.7,
          },
        });

        const prompt = `Phân tích chi tiêu bằng tiếng Việt: Tổng ${summaryData.totalMonth.toLocaleString(
          "vi-VN"
        )} VND, danh mục chính ${summaryData.topCategory.name} (${
          summaryData.topCategory.percent
        }%), so tháng trước ${
          summaryData.compare
        }%. Phân tích ngắn gọn, tích cực, dưới 100 từ.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        console.log(`Success with model: ${modelName}`);
        console.log("Gemini response:", text);
        return text;
      } catch (error) {
        console.log(`Model ${modelName} failed:`, error.message);
        lastError = error;
        continue; // Thử model tiếp theo
      }
    }

    // Nếu tất cả models đều fail
    throw lastError;
  } catch (error) {
    console.error("All Gemini models failed:", error);
    return generateFallbackAnalysis(summaryData);
  }
};

const generateFallbackAnalysis = (summaryData) => {
  const { totalMonth, topCategory, compare } = summaryData;

  const isIncrease = compare.includes("+");
  const isDecrease = compare.includes("-");

  let trend = "";
  let advice = "";

  if (isIncrease) {
    trend = `tăng ${compare}`;
    advice = "Hãy xem xét kiểm soát chi tiêu tốt hơn!";
  } else if (isDecrease) {
    trend = `giảm ${compare.replace("-", "")}`;
    advice = "Tiếp tục phát huy nhé!";
  } else {
    trend = "ổn định";
    advice = "Chi tiêu khá ổn định!";
  }

  return `📊 Phân tích chi tiêu:\n• Tổng chi: ${totalMonth.toLocaleString(
    "vi-VN"
  )} VND\n• Danh mục chính: ${topCategory.name} (${
    topCategory.percent
  }%)\n• So tháng trước: ${trend}\n💡 ${advice}`;
};

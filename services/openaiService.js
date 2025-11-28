import axios from "axios";

import { OPENAI_API_KEY } from "@env";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export const getAIAnalysis = async (summaryData) => {
  try {
    console.log("Sending to OpenAI:", summaryData);

    const prompt = `
      Dựa trên các số liệu chi tiêu sau, hãy viết một phân tích ngắn gọn, thân thiện và hữu ích bằng tiếng Việt:
      
      Tổng chi tháng này: ${summaryData.totalMonth.toLocaleString()} VND
      Danh mục chi nhiều nhất: ${summaryData.topCategory.name} (${
      summaryData.topCategory.percent
    }%)
      So với tháng trước: ${summaryData.compare}%
      
      Hãy:
      - Phân tích xu hướng chi tiêu
      - Đưa ra lời khuyên ngắn gọn
      - Giữ giọng điệu tích cực, động viên
      - Dưới 100 từ
      - Chỉ trả về nội dung phân tích, không thêm tiêu đề hay giải thích
    `;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo", // Hoặc "gpt-4" nếu có
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    console.log("OpenAI response:", response.data);
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI API Error:", error.response?.data || error.message);
    throw new Error("Không thể kết nối với AI. Vui lòng thử lại sau.");
  }
};


import { GoogleGenAI, Type } from "@google/genai";
import { Task, AIAnalysisResult } from "../types";

export const analyzeTasks = async (tasks: Task[]): Promise<AIAnalysisResult> => {
  if (tasks.length === 0) {
    return {
      summary: "คุณยังไม่มีงานค้างเลย เริ่มเพิ่มงานเพื่อรับการวิเคราะห์จาก AI ได้ทันที",
      priorityTasks: [],
      suggestedSchedule: [],
      workloadScore: 0
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `วิเคราะห์ภาระงานต่อไปนี้และให้คำแนะนำลำดับความสำคัญ:
    ${JSON.stringify(tasks.map(t => ({
      title: t.title,
      dueDate: t.dueDate,
      priority: t.priority,
      status: t.status,
      description: t.description
    })))}
    
    โปรดสรุปความเร่งด่วน แนะนำลำดับการทำงานที่เหมาะสมที่สุดเพื่อให้เสร็จทันเวลา และให้คะแนนภาระงานรวม (1-10)`;

  try {
    // Upgrade: Use gemini-3-pro-preview for complex reasoning tasks like scheduling and analysis.
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'ภาพรวมของภาระงานค้าง' },
            priorityTasks: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'รายชื่อชื่องานที่ควรทำทันที'
            },
            suggestedSchedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  taskTitle: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["taskTitle", "reason"]
              }
            },
            workloadScore: { type: Type.NUMBER, description: 'คะแนนภาระงาน 1-10' }
          },
          required: ["summary", "priorityTasks", "suggestedSchedule", "workloadScore"]
        }
      }
    });

    // Fix: access text property directly and handle potential undefined value before parsing
    const text = response.text;
    if (!text) {
      throw new Error("ไม่ได้รับข้อมูลการวิเคราะห์จาก AI");
    }
    const result = JSON.parse(text);
    return result;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้ โปรดลองอีกครั้งภายหลัง");
  }
};

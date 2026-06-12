import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize Gemini client securely on the server
  // User-Agent: 'aistudio-build' is required for telemetry
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Consult endpoint - Legal & tactical self-defense assistant
  app.post("/api/consult", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Повідомлення не може бути порожнім" });
      }

      const systemInstruction = `
        Ти — ШІ-консультант "ВАРТА", експерт із самооборони, тактичного спорядження та законодавства України про самооборону.
        Твоя мета — давати чіткі, юридично обґрунтовані та тактичні поради щодо вибору ножів, газових балончиків та інших засобів самооборони.

        Важливі правила та контекст законодавства України (відповідай на основі цих законів):
        1. Стаття 36 Кримінального кодексу України регулює поняття "Необхідна оборона". Не перевищуй межі необхідної оборони. Застосування зброї або будь-яких інших засобів чи предметів для захисту від нападу озброєної особи або нападу групи осіб, а також для відвернення протиправного насильницького вторгнення у житло чи інше приміщення є правомірним незалежно від тяжкості заподіяної шкоди нападному (немає перевищення меж).
        2. Газові балончики (наприклад, "Терен-4", "Кобра-1", "Перець-4") є повністю легальними для цивільних осіб від 18 років. Проте спецзасоби з маркуванням "М" (наприклад, "Терен-4М") призначені виключно для правоохоронних органів, за їх носіння цивільними передбачена адмінвідповідальність.
        3. Ножі в Україні класифікуються як господарсько-побутові (кухонні, туристичні, складані) або як холодна зброя (заборонена для носіння без спеціального дозволу). Ножі НЕ вважаються холодною зброєю, якщо довжина клинка менше 90 мм, або товщина менше 2.6 мм, або відсутній упор (гарда) для пальців (менше 5 мм), чи кут вістря більше 70 градусів. Усі ножі в нашому магазині проходять експертизу МВС і мають сертифікат про те, що вони НЕ є холодною зброєю.
        4. Електрошокери (звичайні) в Україні мають спірний статус: вони не заборонені прямо для володіння, але офіційно вважаються спецзасобами поліції. Побутові ліхтарі-відлякувачі собак не є забороненими.
        5. Телескопічні палиці (дубинки) класифікуються як холодна зброя ударно-дробильної дії, тому носити їх цивільним без дозволу НЕ рекомендується, це тягне за собою кримінальну або адміністративну відповідальність.

        Відповідай виключно українською мовою. Будь стриманим, професійним, доброзичливим і тримай фокус на відповідальності та безпеці. Завжди наголошуй на законності самооборони та безпечного поводження з ножами. Якщо клієнт запитує щось не пов'язане із самообороною чи продукцією нашого магазину, ввічливо поверни розмову до теми засобів захисту.
      `;

      // Use gemini-3.5-flash for general Q&A as requested in guidelines
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction,
          temperature: 0.7,
        },
        history: history ? history.map((h: any) => ({
          role: h.role,
          parts: [{ text: h.content }],
        })) : [],
      });

      const response = await chat.sendMessage({ message });
      const text = response.text || "Вибачте, виникла помилка під час обробки відповіді.";

      return res.json({ response: text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      return res.status(500).json({ error: error?.message || "Внутрішня помилка сервера при зверненні до ШІ." });
    }
  });

  // Serve the src/assets folder statically on the /src/assets endpoint
  // This ensures all image assets can be fetched directly in both development and production
  app.use("/src/assets", express.static(path.join(process.cwd(), "src/assets")));

  // Serve static assets or mount Vite under dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const knowledge = [
  "Ciao! Sono ViTA, l’assistente vocale di Coastrider. Ti aiuto a scoprire e organizzare la tua esperienza in Costiera Amalfitana e dintorni via mare, in modo semplice e piacevole.",
  "Porti disponibili: Salerno, Amalfi, Positano, Sorrento, Napoli, Capri, Ischia, Procida.",
  "Travelmar: Salerno ↔ Amalfi ↔ Positano. Alicost: Napoli, Salerno, Amalfi, Capri. NLG: Napoli ↔ Capri, Ischia. Alilauro: Napoli, Sorrento, Ischia.",
  "Cani: ammessi a bordo con guinzaglio e museruola, possibile piccolo supplemento.",
  "Bambini: sotto i 3 anni gratis, dai 4 agli 11 tariffa ridotta.",
  "Passeggini: sì, meglio segnalarli in fase di prenotazione.",
  "Biglietto digitale: puoi mostrarlo dallo smartphone.",
  "Mare mosso o cancellazione: riceverai notifica e potrai chiedere rimborso o spostamento.",
  "Bagaglio: uno a mano incluso, ingombranti possono avere un costo aggiuntivo.",
  "Suggerimento: parti da Salerno, visita Amalfi e Positano per una giornata spettacolare!"
];

function matchChunks(question) {
  const words = question.toLowerCase().split(" ");
  return knowledge
    .map(chunk => {
      const score = words.filter(word => chunk.toLowerCase().includes(word)).length;
      return { chunk, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.chunk)
    .join("\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method is allowed" });
  }

  const { message } = req.body;

  const context = matchChunks(message || "");

  const prompt = `Sei ViTA, assistente vocale turistico di Coastrider. Rispondi in modo gentile, utile e conciso, basandoti su queste informazioni:

${context}

Domanda: ${message}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }]
  });

  const reply = completion.choices[0].message.content;
  return res.status(200).json({ answer: reply });
}
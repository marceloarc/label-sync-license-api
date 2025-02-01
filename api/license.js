import { readFile } from "fs/promises";
import { join } from "path";
import { parse } from "url";
import { format } from "date-fns";
import { addDays } from 'date-fns';
import { addMonths } from 'date-fns';
import { addYears } from 'date-fns';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ error: "Chave não fornecida" });
    }

    // Carregar keys.json
    const filePath = join(process.cwd(), "keys.json");
    const data = JSON.parse(await readFile(filePath, "utf-8"));

    // Encontrar a chave
    const keyData = data.keys.find((k) => k.key === key);
    if (!keyData) {
      return res.status(404).json({ error: "Chave não encontrada" });
    }

    // Calcular a data de expiração
    const now = new Date();
    const { days, months, years } = keyData.duration;
    let expiresAt = now;
    if (days) expiresAt = addDays(expiresAt, days);
    if (months) expiresAt = addMonths(expiresAt, months);
    if (years) expiresAt = addYears(expiresAt, years);

    return res.status(200).json({
      key: keyData.key,
      expires_at: format(expiresAt, "yyyy-MM-dd HH:mm:ss"),
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
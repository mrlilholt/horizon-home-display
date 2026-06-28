import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { getCalendarPayload } from "./calendarService.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3333;
const distPath = path.resolve(process.cwd(), "dist");

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "Horizon Home Display API"
  });
});

app.get("/api/events", async (_req, res) => {
  const payload = await getCalendarPayload();

  res.json(payload);
});

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get(/^(?!\/api).*/, (req, res) => {
    if (req.path.startsWith("/api")) {
      return;
    }

    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Horizon Home Display API running on port ${port}`);
});

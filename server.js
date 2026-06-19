const express = require("express");
const app = express();

app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "diones_token_123";

app.get("/", (req, res) => {
  res.send("API Messenger funcionando");
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", (req, res) => {
  console.log("Evento recebido:", JSON.stringify(req.body, null, 2));
  res.status(200).send("EVENT_RECEIVED");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

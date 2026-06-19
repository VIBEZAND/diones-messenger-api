const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.get("/", (req, res) => {
  res.send("API Messenger funcionando");
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    console.log("Evento recebido:", JSON.stringify(body, null, 2));

    if (body.object === "page") {
      for (const entry of body.entry) {
        const events = entry.messaging || [];

        for (const event of events) {
          if (event.message && event.sender) {
            const senderId = event.sender.id;
            const texto = event.message.text || "";

            await axios.post(
              `https://graph.facebook.com/v25.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
              {
                recipient: {
                  id: senderId
                },
                message: {
                  text: `Você escreveu: ${texto}`
                }
              }
            );

            console.log("Resposta enviada");
          }
        }
      }
    }

    res.status(200).send("EVENT_RECEIVED");
  } catch (erro) {
    console.error(erro.response?.data || erro.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

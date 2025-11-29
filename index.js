const express = require("express");
const { twiml: { MessagingResponse } } = require("twilio");

const app = express();
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot de WhatsApp del Dr. Berrones está vivo 😎");
});

app.post("/whatsapp", (req, res) => {
  const twiml = new MessagingResponse();

  twiml.message(
    "Hola 👋, soy el asistente del Dr. Berrones. " +
    "Cuéntame brevemente qué te pasa y en breve te contactaremos."
  );

  res.type("text/xml");
  res.send(twiml.toString());
});

app.listen(PORT, () => {
  console.log(⁠ Servidor escuchando en puerto ${PORT} ⁠);
});

const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// Endpoint para probar que la app está viva
app.get("/", (req, res) => {
  res.send("Bot de WhatsApp del Dr. Berrones está vivo 😎");
});

// Endpoint que usaremos después con Twilio
app.post("/whatsapp", (req, res) => {
  const twiml =
    ⁠ <?xml version="1.0" encoding="UTF-8"?> ⁠ +
    ⁠ <Response> ⁠ +
    ⁠ <Message> ⁠ +
    `Hola 👋, soy el asistente del Dr. Berrones. ` +
    ⁠ Cuéntame brevemente qué te pasa y en breve te contactaremos. ⁠ +
    ⁠ </Message> ⁠ +
    ⁠ </Response> ⁠;

  res.type("text/xml");
  res.send(twiml);
});

app.listen(PORT, () => {
  console.log(⁠ Servidor escuchando en puerto ${PORT} ⁠);
});

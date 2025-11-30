const http = require("http");
const querystring = require("querystring");

// Twilio config
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const callerNumber = process.env.TWILIO_CALLER_NUMBER;
const doctorPhone = process.env.DOCTOR_1_PHONE;

let twilioClient = null;
if (accountSid && authToken) {
  twilioClient = require("twilio")(accountSid, authToken);
}

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Probar que la app está viva
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bot de WhatsApp del Dr. Berrones está vivo 😎");
    return;
  }

  // Webhook de Twilio para WhatsApp
  if (req.url === "/whatsapp" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      // body viene como x-www-form-urlencoded
      const params = querystring.parse(body);

      const from = params.From || "";   // número del paciente (formato "whatsapp:+52...")
      const msgBody = params.Body || ""; // texto que mandó

      const pacienteNumber = from.replace("whatsapp:", ""); // "+52..."

      console.log("Mensaje de:", pacienteNumber, "Texto:", msgBody);

      // 1) Responder al paciente en WhatsApp
      const twiml =
        `<?xml version="1.0" encoding="UTF-8"?>` +
        `<Response>` +
        `<Message>` +
        `Hola 👋, soy el asistente del Dr. Berrones. ` +
        `He recibido tu mensaje: "${msgBody}". ` +
        `En breve un doctor de guardia revisará tu caso.` +
        `</Message>` +
        `</Response>`;

      // 2) Llamar al doctor (Versión 1 simple)
      if (twilioClient && callerNumber && doctorPhone) {
        const voiceTwiml =
          `<Response>` +
          `<Say language="es-MX" voice="alice">` +
          `Doctor, tiene un paciente que escribió por WhatsApp. ` +
          `Por favor comuníquese al número ${pacienteNumber}.` +
          `</Say>` +
          `</Response>`;

        twilioClient.calls
          .create({
            to: doctorPhone,
            from: callerNumber,
            twiml: voiceTwiml
          })
          .then(call => {
            console.log("Llamada al doctor iniciada. SID:", call.sid);
          })
          .catch(err => {
            console.error("Error al llamar al doctor:", err.message);
          });
      } else {
        console.log("Twilio no configurado para llamadas (revisa SID/TOKEN/NÚMEROS).");
      }

      // Responder a Twilio (WhatsApp)
      res.writeHead(200, { "Content-Type": "text/xml; charset=utf-8" });
      res.end(twiml);
    });

    return;
  }

  // Cualquier otra ruta
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("No encontrado");
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

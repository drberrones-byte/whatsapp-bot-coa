const http = require("http");
const querystring = require("querystring");

// Twilio config (desde Heroku Config Vars)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const callerNumber = process.env.TWILIO_CALLER_NUMBER; // número Twilio con VOZ (y si quieres SMS también)
const doctorPhone = process.env.DOCTOR_1_PHONE; // número del doctor

let twilioClient = null;
if (accountSid && authToken) {
  twilioClient = require("twilio")(accountSid, authToken);
}

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Mostrar que el servidor está vivo
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bot de WhatsApp del Dr. Berrones está vivo 😎");
    return;
  }

  // Webhook de WhatsApp
  if (req.url === "/whatsapp" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const params = querystring.parse(body);
      const from = params.From || "";         // "whatsapp:+52..."
      const msgBody = params.Body || "";       // mensaje original

      const pacienteNumber = from.replace("whatsapp:", ""); // "+52..."

      console.log("Mensaje de:", pacienteNumber, "Texto:", msgBody);

      // Respuesta al paciente
      const twiml =
        `<?xml version="1.0" encoding="UTF-8"?>` +
        `<Response>` +
        `<Message>` +
        `Hola 👋, soy el asistente del Colegio de Oftalmología de Aguascalientes. ` +
        `He recibido tu mensaje: "${msgBody}". ` +
        `Un doctor de guardia revisará tu caso y se comunicará contigo.` +
        `</Message>` +
        `</Response>`;

      //
      // 📞 Llamada al doctor
      //
      if (twilioClient && callerNumber && doctorPhone) {
        
        // Voice call with pauses + number repeated
        const voiceTwiml =
          `<Response>` +
            `<Say language="es-MX" voice="alice">` +
              `Doctor, tiene un paciente que escribió por WhatsApp.` +
            `</Say>` +
            `<Pause length="1"/>` +
            `<Say language="es-MX" voice="alice">` +
              `El número del paciente es: ${pacienteNumber}.` +
            `</Say>` +
            `<Pause length="1"/>` +
            `<Say language="es-MX" voice="alice">` +
              `Se lo repito. El número del paciente es: ${pacienteNumber}.` +
            `</Say>` +
          `</Response>`;

        // Voice call
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

        //
        // 📩 SMS al doctor (con el número del paciente)
        //
        twilioClient.messages
          .create({
            to: doctorPhone,
            from: callerNumber,    // este número debe permitir SMS
            body: `Paciente por WhatsApp: ${pacienteNumber}. Mensaje: "${msgBody}".`
          })
          .then(msg => console.log("SMS enviado al doctor. SID:", msg.sid))
          .catch(err => console.error("Error enviando SMS al doctor:", err.message));

      } else {
        console.log("Twilio no configurado para llamadas/SMS (SID/TOKEN/NÚMEROS).");
      }

      // Respuesta a Twilio (WhatsApp)
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


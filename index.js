const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bot de WhatsApp del Dr. Berrones está vivo 😎");
  } else if (req.url === "/whatsapp" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const twiml =
        `<?xml version="1.0" encoding="UTF-8"?>` +
        `<Response>` +
        `<Message>` +
        `Hola, soy el asistente virtual del Colegio de Oftalmología de Aguascalientes. ` +
        `Cuéntame brevemente tu nombre y cuál es tu urgencia y en breve te contactaremos.` +
        `</Message>` +
        `</Response>`;

      res.writeHead(200, { "Content-Type": "text/xml; charset=utf-8" });
      res.end(twiml);
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("No encontrado");
  }
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

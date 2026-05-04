import { Resend } from "resend";

export const config = {
  runtime: "nodejs",
};

const resend = new Resend(process.env.RESEND_API_KEY);

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const raw = await new Promise((resolve, reject) => {
      let data = "";

      req.on("data", chunk => {
        data += chunk;
      });

      req.on("end", () => resolve(data));
      req.on("error", reject);
    });

    const body = JSON.parse(raw || "{}");

    // 🟢 Seguridad contra undefined
    const name = normalizeString(body.name);
    const email = normalizeString(body.email);
    const message = normalizeString(body.message);

    // 🧠 Validación básica (IMPORTANTE)
    if (!name || !email || !message) {
      return res.status(400).json({
        error: "Name, email, and message are required"
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address"
      });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    // 📧 Enviar email con Resend
    const data = await resend.emails.send({
      from: "MiniIk <contact@miniik.com>",
      to: "srssdesing@gmail.com",
      subject: `New message from ${name}`,
      replyTo: email,
      html: `
        <h2>New contact form message</h2>
        <p><b>Name:</b> ${safeName}</p>
        <p><b>Email:</b> ${safeEmail}</p>
        <p><b>Message:</b></p>
        <p>${safeMessage}</p>
      `,
    });

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error("ERROR:", error);

    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
}

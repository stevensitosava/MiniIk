import { Resend } from "resend";

export const config = {
  runtime: "nodejs",
};

const resend = new Resend(process.env.RESEND_API_KEY);

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

    console.log("RAW BODY:", raw);

    const body = JSON.parse(raw || "{}");

    // 🟢 Seguridad contra undefined
    const name = body.name || "No name";
    const email = body.email || "No email";
    const message = body.message || "No message";

    // 🧠 Validación básica (IMPORTANTE)
    if (!email || !message) {
      return res.status(400).json({
        error: "Email and message are required"
      });
    }

    // 📧 Enviar email con Resend
    const data = await resend.emails.send({
      from: "MiniIk <contact@miniik.com>",
      to: "srssdesing@gmail.com",
      subject: `New message from ${name}`,
      reply_to: email,
      html: `
        <h2>New contact form message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
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
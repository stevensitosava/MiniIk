import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 🔥 FORZAR lectura correcta del body
    const text = await new Promise((resolve, reject) => {
      let data = "";

      req.on("data", chunk => (data += chunk));
      req.on("end", () => resolve(data));
      req.on("error", reject);
    });

    const body = JSON.parse(text || "{}");

    console.log("BODY RECEIVED:", body);

    const { name, email, message } = body;

    await resend.emails.send({
      from: "MiniIk <contact@miniik.com>",
      to: "srssdesing@gmail.com",
      subject: `New message from ${name}`,
      reply_to: email,
      html: `
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("ERROR:", error);

    return res.status(500).json({
      error: error.message
    });
  }
}
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, message } = req.body;

    await resend.emails.send({
      from: "Contacto <contacto@miniik.com>",
      to: "tuemail@gmail.com",
      subject: `Nuevo mensaje de ${name}`,
      html: `<p>${message}</p>`,
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: error.message });
  }
}
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, message } = req.body;

    await resend.emails.send({
        from: "MiniIk Contact <[EMAIL_ADDRESS]>",
        to: "[EMAIL_ADDRESS]",
        subject: `Nuevo mensaje de ${name}`,
        reply_to: email,
        html: `
            <p><b>Nombre:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Mensaje:</b> ${message}</p>
        `,
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: error.message });
  }
}
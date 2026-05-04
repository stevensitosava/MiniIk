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
    const body = req.body;

    const { name, email, message } = body || {};

    console.log("BODY RECEIVED:", body);

    await resend.emails.send({
      from: "MiniIk <contact@miniik.com>",
      to: "yourgmail@gmail.com",
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
    console.error(error);

    return res.status(500).json({ error: error.message });
  }
}
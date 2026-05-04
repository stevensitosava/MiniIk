const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, message } = req.body || {};

    await resend.emails.send({
      from: "Contacto <contacto@miniik.com>",
      to: "tuemail@gmail.com",
      subject: `Nuevo mensaje de ${name}`,
      html: `
        <p><b>Nombre:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Mensaje:</b> ${message}</p>
      `,
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("ERROR:", error);

    return res.status(500).json({
      error: error.message || "Error interno"
    });
  }
};
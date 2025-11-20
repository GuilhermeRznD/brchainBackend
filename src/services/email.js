const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_SERVICE_USER, 
        pass: process.env.EMAIL_SERVICE_PASS, 
    },
});

/**
 * Envia o token de recuperação de senha para o usuário.
 * @param {string} toEmail O email do destinatário.
 * @param {string} token O código de recuperação.
 */
const sendRecoveryToken = async (toEmail, token) => {
    const mailOptions = {
        from: process.env.EMAIL_SERVICE_USER,
        to: toEmail,
        subject: 'BRChain: Código de Recuperação de Senha',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #004D40;">Recuperação de Senha BRChain</h2>
                <p>Seu código de verificação é:</p>
                <div style="font-size: 28px; font-weight: bold; color: #004D40; background-color: #E8F5E9; padding: 15px; border-radius: 4px; text-align: center;">
                    ${token}
                </div>
                <p>Este código expira em 10 minutos. Se você não solicitou esta recuperação, ignore este e-mail.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email de recuperação enviado para: ${toEmail}`);
        return true;
    } catch (error) {
        console.error(`ERRO AO ENVIAR EMAIL para ${toEmail}:`, error);
        return false;
    }
};

module.exports = { sendRecoveryToken };
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const crypto = require('crypto'); 
const { getCollection, client } = require('../services/mongodb');
const { sendRecoveryToken } = require('../services/email'); 


const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("ERRO CRÍTICO: JWT_SECRET não encontrado no .env! O servidor não pode iniciar.");
    process.exit(1);
}

// Utilidade para gerar um token de 6 dígitos para recuperação
const generateToken = () => {
    // Gera um número aleatório entre 100000 e 999999
    return crypto.randomInt(100000, 999999).toString();
};


// ------------------------------------
// ROTA 1: CADASTRO DE USUÁRIO 
// ------------------------------------
router.post('/register', async (req, res) => {
    const { nome, email, telefone, senha } = req.body; 

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: "Dados incompletos." });
    }

    try {
        const usuarios = await getCollection("brchainApp", "usuarios");
        const usuarioExistente = await usuarios.findOne({ email: email });
        
        if (usuarioExistente) {
            return res.status(409).json({ message: "Este email já está cadastrado." });
        }

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const novoUsuario = {
            nome, email, telefone, senha_hash: senhaHash, 
            role: 'user', 
            createdAt: new Date(),
        };

        await usuarios.insertOne(novoUsuario);
        res.status(201).json({ message: "Usuário cadastrado com sucesso!" });

    } catch (e) {
        console.error("Erro no cadastro:", e);
        res.status(500).send({ message: "Erro interno do servidor durante o cadastro." });
    } finally {
        await client.close();
    }
});

// ------------------------------------
// ROTA 2: LOGIN DE USUÁRIO
// ------------------------------------
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: "Email e senha são obrigatórios." });
    }

    try {
        const usuarios = await getCollection("brchainApp", "usuarios");
        const usuario = await usuarios.findOne({ email: email });

        if (!usuario) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        const token = jwt.sign(
            { userId: usuario._id, role: usuario.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            token: token,
            userId: usuario._id,
            userRole: usuario.role,
            userName: usuario.nome, 
            message: "Login realizado com sucesso!"
        });

    } catch (e) {
        console.error("Erro no login:", e);
        res.status(500).send({ message: "Erro interno do servidor." });
    } finally {
        await client.close();
    }
});

// ------------------------------------
// ROTA 3: SOLICITAR RECUPERAÇÃO DE SENHA 
// ------------------------------------
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "O email é obrigatório." });
    }

    try {
        const usuarios = await getCollection("brchainApp", "usuarios");
        const usuario = await usuarios.findOne({ email: email });

        if (!usuario) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        const token = generateToken();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos no futuro

        
        await usuarios.updateOne(
            { _id: usuario._id },
            { $set: { 
                resetPasswordToken: token,
                resetPasswordExpires: expiresAt
            }}
        );

        const emailSent = await sendRecoveryToken(email, token);

        if (emailSent) {
            return res.status(200).json({ message: "Token de recuperação enviado por e-mail." });
        } else {
            await usuarios.updateOne(
                { _id: usuario._id },
                { $unset: { resetPasswordToken: "", resetPasswordExpires: "" }}
            );
            return res.status(500).json({ message: "Falha ao enviar o e-mail de recuperação." });
        }

    } catch (e) {
        console.error("Erro na recuperação de senha:", e);
        return res.status(500).json({ message: "Erro interno do servidor." });
    } finally {
        await client.close();
    }
});


// ------------------------------------
// ROTA 4: VERIFICAR TOKEN DE RECUPERAÇÃO 
// ------------------------------------
router.post('/verify-token', async (req, res) => {
    const { email, token } = req.body;

    if (!email || !token) {
        return res.status(400).json({ message: "Email e Token são obrigatórios." });
    }

    try {
        const usuarios = await getCollection("brchainApp", "usuarios");
        const usuario = await usuarios.findOne({ email: email });

        if (!usuario) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        
        // Checa se o token bate E se não expirou
        const isTokenValid = usuario.resetPasswordToken === token && 
                             usuario.resetPasswordExpires > new Date();

        if (isTokenValid) {
            return res.status(200).json({ message: "Token verificado com sucesso." });
        } else {
            return res.status(401).json({ message: "Token inválido ou expirado." });
        }

    } catch (e) {
        console.error("Erro na verificação do token:", e);
        return res.status(500).send({ message: "Erro interno do servidor." });
    } finally {
        await client.close();
    }
});

// ------------------------------------
// ROTA 5: TROCAR SENHA 
// ------------------------------------
router.post('/reset-password', async (req, res) => {
    const { email, token, novaSenha } = req.body;

    if (!email || !token || !novaSenha) {
        return res.status(400).json({ message: "Dados incompletos." });
    }

    try {
        const usuarios = await getCollection("brchainApp", "usuarios");
        const usuario = await usuarios.findOne({ email: email });

        if (!usuario) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        
        const isTokenValid = usuario.resetPasswordToken === token && 
                             usuario.resetPasswordExpires > new Date();

        if (!isTokenValid) {
            return res.status(401).json({ message: "Token inválido ou expirado. Tente o fluxo novamente." });
        }

        // Gera novo hash da nova senha
        const salt = await bcrypt.genSalt(10);
        const novaSenhaHash = await bcrypt.hash(novaSenha, salt);
        
        // Atualiza a senha e limpa o token de recuperação
        await usuarios.updateOne(
            { _id: usuario._id },
            { $set: { senha_hash: novaSenhaHash },
              $unset: { resetPasswordToken: "", resetPasswordExpires: "" } 
            }
        );
        
        return res.status(200).json({ message: "Senha alterada com sucesso!" });

    } catch (e) {
        console.error("Erro no reset de senha:", e);
        return res.status(500).send({ message: "Erro interno do servidor." });
    } finally {
        await client.close();
    }
});

module.exports = router;
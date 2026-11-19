
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const COOKIE_NAME = "peopleflow_token";

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado.");
  }

  return process.env.JWT_SECRET;
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60 * 1000,
  };
}

// Criar administrador inicial, caso não exista
async function initializeAdmin(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id BIGSERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role VARCHAR(30) NOT NULL DEFAULT 'admin',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL e ADMIN_INITIAL_PASSWORD precisam estar configurados."
    );
  }

  if (Buffer.byteLength(password, "utf8") < 12) {
    throw new Error(
      "ADMIN_INITIAL_PASSWORD precisa ter pelo menos 12 bytes."
    );
  }

  const resultado = await pool.query(
    "SELECT id FROM usuarios WHERE LOWER(email) = LOWER($1)",
    [email]
  );

  if (resultado.rows.length === 0) {
    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO usuarios (email, password_hash, role)
       VALUES ($1, $2, 'admin')`,
      [email, passwordHash]
    );
  }
}

// Proteção das rotas
function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({
        erro: "Não autenticado."
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());

    if (decoded.role !== "admin") {
      return res.status(403).json({
        erro: "Acesso não autorizado."
      });
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      erro: "Sessão inválida ou expirada."
    });
  }
}

// Login
router.post("/login", async (req, res) => {
  try {
    await initializeAdmin(req.pool);

    const email = req.body.email?.trim().toLowerCase();
    const senha = req.body.senha;

    if (!email || !senha) {
      return res.status(400).json({
        erro: "Informe o e-mail e a senha."
      });
    }

    const resultado = await req.pool.query(
      "SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos."
      });
    }

    const usuario = resultado.rows[0];

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.password_hash
    );

    if (!senhaValida) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos."
      });
    }

    const token = jwt.sign(
      {
        email: usuario.email,
        role: usuario.role,
      },
      getJwtSecret(),
      {
        subject: String(usuario.id),
        expiresIn: "8h",
      }
    );

    res.cookie(COOKIE_NAME, token, cookieOptions());

    return res.json({
      mensagem: "Login realizado com sucesso!",
      usuario: {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
      },
    });

  } catch (error) {
    console.error("Erro no login:", error);

    return res.status(500).json({
      erro: "Não foi possível realizar o login."
    });
  }
});

// Verificar sessão atual
router.get("/me", requireAuth, async (req, res) => {
  return res.json({
    autenticado: true,
    usuario: req.user,
  });
});

// Atualizar e-mail do administrador
router.put("/perfil", requireAuth, async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        erro: "Informe um e-mail válido."
      });
    }

    const existente = await req.pool.query(
      `SELECT id FROM usuarios
       WHERE LOWER(email) = LOWER($1) AND id <> $2`,
      [email, req.user.id]
    );

    if (existente.rows.length > 0) {
      return res.status(409).json({
        erro: "Este e-mail já está em uso."
      });
    }

    const resultado = await req.pool.query(
      `UPDATE usuarios
       SET email = $1
       WHERE id = $2
       RETURNING id, email, role`,
      [email, req.user.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Administrador não encontrado."
      });
    }

    const usuario = resultado.rows[0];

    const token = jwt.sign(
      {
        email: usuario.email,
        role: usuario.role,
      },
      getJwtSecret(),
      {
        subject: String(usuario.id),
        expiresIn: "8h",
      }
    );

    res.cookie(COOKIE_NAME, token, cookieOptions());

    return res.json({
      mensagem: "E-mail atualizado com sucesso!",
      usuario,
    });

  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);

    return res.status(500).json({
      erro: "Não foi possível atualizar o perfil."
    });
  }
});

// Alterar senha do administrador
router.patch("/senha", requireAuth, async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (
      typeof senhaAtual !== "string" ||
      typeof novaSenha !== "string" ||
      !senhaAtual ||
      !novaSenha
    ) {
      return res.status(400).json({
        erro: "Informe a senha atual e a nova senha."
      });
    }

    const tamanhoSenha = Buffer.byteLength(novaSenha, "utf8");

    if (tamanhoSenha < 12 || tamanhoSenha > 72) {
      return res.status(400).json({
        erro: "A nova senha deve ter entre 12 e 72 bytes."
      });
    }

    const resultado = await req.pool.query(
      "SELECT password_hash FROM usuarios WHERE id = $1",
      [req.user.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Administrador não encontrado."
      });
    }

    const senhaValida = await bcrypt.compare(
      senhaAtual,
      resultado.rows[0].password_hash
    );

    if (!senhaValida) {
      return res.status(401).json({
        erro: "A senha atual está incorreta."
      });
    }

    const novoHash = await bcrypt.hash(novaSenha, 12);

    await req.pool.query(
      "UPDATE usuarios SET password_hash = $1 WHERE id = $2",
      [novoHash, req.user.id]
    );

    return res.json({
      mensagem: "Senha alterada com sucesso!"
    });

  } catch (error) {
    console.error("Erro ao alterar senha:", error);

    return res.status(500).json({
      erro: "Não foi possível alterar a senha."
    });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.json({
    mensagem: "Logout realizado com sucesso."
  });
});

module.exports = {
  router,
  requireAuth,
};

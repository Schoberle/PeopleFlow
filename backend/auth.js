
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const COOKIE_NAME = "peopleflow_token";
const SESSION_DURATION = 8 * 60 * 60 * 1000;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET não configurado corretamente.");
  }

  return secret;
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  };
}

// Criar tabela e administrador inicial
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

  if (!email) {
    throw new Error("ADMIN_EMAIL não configurado.");
  }

  const existing = await pool.query(
    "SELECT id FROM usuarios WHERE LOWER(email) = LOWER($1)",
    [email]
  );

  if (existing.rows.length > 0) {
    return;
  }

  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (!initialPassword || Buffer.byteLength(initialPassword, "utf8") < 12) {
    throw new Error(
      "ADMIN_INITIAL_PASSWORD precisa ter pelo menos 12 bytes."
    );
  }

  if (Buffer.byteLength(initialPassword, "utf8") > 72) {
    throw new Error("A senha inicial excede o limite suportado pelo bcrypt.");
  }

  const passwordHash = await bcrypt.hash(initialPassword, 12);

  await pool.query(
    `INSERT INTO usuarios (email, password_hash, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    [email, passwordHash]
  );
}

// Middleware de autenticação
function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({
        erro: "Acesso não autorizado."
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());

    if (decoded.role !== "admin") {
      return res.status(403).json({
        erro: "Permissão insuficiente."
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
    const { email, senha } = req.body;

    if (!email || !senha || typeof email !== "string" || typeof senha !== "string") {
      return res.status(400).json({
        erro: "Informe e-mail e senha."
      });
    }

    if (Buffer.byteLength(senha, "utf8") > 72) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos."
      });
    }

    await initializeAdmin(req.pool);

    const resultado = await req.pool.query(
      `SELECT id, email, password_hash, role
       FROM usuarios
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email.trim()]
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

    if (!senhaValida || usuario.role !== "admin") {
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

// Consultar sessão
router.get("/me", requireAuth, (req, res) => {
  res.json({
    autenticado: true,
    usuario: req.user,
  });
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    ...cookieOptions(),
    maxAge: undefined,
  });

  res.json({
    mensagem: "Logout realizado com sucesso!"
  });
});

module.exports = {
  router,
  requireAuth,
};

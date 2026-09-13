require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

// Conexão com PostgreSQL

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Teste da API

app.get("/", (req, res) => {
  res.json({
    mensagem: "Servidor PeopleFlow funcionando!",
  });
});

// Teste da conexão com o banco

app.get("/teste-banco", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT NOW()");

    res.json({
      mensagem: "Banco de dados conectado com sucesso!",
      data: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Erro ao conectar ao banco de dados",
    });
  }
});

// Cadastrar colaborador

app.post("/colaboradores", async (req, res) => {
  try {
    const {
      nome,
      cpf,
      email,
      telefone,
      cargo,
      setor,
      status,
      data_admissao,
    } = req.body;

    const resultado = await pool.query(
      `INSERT INTO colaboradores
      (nome, cpf, email, telefone, cargo, setor, status, data_admissao)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        nome,
        cpf,
        email,
        telefone,
        cargo,
        setor,
        status || "Ativo",
        data_admissao,
      ]
    );

    res.status(201).json({
      mensagem: "Colaborador cadastrado com sucesso!",
      colaborador: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Erro ao cadastrar colaborador",
    });
  }
});

// Buscar todos os colaboradores

app.get("/colaboradores", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM colaboradores ORDER BY id DESC"
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Erro ao buscar colaboradores",
    });
  }
});

// Buscar um colaborador pelo ID

app.get("/colaboradores/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      "SELECT * FROM colaboradores WHERE id = $1",
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Colaborador não encontrado",
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Erro ao buscar colaborador",
    });
  }
});

// Atualizar colaborador

app.put("/colaboradores/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nome,
      cpf,
      email,
      telefone,
      cargo,
      setor,
      status,
      data_admissao,
    } = req.body;

    const resultado = await pool.query(
      `UPDATE colaboradores
       SET
         nome = $1,
         cpf = $2,
         email = $3,
         telefone = $4,
         cargo = $5,
         setor = $6,
         status = $7,
         data_admissao = $8
       WHERE id = $9
       RETURNING *`,
      [
        nome,
        cpf,
        email,
        telefone,
        cargo,
        setor,
        status,
        data_admissao,
        id,
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Colaborador não encontrado",
      });
    }

    res.json({
      mensagem: "Colaborador atualizado com sucesso!",
      colaborador: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Erro ao atualizar colaborador",
    });
  }
});

// Iniciar servidor

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
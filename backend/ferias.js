
const express = require("express");

function createFeriasRouter(pool) {
  const router = express.Router();

  let tabelaPromise = null;

  async function garantirTabela() {
    if (!tabelaPromise) {
      tabelaPromise = pool.query(`
        CREATE TABLE IF NOT EXISTS ferias (
          id BIGSERIAL PRIMARY KEY,
          colaborador_id INTEGER NOT NULL
            REFERENCES colaboradores(id) ON DELETE CASCADE,
          data_inicio DATE NOT NULL,
          data_fim DATE NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'Pendente',
          observacoes TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT periodo_ferias_valido
            CHECK (data_fim >= data_inicio),
          CONSTRAINT status_ferias_valido
            CHECK (status IN ('Pendente', 'Aprovada', 'Concluída', 'Recusada'))
        )
      `).catch((erro) => {
        tabelaPromise = null;
        throw erro;
      });
    }

    await tabelaPromise;
  }

  router.use(async (req, res, next) => {
    try {
      await garantirTabela();
      next();
    } catch (erro) {
      console.error("Erro ao criar tabela de férias:", erro);

      res.status(500).json({
        erro: "Erro ao preparar o módulo de férias."
      });
    }
  });

  // Listar períodos de férias
  router.get("/", async (req, res) => {
    try {
      const resultado = await pool.query(`
        SELECT
          f.id,
          f.colaborador_id,
          c.nome AS colaborador,
          f.data_inicio,
          f.data_fim,
          f.status,
          f.observacoes,
          f.created_at
        FROM ferias f
        INNER JOIN colaboradores c
          ON c.id = f.colaborador_id
        ORDER BY f.data_inicio DESC
      `);

      res.json(resultado.rows);
    } catch (erro) {
      console.error("Erro ao buscar férias:", erro);

      res.status(500).json({
        erro: "Erro ao buscar períodos de férias."
      });
    }
  });

  // Cadastrar período de férias
  router.post("/", async (req, res) => {
    try {
      const {
        colaborador_id,
        data_inicio,
        data_fim,
        observacoes
      } = req.body;

      if (!colaborador_id || !data_inicio || !data_fim) {
        return res.status(400).json({
          erro: "Preencha o colaborador e as datas de férias."
        });
      }

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(data_inicio) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(data_fim)
      ) {
        return res.status(400).json({
          erro: "Informe datas válidas."
        });
      }

      if (data_fim < data_inicio) {
        return res.status(400).json({
          erro: "A data final não pode ser anterior à data inicial."
        });
      }

      const colaborador = await pool.query(
        "SELECT id FROM colaboradores WHERE id = $1",
        [colaborador_id]
      );

      if (colaborador.rows.length === 0) {
        return res.status(404).json({
          erro: "Colaborador não encontrado."
        });
      }

      const resultado = await pool.query(`
        INSERT INTO ferias (
          colaborador_id,
          data_inicio,
          data_fim,
          observacoes
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [
        colaborador_id,
        data_inicio,
        data_fim,
        observacoes || null
      ]);

      res.status(201).json({
        mensagem: "Período de férias cadastrado com sucesso!",
        ferias: resultado.rows[0]
      });

    } catch (erro) {
      console.error("Erro ao cadastrar férias:", erro);

      res.status(500).json({
        erro: "Erro ao cadastrar período de férias."
      });
    }
  });

  // Atualizar status das férias
  router.patch("/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const statusPermitidos = [
        "Pendente",
        "Aprovada",
        "Concluída",
        "Recusada"
      ];

      if (!statusPermitidos.includes(status)) {
        return res.status(400).json({
          erro: "Status de férias inválido."
        });
      }

      const resultado = await pool.query(`
        UPDATE ferias
        SET status = $1
        WHERE id = $2
        RETURNING *
      `, [status, id]);

      if (resultado.rows.length === 0) {
        return res.status(404).json({
          erro: "Período de férias não encontrado."
        });
      }

      res.json({
        mensagem: "Status atualizado com sucesso!",
        ferias: resultado.rows[0]
      });

    } catch (erro) {
      console.error("Erro ao atualizar férias:", erro);

      res.status(500).json({
        erro: "Erro ao atualizar status."
      });
    }
  });

  return router;
}

module.exports = createFeriasRouter;

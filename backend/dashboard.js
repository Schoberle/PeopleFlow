
const express = require("express");

function createDashboardRouter(pool) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      // Descobre os nomes reais das colunas
      const schema = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'colaboradores'
          AND table_schema = 'public'
      `);

      const columns = schema.rows.map(row => row.column_name);

      const has = name => columns.includes(name);

      const departmentColumn = has("departamento")
        ? "departamento"
        : has("setor")
          ? "setor"
          : null;

      const admissionColumn = has("data_admissao")
        ? "data_admissao"
        : has("dataAdmissao")
          ? "dataAdmissao"
          : null;

      const required = ["status", "cargo"];

      for (const column of required) {
        if (!has(column)) {
          throw new Error(`Coluna obrigatória não encontrada: ${column}`);
        }
      }

      const totalResult = await pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (
            WHERE LOWER(TRIM(status)) = 'ativo'
          )::int AS ativos,
          COUNT(*) FILTER (
            WHERE LOWER(TRIM(status)) = 'desligado'
          )::int AS desligados
        FROM colaboradores
      `);

      let departments = [];

      if (departmentColumn) {
        const result = await pool.query(`
          SELECT
            COALESCE(NULLIF(TRIM("${departmentColumn}"), ''), 'Não informado') AS nome,
            COUNT(*)::int AS quantidade
          FROM colaboradores
          GROUP BY 1
          ORDER BY quantidade DESC
        `);

        departments = result.rows;
      }

      const positionsResult = await pool.query(`
        SELECT
          COALESCE(NULLIF(TRIM(cargo), ''), 'Não informado') AS nome,
          COUNT(*)::int AS quantidade
        FROM colaboradores
        GROUP BY 1
        ORDER BY quantidade DESC
        LIMIT 10
      `);

      let admissions = [];

      if (admissionColumn) {
        const result = await pool.query(`
          SELECT
            TO_CHAR(
              DATE_TRUNC('month', "${admissionColumn}"::date),
              'YYYY-MM'
            ) AS mes,
            COUNT(*)::int AS quantidade
          FROM colaboradores
          WHERE "${admissionColumn}" IS NOT NULL
          GROUP BY DATE_TRUNC('month', "${admissionColumn}"::date)
          ORDER BY DATE_TRUNC('month', "${admissionColumn}"::date)
        `);

        admissions = result.rows;
      }

      res.json({
        indicadores: totalResult.rows[0],
        departamentos: departments,
        cargos: positionsResult.rows,
        admissoes: admissions
      });

    } catch (error) {
      console.error("Erro no Dashboard:", error);

      res.status(500).json({
        erro: "Não foi possível carregar os indicadores.",
        detalhe: error.message
      });
    }
  });

  return router;
}

module.exports = createDashboardRouter;

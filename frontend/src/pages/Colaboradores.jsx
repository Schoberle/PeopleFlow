
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar.jsx";
import "./Colaboradores.css";

function Colaboradores() {
  const navigate = useNavigate();

  const [colaboradores, setColaboradores] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function buscarColaboradores() {
      try {
        setErro("");

        const resposta = await fetch("/api/colaboradores");

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar os colaboradores.");
        }

        const dados = await resposta.json();
        setColaboradores(Array.isArray(dados) ? dados : []);
      } catch (erro) {
        console.error("Erro ao buscar colaboradores:", erro);
        setErro("Não foi possível carregar os colaboradores. Tente novamente.");
      } finally {
        setCarregando(false);
      }
    }

    buscarColaboradores();
  }, []);

  const colaboradoresFiltrados = colaboradores.filter((colaborador) => {
    const termo = pesquisa.trim().toLowerCase();

    const correspondePesquisa = [
      colaborador.nome,
      colaborador.cpf,
      colaborador.cargo,
      colaborador.setor,
    ].some((campo) =>
      String(campo ?? "").toLowerCase().includes(termo)
    );

    const status = String(colaborador.status ?? "").toLowerCase();

    const correspondeStatus =
      filtroStatus === "Todos" ||
      (filtroStatus === "Ativos" && status === "ativo") ||
      (filtroStatus === "Desligados" && status === "desligado");

    return correspondePesquisa && correspondeStatus;
  });

  const totalAtivos = colaboradores.filter(
    (colaborador) =>
      String(colaborador.status ?? "").toLowerCase() === "ativo"
  ).length;

  const totalDesligados = colaboradores.filter(
    (colaborador) =>
      String(colaborador.status ?? "").toLowerCase() === "desligado"
  ).length;

  function visualizarColaborador(id) {
    if (!id) {
      console.error("Colaborador sem ID.");
      return;
    }

    navigate(`/colaborador/${id}`);
  }

  return (
    <div className="colaboradores-layout">
      <Sidebar />

      <main className="colaboradores-page">
        <div className="page-header">
          <div>
            <h1>Colaboradores</h1>
            <p>Gerencie os colaboradores da empresa</p>
          </div>

          <button
            className="btn-novo"
            type="button"
            onClick={() => navigate("/cadastro-colaborador")}
          >
            + Novo colaborador
          </button>
        </div>

        <section className="resumo-colaboradores">
          <article className="resumo-card">
            <span className="resumo-label">Total de colaboradores</span>
            <strong>{colaboradores.length}</strong>
          </article>

          <article className="resumo-card resumo-ativos">
            <span className="resumo-label">Ativos</span>
            <strong>{totalAtivos}</strong>
          </article>

          <article className="resumo-card resumo-desligados">
            <span className="resumo-label">Desligados</span>
            <strong>{totalDesligados}</strong>
          </article>
        </section>

        <section className="filtros-colaboradores">
          <div className="search-container">
            <label htmlFor="pesquisa-colaborador">
              Buscar colaborador
            </label>

            <input
              id="pesquisa-colaborador"
              type="search"
              placeholder="Pesquise por nome, CPF, cargo ou departamento..."
              value={pesquisa}
              onChange={(event) => setPesquisa(event.target.value)}
            />
          </div>

          <div className="filtro-status">
            <label htmlFor="filtro-status">Filtrar por status</label>

            <select
              id="filtro-status"
              value={filtroStatus}
              onChange={(event) => setFiltroStatus(event.target.value)}
            >
              <option value="Todos">Todos os status</option>
              <option value="Ativos">Ativos</option>
              <option value="Desligados">Desligados</option>
            </select>
          </div>
        </section>

        <section className="lista-colaboradores">
          <div className="lista-cabecalho">
            <div>
              <h2>Lista de colaboradores</h2>
              <p>
                {colaboradoresFiltrados.length}{" "}
                {colaboradoresFiltrados.length === 1
                  ? "colaborador encontrado"
                  : "colaboradores encontrados"}
              </p>
            </div>
          </div>

          {erro && (
            <div className="mensagem-erro" role="alert">
              {erro}
            </div>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Cargo</th>
                  <th>Departamento</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {carregando ? (
                  <tr>
                    <td colSpan="6" className="empty-message">
                      Carregando colaboradores...
                    </td>
                  </tr>
                ) : colaboradoresFiltrados.length > 0 ? (
                  colaboradoresFiltrados.map((colaborador) => {
                    const desligado =
                      String(colaborador.status ?? "").toLowerCase() ===
                      "desligado";

                    return (
                      <tr key={colaborador.id}>
                        <td className="nome-colaborador">
                          {colaborador.nome || "—"}
                        </td>

                        <td>{colaborador.cpf || "—"}</td>
                        <td>{colaborador.cargo || "—"}</td>
                        <td>{colaborador.setor || "—"}</td>

                        <td>
                          <span
                            className={`status-badge ${
                              desligado
                                ? "status-desligado"
                                : "status-ativo"
                            }`}
                          >
                            <span aria-hidden="true">●</span>{" "}
                            {colaborador.status || "Não informado"}
                          </span>
                        </td>

                        <td>
                          <button
                            className="btn-acao"
                            type="button"
                            onClick={() =>
                              visualizarColaborador(colaborador.id)
                            }
                          >
                            Ver detalhes
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-message">
                      {colaboradores.length === 0
                        ? "Nenhum colaborador cadastrado."
                        : "Nenhum colaborador corresponde aos filtros selecionados."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Colaboradores;

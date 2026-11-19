
import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import "./Ferias.css";

function Ferias() {
  const [ferias, setFerias] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [colaboradorId, setColaboradorId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const carregarDados = useCallback(async () => {
    try {
      const [respostaFerias, respostaColaboradores] = await Promise.all([
        fetch("/api/ferias", { credentials: "include" }),
        fetch("/api/colaboradores", { credentials: "include" }),
      ]);

      if (!respostaFerias.ok || !respostaColaboradores.ok) {
        throw new Error("Não foi possível carregar os dados.");
      }

      const dadosFerias = await respostaFerias.json();
      const dadosColaboradores = await respostaColaboradores.json();

      setErro("");
      setFerias(Array.isArray(dadosFerias) ? dadosFerias : []);
      setColaboradores(
        Array.isArray(dadosColaboradores) ? dadosColaboradores : []
      );
    } catch (error) {
      console.error("Erro ao carregar férias:", error);
      setErro("Não foi possível carregar as informações.");
    } finally {
      setCarregando(false);
    }
  }, []);

useEffect(() => {
  const timer = setTimeout(() => {
    carregarDados();
  }, 0);

  return () => clearTimeout(timer);
}, [carregarDados]);

  async function cadastrarFerias(event) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    try {
      const resposta = await fetch("/api/ferias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          colaborador_id: colaboradorId,
          data_inicio: dataInicio,
          data_fim: dataFim,
          observacoes,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Não foi possível cadastrar as férias."
        );
      }

      setMensagem("Período de férias cadastrado com sucesso!");
      setColaboradorId("");
      setDataInicio("");
      setDataFim("");
      setObservacoes("");

      await carregarDados();
    } catch (error) {
      setErro(error.message);
    }
  }

  async function atualizarStatus(id, status) {
    setErro("");
    setMensagem("");

    try {
      const resposta = await fetch(`/api/ferias/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Não foi possível atualizar o status."
        );
      }

      setMensagem("Status atualizado com sucesso!");
      await carregarDados();
    } catch (error) {
      setErro(error.message);
    }
  }

  function formatarData(data) {
    if (!data) return "—";

    return new Date(`${String(data).slice(0, 10)}T12:00:00`)
      .toLocaleDateString("pt-BR");
  }

  const totalPendentes = ferias.filter(
    (item) => item.status === "Pendente"
  ).length;

  const totalAprovadas = ferias.filter(
    (item) => item.status === "Aprovada"
  ).length;

  const totalConcluidas = ferias.filter(
    (item) => item.status === "Concluída"
  ).length;

  return (
    <div className="colaboradores-layout">
      <Sidebar />

      <main className="colaboradores-page">
        <div className="page-header">
          <div>
            <h1>Gestão de Férias</h1>
            <p>Gerencie os períodos de férias dos colaboradores.</p>
          </div>
        </div>

        <section className="resumo-colaboradores">
          <article className="resumo-card">
            <span className="resumo-label">Solicitações pendentes</span>
            <strong>{totalPendentes}</strong>
          </article>

          <article className="resumo-card resumo-ativos">
            <span className="resumo-label">Aprovadas</span>
            <strong>{totalAprovadas}</strong>
          </article>

          <article className="resumo-card">
            <span className="resumo-label">Concluídas</span>
            <strong>{totalConcluidas}</strong>
          </article>
        </section>

        <section className="lista-colaboradores">
          <div className="lista-cabecalho">
            <div>
              <h2>Cadastrar período de férias</h2>
              <p>Informe o colaborador e o período solicitado.</p>
            </div>
          </div>

          <form className="form-ferias" onSubmit={cadastrarFerias}>
            <div>
              <label htmlFor="colaborador-ferias">Colaborador</label>
              <select
                id="colaborador-ferias"
                value={colaboradorId}
                onChange={(event) => setColaboradorId(event.target.value)}
                required
              >
                <option value="">Selecione um colaborador</option>

                {colaboradores
                  .filter(
                    (colaborador) =>
                      String(colaborador.status).toLowerCase() === "ativo"
                  )
                  .map((colaborador) => (
                    <option key={colaborador.id} value={colaborador.id}>
                      {colaborador.nome}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="data-inicio-ferias">Data de início</label>
              <input
                id="data-inicio-ferias"
                type="date"
                value={dataInicio}
                onChange={(event) => setDataInicio(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="data-fim-ferias">Data de término</label>
              <input
                id="data-fim-ferias"
                type="date"
                value={dataFim}
                min={dataInicio || undefined}
                onChange={(event) => setDataFim(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="observacoes-ferias">Observações</label>
              <input
                id="observacoes-ferias"
                type="text"
                value={observacoes}
                onChange={(event) => setObservacoes(event.target.value)}
                placeholder="Observações (opcional)"
              />
            </div>

            <button className="btn-novo" type="submit">
              Cadastrar férias
            </button>
          </form>

          {mensagem && (
            <p className="mensagem-sucesso">{mensagem}</p>
          )}

          {erro && (
            <p className="mensagem-erro" role="alert">
              {erro}
            </p>
          )}
        </section>

        <section className="lista-colaboradores">
          <div className="lista-cabecalho">
            <div>
              <h2>Períodos de férias</h2>
              <p>{ferias.length} registro(s)</p>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>Início</th>
                  <th>Término</th>
                  <th>Observações</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {carregando ? (
                  <tr>
                    <td colSpan="6" className="empty-message">
                      Carregando períodos...
                    </td>
                  </tr>
                ) : ferias.length > 0 ? (
                  ferias.map((item) => (
                    <tr key={item.id}>
                      <td className="nome-colaborador">
                        {item.colaborador || "—"}
                      </td>

                      <td>{formatarData(item.data_inicio)}</td>
                      <td>{formatarData(item.data_fim)}</td>
                      <td>{item.observacoes || "—"}</td>
                      <td>{item.status}</td>

                      <td>
                        {item.status === "Pendente" && (
                          <>
                            <button
                              type="button"
                              className="btn-acao"
                              onClick={() =>
                                atualizarStatus(item.id, "Aprovada")
                              }
                            >
                              Aprovar
                            </button>

                            <button
                              type="button"
                              className="btn-acao"
                              onClick={() =>
                                atualizarStatus(item.id, "Recusada")
                              }
                            >
                              Recusar
                            </button>
                          </>
                        )}

                        {item.status === "Aprovada" && (
                          <button
                            type="button"
                            className="btn-acao"
                            onClick={() =>
                              atualizarStatus(item.id, "Concluída")
                            }
                          >
                            Concluir
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-message">
                      Nenhum período de férias cadastrado.
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

export default Ferias;

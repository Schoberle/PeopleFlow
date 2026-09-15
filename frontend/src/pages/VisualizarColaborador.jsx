import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./Colaborador.css";

function VisualizarColaborador() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [colaborador, setColaborador] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function buscarColaborador() {
      try {
        const resposta = await fetch(
          `/api/colaboradores/${id}`
        );

        if (!resposta.ok) {
          throw new Error("Colaborador não encontrado.");
        }

        const dados = await resposta.json();

        setColaborador(dados);
      } catch (error) {
        console.error("Erro ao buscar colaborador:", error);
        setErro("Não foi possível carregar os dados do colaborador.");
      } finally {
        setCarregando(false);
      }
    }

    buscarColaborador();
  }, [id]);

  function formatarData(data) {
    if (!data) return "-";

    return new Date(data).toLocaleDateString("pt-BR", {
      timeZone: "UTC",
    });
  }

  if (carregando) {
    return (
      <div className="colaborador-container">
        <div className="colaborador-loading">
          Carregando dados do colaborador...
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="colaborador-container">
        <div className="colaborador-erro">
          <h2>Ops!</h2>

          <p>{erro}</p>

          <button
            className="btn-voltar"
            onClick={() => navigate("/colaboradores")}
          >
            ← Voltar para colaboradores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="colaborador-container">

      <div className="colaborador-header">

        <button
          className="btn-voltar-topo"
          onClick={() => navigate("/colaboradores")}
        >
          ← Voltar
        </button>

        <h1>Visualizar colaborador</h1>

        <p>
          Informações cadastrais do colaborador
        </p>

      </div>

      <div className="colaborador-card">

        <div className="colaborador-perfil">

          <div className="avatar">
            {colaborador.nome?.charAt(0).toUpperCase()}
          </div>

          <div className="perfil-info">

            <h2>
              {colaborador.nome}
            </h2>

            <span
              className={`status ${
                colaborador.status?.toLowerCase() === "ativo"
                  ? "status-ativo"
                  : "status-inativo"
              }`}
            >
              {colaborador.status}
            </span>

          </div>

        </div>

        <div className="linha-separadora"></div>

        <div className="informacoes">

          <div className="campo">
            <span>CPF</span>
            <strong>
              {colaborador.cpf || "-"}
            </strong>
          </div>

          <div className="campo">
            <span>E-mail</span>
            <strong>
              {colaborador.email || "-"}
            </strong>
          </div>

          <div className="campo">
            <span>Telefone</span>
            <strong>
              {colaborador.telefone || "-"}
            </strong>
          </div>

          <div className="campo">
            <span>Cargo</span>
            <strong>
              {colaborador.cargo || "-"}
            </strong>
          </div>

          <div className="campo">
            <span>Departamento</span>
            <strong>
              {colaborador.setor || "-"}
            </strong>
          </div>

          <div className="campo">
            <span>Data de admissão</span>
            <strong>
              {formatarData(colaborador.data_admissao)}
            </strong>
          </div>

        </div>

        <div className="rodape-card">

          <button
            className="btn-voltar"
            onClick={() => navigate("/colaboradores")}
          >
            ← Voltar para colaboradores
          </button>

          <button
            className="btn-editar"
            onClick={() =>
              navigate(`/editar-colaborador/${id}`)
            }
          >
            ✏️ Editar colaborador
          </button>

        </div>

      </div>

    </div>
  );
}

export default VisualizarColaborador;
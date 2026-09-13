import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./EditarColaborador.css";

function EditarColaborador() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    cargo: "",
    setor: "",
    status: "Ativo",
    data_admissao: "",
  });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function buscarColaborador() {
      try {
        const resposta = await fetch(
          `http://localhost:3001/colaboradores/${id}`
        );

        if (!resposta.ok) {
          throw new Error("Colaborador não encontrado.");
        }

        const dados = await resposta.json();

        setFormulario({
          nome: dados.nome || "",
          cpf: dados.cpf || "",
          email: dados.email || "",
          telefone: dados.telefone || "",
          cargo: dados.cargo || "",
          setor: dados.setor || "",
          status: dados.status || "Ativo",
          data_admissao: dados.data_admissao
            ? dados.data_admissao.substring(0, 10)
            : "",
        });

      } catch (error) {
        console.error(error);
        setErro("Não foi possível carregar o colaborador.");
      } finally {
        setCarregando(false);
      }
    }

    buscarColaborador();
  }, [id]);

  function alterarCampo(event) {
    const { name, value } = event.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  }

  async function salvarAlteracoes(event) {
    event.preventDefault();

    setSalvando(true);
    setErro("");

    try {
      const resposta = await fetch(
        `http://localhost:3001/colaboradores/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formulario),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Erro ao atualizar colaborador."
        );
      }

      alert("Colaborador atualizado com sucesso!");

      navigate(`/colaborador/${id}`);

    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível atualizar o colaborador."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="editar-container">
        <div className="editar-loading">
          Carregando dados...
        </div>
      </div>
    );
  }

  if (erro && !formulario.nome) {
    return (
      <div className="editar-container">
        <div className="editar-erro">
          <h2>Ops!</h2>

          <p>{erro}</p>

          <button
            onClick={() =>
              navigate(`/colaborador/${id}`)
            }
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="editar-container">

      <div className="editar-header">

        <button
          className="btn-voltar-edicao"
          onClick={() =>
            navigate(`/colaborador/${id}`)
          }
        >
          ← Voltar
        </button>

        <h1>Editar colaborador</h1>

        <p>
          Atualize as informações cadastrais do colaborador
        </p>

      </div>

      <form
        className="editar-card"
        onSubmit={salvarAlteracoes}
      >

        <div className="form-grid">

          <div className="form-group">
            <label>Nome completo</label>

            <input
              type="text"
              name="nome"
              value={formulario.nome}
              onChange={alterarCampo}
              required
            />
          </div>

          <div className="form-group">
            <label>CPF</label>

            <input
              type="text"
              name="cpf"
              value={formulario.cpf}
              onChange={alterarCampo}
              required
            />
          </div>

          <div className="form-group">
            <label>E-mail</label>

            <input
              type="email"
              name="email"
              value={formulario.email}
              onChange={alterarCampo}
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>

            <input
              type="text"
              name="telefone"
              value={formulario.telefone}
              onChange={alterarCampo}
            />
          </div>

          <div className="form-group">
            <label>Cargo</label>

            <input
              type="text"
              name="cargo"
              value={formulario.cargo}
              onChange={alterarCampo}
            />
          </div>

          <div className="form-group">
            <label>Departamento</label>

            <input
              type="text"
              name="setor"
              value={formulario.setor}
              onChange={alterarCampo}
            />
          </div>

          <div className="form-group">
            <label>Status</label>

            <select
              name="status"
              value={formulario.status}
              onChange={alterarCampo}
            >
              <option value="Ativo">
                Ativo
              </option>

              <option value="Inativo">
                Inativo
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Data de admissão</label>

            <input
              type="date"
              name="data_admissao"
              value={formulario.data_admissao}
              onChange={alterarCampo}
            />
          </div>

        </div>

        {erro && (
          <div className="mensagem-erro">
            {erro}
          </div>
        )}

        <div className="editar-acoes">

          <button
            type="button"
            className="btn-cancelar"
            onClick={() =>
              navigate(`/colaborador/${id}`)
            }
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="btn-salvar"
            disabled={salvando}
          >
            {salvando
              ? "Salvando..."
              : "Salvar alterações"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default EditarColaborador;
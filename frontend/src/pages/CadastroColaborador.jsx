import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import "./CadastroColaborador.css";

function CadastroColaborador() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    dataAdmissao: "",
    cargo: "",
    departamento: "",
    status: "Ativo",
  });

  const [salvando, setSalvando] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((dadosAnteriores) => ({
      ...dadosAnteriores,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (salvando) {
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch(
        "/api/colaboradores",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: formData.nome,
            cpf: formData.cpf,
            email: formData.email,
            telefone: formData.telefone,
            cargo: formData.cargo,
            setor: formData.departamento,
            status: formData.status,
            data_admissao: formData.dataAdmissao,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Não foi possível cadastrar o colaborador."
        );
      }

      alert("Colaborador cadastrado com sucesso!");

      setFormData({
        nome: "",
        cpf: "",
        email: "",
        telefone: "",
        dataAdmissao: "",
        cargo: "",
        departamento: "",
        status: "Ativo",
      });

      navigate("/colaboradores");
    } catch (erro) {
      console.error("Erro ao cadastrar colaborador:", erro);

      alert(
        erro.message ||
          "Erro ao cadastrar colaborador. Verifique se o servidor está funcionando."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="cadastro-layout">
      <Sidebar />

      <main className="cadastro-page">
        <div className="cadastro-header">
          <h1>Novo Colaborador</h1>
          <p>
            Preencha os dados para cadastrar um novo colaborador.
          </p>
        </div>

        <div className="cadastro-card">
          <form
            className="cadastro-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label>Nome completo</label>

              <input
                type="text"
                name="nome"
                placeholder="Digite o nome completo"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>CPF</label>

                <input
                  type="text"
                  name="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Telefone</label>

                <input
                  type="text"
                  name="telefone"
                  placeholder="Digite o telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>E-mail</label>

              <input
                type="email"
                name="email"
                placeholder="Digite o e-mail"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Data de admissão</label>

                <input
                  type="date"
                  name="dataAdmissao"
                  value={formData.dataAdmissao}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Cargo</label>

                <input
                  type="text"
                  name="cargo"
                  placeholder="Digite o cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Departamento</label>

                <input
                  type="text"
                  name="departamento"
                  placeholder="Digite o departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => navigate("/colaboradores")}
                disabled={salvando}
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
                  : "Salvar Colaborador"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CadastroColaborador;
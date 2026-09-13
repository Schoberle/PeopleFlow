import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar.jsx";

import "./Colaboradores.css";

function Colaboradores() {
  const navigate = useNavigate();

  const [colaboradores, setColaboradores] = useState([]);
  const [pesquisa, setPesquisa] = useState("");

  useEffect(() => {
    async function buscarColaboradores() {
      try {
        const resposta = await fetch(
          "http://localhost:3001/colaboradores"
        );

        if (!resposta.ok) {
          throw new Error("Erro ao buscar colaboradores");
        }

        const dados = await resposta.json();

        console.log("Colaboradores recebidos:", dados);

        setColaboradores(dados);
      } catch (erro) {
        console.error("Erro ao buscar colaboradores:", erro);
      }
    }

    buscarColaboradores();
  }, []);

  const colaboradoresFiltrados = colaboradores.filter(
    (colaborador) =>
      colaborador.nome
        ?.toLowerCase()
        .includes(pesquisa.toLowerCase())
  );

  function visualizarColaborador(id) {
    console.log("Cliquei em Ver. ID recebido:", id);

    if (!id) {
      console.error(
        "ERRO: o colaborador não possui ID:",
        id
      );

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

            <p>
              Gerencie os colaboradores da empresa
            </p>
          </div>

          <button
            className="btn-novo"
            type="button"
            onClick={() =>
              navigate("/cadastro-colaborador")
            }
          >
            + Novo Colaborador
          </button>

        </div>

        <div className="search-container">

          <input
            type="text"
            placeholder="🔍 Pesquisar colaborador..."
            value={pesquisa}
            onChange={(event) =>
              setPesquisa(event.target.value)
            }
          />

        </div>

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

              {colaboradoresFiltrados.length > 0 ? (

                colaboradoresFiltrados.map(
                  (colaborador) => (

                    <tr key={colaborador.id}>

                      <td>
                        {colaborador.nome}
                      </td>

                      <td>
                        {colaborador.cpf}
                      </td>

                      <td>
                        {colaborador.cargo}
                      </td>

                      <td>
                        {colaborador.setor}
                      </td>

                      <td>

                        <span className="status-badge">
                          {colaborador.status}
                        </span>

                      </td>

                      <td>

                        <button
                          className="btn-acao"
                          type="button"
                          onClick={() =>
                            visualizarColaborador(
                              colaborador.id
                            )
                          }
                        >
                          Ver
                        </button>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="empty-message"
                  >
                    Nenhum colaborador cadastrado
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </main>

    </div>
  );
}

export default Colaboradores;

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import "./Dashboard.css";

function Dashboard() {
  const [dados, setDados] = useState({
    indicadores: {
      total: 0,
      ativos: 0,
      desligados: 0,
    },
    departamentos: [],
    cargos: [],
    admissoes: [],
  });

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await fetch("/api/dashboard");

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar os dados do Dashboard.");
        }

        const resultado = await resposta.json();

        setDados({
          indicadores: resultado.indicadores || {
            total: 0,
            ativos: 0,
            desligados: 0,
          },
          departamentos: resultado.departamentos || [],
          cargos: resultado.cargos || [],
          admissoes: resultado.admissoes || [],
        });
      } catch (error) {
        console.error("Erro ao carregar Dashboard:", error);
        setErro("Não foi possível carregar os dados. Tente atualizar a página.");
      } finally {
        setCarregando(false);
      }
    }

    carregarDashboard();
  }, []);

  const { indicadores, departamentos, cargos, admissoes } = dados;

  const quantidadeDepartamentos = departamentos.length;

  const maiorDepartamento = Math.max(
    1,
    ...departamentos.map((item) => Number(item.quantidade))
  );

  const maiorCargo = Math.max(
    1,
    ...cargos.map((item) => Number(item.quantidade))
  );

  const maiorAdmissao = Math.max(
    1,
    ...admissoes.map((item) => Number(item.quantidade))
  );

  const percentualAtivos =
    indicadores.total > 0
      ? ((indicadores.ativos / indicadores.total) * 100).toFixed(1)
      : "0.0";

  const percentualDesligados =
    indicadores.total > 0
      ? ((indicadores.desligados / indicadores.total) * 100).toFixed(1)
      : "0.0";

  function formatarMes(mes) {
    if (!mes) return "Não informado";

    const [ano, numeroMes] = mes.split("-");

    const data = new Date(Number(ano), Number(numeroMes) - 1, 1);

    return data.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  }

  const cards = [
    {
      titulo: "Total de Colaboradores",
      valor: indicadores.total,
      descricao: "Cadastros no sistema",
      icone: "👥",
      cor: "azul",
    },
    {
      titulo: "Colaboradores Ativos",
      valor: indicadores.ativos,
      descricao: `${percentualAtivos}% do total`,
      icone: "✓",
      cor: "verde",
    },
    {
      titulo: "Colaboradores Desligados",
      valor: indicadores.desligados,
      descricao: `${percentualDesligados}% do total`,
      icone: "↗",
      cor: "vermelho",
    },
    {
      titulo: "Departamentos",
      valor: quantidadeDepartamentos,
      descricao: "Áreas com colaboradores",
      icone: "🏢",
      cor: "roxo",
    },
  ];

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              PEOPLEFLOW / GESTÃO
            </span>
            <h1>Dashboard</h1>
            <p>Visão geral da sua equipe</p>
          </div>

          <div className="user-info">
            <div className="user-avatar">A</div>
            <div>
              <strong>Administrador</strong>
              <span>Gestor do sistema</span>
            </div>
          </div>
        </header>

        <div className="dashboard-demo-notice">
          <span>ⓘ</span>
          Indicadores conectados ao banco de dados. Informações atualizadas
          conforme os registros dos colaboradores.
        </div>

        {carregando && (
          <div className="dashboard-demo-notice">
            Carregando informações do banco de dados...
          </div>
        )}

        {erro && (
          <div className="dashboard-demo-notice">
            {erro}
          </div>
        )}

        {!carregando && !erro && (
          <>
            <section className="dashboard-section">
              <div className="section-heading">
                <div>
                  <h2>Indicadores gerais</h2>
                  <p>Acompanhamento do quadro de colaboradores</p>
                </div>
                <span className="dashboard-period">
                  Dados em tempo real
                </span>
              </div>

              <section className="cards">
                {cards.map((item) => (
                  <div className="card" key={item.titulo}>
                    <div className={`card-icon ${item.cor}`}>
                      {item.icone}
                    </div>

                    <div className="card-information">
                      <p>{item.titulo}</p>
                      <strong>{item.valor}</strong>
                      <span>{item.descricao}</span>
                    </div>
                  </div>
                ))}
              </section>
            </section>

            <section className="dashboard-charts">
              <div className="dashboard-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Colaboradores por departamento</h2>
                    <p>Distribuição real da equipe</p>
                  </div>
                  <span className="panel-icon">🏢</span>
                </div>

                <div className="chart-list">
                  {departamentos.length > 0 ? (
                    departamentos.map((item) => (
                      <div className="chart-item" key={item.nome}>
                        <div className="chart-label">
                          <span>{item.nome}</span>
                          <strong>{item.quantidade}</strong>
                        </div>

                        <div className="bar-background">
                          <div
                            className="bar-blue"
                            style={{
                              width: `${
                                (Number(item.quantidade) /
                                  maiorDepartamento) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Nenhum departamento cadastrado.</p>
                  )}
                </div>
              </div>

              <div className="dashboard-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Colaboradores por cargo</h2>
                    <p>Distribuição real por função</p>
                  </div>
                  <span className="panel-icon">💼</span>
                </div>

                <div className="chart-list">
                  {cargos.length > 0 ? (
                    cargos.map((item) => (
                      <div className="chart-item" key={item.nome}>
                        <div className="chart-label">
                          <span>{item.nome}</span>
                          <strong>{item.quantidade}</strong>
                        </div>

                        <div className="bar-background">
                          <div
                            className="bar-purple"
                            style={{
                              width: `${
                                (Number(item.quantidade) / maiorCargo) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Nenhum cargo cadastrado.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="dashboard-panel admission-panel">
              <div className="panel-heading">
                <div>
                  <h2>Histórico de admissões</h2>
                  <p>Quantidade real de admissões por mês</p>
                </div>
                <span className="panel-icon">📈</span>
              </div>

              <div className="admission-grid">
                {admissoes.length > 0 ? (
                  admissoes.map((item) => (
                    <div className="admission-item" key={item.mes}>
                      <div className="admission-info">
                        <span>{formatarMes(item.mes)}</span>
                        <strong>{item.quantidade}</strong>
                      </div>

                      <div className="bar-background">
                        <div
                          className="bar-green"
                          style={{
                            width: `${
                              (Number(item.quantidade) / maiorAdmissao) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Nenhuma admissão registrada.</p>
                )}
              </div>
            </section>
          </>
        )}

        <footer className="dashboard-footer">
          <span>PeopleFlow — Gestão de Pessoas</span>
          <span>Dashboard • AC3</span>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;

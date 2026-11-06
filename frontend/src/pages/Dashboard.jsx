
import Sidebar from "../components/Sidebar.jsx";
import "./Dashboard.css";

function Dashboard() {
  // DADOS DEMONSTRATIVOS — serão substituídos pelos dados reais na integração.
  const indicadores = [
    {
      titulo: "Total de Colaboradores",
      valor: "128",
      descricao: "Cadastros demonstrativos",
      icone: "👥",
      cor: "azul",
    },
    {
      titulo: "Colaboradores Ativos",
      valor: "112",
      descricao: "87,5% do total",
      icone: "✓",
      cor: "verde",
    },
    {
      titulo: "Colaboradores Desligados",
      valor: "16",
      descricao: "12,5% do total",
      icone: "↗",
      cor: "vermelho",
    },
    {
      titulo: "Departamentos",
      valor: "6",
      descricao: "Áreas cadastradas",
      icone: "🏢",
      cor: "roxo",
    },
  ];

  const departamentos = [
    { nome: "Operacional", quantidade: 48 },
    { nome: "Segurança", quantidade: 32 },
    { nome: "Administrativo", quantidade: 20 },
    { nome: "Monitoramento", quantidade: 15 },
    { nome: "Recursos Humanos", quantidade: 8 },
    { nome: "Financeiro", quantidade: 5 },
  ];

  const cargos = [
    { nome: "Controlador de Acesso", quantidade: 42 },
    { nome: "Vigilante", quantidade: 35 },
    { nome: "Supervisor", quantidade: 18 },
    { nome: "Assistente Administrativo", quantidade: 15 },
    { nome: "Outros", quantidade: 18 },
  ];

  const admissoes = [
    { mes: "Junho", quantidade: 8 },
    { mes: "Julho", quantidade: 12 },
    { mes: "Agosto", quantidade: 7 },
    { mes: "Setembro", quantidade: 15 },
    { mes: "Outubro", quantidade: 10 },
    { mes: "Novembro", quantidade: 6 },
  ];

  const maiorDepartamento = Math.max(
    ...departamentos.map((item) => item.quantidade)
  );

  const maiorCargo = Math.max(
    ...cargos.map((item) => item.quantidade)
  );

  const maiorAdmissao = Math.max(
    ...admissoes.map((item) => item.quantidade)
  );

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">PEOPLEFLOW / GESTÃO</span>
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
          Esta é uma prévia com dados demonstrativos. Os indicadores serão
          conectados ao banco de dados na próxima etapa.
        </div>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Indicadores gerais</h2>
              <p>Acompanhamento do quadro de colaboradores</p>
            </div>
            <span className="dashboard-period">Visão demonstrativa</span>
          </div>

          <section className="cards">
            {indicadores.map((item) => (
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
                <p>Distribuição demonstrativa da equipe</p>
              </div>
              <span className="panel-icon">🏢</span>
            </div>

            <div className="chart-list">
              {departamentos.map((item) => (
                <div className="chart-item" key={item.nome}>
                  <div className="chart-label">
                    <span>{item.nome}</span>
                    <strong>{item.quantidade}</strong>
                  </div>

                  <div className="bar-background">
                    <div
                      className="bar-blue"
                      style={{
                        width: `${(item.quantidade / maiorDepartamento) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <h2>Colaboradores por cargo</h2>
                <p>Distribuição demonstrativa por função</p>
              </div>
              <span className="panel-icon">💼</span>
            </div>

            <div className="chart-list">
              {cargos.map((item) => (
                <div className="chart-item" key={item.nome}>
                  <div className="chart-label">
                    <span>{item.nome}</span>
                    <strong>{item.quantidade}</strong>
                  </div>

                  <div className="bar-background">
                    <div
                      className="bar-purple"
                      style={{
                        width: `${(item.quantidade / maiorCargo) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard-panel admission-panel">
          <div className="panel-heading">
            <div>
              <h2>Histórico de admissões</h2>
              <p>Quantidade de admissões por mês — dados ilustrativos</p>
            </div>
            <span className="panel-icon">📈</span>
          </div>

          <div className="admission-grid">
            {admissoes.map((item) => (
              <div className="admission-item" key={item.mes}>
                <div className="admission-info">
                  <span>{item.mes}</span>
                  <strong>{item.quantidade}</strong>
                </div>

                <div className="bar-background">
                  <div
                    className="bar-green"
                    style={{
                      width: `${(item.quantidade / maiorAdmissao) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>PeopleFlow — Gestão de Pessoas</span>
          <span>Dashboard • AC3</span>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;

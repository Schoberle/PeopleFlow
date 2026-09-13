import Sidebar from "../components/Sidebar.jsx";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">

      <Sidebar />

      <main className="dashboard-content">

        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Visão geral da sua equipe</p>
          </div>

          <div className="user-info">
            <span>Olá, Administrador 👋</span>
          </div>
        </header>

        <section className="cards">

          <div className="card">
            <h3>Total de Colaboradores</h3>
            <strong>0</strong>
          </div>

          <div className="card">
            <h3>Colaboradores Ativos</h3>
            <strong>0</strong>
          </div>

          <div className="card">
            <h3>Documentos Pendentes</h3>
            <strong>0</strong>
          </div>

          <div className="card">
            <h3>Em Férias</h3>
            <strong>0</strong>
          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;
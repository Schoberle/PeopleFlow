
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  }

  return (
    <aside className="sidebar">
      <div className="logo">
        <h2>PeopleFlow</h2>
      </div>

      <nav className="menu">
        <button onClick={() => navigate("/dashboard")}>
          📊 Dashboard
        </button>

        <button onClick={() => navigate("/colaboradores")}>
          👥 Colaboradores
        </button>

        <button onClick={() => navigate("/ferias")}>
          📅 Férias
        </button>

        <button onClick={() => navigate("/configuracoes")}>
          ⚙️ Configurações
        </button>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout}>
          🚪 Sair
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

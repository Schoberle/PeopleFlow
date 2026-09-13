import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

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

        <button>
          📄 Documentos
        </button>

        <button>
          ⚙️ Configurações
        </button>

      </nav>

    </aside>
  );
}

export default Sidebar;

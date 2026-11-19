
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Colaboradores from "./pages/Colaboradores";
import CadastroColaborador from "./pages/CadastroColaborador";
import VisualizarColaborador from "./pages/VisualizarColaborador";
import EditarColaborador from "./pages/EditarColaborador";
import Ferias from "./pages/Ferias";
import Configuracoes from "./pages/Configuracoes";

function RotaProtegida({ children }) {
  const [autenticado, setAutenticado] = useState(null);

  useEffect(() => {
    async function verificarSessao() {
      try {
        const resposta = await fetch("/api/auth/me", {
          credentials: "include",
        });

        setAutenticado(resposta.ok);
      } catch {
        setAutenticado(false);
      }
    }

    verificarSessao();
  }, []);

  if (autenticado === null) {
    return <p>Verificando autenticação...</p>;
  }

  return autenticado ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <RotaProtegida>
              <Dashboard />
            </RotaProtegida>
          }
        />

        <Route
          path="/colaboradores"
          element={
            <RotaProtegida>
              <Colaboradores />
            </RotaProtegida>
          }
        />

        <Route
          path="/cadastro-colaborador"
          element={
            <RotaProtegida>
              <CadastroColaborador />
            </RotaProtegida>
          }
        />

        <Route
          path="/colaborador/:id"
          element={
            <RotaProtegida>
              <VisualizarColaborador />
            </RotaProtegida>
          }
        />

        <Route
          path="/editar-colaborador/:id"
          element={
            <RotaProtegida>
              <EditarColaborador />
            </RotaProtegida>
          }
        />

        <Route
          path="/ferias"
          element={
            <RotaProtegida>
              <Ferias />
            </RotaProtegida>
          }
        />

                  <Route
          path="/configuracoes"
          element={
            <RotaProtegida>
              <Configuracoes />
            </RotaProtegida>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

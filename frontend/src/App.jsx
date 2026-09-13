import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Colaboradores from "./pages/Colaboradores";
import CadastroColaborador from "./pages/CadastroColaborador";
import VisualizarColaborador from "./pages/VisualizarColaborador";
import EditarColaborador from "./pages/EditarColaborador";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/colaboradores"
          element={<Colaboradores />}
        />

        <Route
          path="/cadastro-colaborador"
          element={<CadastroColaborador />}
        />

        <Route
          path="/colaborador/:id"
          element={<VisualizarColaborador />}
        />

        <Route
          path="/editar-colaborador/:id"
          element={<EditarColaborador />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
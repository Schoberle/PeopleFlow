import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  function handleLogin(event) {
    event.preventDefault();

    navigate("/dashboard");
  }

  return (
    <div className="login-container">

      <div className="login-card">

        <div className="login-header">
          <h1>PeopleFlow</h1>
          <p>Gestão inteligente de pessoas</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>

          <div className="input-group">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="Digite seu e-mail"
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
            />
          </div>

          <button type="submit">
            Entrar
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;
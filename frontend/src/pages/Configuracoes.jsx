
import { useEffect, useState } from "react";
import "./Configuracoes.css";

function Configuracoes() {
  const [email, setEmail] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mensagemPerfil, setMensagemPerfil] = useState("");
  const [mensagemSenha, setMensagemSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const resposta = await fetch("/api/auth/me", {
          credentials: "include",
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(dados.erro || "Não foi possível carregar o perfil.");
        }

        setEmail(dados.usuario.email);
        setNovoEmail(dados.usuario.email);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarPerfil();
  }, []);

  async function atualizarEmail(e) {
    e.preventDefault();
    setMensagemPerfil("");
    setErro("");

    try {
      const resposta = await fetch("/api/auth/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: novoEmail,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Erro ao atualizar e-mail.");
      }

      setEmail(dados.usuario.email);
      setNovoEmail(dados.usuario.email);
      setMensagemPerfil(dados.mensagem);
    } catch (error) {
      setErro(error.message);
    }
  }

  async function alterarSenha(e) {
    e.preventDefault();
    setMensagemSenha("");
    setErro("");

    if (novaSenha !== confirmarSenha) {
      setErro("A confirmação da nova senha não corresponde.");
      return;
    }

    if (new TextEncoder().encode(novaSenha).length < 12) {
      setErro("A nova senha deve possuir pelo menos 12 bytes.");
      return;
    }

    try {
      const resposta = await fetch("/api/auth/senha", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          senhaAtual,
          novaSenha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Erro ao alterar senha.");
      }

      setMensagemSenha(dados.mensagem);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error) {
      setErro(error.message);
    }
  }

  if (carregando) {
    return (
      <div className="pagina-configuracoes">
        <p>Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="pagina-configuracoes">
      <div className="configuracoes-cabecalho">
        <h1>Configurações</h1>
        <p>Gerencie sua conta e as configurações do sistema.</p>
      </div>

      {erro && <div className="config-mensagem erro">{erro}</div>}

      <section className="config-card">
        <div className="config-card-titulo">
          <h2>Perfil do administrador</h2>
          <p>Gerencie as informações da sua conta.</p>
        </div>

        <form onSubmit={atualizarEmail} className="config-form">
          <div className="config-campo">
            <label>E-mail atual</label>
            <input type="email" value={email} disabled />
          </div>

          <div className="config-campo">
            <label>Novo e-mail</label>
            <input
              type="email"
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
              placeholder="Digite o novo e-mail"
              required
            />
          </div>

          <button type="submit" className="config-botao">
            Salvar alterações
          </button>

          {mensagemPerfil && (
            <p className="config-mensagem sucesso">{mensagemPerfil}</p>
          )}
        </form>
      </section>

      <section className="config-card">
        <div className="config-card-titulo">
          <h2>Segurança</h2>
          <p>Altere a senha de acesso do administrador.</p>
        </div>

        <form onSubmit={alterarSenha} className="config-form">
          <div className="config-campo">
            <label>Senha atual</label>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="Digite sua senha atual"
              required
            />
          </div>

          <div className="config-campo">
            <label>Nova senha</label>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo de 12 bytes"
              required
            />
          </div>

          <div className="config-campo">
            <label>Confirmar nova senha</label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Digite novamente a nova senha"
              required
            />
          </div>

          <button type="submit" className="config-botao">
            Alterar senha
          </button>

          {mensagemSenha && (
            <p className="config-mensagem sucesso">{mensagemSenha}</p>
          )}
        </form>
      </section>

      <section className="config-card">
        <div className="config-card-titulo">
          <h2>Informações do sistema</h2>
          <p>Informações gerais sobre a plataforma.</p>
        </div>

        <div className="config-sistema">
          <div>
            <span>Nome do sistema</span>
            <strong>PeopleFlow</strong>
          </div>

          <div>
            <span>Plataforma</span>
            <strong>Gestão de Recursos Humanos</strong>
          </div>

          <div>
            <span>Ambiente</span>
            <strong>Web</strong>
          </div>

          <div>
            <span>Acesso</span>
            <strong>Administrador</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Configuracoes;

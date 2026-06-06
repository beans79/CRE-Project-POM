// public/js/registro.js

const formRegistro = document.getElementById('form-registro');

formRegistro.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;

  if (senha !== confirmarSenha) {
    alert('As senhas não conferem.');
    return;
  }

  try {
    const response = await fetch('/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        email,
        senha,
        tipo: 1 // sempre aluno
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Cadastro realizado com sucesso! Faça login.');
      window.location.href = 'login.html';
    } else {
      alert(data.mensagem || 'Erro ao registrar usuário');
    }
  } catch (error) {
    alert('Erro ao conectar com o servidor: ' + error.message);
  }
});

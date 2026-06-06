const formLogin = document.getElementById('form-login');

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  
  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      localStorage.setItem('token', data.token);
      alert('Login realizado com sucesso!');
      window.location.href = 'dashboard.html';
    } else {
      alert(data.mensagem || 'Erro ao fazer login');
    }
  } catch (error) {
    alert('Erro ao conectar com o servidor');
  }
});

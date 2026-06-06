// public/js/auth.js

function verificarAutenticacao() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function getUsuarioAtual() {
  return JSON.parse(localStorage.getItem('usuario'));
}

function logout() {
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

function atualizarHeaderUsuario() {
  const usuario = getUsuarioAtual();
  if (usuario) {
    const nomeElement = document.getElementById('nomeUsuario');
    if (nomeElement) {
      nomeElement.innerHTML = usuario.nome;

      const tipoBadge = document.createElement('span');
      tipoBadge.className = 'tipo-badge';
      tipoBadge.style.cssText = `
        margin-left: 10px;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
        color: white;
      `;

      if (usuario.tipo === 1) {
        tipoBadge.textContent = 'ALUNO';
        tipoBadge.style.backgroundColor = '#28a745';
      } else if (usuario.tipo === 2) {
        tipoBadge.textContent = 'FUNCIONÁRIO';
        tipoBadge.style.backgroundColor = '#007bff';
      } else {
        tipoBadge.textContent = 'ADMIN';
        tipoBadge.style.backgroundColor = '#dc3545';
      }

      nomeElement.appendChild(tipoBadge);
    }
  }
}

function inicializarAutenticacao() {
  if (verificarAutenticacao()) {
    atualizarHeaderUsuario();
    montarMenuNav();
  }
}

function montarMenuNav() {
  const nav = document.getElementById('nav-menu');
  if (!nav) return;

  const usuario = getUsuarioAtual();
  if (!usuario) return;

  const path = window.location.pathname.split('/').pop() || 'dashboard.html';

  const linksBase = [
    { href: 'dashboard.html', label: 'Dashboard' },
    { href: 'livros.html', label: 'Livros' },
    { href: 'favoritos.html', label: 'Favoritos' }
  ];

  let linksExtras = [];
  if (usuario.tipo === 1) {
    linksExtras = [
      { href: 'arrendamentos.html', label: 'Meus Arrendamentos' },
      { href: 'compras.html', label: 'Compras' },
      { href: 'minhas-compras.html', label: 'Minhas Compras' }
    ];
  } else if (usuario.tipo === 2) {
    linksExtras = [
      { href: 'arrendamentos.html', label: 'Meus Arrendamentos' },
      { href: 'aprovacoes.html', label: 'Aprovações' },
      { href: 'compras-admin.html', label: 'Compras Admin' }
    ];
  } else if (usuario.tipo === 3) {
    linksExtras = [
      { href: 'arrendamentos.html', label: 'Meus Arrendamentos' },
      { href: 'aprovacoes.html', label: 'Aprovações' },
      { href: 'compras-admin.html', label: 'Compras Admin' },
      { href: 'admin-usuarios.html', label: 'Usuários (Admin)' }
    ];
  }

  const todosLinks = [...linksBase, ...linksExtras];

  nav.innerHTML = '';
  todosLinks.forEach(link => {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.label;
    a.className = 'nav-btn';
    if (path === link.href) {
      a.classList.add('active');
    }
    nav.appendChild(a);
  });
}


// js/minhas-compras.js

const API_BASE = 'http://localhost:3000';

function obterUsuarioLogado() {
  const usuarioStr = localStorage.getItem('usuario');
  if (!usuarioStr) {
    window.location.href = 'login.html';
    return null;
  }
  try {
    return JSON.parse(usuarioStr);
  } catch (e) {
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
    return null;
  }
}

function logout() {
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

function formatarData(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

async function carregarMinhasCompras() {
  const usuario = obterUsuarioLogado();
  if (!usuario) return;

  const nomeUsuarioEl = document.getElementById('nomeUsuario');
  if (nomeUsuarioEl) {
    nomeUsuarioEl.textContent = usuario.nome || '';
  }

  const lista = document.getElementById('lista-compras');
  const msgVazio = document.getElementById('mensagem-vazio');

  try {
    const resp = await fetch(`${API_BASE}/compras/me?usuarioId=${usuario.id}`);
    const data = await resp.json();

    lista.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      msgVazio.style.display = 'block';
      return;
    }

    msgVazio.style.display = 'none';

    data.forEach(compra => {
      const card = document.createElement('div');
      card.className = 'book-card';

      const titulo = document.createElement('h3');
      titulo.textContent = `Compra #${compra.id}`;
      card.appendChild(titulo);

      const infoLivro = document.createElement('p');
      infoLivro.textContent = `Livro ID: ${compra.livroId}`;
      card.appendChild(infoLivro);

      const qtd = document.createElement('p');
      qtd.textContent = `Quantidade: ${compra.quantidade}`;
      card.appendChild(qtd);

      const total = document.createElement('p');
      total.textContent = `Total: € ${Number(compra.total || 0).toFixed(2)}`;
      card.appendChild(total);

      const status = document.createElement('p');
      status.textContent = `Status: ${compra.status}`;
      card.appendChild(status);

      const criadoEm = document.createElement('p');
      criadoEm.textContent = `Criado em: ${formatarData(compra.criadoEm)}`;
      card.appendChild(criadoEm);

      lista.appendChild(card);
    });
  } catch (err) {
    console.error('Erro ao carregar compras', err);
    alert('Erro ao carregar suas compras. Tente novamente mais tarde.');
  }
}

document.addEventListener('DOMContentLoaded', carregarMinhasCompras);

// public/js/aprovacoes.js

inicializarAutenticacao();

const usuario = getUsuarioAtual();
if (!usuario) window.location.href = 'login.html';

// Bloqueia aluno
if (usuario.tipo === 1) {
  alert('Acesso permitido apenas para funcionários e administradores.');
  window.location.href = 'dashboard.html';
}

function logout() {
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

const listaPendentes = document.getElementById('lista-pendentes');
const listaTodos = document.getElementById('lista-todos');

async function carregarArrendamentos() {
  try {
    const response = await fetch('/arrendamentos');
    const arrs = await response.json();

    listaPendentes.innerHTML = '';
    listaTodos.innerHTML = '';

    if (!Array.isArray(arrs) || arrs.length === 0) {
      listaPendentes.innerHTML = '<p>Nenhum arrendamento encontrado.</p>';
      listaTodos.innerHTML = '<p>Nenhum arrendamento encontrado.</p>';
      return;
    }

    arrs.forEach(a => {
      const baseHTML = `
        <h3>Arrendamento #${a.id}</h3>
        <p><strong>Usuário ID:</strong> ${a.usuarioId}</p>
        <p><strong>Livro ID:</strong> ${a.livroId}</p>
        <p><strong>Início:</strong> ${new Date(a.dataInicio).toLocaleDateString('pt-BR')}</p>
        <p><strong>Fim:</strong> ${new Date(a.dataFim).toLocaleDateString('pt-BR')}</p>
        <p><strong>Status:</strong> ${a.status}</p>
        ${
          a.status === 'PENDENTE'
            ? `<div class="action-buttons" style="margin-top:10px;">
                 <button class="btn btn-primary" onclick="aprovar(${a.id})">Aprovar</button>
                 <button class="btn btn-danger" onclick="rejeitar(${a.id})">Rejeitar</button>
               </div>`
            : ''
        }
      `;

      const cardTodos = document.createElement('div');
      cardTodos.className = 'book-card';
      cardTodos.innerHTML = baseHTML;
      listaTodos.appendChild(cardTodos);

      if (a.status === 'PENDENTE') {
        const cardPend = document.createElement('div');
        cardPend.className = 'book-card';
        cardPend.innerHTML = baseHTML;
        listaPendentes.appendChild(cardPend);
      }
    });
  } catch (error) {
    console.error('Erro ao carregar arrendamentos:', error);
    listaPendentes.innerHTML = '<p>Erro ao carregar arrendamentos.</p>';
    listaTodos.innerHTML = '<p>Erro ao carregar arrendamentos.</p>';
  }
}

async function aprovar(id) {
  if (!confirm(`Confirmar aprovação do arrendamento #${id}?`)) return;

  try {
    const response = await fetch(`/arrendamentos/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APROVADO' })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Arrendamento aprovado com sucesso!');
      carregarArrendamentos();
    } else {
      alert(data.mensagem || 'Erro ao aprovar arrendamento');
    }
  } catch (error) {
    alert('Erro ao conectar com o servidor: ' + error.message);
  }
}

async function rejeitar(id) {
  if (!confirm(`Confirmar rejeição do arrendamento #${id}?`)) return;

  try {
    const response = await fetch(`/arrendamentos/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJEITADO' })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Arrendamento rejeitado com sucesso!');
      carregarArrendamentos();
    } else {
      alert(data.mensagem || 'Erro ao rejeitar arrendamento');
    }
  } catch (error) {
    alert('Erro ao conectar com o servidor: ' + error.message);
  }
}

window.aprovar = aprovar;
window.rejeitar = rejeitar;

carregarArrendamentos();

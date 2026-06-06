// public/js/compras-admin.js

inicializarAutenticacao();

const usuario = getUsuarioAtual();
if (!usuario) window.location.href = 'login.html';

// bloqueia aluno
if (usuario.tipo === 1) {
  alert('Acesso permitido apenas para funcionários e administradores.');
  window.location.href = 'dashboard.html';
}

function logout() {
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

const listaComprasAdmin = document.getElementById('lista-compras-admin');

async function carregarComprasAdmin() {
  try {
    const response = await fetch('/compras');
    const comp = await response.json();

    listaComprasAdmin.innerHTML = '';

    if (!Array.isArray(comp) || comp.length === 0) {
      listaComprasAdmin.innerHTML = '<p>Nenhuma compra registrada.</p>';
      return;
    }

    comp.forEach(c => {
      const card = document.createElement('div');
      card.className = 'book-card';
      card.innerHTML = `
        <h3>Compra #${c.id}</h3>
        <p><strong>Usuário ID:</strong> ${c.usuarioId}</p>
        <p><strong>Livro ID:</strong> ${c.livroId}</p>
        <p><strong>Quantidade:</strong> ${c.quantidade}</p>
        <p><strong>Total:</strong> € ${c.total.toFixed(2)}</p>
        <p><strong>Status:</strong> ${c.status}</p>
        <p><strong>Data:</strong> ${new Date(c.criadoEm).toLocaleString('pt-BR')}</p>
        ${
          c.status === 'PENDENTE'
            ? `<div class="action-buttons" style="margin-top:10px;">
                 <button class="btn btn-primary" onclick="atualizarStatusCompra(${c.id}, 'APROVADA')">Aprovar</button>
                 <button class="btn btn-danger" onclick="atualizarStatusCompra(${c.id}, 'CANCELADA')">Cancelar</button>
               </div>`
            : ''
        }
      `;
      listaComprasAdmin.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar compras admin:', error);
    listaComprasAdmin.innerHTML = '<p>Erro ao carregar compras.</p>';
  }
}

async function atualizarStatusCompra(id, status) {
  if (!confirm(`Confirmar alteração da compra #${id} para ${status}?`)) return;

  try {
    const response = await fetch(`/compras/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Status atualizado com sucesso!');
      carregarComprasAdmin();
    } else {
      alert(data.mensagem || 'Erro ao atualizar status da compra');
    }
  } catch (error) {
    alert('Erro ao conectar com o servidor: ' + error.message);
  }
}

window.atualizarStatusCompra = atualizarStatusCompra;

carregarComprasAdmin();

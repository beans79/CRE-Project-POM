// public/js/admin-usuarios.js

inicializarAutenticacao();

const usuarioAtual = getUsuarioAtual();
if (!usuarioAtual) window.location.href = 'login.html';

function logout() {
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

const areaBloqueio = document.getElementById('area-admin-bloqueio');
const areaConteudo = document.getElementById('area-admin-conteudo');
const formNovoUsuario = document.getElementById('form-novo-usuario');
const listaUsuarios = document.getElementById('lista-usuarios');

// Só admin pode ver o conteúdo
if (usuarioAtual.tipo !== 3) {
  areaBloqueio.style.display = 'block';
  areaConteudo.style.display = 'none';
} else {
  areaBloqueio.style.display = 'none';
  areaConteudo.style.display = 'block';
  carregarUsuarios();
}

// ------- LISTAR -------

async function carregarUsuarios() {
  try {
    const response = await fetch('/usuarios');
    const usuarios = await response.json();

    listaUsuarios.innerHTML = '';

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="5" style="text-align:center;">Nenhum usuário encontrado.</td>';
      listaUsuarios.appendChild(tr);
      return;
    }

    usuarios.forEach(u => {
      const tr = document.createElement('tr');

      const tipoLabel =
        u.tipo === 1 ? 'Aluno' :
        u.tipo === 2 ? 'Funcionário' :
        'Admin';

      tr.innerHTML = `
        <td>${u.id}</td>
        <td><input type="text" value="${u.nome}" data-id="${u.id}" data-campo="nome" class="input-inline"></td>
        <td><input type="email" value="${u.email}" data-id="${u.id}" data-campo="email" class="input-inline"></td>
        <td>
          <select data-id="${u.id}" data-campo="tipo" class="input-inline">
            <option value="1" ${u.tipo === 1 ? 'selected' : ''}>Aluno</option>
            <option value="2" ${u.tipo === 2 ? 'selected' : ''}>Funcionário</option>
            <option value="3" ${u.tipo === 3 ? 'selected' : ''}>Admin</option>
          </select>
        </td>
        <td>
          <button class="btn btn-primary" onclick="salvarUsuario(${u.id})">Salvar</button>
          ${
            u.id !== 1
              ? `<button class="btn btn-danger" onclick="excluirUsuario(${u.id})">Excluir</button>`
              : ''
          }
        </td>
      `;

      listaUsuarios.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
  }
}

// ------- CRIAR (POST /registro) -------

formNovoUsuario.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const tipo = parseInt(document.getElementById('tipo').value);

  if (![2, 3].includes(tipo)) {
    alert('Tipo inválido. Selecione Funcionário ou Admin.');
    return;
  }

  try {
    const response = await fetch('/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha, tipo })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Usuário criado com sucesso!');
      formNovoUsuario.reset();
      carregarUsuarios();
    } else {
      alert(data.mensagem || 'Erro ao criar usuário');
    }
  } catch (error) {
    alert('Erro ao conectar com o servidor: ' + error.message);
  }
});

// ------- ATUALIZAR (PUT /usuarios/:id) -------

async function salvarUsuario(id) {
  const nomeInput = document.querySelector(`input[data-id="${id}"][data-campo="nome"]`);
  const emailInput = document.querySelector(`input[data-id="${id}"][data-campo="email"]`);
  const tipoSelect = document.querySelector(`select[data-id="${id}"][data-campo="tipo"]`);

  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim();
  const tipo = parseInt(tipoSelect.value);

  if (!nome || !email) {
    alert('Nome e email são obrigatórios.');
    return;
  }

  try {
    const response = await fetch(`/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, tipo })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Usuário atualizado com sucesso!');
      carregarUsuarios();
    } else {
      alert(data.mensagem || 'Erro ao atualizar usuário');
    }
  } catch (error) {
    alert('Erro ao conectar com o servidor: ' + error.message);
  }
}

// ------- EXCLUIR (DELETE /usuarios/:id) -------

async function excluirUsuario(id) {
  if (id === 1) {
    alert('O admin principal não pode ser removido.');
    return;
  }

  if (!confirm(`Deseja realmente excluir o usuário #${id}?`)) return;

  try {
    const response = await fetch(`/usuarios/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (response.ok) {
      alert('Usuário excluído com sucesso!');
      carregarUsuarios();
    } else {
      alert(data.mensagem || 'Erro ao excluir usuário');
    }
  } catch (error) {
    alert('Erro ao conectar com o servidor: ' + error.message);
  }
}

// expõe funções para os botões inline
window.salvarUsuario = salvarUsuario;
window.excluirUsuario = excluirUsuario;

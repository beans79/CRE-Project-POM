// public/js/arrendamentos.js

inicializarAutenticacao();

const usuario = getUsuarioAtual();
if (!usuario) window.location.href = 'login.html';

function logout() {
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

const formArrendamento = document.getElementById('form-arrendamento');
const listaArrendamentos = document.getElementById('lista-arrendamentos');
const selectLivro = document.getElementById('livroSelect');

// Carrega lista de livros para o select
async function carregarLivrosSelect() {
  try {
    const response = await fetch('/livros/disponiveis');
    const livros = await response.json();

    // limpa mantendo o "Selecione..."
    selectLivro.innerHTML = '<option value="">Selecione um livro...</option>';

    if (!Array.isArray(livros) || livros.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.disabled = true;
      opt.textContent = 'Nenhum livro disponível';
      selectLivro.appendChild(opt);
      return;
    }

    livros.forEach(livro => {
      const option = document.createElement('option');
      option.value = livro.id; // usamos o id no value
      option.textContent = `${livro.nome} (${livro.autor})`;
      selectLivro.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar livros para o select:', error);
  }
}

formArrendamento.addEventListener('submit', async (e) => {
  e.preventDefault();

  const livroId = selectLivro.value;
  const dataInicio = document.getElementById('dataInicio').value;
  const dataFim = document.getElementById('dataFim').value;

  if (!livroId) {
    alert('Selecione um livro.');
    return;
  }

  if (!dataInicio || !dataFim) {
    alert('Informe as datas de início e fim');
    return;
  }

  if (new Date(dataFim) <= new Date(dataInicio)) {
    alert('Data fim deve ser maior que a data início');
    return;
  }

  try {
    const response = await fetch('/arrendamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: usuario.id,
        livroId,
        dataInicio,
        dataFim
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Arrendamento solicitado com sucesso!');
      formArrendamento.reset();
      carregarLivrosSelect();      // recarrega para atualizar disponibilidade
      carregarMeusArrendamentos();
    } else {
      alert(data.mensagem || 'Erro ao solicitar arrendamento');
    }
  } catch (error) {
    alert('Erro ao conectar com o servidor: ' + error.message);
  }
});

async function carregarMeusArrendamentos() {
  try {
    const response = await fetch(`/arrendamentos/me?usuarioId=${usuario.id}`);
    const arrs = await response.json();

    listaArrendamentos.innerHTML = '';

    if (!Array.isArray(arrs) || arrs.length === 0) {
      listaArrendamentos.innerHTML = '<p>Nenhum arrendamento encontrado.</p>';
      return;
    }

    arrs.forEach(a => {
      const card = document.createElement('div');
      card.className = 'book-card';
      card.innerHTML = `
        <h3>Arrendamento #${a.id}</h3>
        <p><strong>Livro ID:</strong> ${a.livroId}</p>
        <p><strong>Início:</strong> ${new Date(a.dataInicio).toLocaleDateString('pt-BR')}</p>
        <p><strong>Fim:</strong> ${new Date(a.dataFim).toLocaleDateString('pt-BR')}</p>
        <p><strong>Status:</strong> ${a.status}</p>
      `;
      listaArrendamentos.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar arrendamentos:', error);
    listaArrendamentos.innerHTML = '<p>Erro ao carregar arrendamentos.</p>';
  }
}

// inicialização
carregarLivrosSelect();
carregarMeusArrendamentos();

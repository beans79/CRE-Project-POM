// public/js/livros.js

const usuario = getUsuarioAtual();
if (!usuario) {
  window.location.href = 'login.html';
}

function logout() {
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

const formAdicionar = document.getElementById('form-adicionar');
const listaLivros = document.getElementById('lista-livros');

// Aluno não vê o formulário de cadastro
if (usuario.tipo === 1 && formAdicionar) {
  formAdicionar.style.display = 'none';
}

formAdicionar?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const autor = document.getElementById('autor').value;
  const paginas = document.getElementById('paginas').value;
  const descricao = document.getElementById('descricao').value;
  const imagemUrl = document.getElementById('imagemUrl').value;
  const estoqueEl = document.getElementById('estoque');
  const precoEl = document.getElementById('preco');

  const estoque = estoqueEl ? estoqueEl.value : 1;
  const preco = precoEl ? precoEl.value : 0;

  try {
    const response = await fetch('/livros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, autor, paginas, descricao, imagemUrl, estoque, preco })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Livro adicionado com sucesso!');
      formAdicionar.reset();
      carregarLivros();
    } else {
      alert(data.mensagem || 'Erro ao adicionar livro');
    }
  } catch (error) {
    alert('Erro ao conectar com o servidor: ' + error.message);
  }
});

async function carregarLivros() {
  try {
    const response = await fetch('/livros');
    const livros = await response.json();

    listaLivros.innerHTML = '';

    if (!Array.isArray(livros) || livros.length === 0) {
      listaLivros.innerHTML = '<p>Nenhum livro cadastrado.</p>';
      return;
    }

    livros.forEach(livro => {
      const card = document.createElement('div');
      card.className = 'book-card';
      card.onclick = () => window.location.href = `detalhes.html?id=${livro.id}`;
      card.innerHTML = `
        <img src="${livro.imagemUrl}" alt="${livro.nome}">
        <h3>${livro.nome}</h3>
        <p><strong>Autor:</strong> ${livro.autor}</p>
        <p><strong>Páginas:</strong> ${livro.paginas}</p>
        <p><strong>Estoque:</strong> ${livro.estoque ?? '-'}</p>
        <p><strong>Preço:</strong> € ${livro.preco?.toFixed(2) || '0,00'}</p>
      `;
      listaLivros.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar livros:', error);
    listaLivros.innerHTML = '<p>Erro ao carregar livros.</p>';
  }
}

carregarLivros();

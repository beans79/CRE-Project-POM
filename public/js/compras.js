// public/js/compras.js

inicializarAutenticacao();

const usuario = getUsuarioAtual();
if (!usuario) window.location.href = 'login.html';

function logout() {
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

const listaLivrosCompra = document.getElementById('lista-livros-compra');

async function carregarLivrosCompra() {
  try {
    const response = await fetch('/livros/disponiveis');
    const livros = await response.json();

    listaLivrosCompra.innerHTML = '';

    if (!Array.isArray(livros) || livros.length === 0) {
      listaLivrosCompra.innerHTML = '<p>Nenhum livro disponível para compra.</p>';
      return;
    }

    livros.forEach(livro => {
      const card = document.createElement('div');
      card.className = 'book-card';
      card.innerHTML = `
        <img src="${livro.imagemUrl}" alt="${livro.nome}">
        <h3>${livro.nome}</h3>
        <p><strong>Autor:</strong> ${livro.autor}</p>
        <p><strong>Preço:</strong> € ${livro.preco?.toFixed(2) || '0,00'}</p>
        <p><strong>Estoque:</strong> ${livro.estoque}</p>
        <div class="form-group" style="margin-top:10px;">
          <label for="qtd-${livro.id}">Quantidade:</label>
          <input type="number" id="qtd-${livro.id}" min="1" max="${livro.estoque}" value="1">
        </div>
        <button class="btn btn-primary" onclick="comprarLivro(${livro.id})">Comprar</button>
      `;
      listaLivrosCompra.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar livros para compra:', error);
    listaLivrosCompra.innerHTML = '<p>Erro ao carregar livros.</p>';
  }
}

async function comprarLivro(livroId) {
  const inputQtd = document.getElementById(`qtd-${livroId}`);
  const quantidade = parseInt(inputQtd.value);

  if (isNaN(quantidade) || quantidade <= 0) {
    alert('Quantidade inválida');
    return;
  }

  try {
    const response = await fetch('/compras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId: usuario.id, livroId, quantidade })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Compra registrada com sucesso! Aguarde aprovação.');
      carregarLivrosCompra();
    } else {
      alert(data.mensagem || 'Erro ao registrar compra');
    }
  } catch (error) {
    alert('Erro ao conectar com o servidor: ' + error.message);
  }
}

window.comprarLivro = comprarLivro;

carregarLivrosCompra();

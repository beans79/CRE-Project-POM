const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nome:
 *           type: string
 *         email:
 *           type: string
 *         tipo:
 *           type: integer
 *           description: 1 = Aluno, 2 = Funcionário, 3 = Admin
 *     NovoUsuario:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *       properties:
 *         nome:
 *           type: string
 *         email:
 *           type: string
 *         senha:
 *           type: string
 *         tipo:
 *           type: integer
 *           description: Opcional. Se não informado, assume 1 (Aluno)
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - senha
 *       properties:
 *         email:
 *           type: string
 *         senha:
 *           type: string
 *     Livro:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nome:
 *           type: string
 *         autor:
 *           type: string
 *         paginas:
 *           type: integer
 *         descricao:
 *           type: string
 *         imagemUrl:
 *           type: string
 *         dataCadastro:
 *           type: string
 *           format: date-time
 *         estoque:
 *           type: integer
 *         preco:
 *           type: number
 *           format: float
 *     NovoLivro:
 *       type: object
 *       required:
 *         - nome
 *         - autor
 *         - paginas
 *       properties:
 *         nome:
 *           type: string
 *         autor:
 *           type: string
 *         paginas:
 *           type: integer
 *         descricao:
 *           type: string
 *         imagemUrl:
 *           type: string
 *         estoque:
 *           type: integer
 *         preco:
 *           type: number
 *           format: float
 *     FavoritoRequest:
 *       type: object
 *       required:
 *         - usuarioId
 *         - livroId
 *       properties:
 *         usuarioId:
 *           type: integer
 *         livroId:
 *           type: integer
 *     Arrendamento:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         usuarioId:
 *           type: integer
 *         livroId:
 *           type: integer
 *         dataInicio:
 *           type: string
 *         dataFim:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDENTE, APROVADO, REJEITADO]
 *         criadoEm:
 *           type: string
 *           format: date-time
 *     NovoArrendamento:
 *       type: object
 *       required:
 *         - usuarioId
 *         - livroId
 *         - dataInicio
 *         - dataFim
 *       properties:
 *         usuarioId:
 *           type: integer
 *         livroId:
 *           type: integer
 *         dataInicio:
 *           type: string
 *         dataFim:
 *           type: string
 *     AtualizaStatusArrendamento:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [APROVADO, REJEITADO]
 *     Compra:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         usuarioId:
 *           type: integer
 *         livroId:
 *           type: integer
 *         quantidade:
 *           type: integer
 *         total:
 *           type: number
 *         status:
 *           type: string
 *           enum: [PENDENTE, APROVADA, CANCELADA]
 *         criadoEm:
 *           type: string
 *           format: date-time
 *     NovaCompra:
 *       type: object
 *       required:
 *         - usuarioId
 *         - livroId
 *         - quantidade
 *       properties:
 *         usuarioId:
 *           type: integer
 *         livroId:
 *           type: integer
 *         quantidade:
 *           type: integer
 *     AtualizaStatusCompra:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [APROVADA, CANCELADA]
 */

// "Banco de dados" em memória
let usuarios = [
  { id: 1, nome: 'Admin Master', email: 'admin@biblioteca.com', senha: '123456', tipo: 3 },
  { id: 2, nome: 'João Funcionário', email: 'func@biblio.com', senha: '123456', tipo: 2 },
  { id: 3, nome: 'Maria Aluna', email: 'aluna@teste.com', senha: '123456', tipo: 1 }
];

let livros = [
  {
    id: 1, nome: 'Clean Code', autor: 'Robert C. Martin', paginas: 464,
    descricao: 'Um guia completo sobre boas práticas de programação',
    imagemUrl: 'https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg',
    dataCadastro: new Date().toISOString(), estoque: 5, preco: 49.90
  },
  {
    id: 2, nome: 'Harry Potter', autor: 'J.K. Rowling', paginas: 309,
    descricao: 'O primeiro livro da saga do bruxinho mais famoso',
    imagemUrl: 'https://m.media-amazon.com/images/I/81ibfYk4qmL._SY466_.jpg',
    dataCadastro: new Date().toISOString(), estoque: 3, preco: 39.90
  }
];

let favoritos = [];       // { usuarioId, livroId }
let arrendamentos = [];   // { id, usuarioId, livroId, dataInicio, dataFim, status, criadoEm }
let compras = [];         // { id, usuarioId, livroId, quantidade, total, status, criadoEm }

let proximoIdUsuario = 4;
let proximoIdLivro = 3;
let proximoIdArrendamento = 1;
let proximoIdCompra = 1;

// ==================== AUTENTICAÇÃO (SEM TOKEN) ====================

/**
 * @swagger
 * /registro:
 *   post:
 *     summary: Registra um novo usuário
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoUsuario'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Email já cadastrado ou dados inválidos
 */
app.post('/registro', (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  const usuarioExistente = usuarios.find(u => u.email === email);
  if (usuarioExistente) {
    return res.status(400).json({ mensagem: 'Email já cadastrado' });
  }

  let tipoFinal = 1;
  if ([1, 2, 3].includes(parseInt(tipo))) {
    tipoFinal = parseInt(tipo);
  }

  const novoUsuario = {
    id: proximoIdUsuario++,
    nome,
    email,
    senha,
    tipo: tipoFinal
  };

  usuarios.push(novoUsuario);

  const { senha: _, ...usuarioSemSenha } = novoUsuario;
  res.status(201).json({
    mensagem: 'Usuário criado com sucesso',
    usuario: usuarioSemSenha
  });
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Realiza login de usuário
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Email ou senha incorretos
 */
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);
  if (!usuario) {
    return res.status(401).json({ mensagem: 'Email ou senha incorretos' });
  }
  const { senha: _, ...usuarioSemSenha } = usuario;
  res.json({
    mensagem: 'Login realizado com sucesso',
    usuario: usuarioSemSenha
  });
});

// ==================== USUÁRIOS (ADMIN / CRUD) ====================

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Lista todos os usuários (sem senha)
 *     tags:
 *       - Usuários
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 */
app.get('/usuarios', (req, res) => {
  const usuariosSemSenha = usuarios.map(({ senha, ...u }) => u);
  res.json(usuariosSemSenha);
});

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Atualiza dados de um usuário
 *     tags:
 *       - Usuários
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               tipo:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
 */
app.put('/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const usuario = usuarios.find(u => u.id === id);

  if (!usuario) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado' });
  }

  const { nome, email, tipo } = req.body;

  if (nome) usuario.nome = nome;
  if (email) usuario.email = email;
  if ([1, 2, 3].includes(parseInt(tipo))) {
    usuario.tipo = parseInt(tipo);
  }

  const { senha: _, ...usuarioSemSenha } = usuario;
  res.json(usuarioSemSenha);
});

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Remove um usuário
 *     tags:
 *       - Usuários
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *       403:
 *         description: Tentativa de excluir o admin principal
 *       404:
 *         description: Usuário não encontrado
 */
app.delete('/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (id === 1) {
    return res.status(403).json({ mensagem: 'Admin principal não pode ser deletado' });
  }

  const index = usuarios.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado' });
  }

  usuarios.splice(index, 1);
  res.json({ mensagem: 'Usuário deletado com sucesso' });
});

// ==================== LIVROS ====================

/**
 * @swagger
 * /livros:
 *   get:
 *     summary: Lista todos os livros
 *     tags:
 *       - Livros
 *     responses:
 *       200:
 *         description: Lista de livros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Livro'
 */
app.get('/livros', (req, res) => {
  res.json(livros);
});

/**
 * @swagger
 * /livros/disponiveis:
 *   get:
 *     summary: Lista livros com estoque > 0
 *     tags:
 *       - Livros
 *     responses:
 *       200:
 *         description: Lista de livros disponíveis
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Livro'
 */
app.get('/livros/disponiveis', (req, res) => {
  const disponiveis = livros
    .filter(l => l.estoque > 0)
    .map(l => ({ ...l, disponivel: true }));
  res.json(disponiveis);
});

/**
 * @swagger
 * /livros/{id}:
 *   get:
 *     summary: Busca um livro por ID
 *     tags:
 *       - Livros
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do livro
 *     responses:
 *       200:
 *         description: Livro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Livro'
 *       404:
 *         description: Livro não encontrado
 */
app.get('/livros/:id', (req, res) => {
  const livro = livros.find(l => l.id === parseInt(req.params.id));
  if (!livro) return res.status(404).json({ mensagem: 'Livro não encontrado' });
  res.json(livro);
});

/**
 * @swagger
 * /livros:
 *   post:
 *     summary: Cria um novo livro
 *     tags:
 *       - Livros
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoLivro'
 *     responses:
 *       201:
 *         description: Livro criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Livro'
 *       400:
 *         description: Campos obrigatórios não informados
 */
app.post('/livros', (req, res) => {
  const { nome, autor, paginas, descricao, imagemUrl, estoque = 1, preco = 0 } = req.body;
  if (!nome || !autor || !paginas) {
    return res.status(400).json({ mensagem: 'Nome, autor e páginas são obrigatórios' });
  }
  const novoLivro = {
    id: proximoIdLivro++,
    nome,
    autor,
    paginas: parseInt(paginas),
    descricao: descricao || '',
    imagemUrl: imagemUrl || 'https://via.placeholder.com/150',
    dataCadastro: new Date().toISOString(),
    estoque: parseInt(estoque),
    preco: parseFloat(preco)
  };
  livros.push(novoLivro);
  res.status(201).json(novoLivro);
});

/**
 * @swagger
 * /livros/{id}:
 *   put:
 *     summary: Atualiza dados de um livro
 *     tags:
 *       - Livros
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do livro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoLivro'
 *     responses:
 *       200:
 *         description: Livro atualizado
 *       404:
 *         description: Livro não encontrado
 */
app.put('/livros/:id', (req, res) => {
  const livro = livros.find(l => l.id === parseInt(req.params.id));
  if (!livro) return res.status(404).json({ mensagem: 'Livro não encontrado' });

  const { nome, autor, paginas, descricao, imagemUrl, estoque, preco } = req.body;
  if (nome) livro.nome = nome;
  if (autor) livro.autor = autor;
  if (paginas) livro.paginas = parseInt(paginas);
  if (descricao !== undefined) livro.descricao = descricao;
  if (imagemUrl) livro.imagemUrl = imagemUrl;
  if (estoque !== undefined) livro.estoque = Math.max(0, parseInt(estoque));
  if (preco !== undefined) livro.preco = parseFloat(preco);

  res.json(livro);
});

/**
 * @swagger
 * /livros/{id}:
 *   delete:
 *     summary: Remove um livro
 *     tags:
 *       - Livros
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do livro
 *     responses:
 *       200:
 *         description: Livro removido
 *       404:
 *         description: Livro não encontrado
 */
app.delete('/livros/:id', (req, res) => {
  const index = livros.findIndex(l => l.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ mensagem: 'Livro não encontrado' });
  livros.splice(index, 1);
  res.json({ mensagem: 'Livro removido' });
});

// ==================== ESTATÍSTICAS ====================

/**
 * @swagger
 * /estatisticas:
 *   get:
 *     summary: Retorna estatísticas gerais da biblioteca
 *     tags:
 *       - Estatísticas
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 */
app.get('/estatisticas', (req, res) => {
  const totalLivros = livros.length;
  const totalPaginas = livros.reduce((acc, l) => acc + l.paginas, 0);
  const totalUsuarios = usuarios.length;
  const usuariosPorTipo = {
    alunos: usuarios.filter(u => u.tipo === 1).length,
    funcionarios: usuarios.filter(u => u.tipo === 2).length,
    admins: usuarios.filter(u => u.tipo === 3).length
  };
  const livrosDisponiveis = livros.filter(l => l.estoque > 0).length;
  const arrendamentosPendentes = arrendamentos.filter(a => a.status === 'PENDENTE').length;
  const comprasPendentes = compras.filter(c => c.status === 'PENDENTE').length;

  res.json({
    totalLivros,
    totalPaginas,
    totalUsuarios,
    usuariosPorTipo,
    livrosDisponiveis,
    arrendamentosPendentes,
    comprasPendentes
  });
});

// ==================== FAVORITOS ====================

/**
 * @swagger
 * /favoritos/{usuarioId}:
 *   get:
 *     summary: Lista livros favoritos de um usuário
 *     tags:
 *       - Favoritos
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de livros favoritos
 */
app.get('/favoritos/:usuarioId', (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);
  const favoritosUsuario = favoritos
    .filter(f => f.usuarioId === usuarioId)
    .map(f => livros.find(l => l.id === f.livroId))
    .filter(Boolean);
  res.json(favoritosUsuario);
});

/**
 * @swagger
 * /favoritos:
 *   post:
 *     summary: Adiciona um livro aos favoritos
 *     tags:
 *       - Favoritos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FavoritoRequest'
 *     responses:
 *       201:
 *         description: Livro adicionado aos favoritos
 *       400:
 *         description: Já está nos favoritos
 */
app.post('/favoritos', (req, res) => {
  const { usuarioId, livroId } = req.body;
  const jaFavoritado = favoritos.find(f => f.usuarioId === usuarioId && f.livroId === livroId);
  if (jaFavoritado) return res.status(400).json({ mensagem: 'Já está nos favoritos' });
  favoritos.push({ usuarioId, livroId });
  res.status(201).json({ mensagem: 'Livro adicionado aos favoritos' });
});

/**
 * @swagger
 * /favoritos:
 *   delete:
 *     summary: Remove um livro dos favoritos
 *     tags:
 *       - Favoritos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FavoritoRequest'
 *     responses:
 *       200:
 *         description: Livro removido dos favoritos
 *       404:
 *         description: Favorito não encontrado
 */
app.delete('/favoritos', (req, res) => {
  const { usuarioId, livroId } = req.body;
  const index = favoritos.findIndex(f => f.usuarioId === usuarioId && f.livroId === livroId);
  if (index === -1) return res.status(404).json({ mensagem: 'Favorito não encontrado' });
  favoritos.splice(index, 1);
  res.json({ mensagem: 'Livro removido dos favoritos' });
});

// ==================== ARRENDAMENTOS ====================

/**
 * @swagger
 * /arrendamentos:
 *   get:
 *     summary: Lista todos os arrendamentos
 *     tags:
 *       - Arrendamentos
 *     responses:
 *       200:
 *         description: Lista de arrendamentos
 */
app.get('/arrendamentos', (req, res) => {
  res.json(arrendamentos);
});

/**
 * @swagger
 * /arrendamentos/me:
 *   get:
 *     summary: Lista arrendamentos de um usuário
 *     tags:
 *       - Arrendamentos
 *     parameters:
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de arrendamentos do usuário
 *       400:
 *         description: usuarioId não informado
 */
app.get('/arrendamentos/me', (req, res) => {
  const usuarioId = parseInt(req.query.usuarioId);
  if (!usuarioId) return res.status(400).json({ mensagem: 'usuarioId é obrigatório na query' });
  const meus = arrendamentos.filter(a => a.usuarioId === usuarioId);
  res.json(meus);
});

/**
 * @swagger
 * /arrendamentos:
 *   post:
 *     summary: Cria um novo arrendamento
 *     tags:
 *       - Arrendamentos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoArrendamento'
 *     responses:
 *       201:
 *         description: Arrendamento criado
 *       400:
 *         description: Livro sem estoque
 *       404:
 *         description: Livro não encontrado
 */
app.post('/arrendamentos', (req, res) => {
  const { usuarioId, livroId, dataInicio, dataFim } = req.body;

  const livro = livros.find(l => l.id === parseInt(livroId));
  if (!livro) return res.status(404).json({ mensagem: 'Livro não encontrado' });
  if (livro.estoque <= 0) return res.status(400).json({ mensagem: 'Livro sem estoque para arrendamento' });

  const novoArrendamento = {
    id: proximoIdArrendamento++,
    usuarioId: parseInt(usuarioId),
    livroId: livro.id,
    dataInicio,
    dataFim,
    status: 'PENDENTE',
    criadoEm: new Date().toISOString()
  };

  arrendamentos.push(novoArrendamento);
  res.status(201).json(novoArrendamento);
}

/**
 * @swagger
 * /arrendamentos/{id}/status:
 *   put:
 *     summary: Atualiza o status de um arrendamento
 *     tags:
 *       - Arrendamentos
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do arrendamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizaStatusArrendamento'
 *     responses:
 *       200:
 *         description: Arrendamento atualizado
 *       400:
 *         description: Status inválido
 *       404:
 *         description: Arrendamento não encontrado
 */
);
app.put('/arrendamentos/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  const arr = arrendamentos.find(a => a.id === id);
  if (!arr) return res.status(404).json({ mensagem: 'Arrendamento não encontrado' });

  if (!['APROVADO', 'REJEITADO'].includes(status)) {
    return res.status(400).json({ mensagem: 'Status inválido' });
  }

  arr.status = status;

  if (status === 'APROVADO') {
    const livro = livros.find(l => l.id === arr.livroId);
    if (livro && livro.estoque > 0) {
      livro.estoque -= 1;
    }
  }

  res.json(arr);
});

// ==================== COMPRAS ====================

/**
 * @swagger
 * /compras/me:
 *   get:
 *     summary: Lista compras de um usuário
 *     tags:
 *       - Compras
 *     parameters:
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de compras do usuário
 *       400:
 *         description: usuarioId não informado
 */
app.get('/compras/me', (req, res) => {
  const usuarioId = parseInt(req.query.usuarioId);
  if (!usuarioId) return res.status(400).json({ mensagem: 'usuarioId é obrigatório na query' });
  const minhas = compras.filter(c => c.usuarioId === usuarioId);
  res.json(minhas);
});

/**
 * @swagger
 * /compras:
 *   get:
 *     summary: Lista todas as compras
 *     tags:
 *       - Compras
 *     responses:
 *       200:
 *         description: Lista de compras
 */
app.get('/compras', (req, res) => {
  res.json(compras);
});

/**
 * @swagger
 * /compras:
 *   post:
 *     summary: Cria uma nova compra
 *     tags:
 *       - Compras
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovaCompra'
 *     responses:
 *       201:
 *         description: Compra criada
 *       400:
 *         description: Quantidade inválida ou estoque insuficiente
 *       404:
 *         description: Livro não encontrado
 */
app.post('/compras', (req, res) => {
  const { usuarioId, livroId, quantidade } = req.body;

  const livro = livros.find(l => l.id === parseInt(livroId));
  if (!livro) return res.status(404).json({ mensagem: 'Livro não encontrado' });

  const qtd = parseInt(quantidade);
  if (isNaN(qtd) || qtd <= 0) {
    return res.status(400).json({ mensagem: 'Quantidade inválida' });
  }

  if (livro.estoque < qtd) {
    return res.status(400).json({ mensagem: 'Estoque insuficiente' });
  }

  const total = (livro.preco || 0) * qtd;

  const novaCompra = {
    id: proximoIdCompra++,
    usuarioId: parseInt(usuarioId),
    livroId: livro.id,
    quantidade: qtd,
    total,
    status: 'PENDENTE',
    criadoEm: new Date().toISOString()
  };

  compras.push(novaCompra);
  res.status(201).json(novaCompra);
});

/**
 * @swagger
 * /compras/{id}/status:
 *   put:
 *     summary: Atualiza o status de uma compra
 *     tags:
 *       - Compras
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da compra
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizaStatusCompra'
 *     responses:
 *       200:
 *         description: Compra atualizada
 *       400:
 *         description: Status inválido ou estoque insuficiente para aprovar
 *       404:
 *         description: Compra ou livro não encontrado
 */
app.put('/compras/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  const compra = compras.find(c => c.id === id);
  if (!compra) return res.status(404).json({ mensagem: 'Compra não encontrada' });

  if (!['APROVADA', 'CANCELADA'].includes(status)) {
    return res.status(400).json({ mensagem: 'Status inválido' });
  }

  if (status === 'APROVADA' && compra.status === 'PENDENTE') {
    const livro = livros.find(l => l.id === compra.livroId);
    if (!livro) return res.status(404).json({ mensagem: 'Livro não encontrado' });
    if (livro.estoque < compra.quantidade) {
      return res.status(400).json({ mensagem: 'Estoque insuficiente para aprovar' });
    }
    livro.estoque -= compra.quantidade;
  }

  compra.status = status;
  res.json(compra);
});

// ==================== LIVROS RECENTES ====================

/**
 * @swagger
 * /livros/recentes/ultimos:
 *   get:
 *     summary: Lista os últimos 5 livros cadastrados
 *     tags:
 *       - Livros
 *     responses:
 *       200:
 *         description: Lista de livros recentes
 */
app.get('/livros/recentes/ultimos', (req, res) => {
  const recentes = livros
    .sort((a, b) => new Date(b.dataCadastro) - new Date(a.dataCadastro))
    .slice(0, 5);
  res.json(recentes);
});

// ==================== SWAGGER BÁSICO ====================

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'API Biblioteca Simples', version: '3.0.0' },
    servers: [{ url: `http://localhost:${PORT}` }]
  },
  apis: ['./server.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}/login.html`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;

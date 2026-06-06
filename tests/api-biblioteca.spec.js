// api-biblioteca.spec.js
// @js-check
import { test, expect } from '@playwright/test';
const { BibliotecaApiController } = require('./controllers/BibliotecaApiController.js');

// Helper para gerar emails dinâmicos e evitar falsos negativos por dados duplicados
const gerarEmailAleatorio = () => `user${Date.now()}@teste.com`; //

test.describe('Suíte de Testes de API - Sistema de Biblioteca (Padrão API Object Model)', () => {
    let api;

    // Inicializa a camada controladora antes de cada teste para reaproveitar o contexto HTTP
    test.beforeEach(async ({ request }) => {
        api = new BibliotecaApiController(request);
    });

    // =========================================================================
    // 1. AUTENTICAÇÃO E PERFIS
    // =========================================================================
    test.describe('1. Autenticação e Perfis', () => {

        test('CT-API-001 - Registro de Novo Usuário Aluno (Sucesso)', async () => {
            const response = await api.registrarUsuario("Maria Silva", gerarEmailAleatorio(), "senha123"); //

            expect(response.status()).toBe(201); //
            const body = await response.json(); //

            expect(body.mensagem).toBe("Usuário criado com sucesso"); //
            expect(body.usuario).toBeDefined(); //
            expect(body.usuario.id).toBeGreaterThan(0); //
            expect(Number.isInteger(body.usuario.id)).toBe(true); //
            expect(body.usuario.nome).toBe("Maria Silva"); //
            expect(body.usuario.tipo).toBe(1); // 1 = Aluno //
            expect(body.usuario.senha).toBeUndefined(); //
        });

        test('CT-API-002 - Registro com Email Duplicado (Falha)', async () => {
            const response = await api.registrarUsuario("João Santos", "admin@biblioteca.com", "senha456"); //

            expect(response.status()).toBe(400); //
            const body = await response.json(); //
            expect(body.mensagem).toBe("Email já cadastrado"); //
        });

        test('CT-API-003 - Login com Credenciais Válidas (Admin)', async () => {
            const inicio = Date.now(); //
            const response = await api.login("admin@biblioteca.com", "123456"); //
            const duracao = Date.now() - inicio; //

            expect(response.status()).toBe(200); //
            const body = await response.json(); //

            expect(body.mensagem).toBe("Login realizado com sucesso"); //
            expect(body.usuario).toBeDefined(); //
            expect(body.usuario.senha).toBeUndefined(); //
            expect(body.usuario.tipo).toBe(3); // 3 = Admin //
            expect(duracao).toBeLessThan(2000); // Validação de tempo de resposta //
        });

        test('CT-API-004 - Login com Credenciais Inválidas', async () => {
            const response = await api.login("admin@biblioteca.com", "senhaerrada"); //

            expect(response.status()).toBe(401); //
            const body = await response.json(); //
            expect(body.mensagem).toBe("Email ou senha incorretos"); //
        });
    });

    // =========================================================================
    // 2. LIVROS
    // =========================================================================
    test.describe('2. Livros', () => {
        let livroCriadoId;

        test('CT-API-005 - Listar Todos os Livros', async () => {
            const response = await api.listarTodosOsLivros();
            expect(response.status()).toBe(200); //

            const livros = await response.json(); //
            expect(Array.isArray(livros)).toBe(true); //

            if (livros.length > 0) { //
                const livro = livros[0]; //
                expect(livro).toHaveProperty('id'); //
                expect(livro).toHaveProperty('nome'); //
                expect(livro).toHaveProperty('autor'); //
                expect(livro).toHaveProperty('paginas'); //
                expect(livro).toHaveProperty('descricao'); //
                expect(livro).toHaveProperty('imagemUrl'); //
                expect(livro).toHaveProperty('dataCadastro'); //
                expect(livro).toHaveProperty('estoque'); //
                expect(livro).toHaveProperty('preco'); //

                expect(livro.paginas).toBeGreaterThan(0); //
                expect(isNaN(Date.parse(livro.dataCadastro))).toBe(false); //
            }
        });

        test('CT-API-006 - Listar Livros Disponíveis', async () => {
            const response = await api.listarLivrosDisponiveis();
            expect(response.status()).toBe(200); //

            const livros = await response.json(); //
            expect(Array.isArray(livros)).toBe(true); //

            for (const livro of livros) { //
                expect(livro.estoque).toBeGreaterThan(0); //
                if (livro.disponivel !== undefined) { //
                    expect(livro.disponivel).toBe(true); //
                }
            }
        });

        test('CT-API-007 - Buscar Livro por ID (Existente)', async () => {
            const response = await api.buscarLivroPorId(1);
            expect(response.status()).toBe(200); //

            const livro = await response.json(); //
            expect(livro.id).toBe(1); //
            expect(livro.nome.trim().length).toBeGreaterThan(0); //
            expect(livro.autor.trim().length).toBeGreaterThan(0); //
            expect(livro.paginas).not.toBeNull(); //
        });

        test('CT-API-008 - Buscar Livro por ID (Inexistente)', async () => {
            const response = await api.buscarLivroPorId(9999);
            expect(response.status()).toBe(404); //

            const body = await response.json(); //
            expect(body.mensagem).toBe("Livro não encontrado"); //
        });

        test('CT-API-009 - Adicionar Novo Livro', async () => {
            const dadosNovoLivro = {
                nome: "Código Limpo", autor: "Robert C. Martin", paginas: 425,
                descricao: "Manual de boas práticas", imagemUrl: "https://exemplo.com/imagem.jpg",
                estoque: 10, preco: 59.9
            };
            const response = await api.cadastrarLivro(dadosNovoLivro);

            expect(response.status()).toBe(201); //
            const body = await response.json(); //

            expect(body.id).toBeDefined(); //
            expect(isNaN(Date.parse(body.dataCadastro))).toBe(false); //
            expect(body.nome).toBe("Código Limpo"); //
            expect(body.estoque).toBe(10); //
            expect(body.preco).toBe(59.9); //

            livroCriadoId = body.id; //
        });

        test('CT-API-010 - Adicionar Livro sem Campos Obrigatórios (Falha)', async () => {
            const dadosIncompletos = { nome: "", autor: "", paginas: null };
            const response = await api.cadastrarLivro(dadosIncompletos);

            expect(response.status()).toBe(400); //
            const body = await response.json(); //
            expect(body.mensagem).toBeDefined(); //
        });

        test('CT-API-011 - Atualizar Livro Existente', async () => {
            const dadosAtualizados = {
                nome: "Clean Code - Edição Atualizada", autor: "Robert C. Martin", paginas: 464,
                descricao: "Guia completo atualizado", imagemUrl: "https://exemplo.com/nova-imagem.jpg",
                estoque: 7, preco: 79.9
            };
            const response = await api.atualizarLivro(1, dadosAtualizados);

            expect(response.status()).toBe(200); //
            const livro = await response.json(); //
            expect(livro.id).toBe(1); //
            expect(livro.nome).toBe("Clean Code - Edição Atualizada"); //
            expect(livro.estoque).toBe(7); //
            expect(livro.preco).toBe(79.9); //
        });

        test('CT-API-012 - Deletar Livro', async () => {
            const deleteResponse = await api.deletarLivro(2);
            expect(deleteResponse.status()).toBe(200); //

            const deleteBody = await deleteResponse.json(); //
            expect(deleteBody.mensagem).toBe("Livro removido"); //

            const getResponse = await api.buscarLivroPorId(2);
            expect(getResponse.status()).toBe(404); //
        });
    });

    // =========================================================================
    // 3. ESTATÍSTICAS
    // =========================================================================
    test.describe('3. Estatísticas', () => {
        test('CT-API-013 - Obter Estatísticas da Biblioteca', async () => {
            const response = await api.obterEstatisticas();
            expect(response.status()).toBe(200); //

            const stats = await response.json(); //

            expect(stats.totalLivros).toBeGreaterThanOrEqual(0); //
            expect(stats.totalPaginas).toBeGreaterThanOrEqual(0); //
            expect(stats.totalUsuarios).toBeGreaterThanOrEqual(0); //
            expect(stats.livrosDisponiveis).toBeGreaterThanOrEqual(0); //
            expect(stats.arrendamentosPendentes).toBeGreaterThanOrEqual(0); //
            expect(stats.comprasPendentes).toBeGreaterThanOrEqual(0); //

            const somaTipos = stats.usuariosPorTipo.alunos + stats.usuariosPorTipo.funcionarios + stats.usuariosPorTipo.admins; //
            expect(stats.totalUsuarios).toBe(somaTipos); //
        });
    });

    // =========================================================================
    // 4. FAVORITOS
    // =========================================================================
    test.describe('4. Favoritos', () => {

        test.beforeEach(async () => {
            // Garante a limpeza do favorito para evitar conflito antes de rodar os testes
            await api.removerFavorito(1, 1);
        });

        test('CT-API-014 - Adicionar Livro aos Favoritos', async () => {
            const response = await api.adicionarFavorito(1, 1);
            expect(response.status()).toBe(201); //
            const body = await response.json(); //
            expect(body.mensagem).toBe("Livro adicionado aos favoritos"); //
        });

        test('CT-API-015 - Adicionar Livro Já Favoritado (Falha)', async () => {
            await api.adicionarFavorito(1, 1); // Pré-condição //

            const response = await api.adicionarFavorito(1, 1);
            expect(response.status()).toBe(400); //
            const body = await response.json(); //
            expect(body.mensagem).toMatch(/já está nos favoritos/i); //
        });

        test('CT-API-016 - Listar Favoritos de Usuário', async () => {
            await api.adicionarFavorito(1, 1); //

            const response = await api.listarFavoritosDoUsuario(1);
            expect(response.status()).toBe(200); //

            const favoritos = await response.json(); //
            expect(Array.isArray(favoritos)).toBe(true); //
        });

        test('CT-API-017 - Remover Livro dos Favoritos', async () => {
            await api.adicionarFavorito(1, 1); //

            const response = await api.removerFavorito(1, 1);
            expect(response.status()).toBe(200); //
            const body = await response.json(); //
            expect(body.mensagem).toBe("Livro removido dos favoritos"); //
        });
    });

    // =========================================================================
    // 5. ARRENDAMENTOS
    // =========================================================================
    test.describe('5. Arrendamentos', () => {

        test('CT-API-018 - Criar Arrendamento Válido', async () => {
            const response = await api.criarArrendamento(3, 1, "2025-12-20", "2025-12-27"); //
            expect(response.status()).toBe(201); //
            const body = await response.json(); //

            expect(body.id).toBeDefined(); //
            expect(body.usuarioId).toBe(3); //
            expect(body.livroId).toBe(1); //
            expect(body.status).toBe("PENDENTE"); //
            expect(body.criadoEm).toBeDefined(); //
        });

        test('CT-API-019 - Criar Arrendamento sem stock (Falha)', async () => {
            // Efeito colateral temporário controlado por POM
            await api.atualizarLivro(1, { nome: "Clean Code", autor: "Robert C. Martin", paginas: 464, estoque: 0, preco: 50 }); //

            const response = await api.criarArrendamento(3, 1, "2025-12-20", "2025-12-27"); //
            expect(response.status()).toBe(400); //
            const body = await response.json(); //
            expect(body.mensagem).toBe("Livro sem estoque para arrendamento"); //

            // Restaura o stock original do livro 1
            await api.atualizarLivro(1, { nome: "Clean Code", autor: "Robert C. Martin", paginas: 464, estoque: 10, preco: 50 }); //
        });

        test('CT-API-020 - Atualizar Status de Arrendamento para APROVADO', async () => {
            await api.atualizarLivro(1, { nome: "Clean Code", autor: "Robert C. Martin", paginas: 464, estoque: 10, preco: 50 }); //
            const arrResp = await api.criarArrendamento(3, 1, "2025-12-20", "2025-12-27"); //
            const arrData = await arrResp.json(); //

            const response = await api.atualizarStatusArrendamento(arrData.id, "APROVADO");
            expect(response.status()).toBe(200); //
            const body = await response.json(); //
            expect(body.status).toBe("APROVADO"); //

            // Valida se o stock reduziu de 10 para 9
            const livroResp = await api.buscarLivroPorId(1);
            const livro = await livroResp.json(); //
            expect(livro.estoque).toBe(9); //
        });

        test('CT-API-021 - Atualizar Status com Valor Inválido (Falha)', async () => {
            const response = await api.atualizarStatusArrendamento(1, "EM_ANALISE");
            expect(response.status()).toBe(400); //
            const body = await response.json(); //
            expect(body.mensagem).toBe("Status inválido"); //
        });

        test('CT-API-022 - Listar Arrendamentos do Usuário', async () => {
            const response = await api.listarArrendamentosDoUsuario(3);
            expect(response.status()).toBe(200); //
            const arrs = await response.json(); //
            expect(Array.isArray(arrs)).toBe(true); //
            for (const item of arrs) { //
                expect(item.usuarioId).toBe(3); //
            }
        });
    });

    // =========================================================================
    // 6. COMPRAS
    // =========================================================================
    test.describe('6. Compras', () => {

        test('CT-API-023 - Criar Compra com Estoque Suficiente', async () => {
            await api.atualizarLivro(1, { nome: "Clean Code", autor: "Robert C. Martin", paginas: 464, estoque: 10, preco: 50.0 }); //

            const response = await api.criarCompra(3, 1, 2);
            expect(response.status()).toBe(201); //
            const compra = await response.json(); //

            expect(compra.status).toBe("PENDENTE"); //
            expect(compra.total).toBe(100.0); //
        });

        test('CT-API-024 - Criar Compra com Estoque Insuficiente (Falha)', async () => {
            await api.atualizarLivro(1, { nome: "Clean Code", autor: "Robert C. Martin", paginas: 464, estoque: 5, preco: 50.0 }); //

            const response = await api.criarCompra(3, 1, 100);
            expect(response.status()).toBe(400); //
            const body = await response.json(); //
            expect(body.mensagem).toBe("Estoque insuficiente"); //
        });

        test('CT-API-025 - Aprovar Compra', async () => {
            await api.atualizarLivro(1, { nome: "Clean Code", autor: "Robert C. Martin", paginas: 464, estoque: 10, preco: 50.0 }); //
            const novaCompraResp = await api.criarCompra(3, 1, 2); //
            const novaCompra = await novaCompraResp.json(); //

            const response = await api.atualizarStatusCompra(novaCompra.id, "APROVADA");
            expect(response.status()).toBe(200); //
            const body = await response.json(); //
            expect(body.status).toBe("APROVADA"); //

            const livroResp = await api.buscarLivroPorId(1);
            const livro = await livroResp.json(); //
            expect(livro.estoque).toBe(8); //
        });

        test('CT-API-026 - Cancelar Compra', async () => {
            await api.atualizarLivro(1, { nome: "Clean Code", autor: "Robert C. Martin", paginas: 464, estoque: 10, preco: 50.0 }); //
            const compraResp = await api.criarCompra(3, 1, 1); //
            const compraData = await compraResp.json(); //

            const response = await api.atualizarStatusCompra(compraData.id, "CANCELADA");
            expect(response.status()).toBe(200); //
            const body = await response.json(); //
            expect(body.status).toBe("CANCELADA"); //

            const livroResp = await api.buscarLivroPorId(1);
            const livro = await livroResp.json(); //
            expect(livro.estoque).toBe(10); //
        });

        test('CT-API-027 - Listar Compras do Usuário', async () => {
            const response = await api.listarComprasDoUsuario(3);
            expect(response.status()).toBe(200); //
            const compras = await response.json(); //
            expect(Array.isArray(compras)).toBe(true); //
        });

        test('CT-API-028 - Listar Todas as Compras', async () => {
            const response = await api.listarTodasAsCompras();
            expect(response.status()).toBe(200); //
            const compras = await response.json(); //
            expect(Array.isArray(compras)).toBe(true); //
        });
    });

    // =========================================================================
    // 7. ADMIN USUÁRIOS
    // =========================================================================
    test.describe('7. Admin Usuários', () => {

        test('CT-API-029 - Listar Usuários', async () => {
            const response = await api.listarUsuarios();
            expect(response.status()).toBe(200); //
            const usuarios = await response.json(); //

            expect(Array.isArray(usuarios)).toBe(true); //
            for (const usuario of usuarios) { //
                expect(usuario.senha).toBeUndefined(); //
            }
        });

        test('CT-API-030 - Atualizar Usuário', async () => {
            const dadosUsuario = { nome: "João Funcionário Atualizado", email: "func.atualizado@biblio.com", tipo: 2 };
            const response = await api.atualizarUsuario(2, dadosUsuario);

            expect(response.status()).toBe(200); //
            const usuario = await response.json(); //

            expect(usuario.nome).toBe("João Funcionário Atualizado"); //
            expect(usuario.email).toBe("func.atualizado@biblio.com"); //
            expect(usuario.tipo).toBe(2); //
        });

        test('CT-API-031 - Excluir Usuário (Não-Admin Principal)', async () => {
            const response = await api.excluirUsuario(3);
            expect(response.status()).toBe(200); //

            const body = await response.json(); //
            expect(body.mensagem).toBe("Usuário deletado com sucesso"); //
        });

        test('CT-API-032 - Tentar Excluir Admin Principal (Falha)', async () => {
            const response = await api.excluirUsuario(1);
            expect(response.status()).toBe(403); //

            const body = await response.json(); //
            expect(body.mensagem).toBeDefined(); //
        });
    });
});
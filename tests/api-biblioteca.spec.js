//const { test, expect } = require('@playwright/test');
// @js-check
import { test, expect } from '@playwright/test';
// Helper para gerar emails dinâmicos e evitar falsos negativos por dados duplicados
const gerarEmailAleatorio = () => `user${Date.now()}@teste.com`;

test.describe('Suíte de Testes de API - Sistema de Biblioteca', () => {

    // =========================================================================
    // 1. AUTENTICAÇÃO E PERFIS
    // =========================================================================
    test.describe('1. Autenticação e Perfis', () => {

        test('CT-API-001 - Registro de Novo Usuário Aluno (Sucesso)', async ({ request }) => {
            const response = await request.post('/registro', {
                data: {
                    nome: "Maria Silva",
                    email: gerarEmailAleatorio(), // Garante a pré-condição de não cadastrado
                    senha: "senha123"
                }
            });

            expect(response.status()).toBe(201);
            const body = await response.json();

            expect(body.mensagem).toBe("Usuário criado com sucesso");
            expect(body.usuario).toBeDefined();
            expect(body.usuario.id).toBeGreaterThan(0);
            expect(Number.isInteger(body.usuario.id)).toBe(true);
            expect(body.usuario.nome).toBe("Maria Silva");
            expect(body.usuario.tipo).toBe(1); // 1 = Aluno
            expect(body.usuario.senha).toBeUndefined();
        });

        test('CT-API-002 - Registro com Email Duplicado (Falha)', async ({ request }) => {
            const response = await request.post('/registro', {
                data: {
                    nome: "João Santos",
                    email: "admin@biblioteca.com", // Email pré-existente
                    senha: "senha456"
                }
            });

            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.mensagem).toBe("Email já cadastrado");
        });

        test('CT-API-003 - Login com Credenciais Válidas (Admin)', async ({ request }) => {
            const inicio = Date.now();
            const response = await request.post('/login', {
                data: {
                    email: "admin@biblioteca.com",
                    senha: "123456"
                }
            });
            const duracao = Date.now() - inicio;

            expect(response.status()).toBe(200);
            const body = await response.json();

            expect(body.mensagem).toBe("Login realizado com sucesso");
            expect(body.usuario).toBeDefined();
            expect(body.usuario.senha).toBeUndefined();
            expect(body.usuario.tipo).toBe(3); // 3 = Admin
            expect(duracao).toBeLessThan(2000); // Validação de tempo de resposta
        });

        test('CT-API-004 - Login com Credenciais Inválidas', async ({ request }) => {
            const response = await request.post('/login', {
                data: {
                    email: "admin@biblioteca.com",
                    senha: "senhaerrada"
                }
            });

            expect(response.status()).toBe(401);
            const body = await response.json();
            expect(body.mensagem).toBe("Email ou senha incorretos");
        });
    });

    // =========================================================================
    // 2. LIVROS
    // =========================================================================
    test.describe('2. Livros', () => {
        let livroCriadoId;

        test('CT-API-005 - Listar Todos os Livros', async ({ request }) => {
            const response = await request.get('/livros');
            expect(response.status()).toBe(200);

            const livros = await response.json();
            expect(Array.isArray(livros)).toBe(true);

            if (livros.length > 0) {
                const livro = livros[0];
                expect(livro).toHaveProperty('id');
                expect(livro).toHaveProperty('nome');
                expect(livro).toHaveProperty('autor');
                expect(livro).toHaveProperty('paginas');
                expect(livro).toHaveProperty('descricao');
                expect(livro).toHaveProperty('imagemUrl');
                expect(livro).toHaveProperty('dataCadastro');
                expect(livro).toHaveProperty('estoque');
                expect(livro).toHaveProperty('preco');

                expect(livro.paginas).toBeGreaterThan(0);
                // Validação básica do formato ISO 8601 através do construtor Date
                expect(isNaN(Date.parse(livro.dataCadastro))).toBe(false);
            }
        });

        test('CT-API-006 - Listar Livros Disponíveis', async ({ request }) => {
            const response = await request.get('/livros/disponiveis');
            expect(response.status()).toBe(200);

            const livros = await response.json();
            expect(Array.isArray(livros)).toBe(true);

            for (const livro of livros) {
                expect(livro.estoque).toBeGreaterThan(0);
                if (livro.disponivel !== undefined) {
                    expect(livro.disponivel).toBe(true);
                }
            }
        });

        test('CT-API-007 - Buscar Livro por ID (Existente)', async ({ request }) => {
            const response = await request.get('/livros/1');
            expect(response.status()).toBe(200);

            const livro = await response.json();
            expect(livro.id).toBe(1);
            expect(livro.nome.trim().length).toBeGreaterThan(0);
            expect(livro.autor.trim().length).toBeGreaterThan(0);
            expect(livro.paginas).not.toBeNull();
        });

        test('CT-API-008 - Buscar Livro por ID (Inexistente)', async ({ request }) => {
            const response = await request.get('/livros/9999');
            expect(response.status()).toBe(404);

            const body = await response.json();
            expect(body.mensagem).toBe("Livro não encontrado");
        });

        test('CT-API-009 - Adicionar Novo Livro', async ({ request }) => {
            const response = await request.post('/livros', {
                data: {
                    nome: "Código Limpo",
                    autor: "Robert C. Martin",
                    paginas: 425,
                    descricao: "Manual de boas práticas",
                    imagemUrl: "https://exemplo.com/imagem.jpg",
                    estoque: 10,
                    preco: 59.9
                }
            });

            expect(response.status()).toBe(201);
            const body = await response.json();

            expect(body.id).toBeDefined();
            expect(isNaN(Date.parse(body.dataCadastro))).toBe(false);
            expect(body.nome).toBe("Código Limpo");
            expect(body.estoque).toBe(10);
            expect(body.preco).toBe(59.9);

            livroCriadoId = body.id; // Armazena para testes sequenciais se necessário
        });

        test('CT-API-010 - Adicionar Livro sem Campos Obrigatórios (Falha)', async ({ request }) => {
            const response = await request.post('/livros', {
                data: {
                    nome: "",
                    autor: "",
                    paginas: null
                }
            });

            expect(response.status()).toBe(400);
            // Validação genérica de presença de mensagem de erro conforme requisito
            const body = await response.json();
            expect(body.mensagem).toBeDefined();
        });

        test('CT-API-011 - Atualizar Livro Existente', async ({ request }) => {
            const response = await request.put('/livros/1', {
                data: {
                    nome: "Clean Code - Edição Atualizada",
                    autor: "Robert C. Martin",
                    paginas: 464,
                    descricao: "Guia completo atualizado",
                    imagemUrl: "https://exemplo.com/nova-imagem.jpg",
                    estoque: 7,
                    preco: 79.9
                }
            });

            expect(response.status()).toBe(200);
            const livro = await response.json();
            expect(livro.id).toBe(1);
            expect(livro.nome).toBe("Clean Code - Edição Atualizada");
            expect(livro.estoque).toBe(7);
            expect(livro.preco).toBe(79.9);
        });

        test('CT-API-012 - Deletar Livro', async ({ request }) => {
            // Apaga o livro ID 2 conforme especificado
            const deleteResponse = await request.delete('/livros/2');
            expect(deleteResponse.status()).toBe(200);

            const deleteBody = await deleteResponse.json();
            //expect(deleteBody.mensagem).toMatch(/removido/i);
            expect(deleteBody.mensagem).toBe("Livro removido");

            // Verifica se realmente foi removido
            const getResponse = await request.get('/livros/2');
            expect(getResponse.status()).toBe(404);
        });
    });

    // =========================================================================
    // 3. ESTATÍSTICAS
    // =========================================================================
    test.describe('3. Estatísticas', () => {
        test('CT-API-013 - Obter Estatísticas da Biblioteca', async ({ request }) => {
            const response = await request.get('/estatisticas');
            expect(response.status()).toBe(200);

            const stats = await response.json();

            expect(stats.totalLivros).toBeGreaterThanOrEqual(0);
            expect(stats.totalPaginas).toBeGreaterThanOrEqual(0);
            expect(stats.totalUsuarios).toBeGreaterThanOrEqual(0);
            expect(stats.livrosDisponiveis).toBeGreaterThanOrEqual(0);
            expect(stats.arrendamentosPendentes).toBeGreaterThanOrEqual(0);
            expect(stats.comprasPendentes).toBeGreaterThanOrEqual(0);

            // Validação da soma por tipos de usuários
            const somaTipos = stats.usuariosPorTipo.alunos + stats.usuariosPorTipo.funcionarios + stats.usuariosPorTipo.admins;
            expect(stats.totalUsuarios).toBe(somaTipos);
        });
    });

    // =========================================================================
    // 4. FAVORITOS
    // =========================================================================
    test.describe('4. Favoritos', () => {

        test.beforeEach(async ({ request }) => {
            // Garante a limpeza do favorito para evitar conflito antes de rodar os testes de inserção
            await request.delete('/favoritos', { data: { usuarioId: 1, livroId: 1 } });
        });

        test('CT-API-014 - Adicionar Livro aos Favoritos', async ({ request }) => {
            const response = await request.post('/favoritos', {
                data: { usuarioId: 1, livroId: 1 }
            });
            expect(response.status()).toBe(201);
            const body = await response.json();
            expect(body.mensagem).toBe("Livro adicionado aos favoritos");
        });

        test('CT-API-015 - Adicionar Livro Já Favoritado (Falha)', async ({ request }) => {
            // Força a inclusão do primeiro favorito (pré-condição)
            await request.post('/favoritos', { data: { usuarioId: 1, livroId: 1 } });

            // Tenta adicionar novamente
            const response = await request.post('/favoritos', {
                data: { usuarioId: 1, livroId: 1 }
            });
            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.mensagem).toMatch(/já está nos favoritos/i);
        });

        test('CT-API-016 - Listar Favoritos de Usuário', async ({ request }) => {
            await request.post('/favoritos', { data: { usuarioId: 1, livroId: 1 } });

            const response = await request.get('/favoritos/1');
            expect(response.status()).toBe(200);

            const favoritos = await response.json();
            expect(Array.isArray(favoritos)).toBe(true);
        });

        test('CT-API-017 - Remover Livro dos Favoritos', async ({ request }) => {
            await request.post('/favoritos', { data: { usuarioId: 1, livroId: 1 } });

            const response = await request.delete('/favoritos', {
                data: { usuarioId: 1, livroId: 1 }
            });
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.mensagem).toBe("Livro removido dos favoritos");
        });
    });

    // =========================================================================
    // 5. ARRENDAMENTOS
    // =========================================================================
    test.describe('5. Arrendamentos', () => {
        let arrendamentoId;

        test('CT-API-018 - Criar Arrendamento Válido', async ({ request }) => {
            const response = await request.post('/arrendamentos', {
                data: {
                    usuarioId: 3,
                    livroId: 1,
                    dataInicio: "2025-12-20",
                    dataFim: "2025-12-27"
                }
            });
            expect(response.status()).toBe(201);
            const body = await response.json();

            expect(body.id).toBeDefined();
            expect(body.usuarioId).toBe(3);
            expect(body.livroId).toBe(1);
            expect(body.status).toBe("PENDENTE");
            expect(body.criadoEm).toBeDefined();

            arrendamentoId = body.id; // Salva para o teste de atualização posterior
        });

        test('CT-API-019 - Criar Arrendamento sem stock (Falha)', async ({ request }) => {
            // Simulação: Força alteração temporária do livro 1 para stock 0 para fins de teste
            await request.put('/livros/1', { data: { nome: "Clean Code", autor: "Robert C. Martin", paginas: 464, estoque: 0, preco: 50 } });

            const response = await request.post('/arrendamentos', {
                data: {
                    usuarioId: 3,
                    livroId: 1,
                    dataInicio: "2025-12-20",
                    dataFim: "2025-12-27"
                }
            });
            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.mensagem).toBe("Livro sem estoque para arrendamento");

            // Restaura o stock do livro 1
            await request.put('/livros/1', { data: { nome: "Clean Code", autor: "Robert C. Martin", paginas: 464, estoque: 10, preco: 50 } });
        });

        test('CT-API-020 - Atualizar Status de Arrendamento para APROVADO', async ({ request }) => {
            // Garante um livro com stock conhecido e um arrendamento pendente ativo
            await request.put('/livros/1', { data: { nome: "Clean Code", autor: "Robert C. Martin", paginas: 464, estoque: 10, preco: 50 } });
            const arrResp = await request.post('/arrendamentos', { data: { usuarioId: 3, livroId: 1, dataInicio: "2025-12-20", dataFim: "2025-12-27" } });
            const arrData = await arrResp.json();

            const response = await request.put(`/arrendamentos/${arrData.id}/status`, {
                data: { status: "APROVADO" }
            });
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.status).toBe("APROVADO");

            // Valida se o stock reduziu de 10 para 9
            const livroResp = await request.get('/livros/1');
            const livro = await livroResp.json();
            expect(livro.estoque).toBe(9);
        });

        test('CT-API-021 - Atualizar Status com Valor Inválido (Falha)', async ({ request }) => {
            const response = await request.put(`/arrendamentos/1/status`, {
                data: { status: "EM_ANALISE" }
            });
            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.mensagem).toBe("Status inválido");
        });

        test('CT-API-022 - Listar Arrendamentos do Usuário', async ({ request }) => {
            const response = await request.get('/arrendamentos/me?usuarioId=3');
            expect(response.status()).toBe(200);
            const arrs = await response.json();
            expect(Array.isArray(arrs)).toBe(true);
            for (const item of arrs) {
                expect(item.usuarioId).toBe(3);
            }
        });
    });

    // =========================================================================
    // 6. COMPRAS
    // =========================================================================
    test.describe('6. Compras', () => {

        test('CT-API-023 - Criar Compra com Estoque Suficiente', async ({ request }) => {
            // Atualiza preço base do livro 1 para validação matemática exata
            await request.put('/livros/1', { data: { nome: "Clean Code", autor: "Robert C. Martin", paginas: 464, estoque: 10, preco: 50.0 } });

            const response = await request.post('/compras', {
                data: { usuarioId: 3, livroId: 1, quantidade: 2 }
            });
            expect(response.status()).toBe(201);
            const compra = await response.json();

            expect(compra.status).toBe("PENDENTE");
            expect(compra.total).toBe(100.0); // precoDoLivro (50.0) * 2
        });

        test('CT-API-024 - Criar Compra com Estoque Insuficiente (Falha)', async ({ request }) => {
            // Configura stock do livro 1 abaixo de 100
            await request.put('/livros/1', { data: { nome: "Clean Code", autor: "Robert C. Martin", paginas: 464, estoque: 5, preco: 50.0 } });

            const response = await request.post('/compras', {
                data: { usuarioId: 3, livroId: 1, quantidade: 100 }
            });
            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.mensagem).toBe("Estoque insuficiente");
        });

        test('CT-API-025 - Aprovar Compra', async ({ request }) => {
            // Prepara cenário controlado
            await request.put('/livros/1', { data: { nome: "Clean Code", autor: "Robert C. Martin", paginas: 464, estoque: 10, preco: 50.0 } });
            const novaCompraResp = await request.post('/compras', { data: { usuarioId: 3, livroId: 1, quantidade: 2 } });
            const novaCompra = await novaCompraResp.json();

            const response = await request.put(`/compras/${novaCompra.id}/status`, {
                data: { status: "APROVADA" }
            });
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.status).toBe("APROVADA");

            // Confere o desconto físico do stock (10 - 2 = 8)
            const livroResp = await request.get('/livros/1');
            const livro = await livroResp.json();
            expect(livro.estoque).toBe(8);
        });

        test('CT-API-026 - Cancelar Compra', async ({ request }) => {
            // Cria compra padrão
            await request.put('/livros/1', { data: { nome: "Clean Code", autor: "Robert C. Martin", paginas: 464, estoque: 10, preco: 50.0 } });
            const compraResp = await request.post('/compras', { data: { usuarioId: 3, livroId: 1, quantidade: 1 } });
            const compraData = await compraResp.json();

            // Cancela a compra criada
            const response = await request.put(`/compras/${compraData.id}/status`, {
                data: { status: "CANCELADA" }
            });
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.status).toBe("CANCELADA");

            // Garante que o stock permaneceu inalterado (em 10, pois estava PENDENTE e não descontou)
            const livroResp = await request.get('/livros/1');
            const livro = await livroResp.json();
            expect(livro.estoque).toBe(10);
        });

        test('CT-API-027 - Listar Compras do Usuário', async ({ request }) => {
            const response = await request.get('/compras/me?usuarioId=3');
            expect(response.status()).toBe(200);
            const compras = await response.json();
            expect(Array.isArray(compras)).toBe(true);
        });

        test('CT-API-028 - Listar Todas as Compras', async ({ request }) => {
            const response = await request.get('/compras');
            expect(response.status()).toBe(200);
            const compras = await response.json();
            expect(Array.isArray(compras)).toBe(true);
        });
    });

    // =========================================================================
    // 7. ADMIN USUÁRIOS
    // =========================================================================
    test.describe('7. Admin Usuários', () => {

        test('CT-API-029 - Listar Usuários', async ({ request }) => {
            const response = await request.get('/usuarios');
            expect(response.status()).toBe(200);
            const usuarios = await response.json();

            expect(Array.isArray(usuarios)).toBe(true);
            for (const usuario of usuarios) {
                expect(usuario.senha).toBeUndefined();
            }
        });

        test('CT-API-030 - Atualizar Usuário', async ({ request }) => {
            const response = await request.put('/usuarios/2', {
                data: {
                    nome: "João Funcionário Atualizado",
                    email: "func.atualizado@biblio.com",
                    tipo: 2
                }
            });
            expect(response.status()).toBe(200);
            const usuario = await response.json();

            expect(usuario.nome).toBe("João Funcionário Atualizado");
            expect(usuario.email).toBe("func.atualizado@biblio.com");
            expect(usuario.tipo).toBe(2); // Tipo Funcionário
        });

        test('CT-API-031 - Excluir Usuário (Não-Admin Principal)', async ({ request }) => {
            // Cria um usuário dinâmico para garantir que o ID 3 exista ou cria um alvo descartável
            // O escopo pede explicitamente exclusão do ID 3
            const response = await request.delete('/usuarios/3');
            expect(response.status()).toBe(200);

            const body = await response.json();
            expect(body.mensagem).toBe("Usuário deletado com sucesso");
        });

        test('CT-API-032 - Tentar Excluir Admin Principal (Falha)', async ({ request }) => {
            const response = await request.delete('/usuarios/1');
            expect(response.status()).toBe(403);

            const body = await response.json();
            expect(body.mensagem).toBeDefined(); // Mensagem indicando bloqueio de deleção do admin principal
        });
    });
});
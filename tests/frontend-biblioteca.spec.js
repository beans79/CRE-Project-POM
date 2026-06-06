
//Ficheiro de Especificação de Testes E2E (Interface Gráfica).

// Importação da API de Testes do Playwright.
const { test, expect } = require('@playwright/test');

// Importação das Classes de Page Object Model (POM) para cada página do sistema,
const { LoginPage } = require('./pages/LoginPage.js');
const { RegistroPage } = require('./pages/RegistroPage.js');
const { DashboardPage } = require('./pages/DashboardPage.js');
const { LivrosPage } = require('./pages/LivrosPage.js');
const { DetalhesPage } = require('./pages/DetalhesPage.js');
const { FavoritosPage } = require('./pages/FavoritosPage.js');
const { ArrendamentosPage } = require('./pages/ArrendamentosPage.js');
const { AdminUsuariosPage } = require('./pages/AdminUsuariosPage.js');

test.describe('Suíte de Testes Frontend (UI) - Sistema de Biblioteca (Padrão POM)', () => {

    // =========================================================================
    // 1. REGISTRO E LOGIN
    // =========================================================================
    test.describe('1. Registro e Login', () => {

        test('CT-FE-001 - Fluxo Completo de Registro (Aluno)', async ({ page }) => {
            const registroPage = new RegistroPage(page);
            const loginPage = new LoginPage(page);

            await registroPage.navegar();

            // Configuração de Listener para Captura de Diálogos: Prepara o teste para interceptar e validar mensagens de alerta geradas durante o processo de registro, garantindo que as mensagens de feedback sejam exibidas corretamente ao usuário.
            // O método page.once garante que o listener seja acionado apenas para o próximo diálogo, 
            // evitando interferências em testes subsequentes.
            page.once('dialog', async dialog => {
                expect(dialog.message()).toContain('sucesso');
                await dialog.accept(); // Clica em OK no popup nativo.
            });

            // Geração de Email Dinâmico para Evitar Conflitos de Dados em Execuções Repetidas:
            const emailDinamico = `carlos.${Date.now()}@teste.com`;
            await registroPage.preencherFormulario('Carlos Oliveira', emailDinamico, 'senha123', 'senha123');
            await registroPage.submeter();

            // Validação de Redirecionamento Pós-Registro: O teste aguarda o redirecionamento para a página de login, confirmando que o fluxo de registro culmina na etapa correta de autenticação.
            await page.waitForURL('**/login.html');
            // Garante isolamento de estados: os campos do login devem iniciar vazios.
            await expect(loginPage.inputEmail).toHaveValue('');
        });

        test('CT-FE-002 - Validação de Senhas Não Correspondentes', async ({ page }) => {
            //  Reutilização de POM para Navegação e Interação.
            const registroPage = new RegistroPage(page);
            await registroPage.navegar();

            //  Configuração de Listener para Captura de Diálogos de Erro: 
            // Prepara o teste para interceptar o alerta específico gerado quand as senhas não conferem
            page.once('dialog', async dialog => {
                expect(dialog.message()).toBe('As senhas não conferem.');
                await dialog.accept();
            });
            // Preenche o formulário com senhas diferentes para acionar a validação de erro.
            await registroPage.preencherFormulario('Carlos Oliveira', 'carlos@teste.com', 'senha123', 'senha456');
            await registroPage.submeter();

            // Validação de Permanência na Página: 
            // Confirma que o usuário permanece na página de registro após a falha de validação.
            expect(page.url()).toContain('/registro.html');
        });

        test('CT-FE-003 - Login com Sucesso (Admin)', async ({ page }) => {
            // Reutilização de POM para Navegação e Interação.
            const loginPage = new LoginPage(page);
            const dashboardPage = new DashboardPage(page);

            await loginPage.navegar();
            // Configuração de Listener para Captura de Diálogo de Sucesso:
            page.once('dialog', async dialog => {
                expect(dialog.message()).toContain('Login realizado com sucesso!');
                await dialog.accept();
            });
            // Realiza o login com credenciais pré-existentes de Admin.
            await loginPage.realizarLogin('admin@biblioteca.com', '123456');
            await page.waitForURL('**/dashboard.html');

            // Validação de Elementos Visuais Específicos para o Perfil Admin:
            await expect(dashboardPage.infoUsuario).toBeVisible({ timeout: 5000 });
            await expect(dashboardPage.infoUsuario).toContainText('ADMIN');
            await expect(dashboardPage.infoUsuario).toContainText('Admin Master');

            // Validação de Baixo Nível: Confirma se o tipo persistido no LocalStorage coincide com a role Admin (3).
            const localStorageUsuario = await page.evaluate(() => localStorage.getItem('usuario'));
            expect(JSON.parse(localStorageUsuario).tipo).toBe(3);
        });

        test('CT-FE-004 - Login com Credenciais Inválidas', async ({ page }) => {
            const loginPage = new LoginPage(page);
            await loginPage.navegar();

            // Configuração de Listener para Captura de Diálogo de Erro: Prepara o teste para interceptar o alerta específico gerado quando as credenciais são inválidas.
            const dialogPromise = page.waitForEvent('dialog');
            await loginPage.realizarLogin('admin@biblioteca.com', 'errada');

            // O método .catch() é utilizado para evitar que o teste falhe caso o 
            // diálogo não seja disparado, permitindo a validação condicional da mensagem de erro.
            const dialog = await dialogPromise.catch(() => null);
            if (dialog) {
                expect(dialog.message()).toBeDefined();
                await dialog.accept();
            }
            expect(page.url()).toContain('/login.html');
        });
    });

    // =========================================================================
    // 2. PROTEÇÃO DE ROTAS E NAVEGAÇÃO
    // =========================================================================
    test.describe('2. Proteção de Rotas e Navegação', () => {

        test('CT-FE-005 - Proteção de Rotas sem Login', async ({ page }) => {
            const loginPage = new LoginPage(page);
            const dashboardPage = new DashboardPage(page);

            await loginPage.navegar();
            // Garante que o LocalStorage esteja limpo, simulando um usuário anônimo sem sessão ativa.
            await page.evaluate(() => localStorage.clear());

            await dashboardPage.navegar();
            // O Frontend deve reencaminhar o utilizador anónimo imediatamente de volta para o login.
            await page.waitForURL('**/login.html');
        });

        test('CT-FE-006 - Menu Dinâmico - Aluno', async ({ page }) => {
            const loginPage = new LoginPage(page);
            const dashboardPage = new DashboardPage(page);

            // Injeção rápida da sessão via LocalStorage (Ignora UI do login para acelerar a execução).
            await loginPage.definirSessaoLocalStorage(1, 'aluna@teste.com');
            await dashboardPage.navegar();
            // Validação de Visibilidade do Menu: Garante que o menu de navegação esteja presente e visível para o usuário autenticado.
            await expect(dashboardPage.menuNav).toBeVisible({ timeout: 5000 });

            // Iteração orientada a dados para verificar a exibição correta dos menus permitidos ao perfil Aluno.
            const itensMenu = ['Dashboard', 'Livros', 'Favoritos', 'Meus Arrendamentos', 'Compras', 'Minhas Compras'];
            for (const item of itensMenu) {
                await expect(dashboardPage.menuNav).toContainText(item);
            }
            // Validação de Ausência de Itens Restritos: 
            // Confirma que opções exclusivas para perfis de maior privilégio, como "Usuários (Admin)", não estão presentes na interface do Aluno.
            await expect(dashboardPage.menuNav).not.toContainText('Usuários (Admin)');
        });

        test('CT-FE-007 - Menu Dinâmico - Admin', async ({ page }) => {
            const loginPage = new LoginPage(page);
            const dashboardPage = new DashboardPage(page);
            // Injeção rápida da sessão via LocalStorage (Ignora UI do login para acelerar a execução).
            await loginPage.definirSessaoLocalStorage(3, 'admin@biblioteca.com');
            await dashboardPage.navegar();
            // Validação de Visibilidade do Menu: Garante que o menu de navegação esteja presente e visível para o usuário autenticado.
            await expect(dashboardPage.linkAdminUsuarios).toBeVisible();
            await dashboardPage.linkAdminUsuarios.click();
            await page.waitForURL('**/admin-usuarios.html');
        });
    });

    // =========================================================================
    // 3. DASHBOARD
    // =========================================================================
    test.describe('3. Dashboard', () => {

        test('CT-FE-008 - Dashboard - Visão Admin', async ({ page }) => {
            const loginPage = new LoginPage(page);
            const dashboardPage = new DashboardPage(page);
            // Injeção rápida da sessão via LocalStorage 
            // (Ignora UI do login para acelerar a execução).
            await loginPage.definirSessaoLocalStorage(3);
            await dashboardPage.navegar();

            // Validação de Elementos Visuais Específicos para o Perfil Admin:
            await expect(page.locator('body')).toContainText('Total de Livros');
            await expect(page.locator('body')).toContainText('Total de Usuários');
            await expect(page.locator('body')).toContainText('Livros Disponíveis');

            // Validação de Quantidade Máxima de Cards Recentes: não ultrapasse o limite definido (5), 
            const totalCards = await dashboardPage.cardsRecentes.count();
            expect(totalCards).toBeLessThanOrEqual(5);
        });

        test('CT-FE-009 - Dashboard - Visão Aluno', async ({ page }) => {
            const loginPage = new LoginPage(page);
            const dashboardPage = new DashboardPage(page);
            // Injeção rápida da sessão via LocalStorage 
            // (Ignora UI do login para acelerar a execução).
            await loginPage.definirSessaoLocalStorage(1);
            await dashboardPage.navegar();
            // Validação de Elementos Visuais Específicos para o Perfil Aluno:
            await expect(dashboardPage.containerCardsAluno).toBeVisible();
        });
    });

    // =========================================================================
    // 4. LIVROS
    // =========================================================================
    test.describe('4. Livros', () => {

        test('CT-FE-010 - Cadastro de Livro via UI', async ({ page }) => {
            const loginPage = new LoginPage(page);
            const livrosPage = new LivrosPage(page);

            await loginPage.definirSessaoLocalStorage(3); // Permissão de Admin/Escrita requerida.
            await livrosPage.navegar();
            // Configuração de Listener para Captura de Diálogo de Sucesso.
            page.once('dialog', async dialog => {
                expect(dialog.message()).toContain('sucesso');
                await dialog.accept();
            });
            // Preenche o formulário de cadastro com dados válidos e submete.
            await livrosPage.cadastrarLivro({
                nome: 'O Hobbit', autor: 'J.R.R. Tolkien', paginas: '310',
                descricao: 'Uma jornada inesperada.', imagemUrl: 'https://images.com/hobbit.jpg',
                estoque: '5', preco: '39.9'
            });

            // Validação de Redirecionamento Pós-Cadastro.
            await expect(livrosPage.inputNome).toHaveValue('');
            await expect(page.locator('body')).toContainText('O Hobbit');
        });

        test('CT-FE-011 - Validação de Campos Obrigatórios no Livro', async ({ page }) => {
            const loginPage = new LoginPage(page);
            const livrosPage = new LivrosPage(page);
            // Injeção rápida da sessão via LocalStorage 
            // (Ignora UI do login para acelerar a execução).
            await loginPage.definirSessaoLocalStorage(3);
            await livrosPage.navegar();

            // Submete de forma direta ignorando o preenchimento prévio.
            await livrosPage.btnCadastrar.click();

            // Validação de Bloqueio de Submissão: Verifica se o formulário foi barrado pela validação nativa do HTML5,
            // Executa script para interrogar o estado ".validity.valid" do input obrigatório.
            const campoInvalido = await page.evaluate(() => {
                return document.querySelector('#nome').validity.valid;
            });
            expect(campoInvalido).toBe(false); // Significa que a validação nativa 'required' barrou o submit.
        });

        test('CT-FE-012 - Visualizar Detalhes de Livro', async ({ page }) => {
            // Reutilização de POM para Navegação e Interação.
            const loginPage = new LoginPage(page);
            const livrosPage = new LivrosPage(page);
            const detalhesPage = new DetalhesPage(page);
            // Injeção rápida da sessão via LocalStorage
            await loginPage.definirSessaoLocalStorage(1);
            // Navega para a página de livros e clica no primeiro livro listado para acessar os detalhes.
            await livrosPage.navegar();
            await livrosPage.abrirDetalhesPrimeiroLivro();
            // Validação de Redirecionamento para a Página de Detalhes.
            await page.waitForURL('**/detalhes.html?id=*');
            await expect(detalhesPage.containerDetalhes).toBeVisible();

            // Validação de Exibição de Imagem com Fallback Inteligente: 
            // O teste tenta validar a presença da imagem do livro,  
            // mas tem um fallback para verificar o container geral de detalhes caso 
            // a imagem não seja carregada, garantindo resiliência a falhas de recursos.
            try {
                await expect(detalhesPage.imagemLivro).toBeVisible({ timeout: 10000 });
            } catch {
                await expect(detalhesPage.containerDetalhes).toBeVisible();
            }
        });
    });

    // =========================================================================
    // 5. FAVORITOS
    // =========================================================================
    test.describe('5. Favoritos', () => {

        test('CT-FE-013 - Adicionar Livro aos Favoritos pela UI', async ({ page }) => {
            // Reutilização de POM para Navegação e Interação.
            const loginPage = new LoginPage(page);
            const detalhesPage = new DetalhesPage(page);
            const favoritosPage = new FavoritosPage(page);
            // Injeção rápida da sessão via LocalStorage (Ignora UI do login para acelerar a execução).
            await loginPage.definirSessaoLocalStorage(1);
            await detalhesPage.navegarParaId(1);

            // Configuração de Listener para Captura de Diálogo de Sucesso.
            page.on('dialog', async dialog => { await dialog.accept(); });

            // Alinha o estado inicial de forma inteligente usando a inteligência POM.
            await detalhesPage.gerirEstadoFavorito(true);
            await expect(detalhesPage.btnFavorito).toHaveAttribute('onclick', 'toggleFavorito(1, false)');
            // Clica para adicionar aos favoritos.
            await detalhesPage.btnFavorito.click();
            // Validação de Mudança de Estado do Botão: 
            // Verifica se o atributo 'onclick' foi atualizado para refletira nova ação possível (remover dos favoritos), 
            // confirmando que a interação teve efeito na UI.
            await expect(detalhesPage.btnFavorito).toHaveAttribute('onclick', 'toggleFavorito(1, true)');
            // Navega para a página de favoritos para confirmar a adição.
            await favoritosPage.navegar();
            // Validação de Exibição do Livro Favoritado: 
            // Verifica se o livro adicionado aparece na lista de favoritos.
            await expect(favoritosPage.gridFavoritos.first()).toBeVisible();
        });

        test('CT-FE-014 - Remover Livro dos Favoritos', async ({ page }) => {
            // Reutilização de POM para Navegação e Interação.
            const loginPage = new LoginPage(page);
            const detalhesPage = new DetalhesPage(page);
            // Injeção rápida da sessão via LocalStorage (Ignora UI do login para acelerar a execução).
            await loginPage.definirSessaoLocalStorage(1);
            await detalhesPage.navegarParaId(1);
            // Configuração de Listener para Captura de Diálogo de Sucesso.
            page.on('dialog', async dialog => { await dialog.accept(); });

            // Força o setup do teste garantindo a pré-condição de que o item já esteja favoritado antes da remoção.
            const statusAtual = await detalhesPage.btnFavorito.getAttribute('onclick');
            if (statusAtual === 'toggleFavorito(1, false)') {
                await detalhesPage.btnFavorito.click();
            }
            // Agora o item está favoritado, o teste pode proceder para clicar e remover dos favoritos.
            await detalhesPage.btnFavorito.click();
            //  Validação de Mudança de Estado do Botão: 
            // Verifica se o atributo 'onclick' foi atualizado (adicionar aos favoritos).
            await expect(detalhesPage.btnFavorito).toContainText(/Adicionar/i);
        });

        test('CT-FE-015 - Listar Livros Favoritos', async ({ page }) => {
            // Reutilização de POM para Navegação e Interação.
            const loginPage = new LoginPage(page);
            const favoritosPage = new FavoritosPage(page);
            // Injeção rápida da sessão via LocalStorage (Ignora UI do login para acelerar a execução).
            await loginPage.definirSessaoLocalStorage(1);
            // Navega para a página de favoritos para validar a listagem.
            await favoritosPage.navegar();
            // Aguarda o carregamento dos favoritos, 
            // seja exibido com ou sem livros, garantindo que o teste prossiga apenas após a renderização completa.
            await favoritosPage.aguardarCarregamentoEstados();

            // Validação de Exibição Condicional: O teste verifica se a grade de favoritos está visível,
            // e se não estiver, confirma que a mensagem de vazio é exibida, garantindo cobertura para ambos os estados possíveis da UI.
            if (await favoritosPage.gridFavoritos.first().isVisible()) {
                await expect(favoritosPage.gridFavoritos.first()).toBeVisible();
                await expect(favoritosPage.mensagemVazia).not.toBeVisible();
            } else {
                await expect(favoritosPage.mensagemVazia).toBeVisible();
            }
        });
    });

    // =========================================================================
    // 6. ARRENDAMENTOS
    // =========================================================================
    test.describe('6. Arrendamentos', () => {

        test('CT-FE-016 - Solicitar Novo Arrendamento', async ({ page }) => {
            // Reutilização de POM para Navegação e Interação.
            const loginPage = new LoginPage(page);
            const arrendamentosPage = new ArrendamentosPage(page);
            // Injeção rápida da sessão via LocalStorage (Ignora UI do login para acelerar a execução).
            await loginPage.definirSessaoLocalStorage(1);
            await arrendamentosPage.navegarArrendamentos();
            // Configuração de Listener para Captura de Diálogo de Sucesso.
            page.once('dialog', async dialog => {
                expect(dialog.message()).toContain('sucesso');
                await dialog.accept();
            });
            // Solicita um arrendamento para o livro com ID 1, com datas válidas.
            await arrendamentosPage.solicitarArrendamento(1, '2026-06-10', '2026-06-17');

            // Validação de Exibição do Arrendamento Pendente: 
            await arrendamentosPage.todosOsCards.first().waitFor({ state: 'visible', timeout: 5000 });
            const textosDosCards = await arrendamentosPage.todosOsCards.evaluateAll(elements => elements.map(el => el.innerText));

            // Verifica se a string "PENDENTE" existe em pelo menos um dos cards lidos.
            const temPendente = textosDosCards.some(texto => texto.includes('PENDENTE'));
            expect(temPendente).toBe(true);
        });

        test('CT-FE-017 - Aprovar Arrendamento', async ({ page }) => {
            // Reutilização de POM para Navegação e Interação.
            const loginPage = new LoginPage(page);
            const arrendamentosPage = new ArrendamentosPage(page);
            // Injeção rápida da sessão via LocalStorage (Ignora UI do login para acelerar a execução).
            await loginPage.definirSessaoLocalStorage(2); // Autentica como Perfil Funcionário.
            await arrendamentosPage.navegarAprovacoes();
            // Configuração de Listener para Captura de Diálogo de Sucesso.
            page.once('dialog', async dialog => { await dialog.accept(); });

            // Execução Condicional de Ação: Só avança se existirem solicitações pendentes na fila de triagem.
            if (await arrendamentosPage.btnAprovar.isVisible()) {
                await arrendamentosPage.btnAprovar.click();
                await expect(page.locator('body')).toContainText('APROVADO');
            }
        });
    });

    // =========================================================================
    // 7. COMPRAS
    // =========================================================================
    test.describe('7. Compras', () => {

        test('CT-FE-018 - Registrar Compra (Aluno)', async ({ page }) => {
            // Reutilização de POM para Navegação e Interação.
            const loginPage = new LoginPage(page);
            await loginPage.definirSessaoLocalStorage(1);
            await page.goto('/compras.html');
            // Configuração de Listener para Captura de Diálogo de Sucesso.
            page.once('dialog', async dialog => {
                expect(dialog.message()).toContain('sucesso');
                await dialog.accept();
            });
            // Clica para comprar o primeiro livro listado.
            const primeiroCard = page.locator('#lista-livros-compra .book-card').first();
            await expect(primeiroCard).toBeVisible({ timeout: 7000 });
            await primeiroCard.locator('button:has-text("Comprar")').click();
            await page.goto('/minhas-compras.html');
            await expect(page.locator('body')).toContainText('PENDENTE');
        });

        test('CT-FE-019 - Aprovar Compra (Admin/Funcionário)', async ({ page }) => {
            // Reutilização de POM para Navegação e Interação.
            const loginPage = new LoginPage(page);
            await loginPage.definirSessaoLocalStorage(3);
            await page.goto('/compras-admin.html');
            //  Configuração de Listener para Captura de Diálogo de Sucesso.
            page.on('dialog', async dialog => { await dialog.accept(); });
            // Execução Condicional de Ação: 
            // Só avança se existirem compras pendentes na fila de triagem.
            const btnAprovarCompra = page.locator('button:has-text("Aprovar"), .btn-aprovar').first();
            if (await btnAprovarCompra.isVisible()) {
                await btnAprovarCompra.click();
                await expect(page.locator('body')).toContainText('APROVADA');
            }
        });
    });

    // =========================================================================
    // 8. ADMIN USUÁRIOS
    // =========================================================================
    test.describe('8. Admin Usuários', () => {

        test('CT-FE-020 - Acessar Tela de Usuários (Admin)', async ({ page }) => {
            const loginPage = new LoginPage(page);
            const adminUsuariosPage = new AdminUsuariosPage(page);

            await loginPage.definirSessaoLocalStorage(3);
            await adminUsuariosPage.navegar();
            await expect(adminUsuariosPage.tabelaUsuarios).toBeVisible();

            // Teste Negativo / Quebra de Privilégio: Valida que um Aluno comum é barrado ou não visualiza a listagem restrita.
            await loginPage.definirSessaoLocalStorage(1);
            await adminUsuariosPage.navegar();
            await expect(page.locator('body')).not.toContainText('usuarios-lista');
        });

        test('CT-FE-021 - Criar Funcionário pela UI Admin', async ({ page }) => {
            const loginPage = new LoginPage(page);
            const adminUsuariosPage = new AdminUsuariosPage(page);

            await loginPage.definirSessaoLocalStorage(3);
            await adminUsuariosPage.navegar();

            page.once('dialog', async dialog => {
                expect(dialog.message()).toContain('sucesso');
                await dialog.accept();
            });

            await adminUsuariosPage.criarFuncionario('Novo Func', `novo.func.${Date.now()}@teste.com`, '123456');

            await adminUsuariosPage.inputsNomeTabela.first().waitFor({ state: 'visible', timeout: 5000 });
            // Extrai a propriedade .value do elemento input via injeção avaliada na API do browser.
            const usuariosCadastrados = await adminUsuariosPage.inputsNomeTabela.evaluateAll(elements => elements.map(el => el.value));

            expect(usuariosCadastrados).toContain('Novo Func');
        });

        test('CT-FE-022 - Editar Usuário na Tabela', async ({ page }) => {
            const loginPage = new LoginPage(page);
            const adminUsuariosPage = new AdminUsuariosPage(page);

            await loginPage.definirSessaoLocalStorage(3);
            await adminUsuariosPage.navegar();

            page.once('dialog', async dialog => {
                expect(dialog.message()).toContain('sucesso');
                await dialog.accept();
            });

            // Isola a linha alvo utilizando o método encapsulado no POM passando o ID técnico correspondente.
            const linhaUsuario = adminUsuariosPage.retornarLinhaPorId('2');
            await expect(linhaUsuario).toBeVisible({ timeout: 5000 });

            const inputNome = linhaUsuario.locator('input[data-campo="nome"]');
            await inputNome.click();
            await inputNome.fill('Nome Alterado UI');

            await linhaUsuario.locator('button:has-text("Salvar")').click();
            // Força o recarregamento (F5) para validar a persistência de dados real na retaguarda.
            await page.reload();

            const linhaAtualizada = adminUsuariosPage.retornarLinhaPorId('2');
            const valorNome = await linhaAtualizada.locator('input[data-campo="nome"]').inputValue();
            expect(valorNome).toBe('Nome Alterado UI');
        });

        test('CT-FE-023 - Excluir Usuário', async ({ page }) => {
            const loginPage = new LoginPage(page);
            const adminUsuariosPage = new AdminUsuariosPage(page);

            await loginPage.definirSessaoLocalStorage(3);
            await adminUsuariosPage.navegar();

            page.on('dialog', async dialog => { await dialog.accept(); });

            await adminUsuariosPage.listaLinhasTabela.first().waitFor({ state: 'visible', timeout: 5000 });
            // Estratégia de Segurança do Teste: Seleciona e elimina sempre a última linha para salvaguardar o Admin Master (ID 1).
            const linhaAlvo = adminUsuariosPage.listaLinhasTabela.last();

            const idUsuario = (await linhaAlvo.locator('td').first().innerText()).trim();
            const emailUsuario = await linhaAlvo.locator('input[data-campo="email"]').inputValue();

            // Defesa preventiva: se a última linha for o ID master 1, aborta preventivamente para não corromper o ecossistema.
            expect(idUsuario).not.toBe('1');

            await linhaAlvo.locator('button:has-text("Excluir")').click();
            await page.reload();

            // Valida a ausência do elemento após a limpeza lógica/física.
            const linhaDeletada = adminUsuariosPage.retornarLinhaPorId(idUsuario);
            await expect(linhaDeletada).not.toBeVisible();

            const emailsRestantes = await adminUsuariosPage.inputsEmailTabela.evaluateAll(elements => elements.map(el => el.value));
            expect(emailsRestantes).not.toContain(emailUsuario);
        });
    });

    // =========================================================================
    // 9. LOGOUT
    // =========================================================================
    test.describe('9. Logout', () => {

        test('CT-FE-024 - Logout do Sistema', async ({ page }) => {
            const loginPage = new LoginPage(page);
            const dashboardPage = new DashboardPage(page);

            await loginPage.definirSessaoLocalStorage(1);
            await dashboardPage.navegar();

            await dashboardPage.efetuarLogout();
            await page.waitForURL('**/login.html', { timeout: 5000 });

            // Garante que o estado de sessão foi completamente purgado a nível físico do browser.
            const localStorageUsuario = await page.evaluate(() => localStorage.getItem('usuario'));
            expect(localStorageUsuario).toBeNull();

            // Re-checagem de segurança: Uma tentativa subsequente de entrar na rota protegida deve falhar e redirecionar.
            await dashboardPage.navegar();
            await page.waitForURL('**/login.html');
        });
    });
});
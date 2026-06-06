const { expect } = require('@playwright/test');

/**
 * Classe de Page Object Model (POM) para a página de login do sistema.
 * 
 */
class LoginPage {
    /**
     * @param {import('@playwright/test').Page} page - Objeto de contexto da página fornecido pelo Playwright.
     */
    constructor(page) {
        // O construtor inicializa os locators para os elementos da página,
        this.page = page;
        // Estrutura de seletores preparados para suportar atributos "type" ou "id" do HTML, garantindo flexibilidade na identificação dos campos.
        this.inputEmail = page.locator('input[type="email"], #email');
        this.inputSenha = page.locator('input[type="password"], #senha');
        // Botão de login identificado por seu papel e nome, utilizando uma expressão regular para permitir variações de texto como "Entrar" ou "Log In".
        this.btnEntrar = page.getByRole('button', { name: /Entrar/i });
    }

    // Método de navegação para acessar a página de login.
    async navegar() {
        await this.page.goto('/login.html');
    }

    /**
     *  Preenche os campos de email e senha e submete o formulário de login.
     * @param {string} email 
     * @param {string} senha 
     */
    async realizarLogin(email, senha) {
        await this.inputEmail.fill(email);
        await this.inputSenha.fill(senha);
        await this.btnEntrar.click();
    }

    /**
     * Define a sessão do usuário diretamente no localStorage do navegador, simulando um login bem-sucedido.
     * Permite configurar o tipo de usuário (Aluno, Funcionário, Admin) e o email associado, facilitando testes que dependem de diferentes níveis de acesso sem a necessidade de passar pelo processo de login tradicional.
     * @param {number} tipoUsuario - 1 para Aluno, 2 para Funcionário, 3 para Admin.
     * @param {string} email 
     */
    async definirSessaoLocalStorage(tipoUsuario = 1, email = 'aluna@teste.com') {
        await this.navegar();
        // O método page.evaluate executa código JavaScript no contexto do navegador de testes.
        await this.page.evaluate((dados) => {
            localStorage.setItem('usuario', JSON.stringify({
                id: dados.id,
                nome: dados.nome,
                email: dados.email,
                tipo: dados.tipo
            }));
        }, { id: tipoUsuario === 3 ? 1 : 3, nome: "Usuário Teste", email, tipo: tipoUsuario });
    }
}
// Exporta a classe para uso em outros arquivos de teste.
module.exports = { LoginPage };
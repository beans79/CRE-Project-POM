/**
 * Classe de Page Object Model (POM) para a página de dashboard do sistema.
 * Centraliza os locators e métodos relacionados à interface principal do usuário,
 * incluindo a exibição de informações do usuário, navegação pelos cards de livros recentes e ações de logout.
 */
class DashboardPage {
    constructor(page) {
        this.page = page;
        this.infoUsuario = page.locator('#nomeUsuario');
        this.menuNav = page.locator('#nav-menu');
        this.linkAdminUsuarios = page.locator('a[href*="admin-usuarios.html"], #link-usuarios');
        
        // Seletor composto para abranger múltiplos padrões de cards implementados no grid de recentes.
        this.cardsRecentes = page.locator('.book-card, .livro-item, #grid-recentes > div');
        this.containerCardsAluno = page.locator('#grid-recentes, .books-grid');
        
        // Elementos dedicados à área de perfil e ação de logout.
        this.containerUserInfo = page.locator('.user-info');
        // Scoping: Procura pelo botão de logout estritamente debaixo do container ".user-info".
        this.btnSair = this.containerUserInfo.locator('button.logout, button:has-text("Sair")');
    }
    // Método de navegação para acessar a página de dashboard.
    async navegar() {
        await this.page.goto('/dashboard.html');
    }

    /**
     * Efetua a desconexão segura aguardando primeiro que o container de perfil esteja renderizado.
     */
    async efetuarLogout() {
        await this.containerUserInfo.waitFor({ state: 'visible', timeout: 5000 });
        await this.btnSair.click();
    }
}
// Exporta a classe para uso em outros arquivos de teste.
module.exports = { DashboardPage };
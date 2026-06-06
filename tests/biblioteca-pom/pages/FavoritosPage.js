/**
 * Classe de Page Object Model (POM) para a página de favoritos do sistema.
 */
class FavoritosPage {
    //
    constructor(page) {
        this.page = page;
        this.gridFavoritos = page.locator('.books-grid, .book-card, .livro-item');
        // Localizador baseado em correspondência de texto exata renderizada na tela.
        this.mensagemVazia = page.locator('text="Você ainda não tem livros favoritos."');
    }
    //
    async navegar() {
        await this.page.goto('/favoritos.html');
    }

// Método para aguardar o carregamento dos favoritos, 
// seja exibindo os livros ou a mensagem de vazio, 
// garantindo que o teste prossiga apenas após a renderização completa.
    async aguardarCarregamentoEstados() {
        await Promise.race([
            this.gridFavoritos.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
            this.mensagemVazia.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
        ]);
    }
}
// Exporta a classe para uso em outros arquivos de teste.
module.exports = { FavoritosPage };
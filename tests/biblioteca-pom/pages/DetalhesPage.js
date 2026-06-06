/**
 * Classe de Page Object Model (POM) para a página de detalhes do livro.
 */
class DetalhesPage {
    // O construtor inicializa os locators para os elementos da página,
    constructor(page) {
        this.page = page;
        this.containerDetalhes = page.locator('#detalhes-container, body');
        this.imagemLivro = page.locator('img');
        this.btnFavorito = page.locator('button.btn.btn-primary');
    }

    /**
     * Navega dinamicamente injetando o ID do livro através da Query String da URL.
     * @param {number|string} id 
     */
    async navegarParaId(id) {
        await this.page.goto(`/detalhes.html?id=${id}`);
    }

    // Método para gerenciar o estado de favorito do livro, 
    // verificando o atributo 'onclick' para determinar a ação necessária.
    async gerirEstadoFavorito(reterComoFavorito) {
        await this.btnFavorito.waitFor({ state: 'visible', timeout: 5000 });
        const onclickStatus = await this.btnFavorito.getAttribute('onclick');
        
        // Verifica se a função interna passada na UI indica intenção de adicionar ou remover.
        if (reterComoFavorito && onclickStatus === 'toggleFavorito(1, true)') {
            await this.btnFavorito.click(); 
        } else if (!reterComoFavorito && onclickStatus === 'toggleFavorito(1, false)') {
            await this.btnFavorito.click(); 
        }
    }
}
// Exporta a classe para uso em outros arquivos de teste.
module.exports = { DetalhesPage };
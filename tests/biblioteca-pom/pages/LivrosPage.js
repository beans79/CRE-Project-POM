/**
 * Classe de Page Object Model (POM) para a página de livros do sistema.
 */
class LivrosPage {
    constructor(page) {
        //
        this.page = page;
        // Estrutura de seletores preparados para suportar atributos "id" ou "name" do HTML.
        this.inputNome = page.locator('#nome, [name="nome"]');
        this.inputAutor = page.locator('#autor, [name="autor"]');
        this.inputPaginas = page.locator('#paginas, [name="paginas"]');
        this.inputDescricao = page.locator('#descricao, [name="descricao"]');
        this.inputImagemUrl = page.locator('#imagemUrl, [name="imagemUrl"]');
        this.inputEstoque = page.locator('#estoque, [name="estoque"]');
        this.inputPreco = page.locator('#preco, [name="preco"]');
        this.btnCadastrar = page.getByRole('button', { name: /Adicionar Livro|Cadastrar/i });
        this.primeiroLivroCard = page.locator('.book-card, .livro-item, a[href*="detalhes.html"]').first();
    }

    //  Método de navegação para acessar a página de livros.
    async navegar() {
        await this.page.goto('/livros.html');
    }

    /**
     * Preenche o dicionário/objeto de dados do novo livro e submete o formulário.
     * @param {Object} dados 
     */
    async cadastrarLivro(dados) {
        await this.inputNome.fill(dados.nome);
        await this.inputAutor.fill(dados.autor);
        await this.inputPaginas.fill(dados.paginas);
        await this.inputDescricao.fill(dados.descricao);
        await this.inputImagemUrl.fill(dados.imagemUrl);
        await this.inputEstoque.fill(dados.estoque);
        await this.inputPreco.fill(dados.preco);
        await this.btnCadastrar.click();
    }
    // Método para abrir a página de detalhes do primeiro livro listado,
    async abrirDetalhesPrimeiroLivro() {
        await this.primeiroLivroCard.click();
    }
}
// Exporta a classe para uso em outros arquivos de teste.
module.exports = { LivrosPage };
/**
 * Classe de Page Object Model (POM) para a página de arrendamentos do sistema.
 * Centraliza os locators e métodos relacionados à funcionalidade de arrendamento de livros,
 */
class ArrendamentosPage {
    // O construtor inicializa os locators para os elementos da página,
    constructor(page) {
        this.page = page;
        // Elementos do Formulário de Requisição (Aluno)
        this.selectLivro = page.locator('select, #livroId');
        this.inputDataInicio = page.locator('#dataInicio, [name="dataInicio"]');
        this.inputDataFim = page.locator('#dataFim, [name="dataFim"]');
        this.btnSolicitar = page.getByRole('button', { name: /Solicitar Arrendamento|Enviar/i });
        this.todosOsCards = page.locator('.book-card');

        // Elementos de Gestão/Moderação (Perfil Funcionário/Admin)
        this.btnAprovar = page.locator('button:has-text("Aprovar"), .btn-aprovar').first();
    }
    // Métodos de Navegação
    async navegarArrendamentos() {
        await this.page.goto('/arrendamentos.html');
    }
    // Método específico para acessar a página de aprovações, 
    // caso seja necessário testar funcionalidades exclusivas dessa seção.
    async navegarAprovacoes() {
        await this.page.goto('/aprovacoes.html');
    }


    //Seleciona o livro pelo index nativo da tag <select> e estipula as datas de vigência do empréstimo.

    async solicitarArrendamento(indexLivro, dataInicio, dataFim) {
        await this.selectLivro.selectOption({ index: indexLivro });
        await this.inputDataInicio.fill(dataInicio);
        await this.inputDataFim.fill(dataFim);
        await this.btnSolicitar.click();
    }
}
// Exporta a classe para uso em outros arquivos de teste.
module.exports = { ArrendamentosPage };
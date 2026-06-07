/**
 * Classe de Page Object Model (POM) para a página de administração de usuários.
 */
class AdminUsuariosPage {
    // O construtor inicializa os locators para os elementos da página,
    //  incluindo a tabela de usuários e os campos do formulário de criação.
    constructor(page) {
        this.page = page;
        this.tabelaUsuarios = page.locator('table, #usuarios-lista');
        this.listaLinhasTabela = page.locator('#lista-usuarios tr');
        
        // Elementos de formulário para criação do usuário
        this.inputNome = page.locator('#nome');
        this.inputEmail = page.locator('#email');
        this.inputSenha = page.locator('#senha');
        this.selectTipo = page.locator('select#tipo');
        this.btnCriarUsuario = page.getByRole('button', { name: 'Criar Usuário', exact: true });
        
        // Coleção de Inputs Dinâmicos incorporados nas células das linhas da tabela, utilizando o atributo 'data-campo' para identificação precisa.
        this.inputsNomeTabela = page.locator('#lista-usuarios tr td input[data-campo="nome"]');
        this.inputsEmailTabela = page.locator('#lista-usuarios tr td input[data-campo="email"]');
    }

    async navegar() {
        await this.page.goto('/admin-usuarios.html');
    }

    /**
     * Automatiza a criação de um novo funcionário associando o valor técnico "2" ao tipo de usuário "Funcionário" no dropdown,
     *  garantindo a seleção correta mesmo que a ordem dos tipos seja alterada no futuro.
     */
    async criarFuncionario(nome, email, senha) {
        await this.inputNome.fill(nome);
        await this.inputEmail.fill(email);
        await this.inputSenha.fill(senha);
        await this.selectTipo.selectOption('2'); 
        await this.btnCriarUsuario.click();
    }

    /**
     * Retorna a linha da tabela de usuários que contém o ID especificado, 
     * utilizando um seletor robusto que verifica o conteúdo da célula correspondente ao ID.
     * @param {string|number} id 
     */
    retornarLinhaPorId(id) {
        return this.page.locator('#lista-usuarios tr', { has: this.page.locator(`td:text-is("${id}")`) });
    }
}
// Exporta a classe para uso em outros arquivos de teste.
module.exports = { AdminUsuariosPage };
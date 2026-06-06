/**
 * Classe de Page Object Model (POM) para a página de registro do sistema.
 */
class RegistroPage {
    //
    constructor(page) {
        this.page = page;
        // Estrutura de seletores preparados para suportar atributos "placeholder", "type" ou "id" do HTML.
        this.inputNome = page.locator('input[placeholder*="Nome"], #nome');
        this.inputEmail = page.locator('input[type="email"], #email');
        // Para o campo de senha, prioriza a identificação por tipo, mas tem fallback para ID, garantindo resiliência a mudanças no HTML.
        this.inputSenha = page.locator('input[type="password"]').first();
        this.inputConfirmarSenha = page.locator('input[placeholder*="Confirmar"], #confirmarSenha');
        this.btnRegistrar = page.getByRole('button', { name: /Registrar/i });
    }
    //  
    async navegar() {
        await this.page.goto('/registro.html');
    }

    // Método para preencher o formulário de registro com os dados fornecidos, 
    // utilizando os locators definidos no construtor.
    async preencherFormulario(nome, email, senha, confirmarSenha) {
        await this.inputNome.fill(nome);
        await this.inputEmail.fill(email);
        await this.inputSenha.fill(senha);
        await this.inputConfirmarSenha.fill(confirmarSenha);
    }
    // Método para submeter o formulário de registro, clicando no botão de registrar.
    async submeter() {
        await this.btnRegistrar.click();
    }
}
// Exporta a classe para uso em outros arquivos de teste.
module.exports = { RegistroPage };
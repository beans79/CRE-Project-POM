// controllers/BibliotecaApiController.js

class BibliotecaApiController {
    /**
     * @param {import('@playwright/test').APIRequestContext} request
     */
    constructor(request) {
        this.request = request;
    }

    // =========================================================================
    // 1. AUTENTICAÇÃO E PERFIS
    // =========================================================================
    async registrarUsuario(nome, email, senha) {
        return await this.request.post('/registro', {
            data: { nome, email, senha }
        });
    }

    async login(email, senha) {
        return await this.request.post('/login', {
            data: { email, senha }
        });
    }

    // =========================================================================
    // 2. LIVROS
    // =========================================================================
    async listarTodosOsLivros() {
        return await this.request.get('/livros');
    }

    async listarLivrosDisponiveis() {
        return await this.request.get('/livros/disponiveis');
    }

    async buscarLivroPorId(id) {
        return await this.request.get(`/livros/${id}`);
    }

    async cadastrarLivro(dadosLivro) {
        return await this.request.post('/livros', {
            data: dadosLivro
        });
    }

    async atualizarLivro(id, dadosLivro) {
        return await this.request.put(`/livros/${id}`, {
            data: dadosLivro
        });
    }

    async deletarLivro(id) {
        return await this.request.delete(`/livros/${id}`);
    }

    // =========================================================================
    // 3. ESTATÍSTICAS
    // =========================================================================
    async obterEstatisticas() {
        return await this.request.get('/estatisticas');
    }

    // =========================================================================
    // 4. FAVORITOS
    // =========================================================================
    async adicionarFavorito(usuarioId, livroId) {
        return await this.request.post('/favoritos', {
            data: { usuarioId, livroId }
        });
    }

    async removerFavorito(usuarioId, livroId) {
        return await this.request.delete('/favoritos', {
            data: { usuarioId, livroId }
        });
    }

    async listarFavoritosDoUsuario(usuarioId) {
        return await this.request.get(`/favoritos/${usuarioId}`);
    }

    // =========================================================================
    // 5. ARRENDAMENTOS
    // =========================================================================
    async criarArrendamento(usuarioId, livroId, dataInicio, dataFim) {
        return await this.request.post('/arrendamentos', {
            data: { usuarioId, livroId, dataInicio, dataFim }
        });
    }

    async atualizarStatusArrendamento(id, status) {
        return await this.request.put(`/arrendamentos/${id}/status`, {
            data: { status }
        });
    }

    async listarArrendamentosDoUsuario(usuarioId) {
        return await this.request.get(`/arrendamentos/me?usuarioId=${usuarioId}`);
    }

    // =========================================================================
    // 6. COMPRAS
    // =========================================================================
    async criarCompra(usuarioId, livroId, quantidade) {
        return await this.request.post('/compras', {
            data: { usuarioId, livroId, quantidade }
        });
    }

    async atualizarStatusCompra(id, status) {
        return await this.request.put(`/compras/${id}/status`, {
            data: { status }
        });
    }

    async listarComprasDoUsuario(usuarioId) {
        return await this.request.get(`/compras/me?usuarioId=${usuarioId}`);
    }

    async listarTodasAsCompras() {
        return await this.request.get('/compras');
    }

    // =========================================================================
    // 7. ADMIN USUÁRIOS
    // =========================================================================
    async listarUsuarios() {
        return await this.request.get('/usuarios');
    }

    async atualizarUsuario(id, dadosUsuario) {
        return await this.request.put(`/usuarios/${id}`, {
            data: dadosUsuario
        });
    }

    async excluirUsuario(id) {
        return await this.request.delete(`/usuarios/${id}`);
    }
}

module.exports = { BibliotecaApiController };
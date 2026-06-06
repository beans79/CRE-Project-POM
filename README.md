# 📚 Sistema de Biblioteca - Suíte de Testes Automatizados (Playwright)

  Este repositório contém a infraestrutura de testes automatizados para o **Sistema de Biblioteca**. A suíte abrange tanto testes de interface gráfica (**End-to-End/UI**) utilizando o padrão *Page Object Model (POM)*, quanto testes de integração e validação de contratos da camada de serviços (**API**).

---

## 📋 Conteúdo do Repositório

O projeto está estruturado com duas suítes principais de testes em Playwright:

1. **`frontend-biblioteca.spec.js` (Testes de UI):** Foco em fluxos de utilizador de ponta a ponta. Implementa 24 Casos de Teste (`CT-FE-001` a `CT-FE-024`) organizados em módulos como Registro, Login, Proteção de Rotas, Dashboard dinâmico por perfil, Catálogo de Livros, Favoritos, Arrendamentos, Compras e Backoffice de Usuários.

2. **`api-biblioteca.spec.js` (Testes de API):** Validação direta dos endpoints REST da aplicação. Implementa 32 Casos de Teste (`CT-API-001` a `CT-API-032`) cobrindo asserções de códigos de estado HTTP, tempo de resposta, payloads JSON, regras de negócio (como validação matemática de totais e integridade de stock) e restrições de privilégios.

---

## ⚙️ Inicialização Automática do Servidor

O ambiente está totalmente configurado para **Integração Contínua (CI)** e execuções locais simplificadas:
* **Execução Local:** O ficheiro `playwright.config.js` utiliza o recurso `webServer` do Playwright. Isto significa que **o servidor/API inicia de forma 100% automática** assim que geras qualquer comando de teste. Não precisas de abrir um terminal à parte para ligar a aplicação.
* **Pipeline de CI:** No ecossistema do GitHub Actions, o ficheiro de workflow `playwright.yml` encarrega-se de provisionar as dependências e levantar o servidor antes de correr as suítes de validação em cada *Pull Request* ou *Push*.

---

## 🛠️ Ferramentas Necessárias e Pré-requisitos

Antes de executar os testes, garante que tens as seguintes ferramentas instaladas na tua máquina:

* **[Node.js](https://nodejs.org/)** (Versão LTS recomendada - v18 ou superior)
* **Gestor de pacotes NPM** (Instalado automaticamente com o Node.js)
* **Editor de Código / IDE:** [Visual Studio Code (VS Code)](https://code.visualstudio.com/) - *Recomendado*
* **Extensão do VS Code:** *Playwright Test for VSCode* (Opcional, útil para execução visual)
* **Github: ** Para clonar o repositório.

---

## 🚀 Instalação e Configuração

  Siga os passos abaixo para preparar o ambiente local:

  1. **Clonar o repositório:**
    bash
    git clone https://github.com/beans79/CRE-Project-POM.git
    cd CRE-Project-POM

  2. Instalar as dependências do projeto:
    Este comando instalará o ecossistema do Playwright e outras bibliotecas necessárias declaradas no package.json.
      bash
      npm install

  3. Instalar os Browsers do Playwright:
    O Playwright precisa fazer download dos binários limpos dos navegadores (Chromium, Firefox, WebKit) para correr os testes de UI.~
      bash
      npx playwright install

🧪 Como Executar os Testes
    No inicio da execução dos testes no playwright, irá instanciar o servidor, aguardar que ele fique disponível, correr os testes e fechá-lo de seguida.
  1. Executar Todos os Testes (UI e API)
    Corre todas as suítes de teste em modo headless (em segundo plano):
      bash
      npx playwright test
  2. Executar Apenas os Testes de Interface (Frontend)
    Para focar apenas na validação visual e fluxos E2E da UI:

      Bash
      npx playwright test frontend-biblioteca.spec.js
  3. Executar Apenas os Testes de API
    Para focar apenas na validação dos endpoints e regras de negócio de back-end:
      bash
      npx playwright test  .\tests\api-biblioteca.spec.js  
  4. Executar em Modo Gráfico (UI Mode)
    Recomendado para desenvolvimento e depuração. Abre uma interface interativa que permite ver o passo a passo, logs e efetuar time-travel nos testes de interface:
      bash
      npx playwright test --ui .\\tests\\biblioteca-pom\\frontend-biblioteca.spec.js 
  5. Executar um teste especifico
    Permite a execução de um teste especifico. 
    Ex: (CT-FE-001 - Fluxo Completo de Registro (Aluno))
      bash
      npx playwright test -g 'CT-FE-001 - Fluxo Completo de Registro (Aluno)'
  6. Acessos principais:
    - Aplicação (login): `http://localhost:3000/login.html`  
    - Swagger: `http://localhost:3000/api-docs`  
    - Base da API: `http://localhost:3000`  

📊 Relatórios de Testes (Reports)
  Após a conclusão de qualquer execução, o Playwright gera automaticamente um relatório HTML detalhado. Para abrir o último relatório gerado e inspecionar falhas ou métricas, executa:
    bash
    npx playwright show-report

***

## 📁 Estrutura do Projeto

```text
CRE-PROJECT-POM/
│
├── controllers/                   # Camada API Object Model (AOM)
│   └── BibliotecaApiController.js # Métodos HTTP encapsulados (GET,POST, etc.)
│
├── pages/                         # Camada Page Object Model (POM) - UI
│   ├── LoginPage.js               # Seletores e ações da tela de Login
│   ├── RegistroPage.js            # Seletores e ações da tela de Registo
│   ├── DashboardPage.js           # Seletores e ações do Painel Principal
│   ├── LivrosPage.js        # Seletores e ações da listagem/cadastro de Livros
│   ├── DetalhesPage.js      # Seletores e ações da página de detalhes do Livro
│   ├── FavoritosPage.js      # Seletores e ações da página de Favoritos
│   ├── ArrendamentosPage.js  # Seletores e ações de Empréstimos/Arrendamentos
│   └── AdminUsuariosPage.js  # Seletores e ações da gestão de utilizadores
│
├── tests/                    # Ficheiros de Especificação
│   ├── frontend-biblioteca.spec.js        # Testes de Interface Gráfica (UI)
│   └── api-biblioteca.spec.js             # Testes de Integração e Contratos (API)
│
├── playwright.config.js        # Configurações globais do Playwright 
└── package.json                # Dependências do projeto (Playwright, scripts)
```
### Resumo dos Componentes
  - tests/: Guarda estritamente as asserções (expect) e o fluxo de cenários de teste. Eles não sabem quais são os seletores CSS ou os endpoints exatos; apenas chamam os métodos das Pages e Controllers.

  - pages/: Contém classes em JavaScript. Cada classe representa uma página web e mapeia os seus elementos (como inputs e botões) e funções (como fazerLogin() ou cadastrarLivro()).

  - controllers/: Funciona como o POM, mas para o teste da API. Centraliza as chamadas de rede (ex: this.request.post('/login')), reduzindo a repetição de código nos testes.
***

## 🔌 Endpoints da API (Resumo)

### Autenticação

| Método | Endpoint     | Descrição                              |
|--------|--------------|----------------------------------------|
| POST   | `/registro`  | Criar usuário (aluno / func / admin)  |
| POST   | `/login`     | Autenticar usuário                     |

### Usuários (Admin / CRUD)

| Método | Endpoint         | Descrição                       |
|--------|------------------|---------------------------------|
| GET    | `/usuarios`      | Listar usuários (sem senha)     |
| PUT    | `/usuarios/:id`  | Atualizar nome/email/tipo       |
| DELETE | `/usuarios/:id`  | Excluir usuário (exceto id 1)   |

### Livros

| Método | Endpoint                  | Descrição                         |
|--------|---------------------------|-----------------------------------|
| GET    | `/livros`                 | Listar todos os livros            |
| GET    | `/livros/disponiveis`     | Listar apenas com estoque > 0     |
| GET    | `/livros/:id`             | Buscar livro por ID               |
| POST   | `/livros`                 | Criar livro                       |
| PUT    | `/livros/:id`             | Atualizar livro                   |
| DELETE | `/livros/:id`             | Remover livro                     |
| GET    | `/livros/recentes/ultimos`| Últimos 5 livros cadastrados      |

### Estatísticas

| Método | Endpoint        | Descrição                                              |
|--------|-----------------|--------------------------------------------------------|
| GET    | `/estatisticas` | Totais de livros, páginas, usuários e pendências      |

### Favoritos

| Método | Endpoint               | Descrição                          |
|--------|------------------------|------------------------------------|
| GET    | `/favoritos/:usuarioId`| Listar favoritos do usuário        |
| POST   | `/favoritos`          | Adicionar livro aos favoritos      |
| DELETE | `/favoritos`          | Remover livro dos favoritos        |

### Arrendamentos

| Método | Endpoint                   | Descrição                                    |
|--------|----------------------------|----------------------------------------------|
| GET    | `/arrendamentos`          | Listar todos (para aprovação)                |
| GET    | `/arrendamentos/me`       | Listar arrendamentos de um usuário (`usuarioId` na query) |
| POST   | `/arrendamentos`          | Solicitar arrendamento                       |
| PUT    | `/arrendamentos/:id/status`| Alterar status (APROVADO / REJEITADO)       |

### Compras

| Método | Endpoint                 | Descrição                                        |
|--------|--------------------------|--------------------------------------------------|
| GET    | `/compras`              | Listar todas as compras                          |
| GET    | `/compras/me`           | Compras de um usuário (`usuarioId` na query)     |
| POST   | `/compras`              | Registrar compra                                 |
| PUT    | `/compras/:id/status`   | Alterar status (APROVADA / CANCELADA)           |

***

## 💡 Dados de Teste

Usuários iniciais:

- **Admin:**  
  - Email: `admin@biblioteca.com`  
  - Senha: `123456`  
- **Funcionário:**  
  - Email: `func@biblio.com`  
  - Senha: `123456`  
- **Aluno:**  
  - Email: `aluna@teste.com`  
  - Senha: `123456`

Livros iniciais:

1. Clean Code – Robert C. Martin (464 páginas)  
2. Harry Potter – J.K. Rowling (309 páginas)

***

## 📝 Autor dos Testes
    Armando Teixeira


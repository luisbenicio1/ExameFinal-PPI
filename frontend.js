function gerarPaginaLogin(erro = '') {
    let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Login - Bate-papo WEB</title>
        <style>
            body { font-family: sans-serif; text-align: center; margin-top: 50px; }
            fieldset { width: 300px; margin: auto; }
            .error { color: red; }
        </style>
    </head>
    <body>
        <h1>Bate-papo WEB</h1>
        <form action="/login" method="POST">
            <fieldset>
                <legend>Acesso ao Sistema</legend>
                <p>Usuário: <input type="text" name="usuario"></p>
                <p>Senha: <input type="password" name="senha"></p>
                ${erro ? `<p class="error">${erro}</p>` : ''}
                <button type="submit">Entrar</button>
            </fieldset>
        </form>
    </body>
    </html>
    `;
    return html;
}

function gerarPaginaMenu(ultimoAcesso) {
    let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Menu Principal</title>
    </head>
    <body>
        <h1>Menu Principal</h1>
        <p>Seu último acesso foi em: ${ultimoAcesso}</p>
        <ul>
            <li><a href="/cadastroUsuario">Cadastro de Usuários</a></li>
            <li><a href="/selecionarAssunto">Bate-papo</a></li>
        </ul>
        <br>
        <a href="/logout">Sair do Sistema</a>
    </body>
    </html>
    `;
    return html;
}

function gerarFormularioCadastro(assuntosDisponiveis, erros = {}, valores = {}) {
    let optionsAssuntos = assuntosDisponiveis.map(assunto =>
        `<option value="${assunto}" ${valores.assunto === assunto ? 'selected' : ''}>${assunto}</option>`
    ).join('');

    let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Cadastro de Usuário</title>
        <style>.error { color: red; font-size: 0.8em; }</style>
    </head>
    <body>
        <h1>Cadastro de Usuário</h1>
        <form action="/cadastrarUsuario" method="POST">
            <p>
                Nome: <input type="text" name="nome" value="${valores.nome || ''}">
                ${erros.nome ? `<span class="error">${erros.nome}</span>` : ''}
            </p>
            <p>
                Data de Nascimento: <input type="date" name="dataNascimento" value="${valores.dataNascimento || ''}">
                 ${erros.dataNascimento ? `<span class="error">${erros.dataNascimento}</span>` : ''}
            </p>
            <p>
                Nickname/Apelido: <input type="text" name="nickname" value="${valores.nickname || ''}">
                 ${erros.nickname ? `<span class="error">${erros.nickname}</span>` : ''}
            </p>
            <p>
                Assunto Preferido:
                <select name="assunto">
                    <option value="">Selecione...</option>
                    ${optionsAssuntos}
                </select>
                 ${erros.assunto ? `<span class="error">${erros.assunto}</span>` : ''}
            </p>
            <button type="submit">Cadastrar</button>
        </form>
        <br>
        <a href="/menu">Voltar ao Menu</a>
    </body>
    </html>
    `;
    return html;
}

function gerarListaUsuarios(usuariosCadastrados) {
    let linhasTabela = usuariosCadastrados.map(user => `
        <tr>
            <td>${user.nome}</td>
            <td>${user.nickname}</td>
            <td>${user.assunto}</td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Usuários Cadastrados</title>
    </head>
    <body>
        <h1>Usuário cadastrado com sucesso!</h1>
        <h2>Lista de Usuários</h2>
        <table border="1">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Nickname</th>
                    <th>Assunto Preferido</th>
                </tr>
            </thead>
            <tbody>
                ${linhasTabela}
            </tbody>
        </table>
        <br>
        <a href="/cadastroUsuario">Cadastrar Novo Usuário</a>
        <br>
        <a href="/menu">Voltar ao Menu</a>
    </body>
    </html>
    `;
}

function gerarPaginaSelecaoAssunto(assuntosDisponiveis) {
    let optionsAssuntos = assuntosDisponiveis.map(assunto =>
        `<option value="${assunto}">${assunto}</option>`
    ).join('');

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Selecionar Assunto</title>
    </head>
    <body>
        <h1>Salas de Bate-papo</h1>
        <form action="/chat" method="GET">
            <label for="assunto">Escolha um assunto para conversar:</label>
            <select name="assunto" id="assunto">
                ${optionsAssuntos}
            </select>
            <button type="submit">Entrar na Sala</button>
        </form>
        <br>
        <a href="/menu">Voltar ao Menu</a>
    </body>
    </html>
    `;
}

function gerarPaginaChat(assunto, usuariosCadastrados, mensagensDoChat, erros = {}) {
    const usuariosDoAssunto = usuariosCadastrados.filter(u => u.assunto === assunto);
    const mensagensDoAssunto = mensagensDoChat.filter(m => m.assunto === assunto);

    let listaDeMensagens = mensagensDoAssunto.map(msg => `
        <p>
            <strong>${msg.nickname}:</strong> ${msg.texto}
            <br>
            <small>Postado em: ${msg.timestamp}</small>
        </p>
    `).join('');

    let optionsUsuarios = usuariosDoAssunto.map(u =>
        `<option value="${u.nickname}">${u.nickname}</option>`
    ).join('');

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Bate-papo sobre ${assunto}</title>
         <style>
            body { font-family: sans-serif; }
            .chat-container { border: 1px solid #ccc; padding: 10px; height: 300px; overflow-y: scroll; margin-bottom: 10px; }
            .form-container { border: 1px solid #ccc; padding: 10px; }
            .error { color: red; font-size: 0.9em; }
        </style>
    </head>
    <body>
        <h1>Sala de Bate-papo: ${assunto}</h1>
        <div class="chat-container">
            ${listaDeMensagens || '<p>Nenhuma mensagem ainda. Seja o primeiro a postar!</p>'}
        </div>

        <div class="form-container">
            <h3>Enviar Mensagem:</h3>
            <form action="/postarMensagem" method="POST">
                <input type="hidden" name="assunto" value="${assunto}">
                Usuário:
                <select name="usuario">
                    <option value="">Selecione um usuário</option>
                    ${optionsUsuarios}
                </select>
                <br><br>
                Mensagem:
                <input type="text" name="mensagem" size="50">
                <button type="submit">Enviar</button>
                ${erros.formulario ? `<p class="error">${erros.formulario}</p>` : ''}
            </form>
        </div>
        <br>
        <a href="/selecionarAssunto">Trocar de Sala</a>
        <br>
        <a href="/menu">Voltar ao Menu Principal</a>
    </body>
    </html>
    `;
}

module.exports = {
    gerarPaginaLogin,
    gerarPaginaMenu,
    gerarFormularioCadastro,
    gerarListaUsuarios,
    gerarPaginaSelecaoAssunto,
    gerarPaginaChat
};

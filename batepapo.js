const express = require('express');
const frontend = require('./frontend');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

let usuariosCadastrados = [];
let mensagensDoChat = [];
const assuntosDisponiveis = ['Hardware Geral', 'Placas de Vídeo', 'Processadores', 'Montagem de PCs', 'Software e Programação', 'Periféricos'];

app.get('/', (req, res) => {
    res.send(frontend.gerarPaginaMenu());
});

app.get('/cadastroUsuario', (req, res) => {
    res.send(frontend.gerarFormularioCadastro(assuntosDisponiveis));
});

app.post('/cadastrarUsuario', (req, res) => {
    const { nome, dataNascimento, nickname, assunto } = req.body;
    const erros = {};

    if (!nome) erros.nome = 'O campo Nome é obrigatório.';
    if (!dataNascimento) erros.dataNascimento = 'O campo Data de Nascimento é obrigatório.';
    if (!nickname) erros.nickname = 'O campo Nickname é obrigatório.';
    if (!assunto) erros.assunto = 'O campo Assunto é obrigatório.';

    if (Object.keys(erros).length > 0) {
        res.send(frontend.gerarFormularioCadastro(assuntosDisponiveis, erros, req.body));
    } else {
        usuariosCadastrados.push({ nome, dataNascimento, nickname, assunto });
        res.send(frontend.gerarListaUsuarios(usuariosCadastrados));
    }
});

app.get('/selecionarAssunto', (req, res) => {
    res.send(frontend.gerarPaginaSelecaoAssunto(assuntosDisponiveis));
});

app.get('/chat', (req, res) => {
    const { assunto } = req.query;
    if (!assunto || !assuntosDisponiveis.includes(assunto)) {
        res.redirect('/selecionarAssunto');
        return;
    }
    res.send(frontend.gerarPaginaChat(assunto, usuariosCadastrados, mensagensDoChat));
});

app.post('/postarMensagem', (req, res) => {
    const { usuario: nickname, mensagem, assunto } = req.body;

    if (!nickname || !mensagem) {
        const erros = { formulario: 'Para postar, você deve selecionar um usuário e escrever uma mensagem.' };
        res.send(frontend.gerarPaginaChat(assunto, usuariosCadastrados, mensagensDoChat, erros));
    } else {
        const novaMensagem = {
            nickname: nickname,
            texto: mensagem,
            assunto: assunto,
            timestamp: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        };
        mensagensDoChat.push(novaMensagem);
        res.redirect(`/chat?assunto=${assunto}`);
    }
});

module.exports = app;

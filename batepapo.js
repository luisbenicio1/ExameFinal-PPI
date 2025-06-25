const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const frontend = require('./frontend');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session(
    {
        secret: 'minha-chave-secreta',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 30 * 60 * 1000
        }
    }
));

let usuariosCadastrados = [];
let mensagensDoChat = [];
const assuntosDisponiveis = ['Futebol', 'Fórmula 1', 'Basquete', 'Vôlei', 'Tênis'];

function autenticar(req, res, next)
{
    if (req.session.usuarioAutenticado)
    {
        next();
    }
    else
    {
        res.redirect('/login');
    }
}

app.get('/', (req, res) =>
{
    res.redirect('/login');
});

app.get('/login', (req, res) =>
{
    res.send(frontend.gerarPaginaLogin());
});

app.post('/login', (req, res) =>
{
    const { usuario, senha } = req.body;
    if (usuario === 'admin' && senha === 'admin')
    {
        req.session.usuarioAutenticado = true;
        res.cookie('ultimoAcesso', new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }), {
            maxAge: 900000000,
            httpOnly: true
        });
        res.redirect('/menu');
    }
    else
    {
        res.send(frontend.gerarPaginaLogin('Usuário ou senha inválida!'));
    }
});

app.get('/logout', (req, res) =>
{
    req.session.destroy();
    res.redirect('/login');
});

app.get('/menu', autenticar, (req, res) =>
{
    const ultimoAcesso = req.cookies.ultimoAcesso || 'Primeiro acesso!';
    res.send(frontend.gerarPaginaMenu(ultimoAcesso));
});

app.get('/cadastroUsuario', autenticar, (req, res) =>
{
    res.send(frontend.gerarFormularioCadastro(assuntosDisponiveis));
});

app.post('/cadastrarUsuario', autenticar, (req, res) =>
{
    const { nome, dataNascimento, nickname, assunto } = req.body;
    const erros = {};

    if (!nome) erros.nome = 'O campo Nome é obrigatório.';
    if (!dataNascimento) erros.dataNascimento = 'O campo Data de Nascimento é obrigatório.';
    if (!nickname) erros.nickname = 'O campo Nickname é obrigatório.';
    if (!assunto) erros.assunto = 'O campo Assunto é obrigatório.';

    if (Object.keys(erros).length > 0)
    {
        res.send(frontend.gerarFormularioCadastro(assuntosDisponiveis, erros, req.body));
    }
    else
    {
        usuariosCadastrados.push({ nome, dataNascimento, nickname, assunto });
        res.send(frontend.gerarListaUsuarios(usuariosCadastrados));
    }
});

app.get('/selecionarAssunto', autenticar, (req, res) =>
{
    res.send(frontend.gerarPaginaSelecaoAssunto(assuntosDisponiveis));
});

app.get('/chat', autenticar, (req, res) =>
{
    const { assunto } = req.query;
    if (!assunto || !assuntosDisponiveis.includes(assunto))
    {
        res.redirect('/selecionarAssunto');
        return;
    }
    res.send(frontend.gerarPaginaChat(assunto, usuariosCadastrados, mensagensDoChat));
});

app.post('/postarMensagem', autenticar, (req, res) =>
{
    const { usuario: nickname, mensagem, assunto } = req.body;

    if (!nickname || !mensagem)
    {
        const erros = { formulario: 'Para postar, você deve selecionar um usuário e escrever uma mensagem.' };
        res.send(frontend.gerarPaginaChat(assunto, usuariosCadastrados, mensagensDoChat, erros));
    }
    else
    {
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

app.listen(port, () =>
{
    console.log(`Servidor rodando em http://localhost:${port}`);
});
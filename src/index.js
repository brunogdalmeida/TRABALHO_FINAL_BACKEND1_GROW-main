import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();
const PORT = 3333;
let novoUsuario;
let usuarios = [];
let mensagens = [];
let proximoUsuario = 1;
let proximaMensagem = 1;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Bem-vindo à aplicação!');
});

app.post('/cadastro', async (req, res) => {
    const nome = req.body.nome;
    const email = req.body.email;
    const senha = req.body.senha;

    if (!nome) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Por favor, informe o nome." }));
    }

    if (!email) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Por favor, informe o email." }));
    }

    let buscaEmail = usuarios.find(usuario => usuario.email === email);

    if (buscaEmail) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Email já cadastrado, tente outro." }));
    }

    if (!senha) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Senha inválida. Favor inserir." }));
    }

    if (nome && email && senha) {
        let senhaCriptografada = await bcrypt.hash(senha, 10);

        novoUsuario = {
            id: proximoUsuario,
            nome: nome,
            email: email,
            senha: senhaCriptografada
        };

        usuarios.push(novoUsuario);
        proximoUsuario++;

        res.status(201).send(JSON.stringify({ Mensagem: `Seja bem-vindo, ${novoUsuario.nome}! Cadastro realizado com sucesso!` }));
    }
});

app.post('/login', async (req, res) => {
    const email = req.body.email;
    const senha = req.body.senha;

    if (!email) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Insira um email válido." }));
    }

    let buscaEmail = usuarios.find(usuario => usuario.email === email);

    if (!buscaEmail) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Email não encontrado." }));
    }

    if (!senha) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Insira uma senha válida." }));
    }

    if (buscaEmail) {
        let senhaCorreta = await bcrypt.compare(senha, buscaEmail.senha);

        if (senhaCorreta) {
            res.status(200).send(JSON.stringify({ Mensagem: `Seja bem-vindo, ${buscaEmail.nome}! Login realizado com sucesso!` }));
        } else {
            res.status(400).send(JSON.stringify({ Mensagem: "Credenciais inválidas. Verifique os dados." }));
        }
    }
});

app.post('/mensagem/:email', (req, res) => {
    const titulo = req.body.titulo;
    const descricao = req.body.descricao;
    const email = req.params.email;

    if (!email) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Por favor, informe um email válido." }));
    }

    let buscaEmail = usuarios.find(usuario => usuario.email === email);

    if (!buscaEmail) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Email não encontrado." }));
    }

    if (!titulo) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Por favor, informe um título válido." }));
    }

    if (!descricao) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Por favor, informe uma descrição válida." }));
    }

    if (titulo && descricao) {
        let novaMensagem = {
            id: proximaMensagem,
            titulo: titulo,
            descricao: descricao
        };

        mensagens.push(novaMensagem);
        proximaMensagem++;

        res.status(201).send(JSON.stringify({ Mensagem: "Mensagem criada com sucesso!" }));
    }
});

app.get('/mensagem/:email', (req, res) => {
    const email = req.params.email;

    if (!email) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Por favor, informe um email válido." }));
    }

    let buscaEmail = usuarios.find(usuario => usuario.email === email);

    if (!buscaEmail) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Email não encontrado." }));
    }

    if (mensagens.length === 0) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Não há mensagens cadastradas. Por favor, crie uma mensagem." }));
    }

    const listaMensagens = mensagens.map(mensagem => {
        return `ID: ${mensagem.id} - Título: ${mensagem.titulo} - Descrição: ${mensagem.descricao}`;
    });

    res.status(200).send(JSON.stringify({ Mensagem: `Seja bem-vindo! As mensagens cadastradas são: ${listaMensagens}` }));
});

app.put('/mensagem/:id', (req, res) => {
    const id = Number(req.params.id);
    const titulo = req.body.titulo;
    const descricao = req.body.descricao;

    if (!id) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Por favor, informe um id válido." }));
    }

    const indiceMensagem = mensagens.findIndex(mensagem => mensagem.id === id);

    if (indiceMensagem === -1) {
        return res.status(400).send(JSON.stringify({ Mensagem: `Mensagem com o id: ${id} não encontrada.` }));
    }

    if (!titulo) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Por favor, informe um título válido." }));
    }

    if (!descricao) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Por favor, informe uma descrição válida." }));
    }

    const mensagem = mensagens[indiceMensagem];
    mensagem.titulo = titulo;
    mensagem.descricao = descricao;

    res.status(200).send(JSON.stringify({ Mensagem: `Mensagem atualizada com sucesso! Título: ${mensagem.titulo}, Descrição: ${mensagem.descricao}` }));
});

app.delete('/mensagem/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!id) {
        return res.status(400).send(JSON.stringify({ Mensagem: "Por favor, informe um id válido." }));
    }

    const indiceMensagem = mensagens.findIndex(mensagem => mensagem.id === id);

    if (indiceMensagem === -1) {
        return res.status(400).send(JSON.stringify({ Mensagem: `Mensagem com o id: ${id} não encontrada.` }));
    }

    mensagens.splice(indiceMensagem, 1);
    res.status(200).send(JSON.stringify({ Mensagem: "Mensagem deletada com sucesso!" }));
});

app.listen(PORT, () => console.log('Servidor rodando na porta 3333.'));

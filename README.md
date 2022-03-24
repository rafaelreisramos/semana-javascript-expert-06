# Spotify Radio - Semana JS Expert 6.0

Projeto desenvolvido na Semana Javascript Expert ministrada pelo mestre
[Erick Wendel](https://cursos.erickwendel.com.br/).

## O Projeto

O projeto é um Stream Deck que permite inserir efeitos sonoros em um streaming de áudio.

É composto basicamente de um player de áudio e o controlador, ou o stream deck, propriamente dito.

## Preview

<img src="./prints/demo.png" />

## Checklist Features

- Web API

  - [x] Deve atingir 100% de cobertura de código em testes
  - [x] Deve ter testes de integração validando todas as rotas da API
  - [x] Deve entregar arquivos estáticos como Node.js Stream
  - [x] Deve entregar arquivos de música como Node.js Stream
  - [x] Dado um usuário desconectado, não deve quebrar a API
  - [x] Mesmo que vários comandos sejam desparados ao mesmo tempo, não deve quebrar a API
  - [x] Caso aconteça um erro inesperado, a API deve continuar funcionando
  - [x] O projeto precisa ser executado em ambientes Linux, Mac e Windows

- Web App
  - Client
    - [x] Deve reproduzir a transmissão
    - [x] Não deve pausar se algum efeito for adicionado
  - Controller
    - [x] Deve atingir 100% de cobertura de código em testes
    - [x] Deve poder iniciar ou parar uma transmissão
    - [x] Deve enviar comandos para adicionar audio efeitos à uma transmissão

## Tarefas a fazer

- [x] implementar testes unitários para o frontend e manter 100% de code coverage
- **PLUS**:
  - [x] disponibilizar um novo efeito
    - [x] adicionar um botão novo no controlador
    - [x] adicionar um som de efeito novo para a pasta `audios/fx/`
    - [x] republicar no heroku

## Mas, e aí, como testar o projeto?

Para testar o projeto é necessário você instalar o [docker compose](https://docs.docker.com/compose/install/)
na sua máquina.

A instalação é necessária porque o ambiente do projeto usa o [SoX](http://sox.sourceforge.net/),
que precisa ser instalado na máquina para permitir a manipulação do áudio pelo controlador.

Para que não seja necessária a instalação na máquina, que acaba ficando dependende do Sistema
Operacional usado, e pode gerar diferenças no comportamento, é preferível rodar o projeto em um
container.

Para rodar o projeto siga os seguintes passos:

- clone este repositório ou o original do [Github do próprio
  Erick Wendel](https://github.com/ErickWendel/semana-javascript-expert06).

`git clone https://github.com/rafaelreisramos/semana-javascript-expert-06`

- Instale as dependências com o npm

`npm i --silent`

- Como o docker compose já instalado, execute

`npm run live-reload:docker`

Verifique se no console aparece o log do servidor rodando. Em caso positivo acesse os endereços
`localhost:3000/home` e em uma outra aba do navegador `localhost:3000/controller`.

_Importante_: Na página `home` de um play para iniciar o streaming de áudio. Este passo
é necessário porque o Chrome e/ou Firefox não vem mais com o autoplay habilitado por padrão.

Agora acione os efeitos no stream deck na página `controller` e ouça o resultado.

Como dito pelo mestre, o resultado não é prefeito e pode ser melhorado mas já nos mostra
o poder da manipulação dos streamings em tempo real.

Se você quiser fazer [deploy no Heroku](https://www.heroku.com/) siga as instruções do arquivo
`heroku-commands.md`, substituindo o meu nome nos comandos de criação do pelo seu ;-).

### Créditos aos áudios usados

#### Transmissão

- [English Conversation](https://youtu.be/ytmMipczEI8)

#### Efeitos

- [Applause](https://youtu.be/mMn_aYpzpG0)
- [Applause Audience](https://youtu.be/3IC76o_lhFw)
- [Boo](https://youtu.be/rYAQN11a2Dc)
- [Fart](https://youtu.be/4PnUfYhbDDM)
- [Laugh](https://youtu.be/TZ90IUrMNCo)
- [Cartoon Running](https://youtu.be/igSHbtv52G4)

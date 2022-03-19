# Server

- service: tudo o que é regra de negócio ou processamento
- controller: intermedia a camada de apresentação (routes) com a camada de negócio (service)
- routes: camada de apresentação
- server: responsável pela criação do servidor (não a instância)
- index: instancia o servidor e expõe para a web (lado da infraestrutura)
- config: tudo que é estático do projeto

# Client

- service: tudo o que é regra de negócio ou processamento
- controller: intermedia a camada de apresentação (view) com a camada de negócio (service)
- view: tudo o que é elemento HTML (visualização)
- server: responsável pela criação do servidor (não a instância)
- index: factory - quem inicializa tudo

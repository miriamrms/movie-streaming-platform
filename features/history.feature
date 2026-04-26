@historia1
Feature: Histórico de Conteúdos Assistidos
    As a usuário do sistema
    I want to acessar uma página que liste, em ordem cronológica inversa, todos os vídeos que assisti anteriormente, exibindo a data e a % assistida
    So that eu possa ter um registro organizado do meu consumo e encontrar facilmente conteúdos para rever ou recomendar.

Scenario: Visualizar Histórico Completo
Given que o usuário está logado
And assistiu ao filme "Matrix" no dia "20/04/2026"
And o progresso assistido do filme "Matrix" é "100%"
And assistiu ao filme "Interstellar" no dia "25/04/2026"
And o progresso assistido do filme "Interstellar" é "40%"
When o usuário acessa a página "Meu Histórico"
Then o usuário vê os títulos "Interstellar" e "Matrix" do mais recente para o mais antigo
And e deve ver a data "25/04/2026" associada ao filme "Interstellar"
And e deve ver o progresso "40%" associado ao filme "Interstellar"
And e deve ver a data "20/04/2026" associada ao filme "Matrix"
And e deve ver o progresso "100%" associado ao filme "Matrix"

Scenario: Adicionar novo filme ao histórico
Given que o usuário está logado
And já possui os filmes "Matrix" e "Interstellar" no seu histórico de filmes assistidos
And o progresso assistido do filme "Matrix" é "100%"
And o progresso assistido do filme "Interstellar" é "40%"
When o usuário assiste ao filme "Inception" no dia "26/04/2026"
And acessa a página "Meu Histórico"
Then o usuário vê os títulos "Inception", "Interstellar" e "Matrix" do mais recente para o mais antigo
And deve ver a data "26/04/2026" associada ao filme "Inception"
And deve ver o progresso "100%" associado ao filme "Inception"
And deve ver a data "25/04/2026" associada ao filme "Interstellar"
And deve ver o progresso "40%" associado ao filme "Interstellar"
And deve ver a data "20/04/2026" associada ao filme "Matrix"
And deve ver o progresso "100%" associado ao filme "Matrix"

Scenario: Remover filme do histórico
Given que o usuário está logado
And tem os filmes "Matrix" e "Interstellar" no seu histórico de filmes assitidos
When o usuário solicita a remoção do filme "Matrix" do seu histórico
Then eu devo ver uma mensagem de confirmação "Filme removido com sucesso"
And o filme "Matrix" não deve mais estar visível na página "Meu Histórico"
And o filme "Interstellar" deve permanecer listado como conteúdo assistido

Scenario: Remover filme inexistente do histórico
Given que o usuário está logado
And tem apenas o filme "Interstellar" no seu histórico de filmes assistidos
When o usuário solicita a remoção do filme "Matrix" do seu histórico
Then eu devo ver uma mensagem de erro "Filme não encontrado no histórico"

Scenario: Apagar histórico Completo
Given que o usuário está logado
And tem os filmes "Matrix" e "Interstellar" no seu histórico de filmes assistidos
When o usuário solicita a exclusão de todo o histórico
Then eu devo ver uma mensagem de confirmação "Histórico apagado com sucesso"
And nenhum filme deve estar visível na página "Meu Histórico"

Scenario: Histórico Vazio
Given que o usuário está logado
And não possui nenhum filme no histórico de filmes assistidos
When o usuário acessa a página "Meu Histórico"
Then deve ver a mensagem "Você ainda não assistiu a nenhum conteúdo"
And não deve ver nenhum título de filme listado

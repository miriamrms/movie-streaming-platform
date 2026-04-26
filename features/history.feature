@historia1
Feature: Histórico de Conteúdos Assistidos
    As a usuário do sistema
    I want to acessar uma página que liste, em ordem cronológica inversa, todos os vídeos que assisti anteriormente, exibindo a data e a % assistida
    So that eu possa ter um registro organizado do meu consumo e encontrar facilmente conteúdos para rever ou recomendar.

Scenario: Visualizar Histórico Completo
Given que o usuário está logado
And assistiu ao filme "Casablanca" no dia "20/04/2026"
And o progresso assistido do filme "Casablanca" é "100%"
And assistiu ao filme "E o Vento Levou" no dia "25/04/2026"
And o progresso assistido do filme "E o Vento Levou" é "40%"
When o usuário acessa a página "Meu Histórico"
Then o usuário vê os títulos "E o Vento Levou" e "Casablanca" do mais recente para o mais antigo
And e deve ver a data "25/04/2026" associada ao filme "E o Vento Levou"
And e deve ver o progresso "40%" associado ao filme "E o Vento Levou"
And e deve ver a data "20/04/2026" associada ao filme "Casablanca"
And e deve ver o progresso "100%" associado ao filme "Casablanca"

Scenario: Bloquear acesso ao histórico sem estar logado
Given que o usuário não está logado
When o usuário tenta acessar a página "Meu Histórico"
Then o usuário deve ser ver a mensagem "Não é possível visualizar o histórico sem estar logado"
And o usuário deve ser redirecionado para a página "Login"

Scenario: Registrar múltiplas visualizações do mesmo filme
Given que o usuário está logado
And assistiu ao filme "Casablanca" no dia "25/04/2026"
And o progresso assistido do filme "Casablanca" é "100%"
And assistiu ao filme "Casablanca" no dia "26/04/2026"
And o progresso assistido do filme "Casablanca" é "50%"
When o usuário acessa a página "Meu Histórico"
Then o usuário vê o filme "Casablanca" duas vezes no histórico
And deve ver a data "26/04/2026" e o progresso "50%" associados a um registro do filme "Casablanca"
And deve ver a data "25/04/2026" e o progresso "100%" associados a um registro do filme "Casablanca"

Scenario: Atualizar progresso ao reassistir no mesmo dia
Given que o usuário está logado
And assistiu ao filme "E o Vento Levou" no dia "26/04/2026"
And o progresso assistido do filme "E o Vento Levou" é "40%"
When o usuário assiste novamente ao filme "E o Vento Levou" no dia "26/04/2026" até "60%"
And o usuário acessa a página "Meu Histórico"
Then o usuário vê o filme "E o Vento Levou" apenas uma vez no histórico
And deve ver a data "26/04/2026" e o progresso "60%" associados ao filme "E o Vento Levou"

Scenario: Adicionar novo filme ao histórico
Given que o usuário está logado
And já possui os filmes "Casablanca" e "E o Vento Levou" no seu histórico de filmes assistidos
And o progresso assistido do filme "Casablanca" é "100%"
And o progresso assistido do filme "E o Vento Levou" é "40%"
When o usuário assiste ao filme "Cidadão Kane" no dia "26/04/2026"
And acessa a página "Meu Histórico"
Then o usuário vê os títulos "Cidadão Kane", "E o Vento Levou" e "Casablanca" do mais recente para o mais antigo
And deve ver a data "26/04/2026" associada ao filme "Cidadão Kane"
And deve ver o progresso "100%" associado ao filme "Cidadão Kane"
And deve ver a data "25/04/2026" associada ao filme "E o Vento Levou"
And deve ver o progresso "40%" associado ao filme "E o Vento Levou"
And deve ver a data "20/04/2026" associada ao filme "Casablanca"
And deve ver o progresso "100%" associado ao filme "Casablanca"

Scenario: Remover filme do histórico
Given que o usuário está logado
And tem os filmes "Casablanca" e "E o Vento Levou" no seu histórico de filmes assitidos
When o usuário solicita a remoção do filme "Casablanca" do seu histórico
Then ele deve ver uma mensagem de confirmação "Filme removido com sucesso"
And o filme "Casablanca" não deve mais estar visível na página "Meu Histórico"
And o filme "E o Vento Levou" deve permanecer listado como conteúdo assistido

Scenario: Remover filme inexistente do histórico
Given que o usuário está logado
And tem apenas o filme "E o Vento Levou" no seu histórico de filmes assistidos
When o usuário solicita a remoção do filme "Casablanca" do seu histórico
Then ele deve ver uma mensagem de erro "Filme não encontrado no histórico"

Scenario: Apagar histórico Completo
Given que o usuário está logado
And tem os filmes "Casablanca" e "E o Vento Levou" no seu histórico de filmes assistidos
When o usuário solicita a exclusão de todo o histórico
Then ele deve ver uma mensagem de confirmação "Histórico apagado com sucesso"
And nenhum filme deve estar visível na página "Meu Histórico"

Scenario: Histórico Vazio
Given que o usuário está logado
And não possui nenhum filme no histórico de filmes assistidos
When o usuário acessa a página "Meu Histórico"
Then deve ver a mensagem "Você ainda não assistiu a nenhum conteúdo"
And não deve ver nenhum título de filme listado


@historia2
Feature: Continuar Assistindo
    As a usuário do sistema
    I want to visualizar os vídeos que não terminei de assistir em uma seção de destaque com a indicação do progresso atual
    So that eu possa continuar assistindo de onde parei com facilidade.
    
Scenario: Visualizar progresso de um vídeo não finalizado
Given que o usuário está logado
And assistiu "40%" do filme "E o Vento Levou"
When o usuário acessa a seção "Assistidos Recentemente" na página inicial
Then o usuário deve ver o filme "E o Vento Levou" como o primeiro item da seção
And o card do filme deve indicar o progresso "40%"

Scenario: Retomar filmes não finalizados
Given que o usuário está logado
And o usuário possui um histórico de visualização de "40%" do filme "E o Vento Levou"
When o usuário seleciona o filme "E o Vento Levou" na seção "Assistidos Recentemente"
Then a reprodução do filme "E o Vento Levou" deve iniciar a partir de "40%"
And o progresso assistido deve continuar sendo atualizado durante a reprodução

Scenario: Atualização de Progresso
Given que o usuário está logado em dois dispositivos
And a última ocorrência do filme "E o Vento Levou" no histórico é de "40%"
When o usuário assiste ao filme "E o Vento Levou" até "60%"
And acessa a seção "Assistidos Recentemente"
Then o card do filme "E o Vento Levou" deve indicar o progresso "60%" referente ao último registro do histórico

Scenario: Esvaziar "Assistidos Recentemente" ao apagar histórico
Given que o usuário está logado
And o usuário possui um histórico de visualização de "60%" do filme "E o Vento Levou"
When o usuário solicita a exclusão de todo o histórico
And acessa a seção "Assistidos Recentemente" na página inicial
Then a seção "Assistidos Recentemente" deve estar vazia
And o filme "E o Vento Levou" não deve estar visível na seção "Assistidos Recentemente"

Scenario: Remover filme da lista
Given que o usuário está logado
And o usuário possui um histórico de visualização de "40%" do filme "E o Vento Levou"
When o usuário solicita a remoção do filme "E o Vento Levou" da seção "Assistidos Recentemente"
Then eu devo ver uma mensagem de confirmação "Filme removido da lista com sucesso"
And o filme "E o Vento Levou" não deve mais estar visível na seção "Assistidos Recentemente"

Scenario: Conteúdo Indisponível no Histórico
Given que o usuário está logado
And o usuário possui um histórico de visualização de "40%" do filme "E o Vento Levou"
And o filme "E o Vento Levou" está indisponível no catálogo
When o usuário acessa a seção "Assistidos Recentemente" na página inicial
Then deve ver uma indicação "Conteúdo indisponível" no item do filme "E o Vento Levou"
And não deve ser possível retomar a reprodução do filme "E o Vento Levou"
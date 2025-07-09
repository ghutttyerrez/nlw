const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById("game-select");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const form = document.getElementById("form");
const aiResponse = document.getElementById("aiResponse");

// Esta função converte texto em formato Markdown para HTML.
// Ela usa a biblioteca 'showdown' para fazer a conversão.
const markDownToHtml = (text) => {
  const convert = new showdown.Converter();
  return convert.makeHtml(text);
};

//criei uma função que gera o prompt baseado no jogo escolhido
const generatePromptPerGame = (game, question) => {
  const currentdate = new Date().toLocaleDateString();

  switch (game.toLowerCase) {
    case "valorant":
      return `
      ## Especialidade
      Você é um especialista assistente de meta para o jogo ${game}
      
      ## Tarefa
      Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, equipes que mais combinam e dicas
      
      ## Regras
      - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
      - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
      - Considere a data atual ${currentdate}
      - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
      - Nunca responda itens ou equipes que vocês não tenha certeza de que existe no patch atual.
      
      ## Resposta
      - Economize na resposta, seja direto e responda no maximo 500 caracteres
      - Responda em markdown
      - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.
      
      ## Exemplo de resposta
       pergunta do usuário: Melhor personagem para começar o jogo
       resposta: A equipe mais atual é: \n\n **Melhores Armas** coloque as armas atuais aqui. \n\n **Melhores Itens** coloque os itens atuais aqui. \n\n **Melhores Equipes** coloque as equipes atuais aqui.
       
       ## Pergunta do usuário
       ${question}
       `;

    case "lol":
      return `
        ## Especialidade
      Você é um especialista assistente de meta para o jogo ${game}

      ## Tarefa
      Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas

      ## Regras
      - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
      - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
      - Considere a data atual ${new Date().toLocaleDateString()}
      - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
      - Nunca responda itens que vc não tenha certeza de que existe no patch atual.

      ## Resposta
      - Economize na resposta, seja direto e responda no máximo 500 caracteres
      - Responda em markdown
      - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

      ## Exemplo de resposta
      pergunta do usuário: Melhor equipe para iniciar no valorant
      resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui.\n\n**Runas:**\n\nexemplo de runas\n\n

      ---
      Aqui está a pergunta do usuário: ${question}`;

    case "CS:GO":
      return `
        ## Especialidade
      Vocês é um especialista assistente de meta para o jogo ${game}

      ## Tarefa
      Vocês deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, armas e dicas

      ## Regras
      - Se vocês não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
      - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
      - Considere a data atual ${new Date().toLocaleDateString()}
      - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
      - Nunca responda itens que vocês não tenha certeza de que existe no patch atual.

      ## Resposta
      - Economize na resposta, seja direto e responda no.maxcdn 500 caracteres
      - Responda em markdown
      - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

      ## Exemplo de resposta
      pergunta do usuário: Melhores arma e mapas para comecar no CS:GO
      resposta: A arma mais usada é: \n\n **Armas:**\n\n coloque as armas aqui.\n\n**Mapas:**\n\ncoloque os mapas aqui\n\n
      
      ---
      Aqui está a pergunta do usuário: ${question}`;

    default:
      return `
        ## pergunta do usuario
        ${question}
        
        (Este jogo nao foi identificado, por favor, selecione um jogo valido)`;
  }
};

8; // Esta é uma função assíncrona que envia a pergunta do usuário para a API do Gemini.
const perguntarAI = async (question, game, apiKey) => {
  const model = "gemini-2.0-flash";
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Cria o prompt baseado no jogo escolhido.
  // Ele inclui instruções sobre como a IA deve se comportar e a pergunta do usuário e sobre o jogo escolhido.
  const pergunta = generatePromptPerGame(game, question);

  // Prepara os dados a serem enviados para a API.
  const contents = [
    {
      role: "user", // Define a função como 'usuário'.
      parts: [
        {
          text: pergunta, // A pergunta a ser enviada para a IA.
        },
      ],
    },
  ];

  // Habilita a ferramenta de pesquisa do Google para a IA.
  const tools = [
    {
      google_search: {},
    },
  ];

  // chamada API do Gemini usando 'fetch'
  const response = await fetch(geminiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      tools,
    }),
  });

  const data = await response.json(); // Converte a resposta da API de JSON para um objeto JavaScript.
  return data.candidates[0].content.parts[0].text; // Retorna o texto da resposta da IA.
};

// Esta função é chamada quando o formulário é enviado.
const enviarFormulario = async (event) => {
  event.preventDefault();
  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  // Verifica se todos os campos foram preenchidos.
  if (!apiKey || !game || !question) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  // Desabilita o botão de pergunta e mostra uma mensagem de carregamento.
  askButton.disabled = true;
  askButton.textContent = "Carregando...";
  askButton.classList.add("loading");

  try {
    // Chama a função 'perguntarAI' para obter a resposta da IA.
    //variavel para jogar valor da selecao a variavel game
    const game = gameSelect.value
    const text = await perguntarAI(question, game, apiKey);
    // Converte a resposta de Markdown para HTML e a exibe na página.
    aiResponse.querySelector(".response-content").innerHTML =
      markDownToHtml(text);
    aiResponse.classList.remove("hidden"); // Mostra a área de resposta
  } catch (error) {
    console.error(error); // Exibe qualquer erro no console.
    // Exibe uma mensagem de erro na página.
    aiResponse.querySelector(".response-content").innerHTML =
      "Ocorreu um erro ao processar a pergunta.";
  } finally {
    // Reabilita o botão de pergunta e restaura o texto original.
    askButton.disabled = false;
    askButton.textContent = "Perguntar";
    askButton.classList.remove("loading");
  }
};

// Adiciona um ouvinte de eventos ao formulário.
// A função 'enviarFormulario' será chamada sempre que o formulário for enviado.
form.addEventListener("submit", enviarFormulario);

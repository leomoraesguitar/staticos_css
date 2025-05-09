
document.addEventListener("DOMContentLoaded", async () => {
    // Declaração da variável today
    const today = new Date();

    // Formata a data para o formato pt-BR
    const formattedDate = today.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    // Atualiza o conteúdo do elemento com ID 'currentDate'
    document.getElementById('currentDate').textContent = formattedDate;

    // Obtenção de dados do Local Storage ou servidor
    let listasData = localStorage.getItem("listas");

    if (!listasData) {
        console.log("Dados não encontrados no Local Storage. Requisitando do servidor...");
        // try {
        //     const resposta = await fetch(urlEndpoint);
        //     // console.log("Resposta do servidor:", resposta);
        //     if (!resposta.ok) {
        //         throw new Error(`Erro ao requisitar os dados: ${resposta.statusText}`);
        //     }
        //     listasData = await resposta.json();
        //     // console.log("JSON recebido do servidor:", listasData);
        //     localStorage.setItem("listas", JSON.stringify(listasData));
        // } catch (error) {
        //     console.error("Erro ao requisitar os dados:", error);
        //     return;
        // }
        requisitarDados();
    } else {
        console.log("Carregando dados do Local Storage...");
        listasData = JSON.parse(listasData);
    }

    // Restante do código
    let grupos = Object.keys(listasData);

    let listas = listasData;

    // console.log("Grupos carregados:", grupos);
    let grupoSelect = document.getElementById("grupoSelect");
    let grupoIndex = 0;
    let exercicioIndex = 0;

    let repeticoesConcluidasEl = document.getElementById("repeticoes-concluidas");
    let barraProgressoEl = document.getElementById("barra-progresso");
    let totalRepeticoesEl = document.getElementById("total-repeticoes");

    let progressoPorGrupo = {};
    let repeticoesMarcadasPorGrupo = {};

    let dia_comentario = document.getElementById("dia_comentario");
    let exercicio_comentario = document.getElementById("exercicio_comentario");
    let comentario = document.getElementById("comentario");

    let btnenviarComentario = document.getElementById("btnenviarComentario");

    let pesoInicialInput = document.getElementById("pesoInicial");
    let pesoFinalInput = document.getElementById("pesoFinal");


    async function requisitarDados() {
        try {
              const resposta = await fetch(urlEndpoint);
              // console.log("Resposta do servidor:", resposta);
              if (!resposta.ok) {
                  throw new Error(`Erro ao requisitar os dados: ${resposta.statusText}`);
              }
              listasData = await resposta.json();
              console.log("JSON recebido do servidor:", listasData);
              localStorage.setItem("listas", JSON.stringify(listasData));
              alert("✅ Dados atualizados!");
              window.location.assign(window.location.href);

          } catch (error) {
              console.error("Erro ao requisitar os dados:", error);
              return;
          }
    }

    async function atualizar_do_bd() {
      requisitarDados();
      grupos = Object.keys(listasData);
      atualizarItens();

    }

    function preencherSelect() {
        grupoSelect.innerHTML = "";
        grupos.forEach((grupo,i) => {
            let option = document.createElement("option");
            option.value = i;
            option.textContent = grupo;
            grupoSelect.appendChild(option);
        });

        if (grupos.length === 0) {
            console.error("Erro: Nenhum grupo encontrado.");
        } else {
            console.log("Grupos carregados:");
        }
    }

    function salvarProgresso() {
        localStorage.setItem("progressoPorGrupo", JSON.stringify(progressoPorGrupo));
        localStorage.setItem("repeticoesMarcadasPorGrupo", JSON.stringify(repeticoesMarcadasPorGrupo));
    }

    function carregarProgresso() {
        let progressoSalvo = localStorage.getItem("progressoPorGrupo");
        let repeticoesSalvas = localStorage.getItem("repeticoesMarcadasPorGrupo");

        if (progressoSalvo) {
            progressoPorGrupo = JSON.parse(progressoSalvo);
        } else {
            progressoPorGrupo = {};
            grupos.forEach(grupo => {
                progressoPorGrupo[grupo] = 0;
            });
        }

        if (repeticoesSalvas) {
            repeticoesMarcadasPorGrupo = JSON.parse(repeticoesSalvas);
        } else {
            repeticoesMarcadasPorGrupo = {};
        }
    }

    function calcularTotalRepeticoes() {
        let grupoAtual = grupos[grupoIndex];
        let totalRepeticoes = listas[grupoAtual].reduce((total, exercicio) => total + exercicio.slice(3).length, 0);
        totalRepeticoesEl.textContent = totalRepeticoes;
    }

    function enviouComentario() {
        // Obter o elemento do comentário do DOM

        if (!comentario) {
            console.error("Elemento de comentário não encontrado.");
            return;
        }
    
        // Supondo que exercicioAtual seja um array global ou definido em outro lugar
        if (!exercicioAtual || !Array.isArray(exercicioAtual)) {
            console.error("exercicioAtual não é um array válido.");
            return;
        }
    
        // Atualizar o último elemento de exercicioAtual com o valor do comentário

        listas[grupoAtual][exercicioIndex][exercicioAtual.length - 1] = comentario.value;
        // Atualiza o localStorage
        localStorage.setItem("listas", JSON.stringify(listas));
        // Exibir os logs
        console.log("Comentário enviado:", comentario.value);
        console.log("Comentário no bd:", exercicioAtual[exercicioAtual.length - 1]);
    }

    async function enviarComentario(grupo, exercicio) {
      // console.log('comentario', comentario.value)
        const formulario = document.getElementById('formComentario');

        if (!updateComentario) {
            console.error("updateComentario não está definido. Verifique o <script> no HTML.");
            return { status: 'error', message: 'Endpoint não configurado' };
        }
        // Cria um FormData com os dados
        const formData = new FormData(formulario);
        // formData.append('grupo', grupo);
        // formData.append('exercicio', exercicio);
        formData.append('dia_comentario', grupo);
        formData.append('exercicio_comentario', exercicio);

        
        

        try {
            const resposta = await fetch(updateComentario, {
                method: 'POST',
                body: formData
            });

            if (!resposta.ok) {
                throw new Error(`Erro na requisição: ${resposta.statusText}`);
            }

            const resultado = await resposta.json();
            console.log("Dados enviados com sucesso:");
            return resultado;
        } catch (erro) {
            console.error("Erro ao enviar dados para o Django:", erro);
            return { status: 'error', message: erro.message };
        }
    }

    // Função para enviar o formulário ao Django
    async function enviarFormulario(grupo, exercicio, pesoInicial, pesoFinal) {
        const formulario = document.querySelector('form[method="POST"]');
        if (!updateEndpoint) {
            console.error("updateEndpoint não está definido. Verifique o <script> no HTML.");
            return { status: 'error', message: 'Endpoint não configurado' };
        }
        // Cria um FormData com os dados
        const formData = new FormData(formulario);
        formData.append('grupo', grupo);
        formData.append('exercicio', exercicio);
        formData.append('pesoInicial', pesoInicial);
        formData.append('pesoFinal', pesoFinal);


        try {
            const resposta = await fetch(updateEndpoint, {
                method: 'POST',
                body: formData
            });

            if (!resposta.ok) {
                throw new Error(`Erro na requisição: ${resposta.statusText}`);
            }

            const resultado = await resposta.json();
            console.log("Dados enviados com sucesso:");
            return resultado;
        } catch (erro) {
            console.error("Erro ao enviar dados para o Django:", erro);
            return { status: 'error', message: erro.message };
        }
    }

    function atualizarItens() {
        // console.log('grupoIndex', grupoIndex )
        // console.log('exercicioIndex', exercicioIndex )
        // console.log('grupos', grupos )
        let grupoAtual = grupos[grupoIndex];
        let exercicioAtual = listas[grupoAtual][exercicioIndex];

        //set os valores das variaves que serão enviadas para savalr os comentarios
        // console.log('grupoAtual', grupoAtual)
        // console.log('exercicioAtual', exercicioAtual)
        if (grupoAtual != null && exercicioAtual != null) {
            dia_comentario.value = grupoAtual
            exercicio_comentario.value = exercicioAtual[0];
        }

        // Adiciona event listeners para pesoInicial e pesoFinal

        
        document.getElementById("exercicio").textContent = exercicioAtual[0];
        // console.log('exercicioAtual_último', exercicioAtual[-1])
        comentario.textContent = exercicioAtual[exercicioAtual.length - 1];
        comentario.value = exercicioAtual[exercicioAtual.length - 1];
        pesoInicialInput.value = exercicioAtual[1];
        pesoInicialInput.textContent = exercicioAtual[1];
        pesoFinalInput.value = exercicioAtual[2];
        pesoFinalInput.textContent = exercicioAtual[2];
        // console.log(exercicioAtual[1], exercicioAtual[2])
        calcularTotalRepeticoes();

        let repeticoesContainer = document.getElementById("repeticoes");
        repeticoesContainer.innerHTML = "";

        exercicioAtual.slice(3, -1).forEach(rep => {
            let button = document.createElement("button");
            button.className = "btn btn-outline-light border-2 fw-bold btn-lg mx-1 repeticao-btn";
            button.textContent = rep;
            button.onclick = () => toggleRepeticao(button, grupoAtual, exercicioAtual[0]);
            repeticoesContainer.appendChild(button);
        });


        restaurarRepeticoesMarcadas(grupoAtual, exercicioAtual[0]);
        atualizarBarraProgresso();



    }

    function atualizarBarraProgresso() {
        let grupoAtual = grupos[grupoIndex];
        let progresso = (progressoPorGrupo[grupoAtual] / parseInt(totalRepeticoesEl.textContent)) * 100;
        barraProgressoEl.style.width = `${progresso}%`;
        barraProgressoEl.setAttribute("aria-valuenow", progressoPorGrupo[grupoAtual]);
        repeticoesConcluidasEl.textContent = progressoPorGrupo[grupoAtual];
    }

    function toggleRepeticao(button, grupoAtual, exercicioAtual) {
        button.classList.toggle("btn-primary");

        if (!repeticoesMarcadasPorGrupo[grupoAtual]) {
            repeticoesMarcadasPorGrupo[grupoAtual] = {};
        }

        if (!repeticoesMarcadasPorGrupo[grupoAtual][exercicioAtual]) {
            repeticoesMarcadasPorGrupo[grupoAtual][exercicioAtual] = [];
        }

        if (button.classList.contains("btn-primary")) {
            progressoPorGrupo[grupoAtual]++;
            repeticoesMarcadasPorGrupo[grupoAtual][exercicioAtual].push(button.textContent);
        } else {
            progressoPorGrupo[grupoAtual]--;
            repeticoesMarcadasPorGrupo[grupoAtual][exercicioAtual] = repeticoesMarcadasPorGrupo[grupoAtual][exercicioAtual].filter(rep => rep !== button.textContent);
        }

        salvarProgresso();
        atualizarBarraProgresso();
    }

    function restaurarRepeticoesMarcadas(grupoAtual, exercicioAtual) {
        let repeticoesSalvas = repeticoesMarcadasPorGrupo[grupoAtual]?.[exercicioAtual] || [];

        document.querySelectorAll(".repeticao-btn").forEach(button => {
            if (repeticoesSalvas.includes(button.textContent)) {
                button.classList.add("btn-primary");
            }
        });
    }
    // Define o grupo com base no dia da semana
    function definirGrupoPorDia() {
        // Mapeia nomes de dias do toLocaleDateString para o formato do modelo Treino2

        const dayMap = {
            'segunda-feira': 0,
            'terça-feira': 1,
            'quarta-feira': 2,
            'quinta-feira': 3,
            'sexta-feira': 4,
            'sábado': 5,
            'domingo': 6,
        };

        // Obtém o nome do dia da semana no formato do modelo Treino2
        const currentDayOfWeek = dayMap[today.toLocaleDateString('pt-BR', { weekday: 'long' })] || 'segunda';
        console.log(`Dia da semana atual: ${currentDayOfWeek}`);
        // Define o valor do grupoSelect
        grupoSelect.value = currentDayOfWeek;
        grupoIndex = currentDayOfWeek;

        // console.log(`Grupo selecionado para o dia ${diaSemana}: ${grupos[grupoIndex]}`);

    }




    carregarProgresso(); // 🚀 Restaurando progresso salvo
    preencherSelect(); // 🚀 Agora os grupos aparecem no select
    definirGrupoPorDia(); // Define o grupo com base no dia
    atualizarItens(); // Inicializando corretamente


// =====================Listeners================================

    document.getElementById("next").addEventListener("click", () => {
        if (exercicioIndex < listas[grupos[grupoIndex]].length - 1) {
            exercicioIndex++;
        }
        atualizarItens();
    });

    document.getElementById("prev").addEventListener("click", () => {
        if (exercicioIndex > 0) {
            exercicioIndex--;
        }
        atualizarItens();
    });

    grupoSelect.addEventListener("change", (event) => {
        grupoIndex = parseInt(event.target.value);

        // console.log('grupoIndex',grupoIndex)
        exercicioIndex = 0;
        atualizarItens();
    });

    document.getElementById("limparProgresso").addEventListener("click", () => {
        // Removendo dados do localStorage
        localStorage.removeItem("progressoPorGrupo");
        localStorage.removeItem("repeticoesMarcadasPorGrupo");

        // Resetando variáveis na memória
        progressoPorGrupo = {};
        repeticoesMarcadasPorGrupo = {};
        grupos.forEach(grupo => {
            progressoPorGrupo[grupo] = 0;
            repeticoesMarcadasPorGrupo[grupo] = {};
        });

        // Resetando barra de progresso
        barraProgressoEl.style.width = "0%";
        barraProgressoEl.setAttribute("aria-valuenow", 0);
        repeticoesConcluidasEl.textContent = 0;

        // Resetando todas as repetições marcadas
        document.querySelectorAll(".repeticao-btn").forEach(button => {
            button.classList.remove("btn-primary");
        });

        // Atualizando a interface para refletir os valores zerados
        atualizarItens(); 
        salvarProgresso(); // Salva os valores zerados para evitar carregamento incorreto

        alert("✅ Progresso e repetições apagadas com sucesso!");
    });

    document.getElementById("atualizar_bd").addEventListener("click", () => {
      requisitarDados();
      grupos = Object.keys(listasData);
      atualizarItens();
    });

    pesoInicialInput.addEventListener("change", (event) => {
        const novoPesoInicial = parseInt(event.target.value);
        let grupoAtual = grupos[grupoIndex];
        let exercicioAtual = listas[grupoAtual][exercicioIndex];
        if (isNaN(novoPesoInicial) || novoPesoInicial < 0) {
            alert("Por favor, insira um peso inicial válido (número inteiro positivo).");
            event.target.value = exercicioAtual[1]; // Restaura o valor anterior
            return;
        }
        // Atualiza o valor no listas
        listas[grupoAtual][exercicioIndex][1] = novoPesoInicial;
        // Atualiza o localStorage
        localStorage.setItem("listas", JSON.stringify(listas));
        // Envia o formulário para o Django

        enviarFormulario(
            grupoAtual,
            exercicioAtual[0],
            novoPesoInicial,
            parseInt(pesoFinalInput.value) || 0,
        )
        // .then(resultado => {
        //     if (resultado && resultado.status === 'success') {
        //         alert("Peso inicial atualizado com sucesso!");
        //     } else {
        //         alert("Erro ao atualizar o peso inicial. Tente novamente.");
        //     }
        // });
        

    });

    pesoFinalInput.addEventListener("change", (event) => {
        const novoPesoFinal = parseInt(event.target.value);
        let grupoAtual = grupos[grupoIndex];
        let exercicioAtual = listas[grupoAtual][exercicioIndex];
        if (isNaN(novoPesoFinal) || novoPesoFinal < 0) {
            alert("Por favor, insira um peso final válido (número inteiro positivo).");
            event.target.value = exercicioAtual[2]; // Restaura o valor anterior
            return;
        }
        // Atualiza o valor no listas
        listas[grupoAtual][exercicioIndex][2] = novoPesoFinal;
        // Atualiza o localStorage
        localStorage.setItem("listas", JSON.stringify(listas));
        // Envia o formulário para o Django

        enviarFormulario(
            grupoAtual,
            exercicioAtual[0],
            parseInt(pesoInicialInput.value) || 0,
            novoPesoFinal,

        )
        // .then(resultado => {
        //     if (resultado && resultado.status === 'success') {
        //         alert("Peso final atualizado com sucesso!");
        //     } else {
        //         alert("Erro ao atualizar o peso final. Tente novamente.");
        //     }
        // });
    });

    btnenviarComentario.addEventListener("click", (event) => {
      // console.log('comentario', comentario.value)
      // console.log('comentario_orig', listas[grupoAtual][exercicioIndex][exercicioAtual.length - 1])
      // console.log(listas[grupoAtual][exercicioIndex]);
      let grupoAtual = grupos[grupoIndex];
      let exercicioAtual = listas[grupoAtual][exercicioIndex];
      if (
            listas[grupoAtual] && 
            Array.isArray(listas[grupoAtual][exercicioIndex]) && 
            listas[grupoAtual][exercicioIndex].length > 0
        ) {
            let ultimoElemento = listas[grupoAtual][exercicioIndex][listas[grupoAtual][exercicioIndex].length - 1];
            if (typeof ultimoElemento === 'string') {
                // console.log("O último elemento é uma string:", ultimoElemento);
                listas[grupoAtual][exercicioIndex][listas[grupoAtual][exercicioIndex].length - 1] = comentario.value

            } else {
                // console.log("O último elemento NÃO é uma string:", ultimoElemento);
                listas[grupo][exercicioIndex].push(comentario.value);
            }
        } else {
            console.error("Array inválido ou vazio");
        }
      // listas[grupo][exercicioIndex].push(comentario.value);
      // Atualiza o localStorage
      localStorage.setItem("listas", JSON.stringify(listas));
      // console.log( grupoAtual,exercicioAtual[0], 'ovo')
      enviarComentario(
          grupoAtual,
          exercicioAtual[0],
      );

      // console.log(listas[grupoAtual][exercicioIndex]);

  });        

  
  


});

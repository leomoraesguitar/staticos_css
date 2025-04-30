

async function requisitarDados() {
    const chaveLocalStorage = "listas";
    // const urlEndpoint = "{% url 'obterdados' %}"; // Certifique-se de usar a URL correta

    // Verifica se os dados já estão no Local Storage
    const dadosExistentes = localStorage.getItem(chaveLocalStorage);

    if (dadosExistentes) {
        console.log("Os dados já estão no Local Storage:", JSON.parse(dadosExistentes));
        return JSON.parse(dadosExistentes); // Retorna os dados armazenados
    } else {
        console.log("Dados não encontrados no Local Storage. Requisitando...");

        try {
            // Faz a requisição ao endpoint de dados
            const resposta = await fetch(urlEndpoint);
            console.log("Resposta do servidor:", resposta);

            if (!resposta.ok) {
                throw new Error(`Erro na requisição: ${resposta.statusText}`);
            }

            const dados = await resposta.json(); // Obtém os dados como JSON
            // console.log("Dados recebidos:", dados);

            // Armazena os dados no Local Storage
            localStorage.setItem(chaveLocalStorage, JSON.stringify(dados));
            console.log("Dados armazenados no Local Storage com sucesso!");

            return dados; // Retorna os dados requisitados
        } catch (erro) {
            console.error("Erro ao requisitar os dados:", erro);
            return null;
        }
    }
}


document.addEventListener("DOMContentLoaded", () => {
  requisitarDados();
});



// document.addEventListener("DOMContentLoaded", async () => {
//     // Obtenção de dados do Local Storage ou servidor
//     let listasData = localStorage.getItem("listas");

//     if (!listasData) {
//         console.log("Dados não encontrados no Local Storage. Requisitando do servidor...");
//         try {
//             const resposta = await fetch(urlEndpoint);
//             // console.log("Resposta do servidor:", resposta);
//             if (!resposta.ok) {
//                 throw new Error(`Erro ao requisitar os dados: ${resposta.statusText}`);
//             }
//             listasData = await resposta.json();
//             // console.log("JSON recebido do servidor:", listasData);
//             localStorage.setItem("listas", JSON.stringify(listasData));
//         } catch (error) {
//             console.error("Erro ao requisitar os dados:", error);
//             return;
//         }
//     } else {
//         console.log("Carregando dados do Local Storage...");
//         listasData = JSON.parse(listasData);
//     }

//     // Restante do código
//     let grupos = Object.keys(listasData);
//     let listas = listasData;

//     // console.log("Grupos carregados:", grupos);
//     let grupoSelect = document.getElementById("grupoSelect");
//     let grupoIndex = 0;
//     let exercicioIndex = 0;

//     let repeticoesConcluidasEl = document.getElementById("repeticoes-concluidas");
//     let barraProgressoEl = document.getElementById("barra-progresso");
//     let totalRepeticoesEl = document.getElementById("total-repeticoes");

//     let progressoPorGrupo = {};
//     let repeticoesMarcadasPorGrupo = {};

//     function preencherSelect() {
//         grupoSelect.innerHTML = "";
//         grupos.forEach((grupo, i) => {
//             let option = document.createElement("option");
//             option.value = i;
//             option.textContent = grupo;
//             grupoSelect.appendChild(option);
//         });

//         if (grupos.length === 0) {
//             console.error("Erro: Nenhum grupo encontrado.");
//         } else {
//             console.log("Grupos carregados:", grupos);
//         }
//     }

//     function salvarProgresso() {
//         localStorage.setItem("progressoPorGrupo", JSON.stringify(progressoPorGrupo));
//         localStorage.setItem("repeticoesMarcadasPorGrupo", JSON.stringify(repeticoesMarcadasPorGrupo));
//     }

//     function carregarProgresso() {
//         let progressoSalvo = localStorage.getItem("progressoPorGrupo");
//         let repeticoesSalvas = localStorage.getItem("repeticoesMarcadasPorGrupo");

//         if (progressoSalvo) {
//             progressoPorGrupo = JSON.parse(progressoSalvo);
//         } else {
//             progressoPorGrupo = {};
//             grupos.forEach(grupo => {
//                 progressoPorGrupo[grupo] = 0;
//             });
//         }

//         if (repeticoesSalvas) {
//             repeticoesMarcadasPorGrupo = JSON.parse(repeticoesSalvas);
//         } else {
//             repeticoesMarcadasPorGrupo = {};
//         }
//     }

//     function calcularTotalRepeticoes() {
//         let grupoAtual = grupos[grupoIndex];
//         let totalRepeticoes = listas[grupoAtual].reduce((total, exercicio) => total + exercicio.slice(3).length, 0);
//         totalRepeticoesEl.textContent = totalRepeticoes;
//     }

//     function atualizarItens() {
//         let grupoAtual = grupos[grupoIndex];
//         let exercicioAtual = listas[grupoAtual][exercicioIndex];

//         document.getElementById("exercicio").textContent = exercicioAtual[0];
//         document.getElementById("pesoInicial").value = exercicioAtual[1];
//         document.getElementById("pesoFinal").value = exercicioAtual[2];

//         calcularTotalRepeticoes();

//         let repeticoesContainer = document.getElementById("repeticoes");
//         repeticoesContainer.innerHTML = "";

//         exercicioAtual.slice(3).forEach(rep => {
//             let button = document.createElement("button");
//             button.className = "btn btn-outline-light border-2 fw-bold btn-lg mx-1 repeticao-btn";
//             button.textContent = rep;
//             button.onclick = () => toggleRepeticao(button, grupoAtual, exercicioAtual[0]);
//             repeticoesContainer.appendChild(button);
//         });

//         restaurarRepeticoesMarcadas(grupoAtual, exercicioAtual[0]);
//         atualizarBarraProgresso();
//     }

//     function atualizarBarraProgresso() {
//         let grupoAtual = grupos[grupoIndex];
//         let progresso = (progressoPorGrupo[grupoAtual] / parseInt(totalRepeticoesEl.textContent)) * 100;
//         barraProgressoEl.style.width = `${progresso}%`;
//         barraProgressoEl.setAttribute("aria-valuenow", progressoPorGrupo[grupoAtual]);
//         repeticoesConcluidasEl.textContent = progressoPorGrupo[grupoAtual];
//     }

//     function toggleRepeticao(button, grupoAtual, exercicioAtual) {
//         button.classList.toggle("btn-primary");

//         if (!repeticoesMarcadasPorGrupo[grupoAtual]) {
//             repeticoesMarcadasPorGrupo[grupoAtual] = {};
//         }

//         if (!repeticoesMarcadasPorGrupo[grupoAtual][exercicioAtual]) {
//             repeticoesMarcadasPorGrupo[grupoAtual][exercicioAtual] = [];
//         }

//         if (button.classList.contains("btn-primary")) {
//             progressoPorGrupo[grupoAtual]++;
//             repeticoesMarcadasPorGrupo[grupoAtual][exercicioAtual].push(button.textContent);
//         } else {
//             progressoPorGrupo[grupoAtual]--;
//             repeticoesMarcadasPorGrupo[grupoAtual][exercicioAtual] = repeticoesMarcadasPorGrupo[grupoAtual][exercicioAtual].filter(rep => rep !== button.textContent);
//         }

//         salvarProgresso();
//         atualizarBarraProgresso();
//     }

//     function restaurarRepeticoesMarcadas(grupoAtual, exercicioAtual) {
//         let repeticoesSalvas = repeticoesMarcadasPorGrupo[grupoAtual]?.[exercicioAtual] || [];

//         document.querySelectorAll(".repeticao-btn").forEach(button => {
//             if (repeticoesSalvas.includes(button.textContent)) {
//                 button.classList.add("btn-primary");
//             }
//         });
//     }

//     document.getElementById("next").addEventListener("click", () => {
//         if (exercicioIndex < listas[grupos[grupoIndex]].length - 1) {
//             exercicioIndex++;
//         }
//         atualizarItens();
//     });

//     document.getElementById("prev").addEventListener("click", () => {
//         if (exercicioIndex > 0) {
//             exercicioIndex--;
//         }
//         atualizarItens();
//     });

//     grupoSelect.addEventListener("change", (event) => {
//         grupoIndex = parseInt(event.target.value);
//         exercicioIndex = 0;
//         atualizarItens();
//     });

//     carregarProgresso(); // 🚀 Restaurando progresso salvo
//     preencherSelect(); // 🚀 Agora os grupos aparecem no select
//     atualizarItens(); // Inicializando corretamente


//     document.getElementById("limparProgresso").addEventListener("click", () => {
//         // Removendo dados do localStorage
//         localStorage.removeItem("progressoPorGrupo");
//         localStorage.removeItem("repeticoesMarcadasPorGrupo");

//         // Resetando variáveis na memória
//         progressoPorGrupo = {};
//         repeticoesMarcadasPorGrupo = {};
//         grupos.forEach(grupo => {
//             progressoPorGrupo[grupo] = 0;
//             repeticoesMarcadasPorGrupo[grupo] = {};
//         });

//         // Resetando barra de progresso
//         barraProgressoEl.style.width = "0%";
//         barraProgressoEl.setAttribute("aria-valuenow", 0);
//         repeticoesConcluidasEl.textContent = 0;

//         // Resetando todas as repetições marcadas
//         document.querySelectorAll(".repeticao-btn").forEach(button => {
//             button.classList.remove("btn-primary");
//         });

//         // Atualizando a interface para refletir os valores zerados
//         atualizarItens(); 
//         salvarProgresso(); // Salva os valores zerados para evitar carregamento incorreto

//         alert("✅ Progresso e repetições apagadas com sucesso!");
//     });



// });



  // Obtém a data atual          const today = new Date();


document.addEventListener("DOMContentLoaded", async () => {
    // Obtenção de dados do Local Storage ou servidor
    let listasData = localStorage.getItem("listas");

    if (!listasData) {
        console.log("Dados não encontrados no Local Storage. Requisitando do servidor...");
        try {
            const resposta = await fetch(urlEndpoint);
            if (!resposta.ok) {
                throw new Error(`Erro ao requisitar os dados: ${resposta.statusText}`);
            }
            listasData = await resposta.json();
            localStorage.setItem("listas", JSON.stringify(listasData));
        } catch (error) {
            console.error("Erro ao requisitar os dados:", error);
            return;
        }
    } else {
        console.log("Carregando dados do Local Storage...");
        listasData = JSON.parse(listasData);
    }

    // Restante do código
    let grupos = Object.keys(listasData);
    let listas = listasData;

    let grupoSelect = document.getElementById("grupoSelect");
    let grupoIndex = 0;
    let exercicioIndex = 0;

    let repeticoesConcluidasEl = document.getElementById("repeticoes-concluidas");
    let barraProgressoEl = document.getElementById("barra-progresso");
    let totalRepeticoesEl = document.getElementById("total-repeticoes");

    let progressoPorGrupo = {};
    let repeticoesMarcadasPorGrupo = {};

    // Função para obter o token CSRF de um cookie
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Função para enviar dados ao Django
    async function enviarDadosParaDjango(grupo, exercicio, pesoInicial, pesoFinal, repeticoes) {
        const updateEndpoint = "{% url 'atualizar_pesos' %}"; // Substitua pela URL correta do Django
        const csrfToken = getCookie('csrftoken'); // Obtém o token CSRF

        const dados = {
            grupo: grupo,
            exercicio: exercicio,
            pesoInicial: pesoInicial,
            pesoFinal: pesoFinal,
            repeticoes: repeticoes
        };

        try {
            const resposta = await fetch(updateEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken // Inclui o token CSRF
                },
                body: JSON.stringify(dados)
            });

            if (!resposta.ok) {
                throw new Error(`Erro na requisição: ${resposta.statusText}`);
            }

            const resultado = await resposta.json();
            console.log("Dados enviados com sucesso:", resultado);
            return resultado;
        } catch (erro) {
            console.error("Erro ao enviar dados para o Django:", erro);
        }
    }

    function atualizarItens() {
        let grupoAtual = grupos[grupoIndex];
        let exercicioAtual = listas[grupoAtual][exercicioIndex];

        document.getElementById("exercicio").textContent = exercicioAtual[0];
        document.getElementById("pesoInicial").value = exercicioAtual[1];
        document.getElementById("pesoFinal").value = exercicioAtual[2];

        calcularTotalRepeticoes();

        let repeticoesContainer = document.getElementById("repeticoes");
        repeticoesContainer.innerHTML = "";

        exercicioAtual.slice(3).forEach(rep => {
            let button = document.createElement("button");
            button.className = "btn btn-outline-light border-2 fw-bold btn-lg mx-1 repeticao-btn";
            button.textContent = rep;
            button.onclick = () => toggleRepeticao(button, grupoAtual, exercicioAtual[0]);
            repeticoesContainer.appendChild(button);
        });

        restaurarRepeticoesMarcadas(grupoAtual, exercicioAtual[0]);
        atualizarBarraProgresso();

        // Adiciona event listeners para pesoInicial e pesoFinal
        const pesoInicialInput = document.getElementById("pesoInicial");
        const pesoFinalInput = document.getElementById("pesoFinal");

        pesoInicialInput.addEventListener("change", (event) => {
            const novoPesoInicial = parseFloat(event.target.value) || 0;
            // Atualiza o valor no listas
            listas[grupoAtual][exercicioIndex][1] = novoPesoInicial;
            // Atualiza o localStorage
            localStorage.setItem("listas", JSON.stringify(listas));
            // Envia a requisição para o Django
            const repeticoesMarcadas = repeticoesMarcadasPorGrupo[grupoAtual]?.[exercicioAtual[0]] || [];
            enviarDadosParaDjango(
                grupoAtual,
                exercicioAtual[0],
                novoPesoInicial,
                parseFloat(pesoFinalInput.value) || 0,
                repeticoesMarcadas
            );
        });

        pesoFinalInput.addEventListener("change", (event) => {
            const novoPesoFinal = parseFloat(event.target.value) || 0;
            // Atualiza o valor no listas
            listas[grupoAtual][exercicioIndex][2] = novoPesoFinal;
            // Atualiza o localStorage
            localStorage.setItem("listas", JSON.stringify(listas));
            // Envia a requisição para o Django
            const repeticoesMarcadas = repeticoesMarcadasPorGrupo[grupoAtual]?.[exercicioAtual[0]] || [];
            enviarDadosParaDjango(
                grupoAtual,
                exercicioAtual[0],
                parseFloat(pesoInicialInput.value) || 0,
                novoPesoFinal,
                repeticoesMarcadas
            );
        });
    }

    // Restante das funções (inalteradas)
    function preencherSelect() {
        grupoSelect.innerHTML = "";
        grupos.forEach((grupo, i) => {
            let option = document.createElement("option");
            option.value = i;
            option.textContent = grupo;
            grupoSelect.appendChild(option);
        });

        if (grupos.length === 0) {
            console.error("Erro: Nenhum grupo encontrado.");
        } else {
            console.log("Grupos carregados:", grupos);
        }
    }

    function salvarProgresso() {
        localStorage.setItem("progressoPorGrupo", JSON.stringify(progressoPorGrupo));
        localStorage.setItem("repeticoesMarcadasPorGrupo", JSON.stringify(repeticoesMarcadasPorGrupo));
    }

    function carregarProgresso() {
        let progressoSalvo = localStorage.get Dados("progressoPorGrupo");
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
        exercicioIndex = 0;
        atualizarItens();
    });

    carregarProgresso();
    preencherSelect();
    atualizarItens();

    document.getElementById("limparProgresso").addEventListener("click", () => {
        localStorage.removeItem("progressoPorGrupo");
        localStorage.removeItem("repeticoesMarcadasPorGrupo");

        progressoPorGrupo = {};
        repeticoesMarcadasPorGrupo = {};
        grupos.forEach(grupo => {
            progressoPorGrupo[grupo] = 0;
            repeticoesMarcadasPorGrupo[grupo] = {};
        });

        barraProgressoEl.style.width = "0%";
        barraProgressoEl.setAttribute("aria-valuenow", 0);
        repeticoesConcluidasEl.textContent = 0;

        document.querySelectorAll(".repeticao-btn").forEach(button => {
            button.classList.remove("btn-primary");
        });

        atualizarItens();
        salvarProgresso();

        alert("✅ Progresso e repetições apagadas com sucesso!");
    });
});



document.addEventListener("DOMContentLoaded", () => {
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
});

  // function salvarUrlNoInput() {
  //     // Recupera a URL armazenada no sessionStorage ou define 1 como padrão
  //     const url = sessionStorage.getItem('url') || '1';

  //     // Define o valor do input como a URL recuperada ou como 1
  //     const input = document.getElementById('url_input');
  //     input.value = url;
  //   }
  
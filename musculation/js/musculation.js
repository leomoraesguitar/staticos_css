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

    console.log("✅ Progresso e repetições apagadas com sucesso!");
});



document.addEventListener("DOMContentLoaded", () => {
    let listasData = document.getElementById("listas-data");

    if (!listasData) {
        console.error("Erro: JSON não encontrado.");
        return;
    }

    let listas = JSON.parse(listasData.textContent);
    let grupos = Object.keys(listas);
    let grupoSelect = document.getElementById("grupoSelect");
    let grupoIndex = 0;
    let exercicioIndex = 0;

    let repeticoesConcluidasEl = document.getElementById("repeticoes-concluidas");
    let barraProgressoEl = document.getElementById("barra-progresso");
    let totalRepeticoesEl = document.getElementById("total-repeticoes");

    let progressoPorGrupo = {};
    let repeticoesMarcadasPorGrupo = {};

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

    carregarProgresso(); // 🚀 Restaurando progresso salvo
    preencherSelect(); // 🚀 Agora os grupos aparecem no select
    atualizarItens(); // Inicializando corretamente
});

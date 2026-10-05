const usuarioLogado = localStorage.getItem("usuarioLogado");

if (!usuarioLogado) {
    window.location.href = "index.html";
}

document.getElementById("nomeUsuario").textContent =
    "Olá, " + usuarioLogado + " 👋";

const chaveDados = "lancamentos_" + usuarioLogado;

let lancamentos =
    JSON.parse(localStorage.getItem(chaveDados)) || [];

const financeForm = document.getElementById("financeForm");
const tipoCompra = document.getElementById("tipoCompra");
const parcelamentoArea = document.getElementById("parcelamentoArea");
const parcelasInput = document.getElementById("parcelas");
const valorInput = document.getElementById("valor");
const valorParcelaPreview = document.getElementById("valorParcelaPreview");
const listaLancamentos = document.getElementById("listaLancamentos");
const semLancamentos = document.getElementById("semLancamentos");

const mesAtualElemento = document.getElementById("mesAtual");
const subtituloLancamentos = document.getElementById("subtituloLancamentos");
const mesAnterior = document.getElementById("mesAnterior");
const mesProximo = document.getElementById("mesProximo");

let mesSelecionado = new Date();
mesSelecionado.setDate(1);

const nomesMeses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function obterChaveMes(data) {
    const partes = data.split("-");
    return Number(partes[0]) * 12 + (Number(partes[1]) - 1);
}

function obterChaveMesSelecionado() {
    return mesSelecionado.getFullYear() * 12 + mesSelecionado.getMonth();
}

/*
 * Retorna os dados da parcela que pertence ao mês selecionado.
 *
 * Exemplo:
 * Compra de R$ 1.200 em 6x em outubro:
 * Outubro = R$ 200 (1/6)
 * Novembro = R$ 200 (2/6)
 * Dezembro = R$ 200 (3/6)
 * ...
 */
function obterParcelaDoMes(lancamento) {

    const mesCompra = obterChaveMes(lancamento.data);
    const mesAtual = obterChaveMesSelecionado();

    if (lancamento.compra !== "parcelado") {
        if (mesCompra !== mesAtual) {
            return null;
        }

        return {
            numero: 1,
            total: 1,
            valor: Number(lancamento.valor)
        };
    }

    const totalParcelas = Math.max(1, Number(lancamento.parcelas) || 1);
    const diferencaMeses = mesAtual - mesCompra;

    if (diferencaMeses < 0 || diferencaMeses >= totalParcelas) {
        return null;
    }

    const numeroParcela = diferencaMeses + 1;
    const valorTotal = Number(lancamento.valor) || 0;

    /*
     * A última parcela recebe eventuais centavos restantes.
     * Isso evita, por exemplo, que R$ 100 / 3 vire
     * R$ 33,33 + R$ 33,33 + R$ 33,33 = R$ 99,99.
     */
    const valorBase = Math.floor((valorTotal / totalParcelas) * 100) / 100;

    let valorParcela = valorBase;

    if (numeroParcela === totalParcelas) {
        valorParcela =
            Math.round(
                (valorTotal - valorBase * (totalParcelas - 1)) * 100
            ) / 100;
    }

    return {
        numero: numeroParcela,
        total: totalParcelas,
        valor: valorParcela
    };
}

tipoCompra.addEventListener("change", function() {

    if (tipoCompra.value === "parcelado") {
        parcelamentoArea.classList.remove("hidden");
        atualizarPreviewParcela();
    } else {
        parcelamentoArea.classList.add("hidden");
        valorParcelaPreview.textContent = "";
    }

});

valorInput.addEventListener("input", atualizarPreviewParcela);
parcelasInput.addEventListener("input", atualizarPreviewParcela);

function atualizarPreviewParcela() {

    if (tipoCompra.value !== "parcelado") {
        valorParcelaPreview.textContent = "";
        return;
    }

    const valor = Number(valorInput.value);
    const parcelas = Number(parcelasInput.value);

    if (!valor || !parcelas || parcelas < 2) {
        valorParcelaPreview.textContent = "";
        return;
    }

    const valorParcela =
        Math.floor((valor / parcelas) * 100) / 100;

    valorParcelaPreview.textContent =
        "Cada mês: aproximadamente " + formatarMoeda(valorParcela);
}

financeForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const tipo =
        document.getElementById("tipo").value;

    const descricao =
        document.getElementById("descricao").value.trim();

    const valor =
        Number(document.getElementById("valor").value);

    const categoria =
        document.getElementById("categoria").value;

    const pagamento =
        document.getElementById("pagamento").value;

    const compra =
        document.getElementById("tipoCompra").value;

    const data =
        document.getElementById("data").value;

    let parcelas = 1;

    if (compra === "parcelado") {

        parcelas =
            Number(document.getElementById("parcelas").value);

        if (!parcelas || parcelas < 2) {
            alert("Informe pelo menos 2 parcelas.");
            return;
        }
    }

    if (!valor || valor <= 0) {
        alert("Informe um valor válido.");
        return;
    }

    if (!data) {
        alert("Informe a data da compra.");
        return;
    }

    const novoLancamento = {

        id: Date.now(),

        tipo: tipo,

        descricao: descricao,

        /*
         * Guardamos o valor TOTAL da compra.
         * A tela mensal mostra somente a parcela correspondente.
         */
        valor: valor,

        categoria: categoria,

        pagamento: pagamento,

        compra: compra,

        parcelas: parcelas,

        data: data

    };

    lancamentos.push(novoLancamento);

    salvarDados();

    atualizarTela();

    financeForm.reset();

    parcelamentoArea.classList.add("hidden");
    valorParcelaPreview.textContent = "";

});

function salvarDados() {

    localStorage.setItem(
        chaveDados,
        JSON.stringify(lancamentos)
    );

}

function atualizarCabecalhoMes() {

    const nomeMes = nomesMeses[mesSelecionado.getMonth()];
    const ano = mesSelecionado.getFullYear();

    mesAtualElemento.textContent =
        nomeMes + " de " + ano;

    subtituloLancamentos.textContent =
        "Lançamentos considerados em " + nomeMes + "/" + ano;

}

function atualizarTela() {

    listaLancamentos.innerHTML = "";

    let receitas = 0;
    let despesas = 0;
    let quantidadeVisivel = 0;

    lancamentos.forEach(function(lancamento) {

        const parcelaDoMes = obterParcelaDoMes(lancamento);

        if (!parcelaDoMes) {
            return;
        }

        quantidadeVisivel++;

        const valorDoMes = parcelaDoMes.valor;

        if (lancamento.tipo === "receita") {
            receitas += valorDoMes;
        } else {
            despesas += valorDoMes;
        }

        const linha = document.createElement("tr");

        const valorFormatado =
            formatarMoeda(valorDoMes);

        const parcelasTexto =
            lancamento.compra === "parcelado"
                ? parcelaDoMes.numero + "/" + parcelaDoMes.total
                : "À vista";

        /*
         * A data exibida para uma parcela é o mês em que ela
         * está sendo considerada, mantendo o dia da compra.
         */
        const dataParcela =
            criarDataDaParcela(lancamento.data, parcelaDoMes.numero - 1);

        linha.innerHTML = `

            <td>
                ${formatarData(dataParcela)}
            </td>

            <td>
                ${escaparHTML(lancamento.descricao)}
            </td>

            <td>
                ${escaparHTML(lancamento.categoria)}
            </td>

            <td>
                ${escaparHTML(lancamento.pagamento)}
            </td>

            <td>
                ${parcelasTexto}
            </td>

            <td class="${
                lancamento.tipo === "receita"
                    ? "valor-receita"
                    : "valor-despesa"
            }">

                ${
                    lancamento.tipo === "receita"
                        ? "+"
                        : "-"
                }

                ${valorFormatado}

            </td>

            <td>

                <button
                    class="btn-excluir"
                    onclick="excluirLancamento(${lancamento.id})"
                >
                    Excluir
                </button>

            </td>

        `;

        listaLancamentos.appendChild(linha);

    });

    if (quantidadeVisivel === 0) {
        semLancamentos.classList.remove("hidden");
    } else {
        semLancamentos.classList.add("hidden");
    }

    document.getElementById("totalReceitas").textContent =
        formatarMoeda(receitas);

    document.getElementById("totalDespesas").textContent =
        formatarMoeda(despesas);

    const saldo = receitas - despesas;

    document.getElementById("saldo").textContent =
        formatarMoeda(saldo);

    atualizarCabecalhoMes();

}

function criarDataDaParcela(dataOriginal, mesesAdicionados) {

    const partes = dataOriginal.split("-");

    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    const data = new Date(ano, mes - 1 + mesesAdicionados, 1);

    /*
     * Ajusta o dia para meses com menos dias.
     * Ex.: compra no dia 31 -> fevereiro usa o último dia disponível.
     */
    const ultimoDiaDoMes =
        new Date(
            data.getFullYear(),
            data.getMonth() + 1,
            0
        ).getDate();

    data.setDate(Math.min(dia, ultimoDiaDoMes));

    const anoFormatado = data.getFullYear();
    const mesFormatado =
        String(data.getMonth() + 1).padStart(2, "0");
    const diaFormatado =
        String(data.getDate()).padStart(2, "0");

    return (
        anoFormatado +
        "-" +
        mesFormatado +
        "-" +
        diaFormatado
    );

}

function excluirLancamento(id) {

    const confirmar =
        confirm("Deseja realmente excluir este lançamento?");

    if (!confirmar) {
        return;
    }

    lancamentos =
        lancamentos.filter(function(lancamento) {
            return lancamento.id !== id;
        });

    salvarDados();

    atualizarTela();

}

function formatarData(data) {

    if (!data) {
        return "";
    }

    const partes = data.split("-");

    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}

/*
 * Evita que uma descrição/categoria digitada pelo usuário
 * seja interpretada como HTML dentro da tabela.
 */
function escaparHTML(texto) {

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

mesAnterior.addEventListener("click", function() {

    mesSelecionado.setMonth(
        mesSelecionado.getMonth() - 1
    );

    atualizarTela();

});

mesProximo.addEventListener("click", function() {

    mesSelecionado.setMonth(
        mesSelecionado.getMonth() + 1
    );

    atualizarTela();

});

document
    .getElementById("limparLancamentos")
    .addEventListener("click", function() {

        const confirmar =
            confirm(
                "Isso apagará todos os seus lançamentos. Continuar?"
            );

        if (!confirmar) {
            return;
        }

        lancamentos = [];

        salvarDados();

        atualizarTela();

    });

document
    .getElementById("btnSair")
    .addEventListener("click", function() {

        localStorage.removeItem("usuarioLogado");

        window.location.href = "index.html";

    });

/*
 * Mantém a data do formulário no dia atual quando possível.
 */
const dataInput = document.getElementById("data");

if (!dataInput.value) {

    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    dataInput.value =
        ano + "-" + mes + "-" + dia;
}

atualizarTela();

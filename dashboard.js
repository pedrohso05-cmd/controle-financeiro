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

const parcelamentoArea =
    document.getElementById("parcelamentoArea");

const listaLancamentos =
    document.getElementById("listaLancamentos");


tipoCompra.addEventListener("change", function() {

    if (tipoCompra.value === "parcelado") {

        parcelamentoArea.classList.remove("hidden");

    } else {

        parcelamentoArea.classList.add("hidden");

    }

});


financeForm.addEventListener("submit", function(event) {

    event.preventDefault();


    const tipo =
        document.getElementById("tipo").value;

    const descricao =
        document.getElementById("descricao").value;

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

    }


    const novoLancamento = {

        id: Date.now(),

        tipo: tipo,

        descricao: descricao,

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

});


function salvarDados() {

    localStorage.setItem(
        chaveDados,
        JSON.stringify(lancamentos)
    );

}


function atualizarTela() {

    listaLancamentos.innerHTML = "";


    let receitas = 0;

    let despesas = 0;


    lancamentos.forEach(function(lancamento) {


        if (lancamento.tipo === "receita") {

            receitas += lancamento.valor;

        } else {

            despesas += lancamento.valor;

        }


        const linha =
            document.createElement("tr");


        const valorFormatado =
            lancamento.valor.toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );


        const parcelasTexto =
            lancamento.compra === "parcelado"
                ? lancamento.parcelas + "x"
                : "À vista";


        linha.innerHTML = `

            <td>
                ${formatarData(lancamento.data)}
            </td>

            <td>
                ${lancamento.descricao}
            </td>

            <td>
                ${lancamento.categoria}
            </td>

            <td>
                ${lancamento.pagamento}
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


    document.getElementById("totalReceitas").textContent =
        receitas.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );


    document.getElementById("totalDespesas").textContent =
        despesas.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );


    const saldo = receitas - despesas;


    document.getElementById("saldo").textContent =
        saldo.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
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


atualizarTela();
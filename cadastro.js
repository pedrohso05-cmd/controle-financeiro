import { supabase } from "./supabase.js";

const cadastroForm = document.getElementById("cadastroForm");
const mensagem = document.getElementById("mensagem");

cadastroForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    mensagem.textContent = "";
    mensagem.style.color = "";

    if (senha !== confirmarSenha) {
        mensagem.textContent = "As senhas não são iguais.";
        mensagem.style.color = "red";
        return;
    }

    if (senha.length < 6) {
        mensagem.textContent = "A senha precisa ter pelo menos 6 caracteres.";
        mensagem.style.color = "red";
        return;
    }

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: senha,
        options: {
            data: {
                nome: nome
            },
            emailRedirectTo: "https://pedrohso05-cmd.github.io/controle-financeiro/index.html"
        }
    });

    if (error) {

        mensagem.textContent = error.message;
        mensagem.style.color = "red";
        return;

    }

    mensagem.textContent =
        "Conta criada! Verifique seu e-mail para confirmar o cadastro.";

    mensagem.style.color = "green";

    cadastroForm.reset();

});
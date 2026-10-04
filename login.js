import { supabase } from "./supabase.js";

const loginForm = document.getElementById("loginForm");
const loginMensagem =
    document.getElementById("loginMensagem");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const senha =
        document.getElementById("senha").value;

    loginMensagem.textContent = "";
    loginMensagem.style.color = "";

    const { data, error } =
        await supabase.auth.signInWithPassword({

            email: email,

            password: senha

        });

    if (error) {

        loginMensagem.textContent =
            "E-mail ou senha incorretos.";

        loginMensagem.style.color = "red";

        return;
    }

    localStorage.setItem(
        "usuarioLogado",
        email
    );

    window.location.href =
        "dashboard.html";

});
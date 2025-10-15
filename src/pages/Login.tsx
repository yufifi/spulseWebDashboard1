import React, { useState } from "react";
import { supabase } from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase
      .from("usersSpulse")
      .select("*")
      .eq("email", email)
      .eq("senha", senha)
      .single();

    if (error || !data) {
      setError("Credenciais inválidas.");
      return;
    }

    localStorage.setItem("currentUser", data.email);
    localStorage.setItem("isAdmin", data.admin ? "true" : "false");
    navigate("/dashboard");
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded-lg"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full p-2 mb-6 border rounded-lg"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
        >
          Entrar
        </button>

        <p className="text-sm text-center mt-4">
          Não tem conta?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-600 cursor-pointer"
          >
            Cadastre-se
          </span>
        </p>
      </form>
    </div>
  );
}

import React, { useState } from "react";
import { supabase } from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const { data: existingUser } = await supabase
      .from("usersSpulse")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      setError("E-mail já cadastrado.");
      return;
    }

    const { error: insertError } = await supabase.from("usersSpulse").insert([
      {
        name,
        email,
        senha,
        cpf,
        admin: false,
        image_url: null,
      },
    ]);

    if (insertError) {
      setError("Erro ao registrar usuário.");
      console.error(insertError);
      return;
    }

    alert("Usuário registrado com sucesso!");
    navigate("/");
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Cadastro</h2>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-4 border rounded-lg"
          required
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded-lg"
          required
        />
        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
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
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
        >
          Cadastrar
        </button>

        <p className="text-sm text-center mt-4">
          Já tem conta?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-blue-600 cursor-pointer"
          >
            Entrar
          </span>
        </p>
      </form>
    </div>
  );
}

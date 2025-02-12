const API_URL = "http://localhost:8084/sorteador-duplas-bt/api/v1/auth/login"; // Ajuste conforme necessÃ¡rio

export async function login(username, password) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error("Usuário ou senha incorretos!");
        }

        const data = await response.json();
        localStorage.setItem("token", data.token); // Salva o token JWT
        return data;
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        throw error;
    }
}

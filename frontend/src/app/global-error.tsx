"use client";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  return (
    <html lang="pt">
      <body>
        <main style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f8fb",
          padding: "24px",
          fontFamily: "Arial, sans-serif",
        }}>
          <section style={{
            width: "100%",
            maxWidth: "420px",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            background: "#fff",
            padding: "24px",
            textAlign: "center",
            boxShadow: "0 8px 28px rgba(15, 23, 42, 0.06)",
          }}>
            <p style={{
              margin: 0,
              color: "#ef4444",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}>
              Erro crítico
            </p>
            <h1 style={{
              margin: "10px 0 0",
              color: "#0f172a",
              fontSize: "22px",
              lineHeight: 1.2,
            }}>
              A aplicação não conseguiu carregar
            </h1>
            <p style={{
              margin: "10px 0 0",
              color: "#667085",
              fontSize: "14px",
              lineHeight: 1.6,
            }}>
              {error.message || "Tenta atualizar a página ou voltar a abrir a aplicação."}
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: "20px",
                minHeight: "40px",
                border: 0,
                borderRadius: "8px",
                background: "#16a34a",
                color: "#fff",
                padding: "0 16px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Tentar novamente
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}

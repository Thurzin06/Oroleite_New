Instruções rápidas para rodar o teste automatizado (Windows):

1) No projeto, inicie um servidor estático a partir da raiz (porta 8000):

```powershell
cd "c:\Users\Comercial05\Desktop\Nova Oroleite"
python -m http.server 8000
```

2) Em outro terminal, instale dependências e execute o teste:

```powershell
cd "c:\Users\Comercial05\Desktop\Nova Oroleite"
npm install
npm run test:form
```

3) O Chromium abrirá, preencherá o formulário e enviará. Logs aparecerão no terminal. Resultados gerados em `test/result-screenshot.png` e `test/result-page.html`.

Observações:
- Garanta que o site esteja acessível em http://localhost:8000
- Se o envio cair no fallback `mailto:`, o script não conseguirá completar o envio automático (irá abrir o cliente). Verifique o console e o Network no devtools.
- Se quiser que eu ajuste campos (nomes diferentes), cole aqui o seletor ou o HTML do formulário.

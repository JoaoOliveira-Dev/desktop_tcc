export const vulnerabilidadesIniciais = [
  {
    value: "Cross-Site Scripting (XSS)",
    label: "Cross-Site Scripting (XSS)",
    desc: "Ataques de Cross-Site Scripting (XSS) envolvem a injeção de código malicioso em sites que, de outra forma, são considerados confiáveis. Isso acontece quando um invasor consegue inserir um script malicioso no conteúdo do site. Como o navegador da vítima não pode discernir que os scripts não são confiáveis, ele os executa. O XSS ativa ataques maliciosos ao injetar scripts do lado do cliente dentro da página web, o que pode resultar em diversos problemas, como a execução bem-sucedida de ataques de phishing, roubo de cookies e dados sensíveis, e instalação de malware. ",
    referencia: "o Web Security Academy: Cross-site scripting \no Web Security Academy: Reflected cross-site scripting \no CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting') \no CWE-80: Improper Neutralization of Script-Related HTML Tags in a Web Page (Basic XSS) \no CWE-116: Improper Encoding or Escaping of Output \no CWE-159: Failure to Sanitize Special Element"
  },
  {
    value: "Information Disclosure",
    label: "Information Disclosure",
    desc: "Foi identicada uma vulnerabilidade crítica na API de favoritar um cartão, onde informações sensíveis, como credenciais do banco de dados (usuário e senha do MySQL), endereço IP do servidor MySQL e queries executadas, estão sendo retornadas nas respostas das requisições.",
    referencia:
      "- https://owasp.org/www-community/vulnerabilities/Information_disclosure\n- https://portswigger.net/web-security/information-disclosure",
  },
  {
    value: "SQL Injection (SQLI)",
    label: "SQL Injection (SQLI)",
  },
  {
    value: "Remote Code Execution (RCE)",
    label: "Remote Code Execution (RCE)",
    desc: "Essa falha permite que um invasor execute comandos remotamente no servidor sem acesso físico.",
    referencia: "https://www.cloudflare.com/pt-br/learning/security/what-is-remote-code-execution/"
  },
  {
    value: "Cross-site Request Forgery (CSRF)",
    label: "Cross-site Request Forgery (CSRF)",
  },
  {
    value: "Denial-of-service (DoS)",
    label: "Denial-of-service (DoS)",
  },
  {
    value: "Local File Inclusion (LFI)",
    label: "Local File Inclusion (LFI)",
  },
  {
    value: "Remote File Inclusion (RFI)",
    label: "Remote File Inclusion (RFI)",
  },
  {
    value: "Server-side request forgery (SSRF)",
    label: "Server-side request forgery (SSRF)",
  },
  {
    value: "Command Injection",
    label: "Command Injection",
  },
  {
    value: "Insecure direct object references (IDOR)",
    label: "Insecure direct object references (IDOR)",
  },
  {
    value: "Open Redirect",
    label: "Open Redirect",
  },
  {
    value: "XXE",
    label: "XXE",
  },
];

export const InformationDisclosure = [];

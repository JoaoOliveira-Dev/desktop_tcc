export interface Note {
  id: number;
  folder: string;
  title: string;
  content: string;
}

export const defaultNotes: Note[] = [
    // 1. Recon
    {
      id: 1,
      folder: "Recon",
      title: "Nmap - Scan Completo",
      content: "nmap -p- -T4 -A -oN fullscan.txt {IP}",
    },
    {
      id: 2,
      folder: "Recon",
      title: "Subdomínios",
      content: "subfinder -d target.com -o subdomains.txt",
    },
    {
      id: 3,
      folder: "Recon",
      title: "Tecnologias",
      content: "Anotar CMS, frameworks, servidores web, linguagens detectadas.",
    },
    {
      id: 4,
      folder: "Recon",
      title: "Informações Públicas",
      content: "Whois, Google Dorks, redes sociais, dados públicos relevantes.",
    },

    // 2. Vulnerability Analysis
    {
      id: 5,
      folder: "Vulnerability Analysis",
      title: "Serviços",
      content:
        "Organizar por serviço (ftp, ssh, apache) e listar vulnerabilidades.",
    },
    {
      id: 6,
      folder: "Vulnerability Analysis",
      title: "CVEs",
      content: "Lista de CVEs relacionados às vulnerabilidades encontradas.",
    },
    {
      id: 7,
      folder: "Vulnerability Analysis",
      title: "Scripts",
      content: "Exploit scripts, scripts de enumeração e PoCs utilizados.",
    },

    // 3. Exploitation
    {
      id: 8,
      folder: "Exploitation",
      title: "Exploits",
      content: "Guarde exploits usados e anote se funcionaram ou não.",
    },
    {
      id: 9,
      folder: "Exploitation",
      title: "Shells",
      content:
        "Tipo de shell (reverso/bind), comandos utilizados, credenciais, observações.",
    },
    {
      id: 10,
      folder: "Exploitation",
      title: "Privesc",
      content: "Técnicas e scripts de escalada de privilégios utilizados.",
    },

    // 4. Post-Exploitation
    {
      id: 11,
      folder: "Post-Exploitation",
      title: "Dados Sensíveis",
      content:
        "Credenciais, arquivos de configuração, dumps de banco de dados.",
    },
    {
      id: 12,
      folder: "Post-Exploitation",
      title: "Persistência",
      content: "Métodos usados para manter acesso ao sistema.",
    },
  ];

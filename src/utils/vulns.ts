import type { VulnType } from "../types/types";

export interface VulnerabilityPreset {
  value: string;
  label: string;
  titulo?: string;
  categoria?: string;
  subcategoria?: string;
  owasp?: string;
  cwe?: string;
  desc?: string;
  referencia?: string;
  impacto?: string;
  reparo?: string;
  poc?: string;
  pocLegenda?: string;
  retestStatus?: string;
  retestDescricao?: string;
  cvssData?: VulnType["cvssData"];
}

const paragraph = (content: string) => `<p>${content}</p>`;

const bulletList = (items: string[]) =>
  items.map((item) => paragraph(item)).join("");

const richText = (...blocks: string[]) => blocks.join("");

const references = (...items: string[]) =>
  items.map((item) => `- ${item}`).join("\n");

const description = (summary: string, contextHint: string) =>
  richText(
    paragraph(summary),
    paragraph(contextHint),
    paragraph(
      "Durante a anotação, registre o endpoint, parâmetro, perfil de usuário, condição de exploração e qualquer limitação observada no teste autorizado."
    )
  );

const impact = (technical: string[], business: string[]) =>
  richText(
    paragraph("<strong>Impacto Técnico:</strong>"),
    bulletList(technical),
    paragraph("<strong>Impacto de Negócio:</strong>"),
    bulletList(business)
  );

const remediation = (items: string[]) =>
  richText(
    paragraph("<strong>Mitigação recomendada:</strong>"),
    bulletList(items),
    paragraph(
      "Após a correção, recomenda-se executar re-test no mesmo fluxo afetado e anexar uma evidência demonstrando o novo comportamento."
    )
  );

const poc = (items: string[]) =>
  richText(
    paragraph(
      "Foi executado um teste controlado e previamente autorizado para validar a exposição no ambiente avaliado."
    ),
    bulletList(items),
    paragraph(
      "<strong>Figura:</strong> [descrever a evidência, destacando parâmetro, resposta, tela, cabeçalho ou comportamento observado]."
    )
  );

const defaultRetest = richText(
  paragraph(
    "Não validado. O re-test ainda não foi executado para confirmar a correção desta vulnerabilidade."
  ),
  paragraph(
    "Quando o re-test for realizado, registrar se a falha foi corrigida, corrigida parcialmente ou permanece não corrigida, anexando evidência quando aplicável."
  )
);

export const vulnerabilidadesIniciais: VulnerabilityPreset[] = [
  {
    value: "Cross-Site Scripting (XSS)",
    label: "Cross-Site Scripting (XSS)",
    titulo:
      "Aplicação suscetível à injeção de JavaScript no parâmetro [parâmetro]",
    categoria: "A03: Injection",
    subcategoria: "Cross-Site Scripting",
    owasp: "OWASP Top 10 2021 - A03: Injection",
    cwe: "CWE-79",
    desc: description(
      "Cross-Site Scripting (XSS) ocorre quando a aplicação permite que conteúdo controlado pelo usuário seja interpretado como JavaScript no navegador de outros usuários.",
      "Foi verificado que a aplicação aceita dados em [campo/parâmetro] sem validação, codificação de saída ou sanitização adequadas, permitindo a execução de conteúdo ativo no contexto da página."
    ),
    impacto: impact(
      [
        "Execução de JavaScript no navegador da vítima, possibilitando captura de tokens, cookies não protegidos e dados exibidos em tela.",
        "Realização de ações em nome do usuário autenticado, conforme permissões disponíveis na sessão afetada.",
        "Possibilidade de redirecionamento, alteração visual da página e apoio a ataques de phishing."
      ],
      [
        "Comprometimento de contas de clientes, colaboradores ou administradores.",
        "Aumento do risco de fraudes, exposição de dados e perda de confiança na aplicação.",
        "Potencial impacto reputacional e jurídico caso dados pessoais sejam manipulados ou expostos."
      ]
    ),
    reparo: remediation([
      "Aplicar codificação de saída contextual para HTML, atributos, JavaScript e URLs.",
      "Sanitizar conteúdo HTML permitido com bibliotecas mantidas e configuradas por lista de permissões.",
      "Validar entradas no servidor e rejeitar caracteres ou formatos incompatíveis com o campo.",
      "Utilizar Content Security Policy (CSP) como camada adicional, sem substituir a correção no código.",
      "Configurar cookies sensíveis com HttpOnly, Secure e SameSite quando aplicável."
    ]),
    poc: poc([
      "Acessar o fluxo [fluxo] utilizando o perfil [perfil].",
      "Inserir um valor controlado no campo/parâmetro [parâmetro].",
      "Registrar a resposta da aplicação demonstrando que o conteúdo foi refletido, armazenado ou executado.",
      "Anexar captura em tema claro com o ponto vulnerável destacado."
    ]),
    pocLegenda: "Figura: Execução de JavaScript no parâmetro [parâmetro].",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/www-community/attacks/xss/",
      "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
      "https://portswigger.net/web-security/cross-site-scripting",
      "https://cwe.mitre.org/data/definitions/79.html"
    ),
  },
  {
    value: "SQL Injection (SQLI)",
    label: "SQL Injection (SQLI)",
    titulo:
      "Possibilidade de manipular comandos SQL na aplicação pelo parâmetro [parâmetro]",
    categoria: "A03: Injection",
    subcategoria: "SQL Injection",
    owasp: "OWASP Top 10 2021 - A03: Injection",
    cwe: "CWE-89",
    desc: description(
      "SQL Injection ocorre quando dados fornecidos pelo usuário são incorporados a consultas SQL sem parametrização, validação ou tratamento adequado.",
      "Foi identificado que o parâmetro [parâmetro] influencia a consulta ao banco de dados, permitindo comportamento anômalo, erro SQL ou extração de informações durante o teste autorizado."
    ),
    impacto: impact(
      [
        "Leitura não autorizada de tabelas, registros e dados sensíveis armazenados no banco.",
        "Alteração ou exclusão de informações, dependendo dos privilégios da conta utilizada pela aplicação.",
        "Possível escalonamento para execução de funções administrativas do SGBD ou movimentação para outros sistemas integrados."
      ],
      [
        "Vazamento de dados pessoais, financeiros ou estratégicos.",
        "Interrupção de processos críticos dependentes do banco de dados.",
        "Risco de sanções regulatórias, ações judiciais e danos à reputação."
      ]
    ),
    reparo: remediation([
      "Substituir concatenação de strings por consultas parametrizadas ou prepared statements.",
      "Validar entradas por lista de permissões, respeitando tipo, tamanho e formato esperado.",
      "Aplicar princípio do menor privilégio à conta de banco usada pela aplicação.",
      "Tratar erros de banco de forma genérica, sem expor query, stack trace ou estrutura interna.",
      "Adicionar testes automatizados para os parâmetros afetados."
    ]),
    poc: poc([
      "Acessar o endpoint [endpoint] e identificar o parâmetro [parâmetro].",
      "Enviar valores controlados para observar erro, alteração de resposta ou diferença de tempo.",
      "Registrar somente dados necessários à comprovação, ofuscando informações sensíveis.",
      "Anexar evidências do erro, da resposta alterada ou da validação por ferramenta autorizada."
    ]),
    pocLegenda:
      "Figura: Resposta da aplicação indicando manipulação de consulta SQL.",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/www-community/attacks/SQL_Injection",
      "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
      "https://portswigger.net/web-security/sql-injection",
      "https://cwe.mitre.org/data/definitions/89.html"
    ),
  },
  {
    value: "Remote Code Execution (RCE)",
    label: "Remote Code Execution (RCE)",
    titulo:
      "Aplicação permite execução remota de código no componente [componente]",
    categoria: "A03: Injection",
    subcategoria: "Remote Code Execution",
    owasp: "OWASP Top 10 2021 - A03: Injection",
    cwe: "CWE-94",
    desc: description(
      "Remote Code Execution (RCE) permite que um atacante execute código ou comandos no servidor que hospeda a aplicação.",
      "Foi observado que o componente [componente] processa dados controlados pelo usuário de forma insegura, possibilitando execução remota no contexto do serviço."
    ),
    impacto: impact(
      [
        "Execução de comandos no servidor, leitura de arquivos e possível alteração de dados da aplicação.",
        "Comprometimento de credenciais, variáveis de ambiente e segredos disponíveis ao processo vulnerável.",
        "Possível pivotagem para outros ativos internos a partir do servidor afetado."
      ],
      [
        "Comprometimento total ou parcial da aplicação e de sua infraestrutura.",
        "Interrupção operacional, perda de dados e potencial indisponibilidade de serviços críticos.",
        "Alto impacto financeiro, regulatório e reputacional em caso de exploração real."
      ]
    ),
    reparo: remediation([
      "Remover execução dinâmica de código sempre que possível.",
      "Isolar o processamento em ambiente restrito, sem acesso a segredos ou recursos sensíveis.",
      "Validar entradas por lista de permissões e rejeitar metacaracteres ou expressões inesperadas.",
      "Atualizar frameworks, bibliotecas e componentes vulneráveis.",
      "Executar o serviço com privilégios mínimos e monitorar eventos de execução anômala."
    ]),
    poc: poc([
      "Identificar o componente [componente] que processa entrada controlada pelo usuário.",
      "Enviar uma entrada benigna de verificação, sem causar dano ao ambiente.",
      "Registrar a resposta que comprova execução no servidor, como saída controlada ou efeito observável.",
      "Ofuscar caminhos, usuários, chaves e demais dados sensíveis nas evidências."
    ]),
    pocLegenda:
      "Figura: Execução controlada no servidor pelo componente [componente].",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/Top10/A03_2021-Injection/",
      "https://cwe.mitre.org/data/definitions/94.html",
      "https://cwe.mitre.org/data/definitions/78.html"
    ),
  },
  {
    value: "Command Injection",
    label: "Command Injection",
    titulo:
      "Parâmetro [parâmetro] permite injeção de comandos no sistema operacional",
    categoria: "A03: Injection",
    subcategoria: "OS Command Injection",
    owasp: "OWASP Top 10 2021 - A03: Injection",
    cwe: "CWE-78",
    desc: description(
      "Command Injection ocorre quando a aplicação concatena entrada do usuário em comandos executados pelo sistema operacional.",
      "Foi verificado que o parâmetro [parâmetro] influencia a execução de uma rotina no servidor, permitindo a inclusão de instruções não previstas no fluxo original."
    ),
    impacto: impact(
      [
        "Execução de comandos no servidor com os privilégios do processo vulnerável.",
        "Leitura de arquivos locais, enumeração do ambiente e possível alteração de configurações.",
        "Uso do servidor afetado como ponto de apoio para novas etapas de ataque."
      ],
      [
        "Interrupção de serviços e perda de integridade de dados operacionais.",
        "Exposição de informações sensíveis armazenadas no servidor.",
        "Dano reputacional e aumento de custos de resposta a incidente."
      ]
    ),
    reparo: remediation([
      "Evitar chamadas ao shell e utilizar APIs nativas da linguagem para a operação necessária.",
      "Quando a execução for indispensável, usar argumentos parametrizados sem interpretação por shell.",
      "Validar entradas por lista de permissões e limitar estritamente formatos aceitos.",
      "Executar o processo com privilégios mínimos e em ambiente segregado.",
      "Registrar e alertar tentativas de uso de metacaracteres ou padrões de comando."
    ]),
    poc: poc([
      "Acessar a funcionalidade [funcionalidade].",
      "Enviar uma entrada controlada no parâmetro [parâmetro].",
      "Registrar a resposta ou efeito observável que indica execução de comando.",
      "Anexar evidência sem expor segredos, caminhos internos sensíveis ou dados de terceiros."
    ]),
    pocLegenda:
      "Figura: Evidência de execução de comando pelo parâmetro [parâmetro].",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/www-community/attacks/Command_Injection",
      "https://portswigger.net/web-security/os-command-injection",
      "https://cwe.mitre.org/data/definitions/78.html"
    ),
  },
  {
    value: "Cross-site Request Forgery (CSRF)",
    label: "Cross-site Request Forgery (CSRF)",
    titulo:
      "Funcionalidade [funcionalidade] permite requisições sem proteção contra CSRF",
    categoria: "A01: Broken Access Control",
    subcategoria: "Cross-Site Request Forgery",
    owasp: "OWASP Top 10 2021 - A01: Broken Access Control",
    cwe: "CWE-352",
    desc: description(
      "Cross-Site Request Forgery (CSRF) ocorre quando uma aplicação aceita ações autenticadas sem validar a intenção legítima do usuário.",
      "Foi identificado que a funcionalidade [funcionalidade] processa requisições sensíveis sem token anti-CSRF, validação de origem ou outra proteção equivalente."
    ),
    impacto: impact(
      [
        "Execução de ações autenticadas sem consentimento explícito da vítima.",
        "Alteração de dados, configurações ou preferências do usuário, conforme a funcionalidade afetada.",
        "Possível encadeamento com engenharia social para induzir usuários autenticados a acionar a requisição."
      ],
      [
        "Fraudes operacionais ou alteração indevida de informações de clientes.",
        "Perda de confiança na aplicação e aumento de solicitações de suporte.",
        "Risco regulatório se ações sensíveis afetarem dados pessoais ou financeiros."
      ]
    ),
    reparo: remediation([
      "Implementar tokens anti-CSRF imprevisíveis e vinculados à sessão do usuário.",
      "Validar cabeçalhos Origin e Referer para ações sensíveis.",
      "Utilizar cookies com SameSite=Lax ou Strict quando compatível com o fluxo.",
      "Exigir reautenticação ou confirmação adicional para operações críticas.",
      "Garantir que métodos seguros, como GET, não alterem estado."
    ]),
    poc: poc([
      "Autenticar-se com o perfil [perfil].",
      "Capturar a requisição da funcionalidade [funcionalidade].",
      "Reproduzir a requisição sem token anti-CSRF válido ou a partir de origem externa controlada.",
      "Registrar a confirmação de que a ação foi aceita pela aplicação."
    ]),
    pocLegenda:
      "Figura: Requisição sensível aceita sem validação anti-CSRF.",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/www-community/attacks/csrf",
      "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html",
      "https://portswigger.net/web-security/csrf",
      "https://cwe.mitre.org/data/definitions/352.html"
    ),
  },
  {
    value: "Insecure direct object references (IDOR)",
    label: "Insecure Direct Object References (IDOR)",
    titulo:
      "Controle de acesso insuficiente permite acesso ao objeto [objeto] de outro usuário",
    categoria: "A01: Broken Access Control",
    subcategoria: "IDOR/BOLA",
    owasp: "OWASP Top 10 2021 - A01: Broken Access Control",
    cwe: "CWE-639",
    desc: description(
      "IDOR ocorre quando a aplicação expõe identificadores de objetos e não valida adequadamente se o usuário autenticado possui autorização para acessá-los.",
      "Foi verificado que a alteração do identificador [identificador] permite consultar ou manipular recursos vinculados a outro usuário, conta ou organização."
    ),
    impacto: impact(
      [
        "Acesso não autorizado a dados de outros usuários ou organizações.",
        "Possível alteração, exclusão ou criação de registros fora do escopo de permissão do usuário.",
        "Quebra de isolamento entre contas, perfis ou tenants."
      ],
      [
        "Exposição de informações confidenciais de clientes ou parceiros.",
        "Fraude, manipulação indevida de registros e quebra de confiança no serviço.",
        "Risco de incidentes de privacidade e obrigações de notificação."
      ]
    ),
    reparo: remediation([
      "Aplicar verificação de autorização no servidor para cada objeto acessado.",
      "Não confiar em identificadores enviados pelo cliente como prova de permissão.",
      "Usar controles centralizados de autorização e testes automatizados por perfil.",
      "Registrar tentativas de acesso a objetos fora do escopo do usuário.",
      "Quando aplicável, substituir IDs sequenciais por identificadores não previsíveis, sem tratar isso como controle principal."
    ]),
    poc: poc([
      "Autenticar-se com o usuário [usuário A] e capturar a requisição do recurso [recurso].",
      "Alterar o identificador para um objeto pertencente ao [usuário B].",
      "Registrar se a aplicação retornou, alterou ou excluiu dados de outro contexto.",
      "Ofuscar dados pessoais e manter apenas o necessário para comprovar a falha."
    ]),
    pocLegenda:
      "Figura: Acesso ao objeto [objeto] sem autorização adequada.",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/Top10/A01_2021-Broken_Access_Control/",
      "https://portswigger.net/web-security/access-control/idor",
      "https://cwe.mitre.org/data/definitions/639.html"
    ),
  },
  {
    value: "Broken Access Control",
    label: "Broken Access Control",
    titulo:
      "Controle de acesso insuficiente na funcionalidade [funcionalidade]",
    categoria: "A01: Broken Access Control",
    subcategoria: "Autorização insuficiente",
    owasp: "OWASP Top 10 2021 - A01: Broken Access Control",
    cwe: "CWE-862",
    desc: description(
      "Broken Access Control ocorre quando a aplicação não impõe corretamente regras de autorização para usuários, perfis, objetos ou funções administrativas.",
      "Foi identificado que a funcionalidade [funcionalidade] permite acesso ou execução de ação incompatível com o perfil [perfil] utilizado no teste."
    ),
    impacto: impact(
      [
        "Acesso indevido a funcionalidades restritas, dados administrativos ou recursos de outros usuários.",
        "Alteração de informações sem permissão adequada.",
        "Possível escalonamento horizontal ou vertical de privilégios."
      ],
      [
        "Comprometimento de dados sensíveis e quebra de segregação de responsabilidades.",
        "Fraudes internas ou externas por abuso de permissões.",
        "Risco de sanções e impacto reputacional por exposição ou alteração indevida de dados."
      ]
    ),
    reparo: remediation([
      "Implementar autorização no servidor para cada ação e recurso sensível.",
      "Centralizar regras de permissão e evitar controles apenas na interface.",
      "Aplicar deny-by-default para rotas e funções administrativas.",
      "Criar testes automatizados cobrindo perfis, tenants e objetos de terceiros.",
      "Monitorar tentativas de acesso negado e padrões de enumeração."
    ]),
    poc: poc([
      "Autenticar-se com o perfil [perfil limitado].",
      "Acessar diretamente a rota ou requisição [rota/requisição].",
      "Registrar que a ação foi executada ou que dados restritos foram retornados.",
      "Comparar o resultado com o comportamento esperado para o perfil autorizado."
    ]),
    pocLegenda:
      "Figura: Funcionalidade restrita acessada pelo perfil [perfil].",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/Top10/A01_2021-Broken_Access_Control/",
      "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html",
      "https://cwe.mitre.org/data/definitions/862.html"
    ),
  },
  {
    value: "Information Disclosure",
    label: "Information Disclosure",
    titulo:
      "Exposição de informações sensíveis na resposta da funcionalidade [funcionalidade]",
    categoria: "A05: Security Misconfiguration",
    subcategoria: "Information Disclosure",
    owasp: "OWASP Top 10 2021 - A05: Security Misconfiguration",
    cwe: "CWE-200",
    desc: description(
      "Information Disclosure ocorre quando a aplicação expõe dados internos, técnicos ou sensíveis que não deveriam ser acessíveis ao usuário.",
      "Foi identificado que a resposta da funcionalidade [funcionalidade] contém [tipo de informação], permitindo inferir detalhes sobre infraestrutura, usuários, credenciais, queries ou regras internas."
    ),
    impacto: impact(
      [
        "Exposição de detalhes técnicos que facilitam ataques direcionados.",
        "Possível vazamento de credenciais, tokens, dados pessoais ou mensagens de erro internas.",
        "Aumento da superfície de ataque por revelar versões, caminhos, queries ou estrutura de sistemas."
      ],
      [
        "Risco de vazamento de dados sensíveis e impacto em privacidade.",
        "Danos reputacionais pela exposição indevida de informações internas.",
        "Aumento do custo de correção caso a informação exposta permita exploração encadeada."
      ]
    ),
    reparo: remediation([
      "Remover dados sensíveis das respostas retornadas ao cliente.",
      "Implementar tratamento genérico de erros e registrar detalhes apenas em logs internos protegidos.",
      "Revisar serialização de objetos para evitar retorno de campos administrativos.",
      "Aplicar mascaramento ou ofuscação para dados que precisem ser parcialmente exibidos.",
      "Revisar permissões e retenção de logs, backups e arquivos expostos."
    ]),
    poc: poc([
      "Acessar a funcionalidade [funcionalidade].",
      "Registrar a resposta que contém [tipo de informação sensível].",
      "Destacar apenas os campos necessários e ofuscar dados reais de pessoas ou credenciais.",
      "Indicar se a exposição ocorre sem autenticação, com perfil comum ou apenas com perfil específico."
    ]),
    pocLegenda:
      "Figura: Resposta contendo informação sensível em [funcionalidade].",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/www-community/vulnerabilities/Information_disclosure",
      "https://portswigger.net/web-security/information-disclosure",
      "https://cwe.mitre.org/data/definitions/200.html"
    ),
  },
  {
    value: "Local File Inclusion (LFI)",
    label: "Local File Inclusion (LFI)",
    titulo:
      "Parâmetro [parâmetro] permite inclusão ou leitura de arquivos locais",
    categoria: "A03: Injection",
    subcategoria: "Local File Inclusion",
    owasp: "OWASP Top 10 2021 - A03: Injection",
    cwe: "CWE-22",
    desc: description(
      "Local File Inclusion ocorre quando a aplicação utiliza entrada do usuário para montar caminhos de arquivos locais sem validação adequada.",
      "Foi identificado que o parâmetro [parâmetro] permite manipular o caminho de arquivo processado pela aplicação, expondo conteúdo local ou comportamento não previsto."
    ),
    impacto: impact(
      [
        "Leitura de arquivos internos do servidor, logs ou configurações.",
        "Exposição de credenciais, chaves e variáveis armazenadas em arquivos locais.",
        "Possível encadeamento com upload, logs ou wrappers para ampliar o impacto."
      ],
      [
        "Vazamento de dados internos e segredos operacionais.",
        "Aumento de risco de comprometimento da infraestrutura.",
        "Impacto reputacional e regulatório se houver exposição de dados pessoais."
      ]
    ),
    reparo: remediation([
      "Não aceitar caminhos de arquivo diretamente do usuário.",
      "Mapear identificadores permitidos para arquivos internos conhecidos.",
      "Normalizar caminhos e bloquear traversal antes do acesso ao sistema de arquivos.",
      "Restringir permissões do processo e isolar diretórios acessíveis.",
      "Desabilitar wrappers, includes remotos ou recursos equivalentes quando não forem necessários."
    ]),
    poc: poc([
      "Identificar o parâmetro [parâmetro] que referencia arquivo ou template.",
      "Enviar uma entrada controlada para validar leitura de arquivo permitido pelo escopo.",
      "Registrar a resposta que demonstra acesso indevido ao conteúdo local.",
      "Ofuscar caminhos, usuários e segredos exibidos na evidência."
    ]),
    pocLegenda:
      "Figura: Leitura de arquivo local por manipulação do parâmetro [parâmetro].",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/www-community/attacks/Path_Traversal",
      "https://portswigger.net/web-security/file-path-traversal",
      "https://cwe.mitre.org/data/definitions/22.html"
    ),
  },
  {
    value: "Remote File Inclusion (RFI)",
    label: "Remote File Inclusion (RFI)",
    titulo:
      "Parâmetro [parâmetro] permite inclusão de recurso remoto não confiável",
    categoria: "A03: Injection",
    subcategoria: "Remote File Inclusion",
    owasp: "OWASP Top 10 2021 - A03: Injection",
    cwe: "CWE-98",
    desc: description(
      "Remote File Inclusion ocorre quando a aplicação carrega arquivos ou recursos remotos a partir de entrada controlada pelo usuário.",
      "Foi observado que o parâmetro [parâmetro] aceita referência externa, permitindo que conteúdo fora do domínio confiável seja processado pela aplicação."
    ),
    impacto: impact(
      [
        "Processamento de conteúdo remoto não confiável pelo servidor ou aplicação.",
        "Possível execução de código, vazamento de dados ou alteração de comportamento, conforme tecnologia utilizada.",
        "Uso da aplicação como ponte para acessar recursos externos ou internos."
      ],
      [
        "Comprometimento da aplicação e perda de integridade do serviço.",
        "Risco de indisponibilidade ou abuso da infraestrutura.",
        "Danos reputacionais caso conteúdo malicioso seja carregado no contexto da organização."
      ]
    ),
    reparo: remediation([
      "Remover suporte a inclusão de URLs fornecidas pelo usuário.",
      "Utilizar lista de permissões de recursos internos e identificadores controlados.",
      "Bloquear protocolos perigosos e validar domínio, esquema e caminho quando recurso remoto for indispensável.",
      "Executar validação no servidor e aplicar timeouts e limites de tamanho.",
      "Monitorar tentativas de carregar recursos externos inesperados."
    ]),
    poc: poc([
      "Identificar o parâmetro [parâmetro] que referencia o recurso carregado.",
      "Enviar URL controlada dentro do escopo autorizado.",
      "Registrar a requisição recebida no recurso controlado ou a resposta da aplicação.",
      "Documentar domínio, data, hora e evidência sem hospedar conteúdo destrutivo."
    ]),
    pocLegenda:
      "Figura: Inclusão de recurso remoto controlado pelo parâmetro [parâmetro].",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/www-community/vulnerabilities/PHP_File_Inclusion",
      "https://cwe.mitre.org/data/definitions/98.html"
    ),
  },
  {
    value: "Server-side request forgery (SSRF)",
    label: "Server-Side Request Forgery (SSRF)",
    titulo:
      "Funcionalidade [funcionalidade] permite requisições server-side para destinos controlados",
    categoria: "A10: Server-Side Request Forgery",
    subcategoria: "SSRF",
    owasp: "OWASP Top 10 2021 - A10: Server-Side Request Forgery",
    cwe: "CWE-918",
    desc: description(
      "SSRF ocorre quando a aplicação realiza requisições a URLs ou hosts definidos pelo usuário sem validação suficiente.",
      "Foi identificado que a funcionalidade [funcionalidade] permite induzir o servidor a acessar destinos controlados ou não previstos pelo fluxo de negócio."
    ),
    impacto: impact(
      [
        "Acesso indireto a serviços internos, metadados de nuvem ou endpoints não expostos publicamente.",
        "Enumeração de rede interna por diferenças de resposta, tempo ou erro.",
        "Possível vazamento de credenciais temporárias ou informações administrativas em ambientes mal configurados."
      ],
      [
        "Comprometimento de dados internos e serviços de infraestrutura.",
        "Risco de acesso indevido a ambientes de nuvem e movimentação lateral.",
        "Impacto financeiro e operacional por abuso de integrações internas."
      ]
    ),
    reparo: remediation([
      "Permitir apenas destinos estritamente necessários por lista de permissões.",
      "Bloquear endereços privados, loopback, link-local e metadados de nuvem.",
      "Resolver DNS e validar o IP final antes da conexão, mitigando DNS rebinding.",
      "Aplicar egress filtering em rede e timeouts curtos para requisições server-side.",
      "Evitar retornar ao usuário erros detalhados de conexão interna."
    ]),
    poc: poc([
      "Informar uma URL controlada no campo [campo/endpoint].",
      "Confirmar que o servidor realizou a requisição para o destino controlado.",
      "Testar apenas destinos autorizados no escopo, evitando impacto em serviços internos sensíveis.",
      "Anexar logs do servidor controlado, data, hora e origem observada."
    ]),
    pocLegenda:
      "Figura: Requisição realizada pelo servidor para destino controlado.",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/",
      "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html",
      "https://portswigger.net/web-security/ssrf",
      "https://cwe.mitre.org/data/definitions/918.html"
    ),
  },
  {
    value: "Open Redirect",
    label: "Open Redirect",
    titulo:
      "Parâmetro [parâmetro] permite redirecionamento para domínio externo",
    categoria: "A01: Broken Access Control",
    subcategoria: "Open Redirect",
    owasp: "OWASP Top 10 2021 - A01: Broken Access Control",
    cwe: "CWE-601",
    desc: description(
      "Open Redirect ocorre quando a aplicação redireciona usuários para URLs fornecidas pelo cliente sem validação adequada.",
      "Foi verificado que o parâmetro [parâmetro] aceita domínio externo e redireciona o usuário para fora do ambiente confiável."
    ),
    impacto: impact(
      [
        "Uso de domínio legítimo como ponto inicial para campanhas de phishing.",
        "Bypass de validações que confiam no domínio da aplicação.",
        "Encadeamento com fluxos de autenticação, OAuth ou recuperação de senha quando presentes."
      ],
      [
        "Aumento da credibilidade de golpes contra clientes e colaboradores.",
        "Danos à reputação da marca por associação a páginas fraudulentas.",
        "Possível impacto financeiro por fraude e roubo de credenciais."
      ]
    ),
    reparo: remediation([
      "Permitir redirecionamento somente para caminhos internos ou domínios em lista de permissões.",
      "Validar esquema, host e normalização da URL antes do redirecionamento.",
      "Evitar usar parâmetros arbitrários de retorno em fluxos sensíveis.",
      "Exibir confirmação ao usuário antes de sair para domínio externo quando necessário.",
      "Adicionar testes para variações de URL absoluta, relativa, codificada e com barras duplicadas."
    ]),
    poc: poc([
      "Acessar a URL [URL] com o parâmetro [parâmetro].",
      "Alterar o destino para um domínio controlado e autorizado.",
      "Registrar o redirecionamento realizado pela aplicação.",
      "Anexar captura da URL inicial e do destino final."
    ]),
    pocLegenda:
      "Figura: Redirecionamento para domínio externo por manipulação do parâmetro [parâmetro].",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html",
      "https://portswigger.net/kb/issues/00500100_open-redirection-reflected",
      "https://cwe.mitre.org/data/definitions/601.html"
    ),
  },
  {
    value: "XXE",
    label: "XML External Entity (XXE)",
    titulo:
      "Parser XML permite processamento de entidade externa na funcionalidade [funcionalidade]",
    categoria: "A05: Security Misconfiguration",
    subcategoria: "XML External Entity",
    owasp: "OWASP Top 10 2021 - A05: Security Misconfiguration",
    cwe: "CWE-611",
    desc: description(
      "XML External Entity (XXE) ocorre quando um parser XML processa entidades externas ou DTDs de forma insegura.",
      "Foi observado que a funcionalidade [funcionalidade] aceita XML controlado pelo usuário e permite comportamento compatível com resolução de entidade externa."
    ),
    impacto: impact(
      [
        "Leitura de arquivos locais acessíveis pelo processo da aplicação.",
        "Possível SSRF para serviços internos, dependendo do parser e da rede.",
        "Exfiltração parcial de dados ou indisponibilidade por expansão de entidades."
      ],
      [
        "Exposição de segredos, configurações e dados internos.",
        "Risco de comprometimento de infraestrutura por acesso indireto a serviços internos.",
        "Impacto regulatório e reputacional caso dados sensíveis sejam divulgados."
      ]
    ),
    reparo: remediation([
      "Desabilitar DTDs e resolução de entidades externas no parser XML.",
      "Utilizar bibliotecas atualizadas e configurações seguras por padrão.",
      "Validar XML por schema quando a entrada XML for necessária.",
      "Aplicar egress filtering e bloquear acesso do serviço a recursos internos desnecessários.",
      "Registrar tentativas de uso de DTD, ENTITY ou padrões XML anômalos."
    ]),
    poc: poc([
      "Enviar XML controlado na funcionalidade [funcionalidade].",
      "Validar comportamento de resolução usando destino controlado ou arquivo permitido pelo escopo.",
      "Registrar a resposta, erro ou requisição externa observada.",
      "Ofuscar qualquer conteúdo sensível retornado pelo parser."
    ]),
    pocLegenda:
      "Figura: Comportamento compatível com processamento de entidade externa.",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/www-community/vulnerabilities/XML_External_Entity_%28XXE%29_Processing",
      "https://portswigger.net/web-security/xxe",
      "https://cwe.mitre.org/data/definitions/611.html"
    ),
  },
  {
    value: "Insecure File Upload",
    label: "Insecure File Upload",
    titulo:
      "Funcionalidade [funcionalidade] permite upload de arquivo inseguro",
    categoria: "A05: Security Misconfiguration",
    subcategoria: "Upload inseguro",
    owasp: "OWASP Top 10 2021 - A05: Security Misconfiguration",
    cwe: "CWE-434",
    desc: description(
      "Upload inseguro ocorre quando a aplicação aceita arquivos sem validação robusta de tipo, extensão, conteúdo, tamanho ou local de armazenamento.",
      "Foi identificado que a funcionalidade [funcionalidade] permite enviar arquivo com característica não permitida ou armazená-lo de forma acessível e insegura."
    ),
    impacto: impact(
      [
        "Armazenamento de arquivos maliciosos, scripts ou conteúdo não autorizado.",
        "Possível execução no servidor se o arquivo for processado por interpretador ou servido de diretório executável.",
        "Consumo de armazenamento ou abuso da aplicação para distribuição de conteúdo indevido."
      ],
      [
        "Comprometimento da aplicação ou hospedagem de conteúdo malicioso sob domínio legítimo.",
        "Risco de incidentes de marca, fraude e bloqueio por mecanismos de reputação.",
        "Custos operacionais por armazenamento excessivo ou resposta a abuso."
      ]
    ),
    reparo: remediation([
      "Validar extensão, MIME type e assinatura do arquivo no servidor.",
      "Armazenar uploads fora do diretório público e servir por controlador seguro.",
      "Renomear arquivos, remover metadados desnecessários e aplicar limites de tamanho.",
      "Bloquear execução de arquivos em diretórios de upload.",
      "Analisar arquivos com mecanismos de segurança compatíveis com o risco do negócio."
    ]),
    poc: poc([
      "Acessar a funcionalidade de upload [funcionalidade].",
      "Enviar arquivo de teste com extensão, MIME ou conteúdo incompatível com a política esperada.",
      "Registrar se o arquivo foi aceito, armazenado, executado ou disponibilizado publicamente.",
      "Anexar captura do envio e do acesso ao arquivo armazenado."
    ]),
    pocLegenda:
      "Figura: Arquivo não permitido aceito pela funcionalidade de upload.",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html",
      "https://portswigger.net/web-security/file-upload",
      "https://cwe.mitre.org/data/definitions/434.html"
    ),
  },
  {
    value: "Path Traversal",
    label: "Path Traversal",
    titulo:
      "Parâmetro [parâmetro] permite manipulação de caminho de arquivo",
    categoria: "A01: Broken Access Control",
    subcategoria: "Path Traversal",
    owasp: "OWASP Top 10 2021 - A01: Broken Access Control",
    cwe: "CWE-22",
    desc: description(
      "Path Traversal ocorre quando a aplicação usa entrada do usuário para montar caminhos e permite sair do diretório esperado.",
      "Foi identificado que o parâmetro [parâmetro] permite alterar o caminho processado, possibilitando acesso a arquivos fora do diretório previsto."
    ),
    impacto: impact(
      [
        "Leitura de arquivos internos, configurações e logs.",
        "Possível acesso a arquivos de outros usuários ou tenants.",
        "Apoio a exploração encadeada caso arquivos sensíveis revelem credenciais."
      ],
      [
        "Exposição de informações sensíveis e segredos operacionais.",
        "Comprometimento de privacidade de usuários afetados.",
        "Impacto reputacional e regulatório por acesso indevido a dados."
      ]
    ),
    reparo: remediation([
      "Substituir caminhos informados pelo usuário por identificadores internos controlados.",
      "Normalizar e validar o caminho final antes de abrir o arquivo.",
      "Restringir acesso a um diretório base e negar qualquer saída desse diretório.",
      "Aplicar controles de autorização por arquivo ou objeto.",
      "Evitar mensagens de erro que revelem caminhos internos."
    ]),
    poc: poc([
      "Identificar endpoint ou parâmetro que recebe nome de arquivo.",
      "Enviar variação controlada para tentar acessar arquivo fora do diretório esperado.",
      "Registrar a resposta que comprova leitura ou tentativa de acesso indevida.",
      "Ofuscar conteúdo sensível exibido na resposta."
    ]),
    pocLegenda:
      "Figura: Acesso a arquivo fora do diretório esperado pelo parâmetro [parâmetro].",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/www-community/attacks/Path_Traversal",
      "https://portswigger.net/web-security/file-path-traversal",
      "https://cwe.mitre.org/data/definitions/22.html"
    ),
  },
  {
    value: "Denial-of-service (DoS)",
    label: "Denial of Service (DoS)",
    titulo:
      "Funcionalidade [funcionalidade] pode causar indisponibilidade ou consumo excessivo de recursos",
    categoria: "A05: Security Misconfiguration",
    subcategoria: "Denial of Service",
    owasp: "OWASP Top 10 2021 - A05: Security Misconfiguration",
    cwe: "CWE-400",
    desc: description(
      "Denial of Service ocorre quando uma aplicação pode ter seus recursos esgotados ou sua disponibilidade afetada por entradas, volume ou operações não controladas.",
      "Foi identificado que a funcionalidade [funcionalidade] não possui limites suficientes para [tipo de recurso], permitindo degradação observável durante teste controlado."
    ),
    impacto: impact(
      [
        "Consumo excessivo de CPU, memória, banco de dados, armazenamento ou filas.",
        "Lentidão, erros intermitentes ou indisponibilidade parcial da aplicação.",
        "Possível impacto em outros serviços compartilhados."
      ],
      [
        "Interrupção de jornadas críticas de clientes e colaboradores.",
        "Perda de receita, aumento de chamados e descumprimento de SLA.",
        "Dano à confiança no serviço em períodos de pico ou campanhas."
      ]
    ),
    reparo: remediation([
      "Aplicar rate limiting, quotas e limites de tamanho por usuário, IP e funcionalidade.",
      "Definir timeouts, paginação e limites de processamento em operações custosas.",
      "Usar filas e processamento assíncrono com controle de concorrência.",
      "Adicionar monitoramento e alertas para consumo anômalo de recursos.",
      "Executar testes de carga autorizados após a correção."
    ]),
    poc: poc([
      "Identificar a funcionalidade [funcionalidade] e o recurso impactado.",
      "Executar teste controlado com volume limitado e previamente autorizado.",
      "Registrar métricas observáveis, tempo de resposta, erros ou degradação.",
      "Interromper o teste ao primeiro sinal de impacto fora do esperado."
    ]),
    pocLegenda:
      "Figura: Degradação observada na funcionalidade [funcionalidade].",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/www-community/attacks/Denial_of_Service",
      "https://cwe.mitre.org/data/definitions/400.html"
    ),
  },
  {
    value: "Email Spoofing",
    label: "Email Spoofing",
    titulo:
      "Domínio [domínio] permite falsificação de remetente por falha em SPF/DKIM/DMARC",
    categoria: "A05: Security Misconfiguration",
    subcategoria: "Email Spoofing",
    owasp: "OWASP Top 10 2021 - A05: Security Misconfiguration",
    cwe: "CWE-290",
    desc: description(
      "Email Spoofing é a falsificação do endereço do remetente para que uma mensagem aparente ter sido enviada por domínio ou usuário legítimo.",
      "Foi verificado que o domínio [domínio] não possui SPF, DKIM e/ou DMARC configurados de forma restritiva e alinhada, permitindo abuso em mensagens fraudulentas."
    ),
    impacto: impact(
      [
        "Envio de mensagens com aparência legítima em nome da organização.",
        "Aumento da efetividade de phishing, fraude financeira e roubo de credenciais.",
        "Redução de rastreabilidade e dificuldade para destinatários diferenciarem mensagens legítimas de falsas."
      ],
      [
        "Danos à reputação do domínio e da marca.",
        "Prejuízos financeiros por engenharia social contra clientes, parceiros ou colaboradores.",
        "Possível queda de entregabilidade de e-mails legítimos após abuso do domínio."
      ]
    ),
    reparo: remediation([
      "Mapear todos os serviços autorizados a enviar e-mails pelo domínio.",
      "Configurar SPF com origens estritamente necessárias e política restritiva após validação.",
      "Habilitar DKIM em todos os remetentes e rotacionar chaves periodicamente.",
      "Publicar DMARC com relatórios e evoluir de p=none para p=quarantine ou p=reject.",
      "Aplicar política também a subdomínios e monitorar falhas de autenticação."
    ]),
    poc: poc([
      "Enviar mensagem de teste autorizada usando o domínio [domínio] no campo From a partir de infraestrutura não autorizada.",
      "Registrar se a mensagem foi aceita ou entregue ao destinatário de teste.",
      "Anexar cabeçalhos completos, Authentication-Results, Message-ID, data e hora.",
      "Ofuscar endereços pessoais e manter apenas dados necessários à validação."
    ]),
    pocLegenda:
      "Figura: Mensagem entregue com remetente falsificado do domínio [domínio].",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://datatracker.ietf.org/doc/html/rfc7208",
      "https://datatracker.ietf.org/doc/html/rfc6376",
      "https://datatracker.ietf.org/doc/html/rfc7489"
    ),
  },
  {
    value: "Missing Security Headers",
    label: "Missing Security Headers",
    titulo:
      "Ausência de cabeçalhos de segurança na aplicação [aplicação]",
    categoria: "A05: Security Misconfiguration",
    subcategoria: "Security Headers",
    owasp: "OWASP Top 10 2021 - A05: Security Misconfiguration",
    cwe: "CWE-693",
    desc: description(
      "Cabeçalhos de segurança orientam o navegador a aplicar proteções adicionais contra ataques como clickjacking, XSS, downgrade de HTTPS e exposição de informações.",
      "Foi identificado que a aplicação [aplicação] não retorna um ou mais cabeçalhos recomendados, reduzindo as camadas defensivas do cliente web."
    ),
    impacto: impact(
      [
        "Aumento da exposição a ataques client-side e exploração encadeada.",
        "Ausência de políticas de proteção contra carregamento indevido, sniffing de conteúdo ou uso inseguro de transporte.",
        "Menor capacidade de contenção caso outra falha, como XSS, seja explorada."
      ],
      [
        "Elevação do risco residual da aplicação mesmo quando não há exploração direta isolada.",
        "Maior probabilidade de impacto em usuários finais em ataques combinados.",
        "Percepção de baixa maturidade de hardening em auditorias e avaliações externas."
      ]
    ),
    reparo: remediation([
      "Configurar Content-Security-Policy adequada ao funcionamento da aplicação.",
      "Adicionar X-Frame-Options ou frame-ancestors na CSP para restringir enquadramento.",
      "Utilizar X-Content-Type-Options: nosniff.",
      "Aplicar Strict-Transport-Security em domínios servidos exclusivamente por HTTPS.",
      "Revisar Referrer-Policy e Permissions-Policy conforme necessidade do negócio."
    ]),
    poc: poc([
      "Realizar requisição HTTP para [URL].",
      "Registrar os cabeçalhos de resposta retornados pelo servidor.",
      "Indicar quais cabeçalhos recomendados estão ausentes ou permissivos.",
      "Anexar evidência da resposta HTTP ou ferramenta de validação utilizada."
    ]),
    pocLegenda:
      "Figura: Resposta HTTP sem cabeçalhos de segurança recomendados.",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/www-project-secure-headers/",
      "https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html",
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers"
    ),
  },
  {
    value: "Clickjacking",
    label: "Clickjacking",
    titulo:
      "Página [página] pode ser carregada em iframe por domínio externo",
    categoria: "A05: Security Misconfiguration",
    subcategoria: "Clickjacking",
    owasp: "OWASP Top 10 2021 - A05: Security Misconfiguration",
    cwe: "CWE-1021",
    desc: description(
      "Clickjacking ocorre quando uma página sensível pode ser renderizada em iframe por um domínio externo, permitindo induzir o usuário a interagir com a aplicação sem perceber.",
      "Foi identificado que a página [página] não possui proteção adequada contra enquadramento, como frame-ancestors ou X-Frame-Options."
    ),
    impacto: impact(
      [
        "Possibilidade de induzir usuário autenticado a clicar em elementos sensíveis.",
        "Execução de ações não intencionais no contexto da sessão da vítima.",
        "Encadeamento com engenharia social em fluxos administrativos ou financeiros."
      ],
      [
        "Fraudes ou alterações indevidas realizadas por usuários legítimos enganados.",
        "Dano à confiança no sistema e aumento de incidentes de suporte.",
        "Risco de impacto financeiro dependendo das ações disponíveis na página afetada."
      ]
    ),
    reparo: remediation([
      "Configurar Content-Security-Policy com frame-ancestors restritivo.",
      "Adicionar X-Frame-Options: DENY ou SAMEORIGIN quando compatível.",
      "Evitar ações críticas com apenas um clique e exigir confirmação contextual.",
      "Revisar páginas autenticadas e fluxos sensíveis para garantir proteção consistente.",
      "Validar a correção em navegadores modernos e ambientes legados suportados."
    ]),
    poc: poc([
      "Criar página de teste autorizada com iframe apontando para [página].",
      "Carregar a página afetada dentro do iframe.",
      "Registrar que o conteúdo foi exibido e permaneceu interativo.",
      "Anexar captura demonstrando o iframe e os cabeçalhos ausentes."
    ]),
    pocLegenda:
      "Figura: Página [página] renderizada em iframe externo.",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/www-community/attacks/Clickjacking",
      "https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html",
      "https://cwe.mitre.org/data/definitions/1021.html"
    ),
  },
  {
    value: "CORS Misconfiguration",
    label: "CORS Misconfiguration",
    titulo:
      "Política CORS permissiva no endpoint [endpoint]",
    categoria: "A05: Security Misconfiguration",
    subcategoria: "CORS permissivo",
    owasp: "OWASP Top 10 2021 - A05: Security Misconfiguration",
    cwe: "CWE-942",
    desc: description(
      "Configuração inadequada de CORS ocorre quando a aplicação permite origens externas de forma ampla ou reflete a origem enviada pelo cliente sem validação segura.",
      "Foi identificado que o endpoint [endpoint] retorna cabeçalhos CORS permissivos, possibilitando leitura de respostas por páginas hospedadas em domínios não confiáveis em determinadas condições."
    ),
    impacto: impact(
      [
        "Leitura de respostas autenticadas por origem externa caso credenciais sejam permitidas.",
        "Exposição de dados sensíveis consumidos por APIs do navegador da vítima.",
        "Possível encadeamento com XSS ou engenharia social para abuso de sessão."
      ],
      [
        "Vazamento de informações de usuários para domínios não autorizados.",
        "Aumento do risco de fraude e comprometimento de privacidade.",
        "Risco regulatório quando dados pessoais são expostos."
      ]
    ),
    reparo: remediation([
      "Definir lista explícita de origens confiáveis, sem curingas para endpoints autenticados.",
      "Não combinar Access-Control-Allow-Origin amplo com Access-Control-Allow-Credentials: true.",
      "Validar a origem no servidor e evitar reflexão automática do cabeçalho Origin.",
      "Restringir métodos e cabeçalhos permitidos ao mínimo necessário.",
      "Adicionar testes para origens nulas, subdomínios similares e esquemas diferentes."
    ]),
    poc: poc([
      "Enviar requisição ao endpoint [endpoint] com Origin controlado.",
      "Registrar os cabeçalhos Access-Control-Allow-Origin e Access-Control-Allow-Credentials.",
      "Validar se a resposta pode ser lida por uma origem não autorizada.",
      "Anexar captura da requisição, resposta e origem utilizada."
    ]),
    pocLegenda:
      "Figura: Endpoint [endpoint] aceitando origem CORS não autorizada.",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://portswigger.net/web-security/cors",
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS",
      "https://cwe.mitre.org/data/definitions/942.html"
    ),
  },
  {
    value: "Weak Password Policy",
    label: "Weak Password Policy",
    titulo:
      "Política de senha fraca no fluxo [cadastro/alteração de senha]",
    categoria: "A07: Identification and Authentication Failures",
    subcategoria: "Política de senha",
    owasp:
      "OWASP Top 10 2021 - A07: Identification and Authentication Failures",
    cwe: "CWE-521",
    desc: description(
      "Política de senha fraca ocorre quando a aplicação aceita credenciais triviais, curtas, previsíveis ou presentes em listas de senhas comprometidas.",
      "Foi identificado que o fluxo [fluxo] aceita senha com complexidade insuficiente ou sem validações compatíveis com o risco da aplicação."
    ),
    impacto: impact(
      [
        "Aumento da probabilidade de comprometimento de contas por adivinhação, credential stuffing ou força bruta.",
        "Maior sucesso em ataques automatizados com senhas comuns.",
        "Possível escalonamento caso contas privilegiadas também sejam afetadas."
      ],
      [
        "Fraudes, acesso indevido a dados e aumento de chamados por contas comprometidas.",
        "Danos à confiança dos usuários e parceiros.",
        "Risco de impacto regulatório se contas comprometidas expuserem dados pessoais."
      ]
    ),
    reparo: remediation([
      "Exigir tamanho mínimo adequado e bloquear senhas comuns ou previamente comprometidas.",
      "Incentivar frases de senha longas em vez de regras de composição frágeis.",
      "Implementar MFA para contas sensíveis e fluxos críticos.",
      "Aplicar rate limiting e monitoramento em autenticação e alteração de senha.",
      "Armazenar senhas com algoritmo de hashing adequado, salt único e custo configurado."
    ]),
    poc: poc([
      "Acessar o fluxo [cadastro/alteração de senha].",
      "Submeter senha fraca controlada, como senha curta ou presente em lista comum.",
      "Registrar que a aplicação aceitou a credencial sem alerta ou bloqueio.",
      "Anexar captura do aceite, sem expor senha real de usuário."
    ]),
    pocLegenda:
      "Figura: Fluxo [fluxo] aceitando senha com complexidade insuficiente.",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
      "https://pages.nist.gov/800-63-3/sp800-63b.html",
      "https://cwe.mitre.org/data/definitions/521.html"
    ),
  },
  {
    value: "Missing Rate Limiting",
    label: "Missing Rate Limiting",
    titulo:
      "Ausência de limitação de tentativas no fluxo [fluxo]",
    categoria: "A07: Identification and Authentication Failures",
    subcategoria: "Rate limiting ausente",
    owasp:
      "OWASP Top 10 2021 - A07: Identification and Authentication Failures",
    cwe: "CWE-307",
    desc: description(
      "Ausência de rate limiting permite que um atacante realize grande volume de tentativas contra autenticação, recuperação de senha, tokens, cupons ou outras funcionalidades sensíveis.",
      "Foi identificado que o fluxo [fluxo] aceita múltiplas requisições consecutivas sem bloqueio, atraso progressivo, captcha adaptativo ou monitoramento efetivo."
    ),
    impacto: impact(
      [
        "Facilitação de ataques de força bruta, enumeração, credential stuffing ou abuso de recursos.",
        "Aumento de carga sobre a aplicação e serviços dependentes.",
        "Possível descoberta de tokens, códigos ou credenciais válidas quando combinada com respostas diferenciadas."
      ],
      [
        "Comprometimento de contas e aumento de fraudes.",
        "Custos operacionais por abuso de recursos, SMS, e-mail ou APIs terceiras.",
        "Indisponibilidade parcial e degradação da experiência de usuários legítimos."
      ]
    ),
    reparo: remediation([
      "Aplicar rate limiting por usuário, IP, dispositivo, fingerprint e contexto de negócio.",
      "Usar bloqueio temporário, backoff progressivo e alertas para tentativas anômalas.",
      "Normalizar mensagens de erro para evitar enumeração.",
      "Adicionar controles específicos para endpoints de login, MFA, recuperação de senha e cupons.",
      "Monitorar métricas de abuso e ajustar limites com base no comportamento real."
    ]),
    poc: poc([
      "Selecionar o fluxo [fluxo] e definir volume seguro de teste.",
      "Enviar múltiplas requisições consecutivas dentro do limite autorizado.",
      "Registrar ausência de bloqueio, atraso ou alerta perceptível.",
      "Anexar evidência com quantidade de requisições, janela de tempo e respostas observadas."
    ]),
    pocLegenda:
      "Figura: Múltiplas tentativas aceitas sem limitação no fluxo [fluxo].",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
      "https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/",
      "https://cwe.mitre.org/data/definitions/307.html"
    ),
  },
  {
    value: "Weak TLS/SSL Configuration",
    label: "Weak TLS/SSL Configuration",
    titulo:
      "Configuração TLS fraca no serviço [serviço/domínio]",
    categoria: "A02: Cryptographic Failures",
    subcategoria: "TLS/SSL fraco",
    owasp: "OWASP Top 10 2021 - A02: Cryptographic Failures",
    cwe: "CWE-326",
    desc: description(
      "Configuração TLS fraca ocorre quando um serviço aceita protocolos obsoletos, cifras inseguras, certificados inválidos ou parâmetros criptográficos incompatíveis com boas práticas.",
      "Foi identificado que o serviço [serviço/domínio] apresenta configuração TLS que reduz a segurança do canal de comunicação."
    ),
    impacto: impact(
      [
        "Possível exposição a ataques de downgrade, interceptação ou quebra de confidencialidade em cenários específicos.",
        "Falha de compatibilidade com padrões modernos de segurança e conformidade.",
        "Risco de confiança indevida caso certificados estejam expirados, incorretos ou incompletos."
      ],
      [
        "Exposição de dados trafegados entre usuários e aplicação.",
        "Impacto em auditorias, requisitos contratuais e conformidade.",
        "Danos à confiança de clientes ao acessar serviços com alerta de segurança."
      ]
    ),
    reparo: remediation([
      "Desabilitar SSLv2, SSLv3, TLS 1.0 e TLS 1.1, mantendo TLS 1.2 e TLS 1.3.",
      "Remover cifras fracas, anônimas, export ou sem sigilo futuro.",
      "Configurar certificado válido, cadeia completa e renovação automatizada.",
      "Habilitar HSTS quando o domínio operar exclusivamente em HTTPS.",
      "Reavaliar a configuração com ferramenta de validação após mudanças."
    ]),
    poc: poc([
      "Executar validação TLS autorizada no host [host] e porta [porta].",
      "Registrar protocolos, cifras e certificado aceitos pelo serviço.",
      "Destacar itens obsoletos ou inseguros encontrados.",
      "Anexar saída da ferramenta com data, hora e alvo avaliado."
    ]),
    pocLegenda:
      "Figura: Validação TLS indicando configuração criptográfica fraca.",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html",
      "https://cwe.mitre.org/data/definitions/326.html",
      "https://www.rfc-editor.org/rfc/rfc9325"
    ),
  },
  {
    value: "Subdomain Takeover",
    label: "Subdomain Takeover",
    titulo:
      "Subdomínio [subdomínio] aponta para serviço externo não reivindicado",
    categoria: "A05: Security Misconfiguration",
    subcategoria: "Subdomain Takeover",
    owasp: "OWASP Top 10 2021 - A05: Security Misconfiguration",
    cwe: "CWE-350",
    desc: description(
      "Subdomain Takeover ocorre quando um registro DNS aponta para serviço externo que não está mais configurado ou reivindicado pela organização.",
      "Foi identificado que o subdomínio [subdomínio] possui apontamento para [provedor/serviço] com indícios de recurso não reivindicado."
    ),
    impacto: impact(
      [
        "Possibilidade de hospedar conteúdo sob subdomínio legítimo da organização.",
        "Abuso para phishing, distribuição de malware, captura de cookies ou manipulação de confiança.",
        "Risco aumentado quando o subdomínio participa de integrações, OAuth, CORS ou cookies compartilhados."
      ],
      [
        "Danos severos à reputação e confiança no domínio corporativo.",
        "Fraudes contra clientes e colaboradores usando identidade visual legítima.",
        "Possível impacto jurídico e regulatório se dados forem coletados por página fraudulenta."
      ]
    ),
    reparo: remediation([
      "Remover registros DNS que apontam para serviços desativados ou não utilizados.",
      "Reivindicar o recurso no provedor externo antes de publicar o apontamento DNS.",
      "Inventariar subdomínios e revisar periodicamente CNAMEs e integrações externas.",
      "Evitar escopo amplo de cookies entre subdomínios quando não necessário.",
      "Monitorar alterações DNS e mensagens de erro típicas de recursos não reivindicados."
    ]),
    poc: poc([
      "Resolver o DNS do subdomínio [subdomínio].",
      "Registrar o apontamento para o serviço externo [provedor].",
      "Capturar a mensagem ou comportamento que indica recurso não reivindicado.",
      "Não reivindicar ou publicar conteúdo no serviço sem autorização explícita."
    ]),
    pocLegenda:
      "Figura: Subdomínio [subdomínio] apontando para recurso externo não reivindicado.",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/01-Information_Gathering/10-Map_Application_Architecture",
      "https://cwe.mitre.org/data/definitions/350.html"
    ),
  },
  {
    value: "Default Credentials",
    label: "Default Credentials",
    titulo:
      "Serviço [serviço] acessível com credenciais padrão ou previsíveis",
    categoria: "A07: Identification and Authentication Failures",
    subcategoria: "Credenciais padrão",
    owasp:
      "OWASP Top 10 2021 - A07: Identification and Authentication Failures",
    cwe: "CWE-798",
    desc: description(
      "Credenciais padrão ou previsíveis representam falha de autenticação em que contas conhecidas, iniciais ou fracas permanecem válidas em ambiente acessível.",
      "Foi identificado que o serviço [serviço] permite autenticação com credenciais padrão, compartilhadas ou facilmente previsíveis durante teste autorizado."
    ),
    impacto: impact(
      [
        "Acesso não autorizado ao painel, serviço ou equipamento afetado.",
        "Alteração de configurações, leitura de dados e possível escalonamento de privilégios.",
        "Uso do serviço como ponto inicial para movimentação lateral."
      ],
      [
        "Comprometimento de sistemas críticos por falha básica de autenticação.",
        "Exposição de dados e risco de interrupção operacional.",
        "Dano reputacional por ausência de hardening mínimo."
      ]
    ),
    reparo: remediation([
      "Alterar credenciais padrão antes da publicação do serviço.",
      "Desabilitar ou remover contas de instalação, teste e demonstração.",
      "Exigir senhas únicas, fortes e rotação controlada para contas privilegiadas.",
      "Habilitar MFA quando disponível, especialmente em painéis administrativos.",
      "Restringir acesso por rede, VPN ou allowlist quando o serviço não deve ser público."
    ]),
    poc: poc([
      "Identificar o serviço [serviço] e a tela de autenticação.",
      "Realizar tentativa única e controlada com credencial padrão conhecida ou fornecida no escopo.",
      "Registrar o acesso concedido e o nível de permissão observado.",
      "Não alterar configurações nem acessar dados além do necessário para comprovar a falha."
    ]),
    pocLegenda:
      "Figura: Autenticação bem-sucedida no serviço [serviço] com credencial padrão.",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/",
      "https://cwe.mitre.org/data/definitions/798.html"
    ),
  },
  {
    value: "Leaked Credentials",
    label: "Leaked Credentials",
    titulo:
      "Credenciais associadas a [domínio/organização] identificadas em bases vazadas",
    categoria: "A07: Identification and Authentication Failures",
    subcategoria: "Credenciais vazadas em bases de vazamento",
    owasp:
      "OWASP Top 10 2021 - A07: Identification and Authentication Failures",
    cwe: "CWE-522",
    desc: description(
      "Credenciais vazadas em bases de dados comprometidas ocorrem quando e-mails, usuários, senhas, hashes ou outros autenticadores aparecem em coleções oriundas de incidentes, stealer logs, dumps ou databases comercializadas em fóruns e ambientes da deep web.",
      "Foi identificado que credenciais relacionadas a [domínio/organização] constam em [base vazada/fonte], indicando risco de acesso indevido caso as senhas ainda estejam ativas, reutilizadas ou associadas a contas corporativas."
    ),
    impacto: impact(
      [
        "Possibilidade de acesso não autorizado por credential stuffing, password spraying ou tentativa direta contra serviços corporativos.",
        "Risco de comprometimento de contas caso usuários reutilizem a mesma senha em VPN, e-mail, SSO, painéis administrativos ou aplicações internas.",
        "Potencial movimentação lateral, abuso de sessões e acesso a dados sensíveis conforme permissões das contas afetadas."
      ],
      [
        "Comprometimento de contas de colaboradores, clientes ou administradores.",
        "Risco de fraudes, vazamento de informações e acesso indevido a ambientes corporativos.",
        "Impacto reputacional, regulatório e financeiro caso credenciais válidas sejam utilizadas por terceiros."
      ]
    ),
    reparo: remediation([
      "Forçar troca de senha das contas afetadas e invalidar sessões, tokens e refresh tokens associados.",
      "Verificar se as credenciais aparecem em serviços internos, VPN, e-mail, SSO, aplicações administrativas ou integrações críticas.",
      "Habilitar MFA para contas corporativas, principalmente contas privilegiadas e acessos remotos.",
      "Bloquear senhas previamente comprometidas nos fluxos de cadastro, troca e recuperação de senha.",
      "Monitorar tentativas de credential stuffing, password spraying, login de localização anômala e autenticações falhas em volume elevado.",
      "Orientar usuários afetados sobre reutilização de senha e revisar contas com privilégios excessivos."
    ]),
    poc: poc([
      "Identificar a base vazada ou fonte onde constam credenciais relacionadas a [domínio/organização].",
      "Registrar usuário/e-mail, origem da base e data aproximada do vazamento quando disponíveis.",
      "Manter senhas, hashes, tokens e dados pessoais ofuscados na evidência.",
      "Validar se a conta ainda existe ou se há indício de senha reutilizada somente quando houver autorização explícita.",
      "Anexar captura ou trecho sanitizado demonstrando a presença das credenciais na base vazada."
    ]),
    pocLegenda:
      "Figura: Credenciais associadas a [domínio/organização] encontradas em base vazada.",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/",
      "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
      "https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html",
      "https://cwe.mitre.org/data/definitions/522.html"
    ),
  },
  {
    value: "Directory Listing Enabled",
    label: "Directory Listing Enabled",
    titulo:
      "Listagem de diretórios habilitada em [caminho]",
    categoria: "A05: Security Misconfiguration",
    subcategoria: "Directory Listing",
    owasp: "OWASP Top 10 2021 - A05: Security Misconfiguration",
    cwe: "CWE-548",
    desc: description(
      "Directory Listing ocorre quando o servidor web permite listar arquivos de um diretório sem página index ou controle adequado.",
      "Foi identificado que o caminho [caminho] permite visualizar arquivos e subdiretórios hospedados no servidor."
    ),
    impacto: impact(
      [
        "Exposição de arquivos, backups, artefatos, logs ou documentos não destinados ao público.",
        "Facilitação de enumeração da estrutura da aplicação.",
        "Possível descoberta de versões, endpoints e arquivos sensíveis."
      ],
      [
        "Vazamento de informações internas e propriedade intelectual.",
        "Aumento do risco de exploração encadeada com arquivos expostos.",
        "Impacto reputacional por exposição de artefatos administrativos ou confidenciais."
      ]
    ),
    reparo: remediation([
      "Desabilitar listagem de diretórios no servidor web.",
      "Remover arquivos desnecessários, backups e artefatos de deploy do diretório público.",
      "Criar página index adequada ou bloquear acesso direto ao diretório.",
      "Aplicar autorização para arquivos que não devem ser públicos.",
      "Revisar pipelines de publicação para evitar envio de arquivos sensíveis."
    ]),
    poc: poc([
      "Acessar o caminho [caminho].",
      "Registrar a listagem de arquivos apresentada pelo servidor.",
      "Destacar exemplos de arquivos expostos sem baixar conteúdo sensível desnecessário.",
      "Anexar captura com dados sensíveis ofuscados."
    ]),
    pocLegenda:
      "Figura: Listagem de diretórios habilitada no caminho [caminho].",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/www-community/vulnerabilities/Directory_Listing",
      "https://cwe.mitre.org/data/definitions/548.html"
    ),
  },
  {
    value: "JWT Misconfiguration",
    label: "JWT Misconfiguration",
    titulo:
      "Configuração insegura de JWT no fluxo [fluxo]",
    categoria: "A07: Identification and Authentication Failures",
    subcategoria: "JWT inseguro",
    owasp:
      "OWASP Top 10 2021 - A07: Identification and Authentication Failures",
    cwe: "CWE-347",
    desc: description(
      "Configuração insegura de JWT ocorre quando tokens são assinados, validados, armazenados ou expirados de forma inadequada.",
      "Foi identificado que o fluxo [fluxo] apresenta fragilidade relacionada a [assinatura/algoritmo/expiração/armazenamento/validação de claims]."
    ),
    impacto: impact(
      [
        "Possível falsificação, reutilização ou abuso de tokens, dependendo da falha específica.",
        "Acesso indevido a sessões, perfis ou recursos caso claims sejam confiadas sem validação.",
        "Ampliação do tempo de exposição quando tokens não expiram ou não podem ser revogados."
      ],
      [
        "Comprometimento de contas e dados associados.",
        "Fraudes ou ações indevidas realizadas com sessão aparentemente legítima.",
        "Impacto reputacional e regulatório em caso de exposição de dados pessoais."
      ]
    ),
    reparo: remediation([
      "Validar assinatura, algoritmo, emissor, audiência, expiração e demais claims relevantes.",
      "Não aceitar algoritmo none ou troca indevida entre algoritmos simétricos e assimétricos.",
      "Usar chaves fortes, protegidas e com rotação planejada.",
      "Definir expiração curta e estratégia de refresh/revogação compatível com o risco.",
      "Armazenar tokens de forma segura e evitar exposição em logs, URLs ou storage inadequado."
    ]),
    poc: poc([
      "Obter token emitido no fluxo [fluxo].",
      "Validar as propriedades do token sem expor segredo ou dados pessoais.",
      "Registrar a falha observada em assinatura, claims, expiração ou armazenamento.",
      "Anexar evidência com payload sensível ofuscado."
    ]),
    pocLegenda:
      "Figura: Token JWT com configuração insegura no fluxo [fluxo].",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html",
      "https://portswigger.net/web-security/jwt",
      "https://cwe.mitre.org/data/definitions/347.html"
    ),
  },
  {
    value: "Host Header Injection",
    label: "Host Header Injection",
    titulo:
      "Aplicação confia no cabeçalho Host no fluxo [fluxo]",
    categoria: "A05: Security Misconfiguration",
    subcategoria: "Host Header Injection",
    owasp: "OWASP Top 10 2021 - A05: Security Misconfiguration",
    cwe: "CWE-20",
    desc: description(
      "Host Header Injection ocorre quando a aplicação utiliza o cabeçalho Host informado pelo cliente para montar links, redirecionamentos, e-mails ou lógica de segurança sem validação.",
      "Foi identificado que o fluxo [fluxo] reflete ou utiliza Host controlado pelo usuário em resposta, link ou comunicação enviada pela aplicação."
    ),
    impacto: impact(
      [
        "Geração de links maliciosos em e-mails de recuperação de senha, confirmação ou convite.",
        "Possível cache poisoning, redirecionamento ou bypass de validações baseadas em domínio.",
        "Apoio a ataques de phishing com conteúdo originado pela própria aplicação."
      ],
      [
        "Roubo de contas por links de recuperação apontando para domínio controlado.",
        "Danos à reputação por mensagens legítimas contendo links manipulados.",
        "Fraudes e aumento de incidentes de suporte."
      ]
    ),
    reparo: remediation([
      "Configurar domínio canônico no servidor e não confiar no cabeçalho Host do cliente.",
      "Validar Host contra lista de permissões antes de processar a requisição.",
      "Construir URLs absolutas a partir de configuração interna segura.",
      "Revisar proxies e balanceadores para normalização correta de headers.",
      "Adicionar testes para Host, X-Forwarded-Host e cabeçalhos equivalentes."
    ]),
    poc: poc([
      "Enviar requisição para o fluxo [fluxo] alterando o cabeçalho Host.",
      "Registrar reflexão ou uso do domínio controlado em resposta, redirecionamento ou e-mail.",
      "Anexar evidência do cabeçalho enviado e do local onde foi utilizado.",
      "Evitar acionar usuários reais durante a validação."
    ]),
    pocLegenda:
      "Figura: Cabeçalho Host manipulado refletido no fluxo [fluxo].",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://portswigger.net/web-security/host-header",
      "https://cwe.mitre.org/data/definitions/20.html"
    ),
  },
  {
    value: "Insecure Deserialization",
    label: "Insecure Deserialization",
    titulo:
      "Desserialização insegura de objeto no componente [componente]",
    categoria: "A08: Software and Data Integrity Failures",
    subcategoria: "Insecure Deserialization",
    owasp:
      "OWASP Top 10 2021 - A08: Software and Data Integrity Failures",
    cwe: "CWE-502",
    desc: description(
      "Desserialização insegura ocorre quando a aplicação reconstrói objetos a partir de dados controlados pelo usuário sem validação, assinatura ou isolamento adequado.",
      "Foi identificado que o componente [componente] processa objeto serializado controlável, permitindo alteração de estado, erro ou comportamento inesperado."
    ),
    impacto: impact(
      [
        "Manipulação de objetos, estados de sessão ou permissões embutidas em dados serializados.",
        "Possível execução de código dependendo da linguagem, biblioteca e cadeia de classes disponível.",
        "Bypass de validações de negócio quando a integridade do objeto não é protegida."
      ],
      [
        "Comprometimento de contas, transações ou dados sensíveis.",
        "Risco de indisponibilidade ou controle de componentes críticos.",
        "Impacto financeiro e reputacional elevado quando a falha permite execução remota."
      ]
    ),
    reparo: remediation([
      "Evitar desserializar dados não confiáveis.",
      "Usar formatos simples e validar campos explicitamente no servidor.",
      "Assinar e verificar integridade de dados serializados quando forem indispensáveis.",
      "Aplicar allowlist de tipos/classes permitidos e atualizar bibliotecas vulneráveis.",
      "Executar processamento em ambiente com privilégios mínimos e monitorar falhas de desserialização."
    ]),
    poc: poc([
      "Identificar parâmetro, cookie ou corpo de requisição contendo objeto serializado.",
      "Alterar campo controlado de baixo impacto para observar mudança de comportamento.",
      "Registrar erro, alteração de estado ou aceitação indevida do objeto modificado.",
      "Não utilizar cadeias destrutivas ou execução de código sem autorização explícita."
    ]),
    pocLegenda:
      "Figura: Objeto serializado modificado aceito pelo componente [componente].",
    retestStatus: "Não validado",
    retestDescricao: defaultRetest,
    referencia: references(
      "https://owasp.org/www-community/vulnerabilities/Deserialization_of_untrusted_data",
      "https://portswigger.net/web-security/deserialization",
      "https://cwe.mitre.org/data/definitions/502.html"
    ),
  },
];

export const InformationDisclosure = [];

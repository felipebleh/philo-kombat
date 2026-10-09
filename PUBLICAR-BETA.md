# Philo Kombat Beta — versão independente

Exportação da versão 181 do Sites, de 08/10/2026.
Fonte original: `da14099f2dae7d387a6daa2b8a08492abd60651d`.

## O que foi preservado

Todos os arquivos de `app/`, todos os 405 recursos de `public/` e todas as fontes locais são idênticos à versão original. Isso inclui os 42 personagens, diálogos, imagens, animações, trilhas e efeitos. `standalone/source-manifest.json` guarda os hashes SHA-256 dos 471 arquivos originais.

Foi acrescentada uma entrada React para servir o componente original `app/page.tsx` como aplicação estática. Ela importa os mesmos estilos, na mesma ordem, e as mesmas fontes locais. As rotinas de jogo não foram editadas. A configuração antiga do Sites permanece no código-fonte para referência, mas não faz parte do executável do beta.

## Executar e construir

Requisito: Node.js 22.13 ou superior.

```sh
npm ci
npm run dev
npm test
npm run build
npm run start
```

`npm run build` produz `beta-dist/`, que contém o jogo completo, incluindo todos os recursos locais. Não requer servidor de aplicação, API, banco de dados ou login do ChatGPT.

## Cloudflare Pages com GitHub

Criar um projeto Pages conectado a `felipebleh/philo-kombat`.

| Campo | Valor |
| --- | --- |
| Nome desejado | `philo-kombat-beta` (sujeito à disponibilidade) |
| Branch de produção | `main` |
| Preset | `None` |
| Comando de build | `npm run build` |
| Diretório de saída | `beta-dist` |
| Diretório raiz | Raiz do repositório |
| Node | `22` |

Não configurar domínio próprio. O Cloudflare fornecerá o endereço real em `pages.dev` após publicar. Não há um endereço publicado nesta etapa.

## Backup e aprovação

A branch `backup/pre-beta-2026-10-08` preserva o commit antigo `b7e7c9624d5192d4de4b528e9df00b463bdf9d6f`. A atualização do beta deverá criar um novo commit descendente desse histórico, sem force push. A atualização e a publicação foram autorizadas pelo proprietário em 08/10/2026. A publicação depende da conclusão do acesso ao Cloudflare e dos testes finais.

## Próximas atualizações

1. Continuar desenvolvendo o jogo no ChatGPT normalmente.
2. Pedir a exportação da nova versão para este mesmo repositório.
3. Manter a entrada e a configuração de `standalone/`; atualizar os arquivos originais e regenerar o manifesto a partir da nova fonte.
4. Conferir os arquivos, testar e criar um novo commit no GitHub.
5. A integração do Cloudflare publica o novo commit automaticamente.

As alterações feitas no ChatGPT não chegam automaticamente ao GitHub: cada nova versão precisa ser exportada. O progresso e o volume são locais ao navegador e ao endereço do jogo; não são transferidos do domínio antigo. Nos computadores compartilhados, continuam compartilhados entre usuários do mesmo perfil do navegador, como no jogo original.

## Validação realizada

- Build estático concluído; 419 arquivos no executável.
- 471 arquivos originais conferidos por SHA-256, incluindo todos os 405 recursos de `public/` também conferidos no executável.
- 141 testes existentes passaram, incluindo História, Doutor, quiz, Versus, personagens, animações e lógica de áudio.
- Os 18 arquivos de áudio foram verificados com FFprobe.
- Testes de interface locais: seleção dos 42 lutadores, Felipe contra Superinteligência, diálogos, início da luta, teclado e botão de golpe; avanço das cenas de abertura do Modo História.
- Nenhum recurso excede 25 MiB.

Ainda pendentes: publicação real no Cloudflare, testes na URL pública, escuta dos áudios em um computador real e teste na rede escolar. Os testes locais não equivalem a uma partida completa de todos os personagens ou à conclusão manual da campanha.

## Situação do acesso Cloudflare

O painel abriu na tela de login e apresentou erro de verificação mesmo após uma recarga. Nenhuma credencial foi coletada ou enviada. Nenhum projeto Cloudflare foi criado. O acesso à conta precisa ser concluído para configurar a integração e publicar.

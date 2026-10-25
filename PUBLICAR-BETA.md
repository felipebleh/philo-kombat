# Philo Kombat — versão independente

Atualização para a versão 226 do Sites, em 24/10/2026.
Fonte original: `10dcba946984b509660bd513f04813bfb24fbf68`.

## Atualização 226

- Campanhas Discípulo e Doutor, com todas as artes atuais e encerramento do Doutor.
- Felipe das Trevas reservado à história e botão Grande Filósofo com tela Em construção.
- Artes completas acima da navegação, com botão Voltar e QR code sem recortes.
- Ajustes atuais de alcance, controles, defesa, impactos e especiais preservados.
- 660 arquivos originais conferidos por SHA-256, incluindo 552 recursos públicos.
- Build estático com 566 arquivos; 268 testes passaram.

## Rodar e publicar

Requer Node.js 22.13 ou superior.

```sh
npm ci
npm test
npm run build
```

O executável completo fica em `beta-dist/`. Ele funciona sem servidor de aplicação, API, banco de dados ou login do ChatGPT.

Cloudflare Pages: repositório `felipebleh/philo-kombat`, branch `main`, comando `npm run build`, saída `beta-dist`, raiz do repositório, preset None e Node 22. Preserve os domínios já associados ao projeto.

A integração com GitHub pode publicar automaticamente cada novo commit. A confirmação de publicação e dos domínios deve ser conferida no painel Cloudflare, em Workers & Pages.

## Próximas atualizações

Atualize os arquivos originais, preserve a entrada estática em `standalone/` e a configuração `vite.beta.config.ts`, regenere o manifesto `standalone/source-manifest.json`, teste e envie um novo commit. Os estilos da entrada estática devem seguir a ordem de `app/layout.tsx`.

As mudanças desenvolvidas no ChatGPT precisam ser exportadas para este repositório; não há sincronização automática. O progresso e o volume são locais ao navegador e ao endereço do jogo.

## Histórico

A exportação inicial foi feita da versão 181 em 08/10/2026. A branch `backup/pre-beta-2026-10-08` preserva a versão anterior à primeira exportação. A atualização 226 mantém esse histórico, sem force push.

A validação local não equivale a uma partida completa com todos os lutadores ou à conclusão manual das campanhas. A URL de produção e o acesso na rede escolar devem ser conferidos após a publicação externa.

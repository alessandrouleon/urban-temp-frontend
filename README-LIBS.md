# Bibliotecas usadas no projeto `urban-temp-frontend`

Este README lista as bibliotecas (dependências e devDependencies) encontradas em `package.json`, com uma breve descrição em português, link para documentação e nota sobre como são usadas no projeto.

> Observação: as descrições são resumidas e focadas no uso prático dentro deste projeto. Para detalhes avançados, visite os links de documentação.

---

## Dependências (runtime)

-   @react-google-maps/api

    -   Descrição: Componentes React para integrar Google Maps (API JavaScript). Facilita carregar mapas, marcadores e outros serviços do Google Maps.
    -   Link: https://github.com/JustFly1984/react-google-maps-api
    -   Uso no projeto: renderização de mapas interativos quando usado o Google Maps (possivelmente nas páginas de `Map`).

-   @tailwindcss/vite

    -   Descrição: Plugin que integra Tailwind CSS com Vite para processamento e otimizações.
    -   Link: https://github.com/tailwindlabs/tailwindcss
    -   Uso no projeto: integração do Tailwind com o build Vite (estilos utilitários).

-   @tanstack/react-query

    -   Descrição: Biblioteca para gestão de estado assíncrono (fetching, caching, atualização) em React.
    -   Link: https://tanstack.com/query/latest
    -   Uso no projeto: requisições e cache de dados climáticos/overpass (serviços em `services/`), simplificando loading e revalidação.

-   apexcharts

    -   Descrição: Biblioteca de gráficos JavaScript focada em simplicidade e performance.
    -   Link: https://apexcharts.com/
    -   Uso no projeto: base gráfica usada por `react-apexcharts` para renderizar gráficos (ex.: áreas, linhas, etc.).

-   axios

    -   Descrição: Cliente HTTP baseado em Promises para fazer requisições ao servidor/API.
    -   Link: https://github.com/axios/axios
    -   Uso no projeto: chamadas às APIs de clima e Overpass em `services/weatherService.ts` e `services/overpassService.ts`.

-   leaflet

    -   Descrição: Biblioteca open-source para mapas interativos (renderização de tiles, camadas, marcadores).
    -   Link: https://leafletjs.com/
    -   Uso no projeto: renderização de mapas via `react-leaflet` e manipulação de camadas.

-   leaflet.heat

    -   Descrição: Plugin para Leaflet que cria camadas de heatmap (mapa de calor).
    -   Link: https://github.com/Leaflet/Leaflet.heat
    -   Uso no projeto: camada de heatmap para visualizar densidade/temperatura.

-   lucide-react

    -   Descrição: Conjunto de ícones leves como componentes React (alternativa ao Feather Icons).
    -   Link: https://lucide.dev/
    -   Uso no projeto: ícones usados na interface (Header, Sidebar, botões).

-   react

    -   Descrição: Biblioteca principal de UI para construir componentes declarativos.
    -   Link: https://reactjs.org/
    -   Uso no projeto: base do frontend.

-   react-apexcharts

    -   Descrição: Wrapper React para ApexCharts, facilita usar charts como componentes React.
    -   Link: https://github.com/apexcharts/react-apexcharts
    -   Uso no projeto: componentes de gráfico na pasta `components/ApexChart`.

-   react-dom

    -   Descrição: Pacote de APIs específicas do DOM para React.
    -   Link: https://reactjs.org/docs/react-dom.html
    -   Uso no projeto: renderização da árvore React em `main.tsx`.

-   react-leaflet

    -   Descrição: Binder React para Leaflet, permite usar componentes Leaflet como componentes React.
    -   Link: https://react-leaflet.js.org/
    -   Uso no projeto: componentes de mapa em `components/Map`.

-   react-router-dom

    -   Descrição: Roteamento declarativo para aplicações React no browser.
    -   Link: https://reactrouter.com/
    -   Uso no projeto: navegação entre páginas (pasta `router/` e `pages/`).

-   recharts
    -   Descrição: Biblioteca de gráficos em React construída com D3, para gráficos simples e compostos.
    -   Link: https://recharts.org/
    -   Uso no projeto: outros componentes de gráficos (ex.: `WeatherComposedChart.tsx`).

---

## DevDependencies (desenvolvimento)

-   @eslint/js, eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh

    -   Descrição: Ferramentas para análise estática de código (lint) e regras para React.
    -   Link: https://eslint.org/
    -   Uso no projeto: manter consistência de estilo e detectar problemas no código.

-   @types/\* (leaflet, leaflet.heat, node, react, react-dom)

    -   Descrição: Tipagens TypeScript para bibliotecas JavaScript.
    -   Link: https://www.npmjs.com/~types
    -   Uso no projeto: suporte de tipagem para desenvolvimento com TypeScript.

-   @vitejs/plugin-react, vite

    -   Descrição: Vite é o bundler / dev-server; plugin React integra Fast Refresh e transformações.
    -   Link: https://vitejs.dev/
    -   Uso no projeto: ambiente de desenvolvimento e build.

-   autoprefixer, postcss, tailwindcss

    -   Descrição: Ferramentas de processamento CSS e Tailwind para utilitários de estilo.
    -   Link: https://tailwindcss.com/
    -   Uso no projeto: estilização via Tailwind + processamento PostCSS.

-   babel-plugin-react-compiler

    -   Descrição: Plugin para compilar JSX/React; versão específica para compatibilidade com React 19 preview features.
    -   Link: https://github.com/facebook/react/tree/main/packages/babel-plugin-react-compiler
    -   Uso no projeto: suporte a transformações experimentais/compatibilidade.

-   globals

    -   Descrição: define variáveis globais para linters/ambientes.
    -   Link: https://www.npmjs.com/package/globals
    -   Uso no projeto: ajudar configurações de lint.

-   typescript, typescript-eslint
    -   Descrição: TypeScript e integração com ESLint.
    -   Link: https://www.typescriptlang.org/
    -   Uso no projeto: tipagem estática e verificação.

---

## Como contribuir / notas rápidas

-   Para rodar o projeto localmente:

```bash
# instalar dependências
npm install
# rodar em dev mode
npm run dev
```

-   Lint:

```bash
npm run lint
```

---

## Sugestões e próximos passos

-   Adicionar pequenas notas de compatibilidade (ex.: versões mínimas do Node).
-   Gerar links diretos para os pacotes no npm (ex.: https://www.npmjs.com/package/axios) se desejar.

---

Concluído: README-LIBS.md gerado automaticamente com base em `package.json`.

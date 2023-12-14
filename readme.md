# dependency-analysis-plugin

it aim to statistic project dependency

supports webpack4

## install

npm

```
npm install dependency-analysis-plugin --save-dev
```

yarn

```
yarn add dependency-analysis-plugin --save-dev
```

pnpm

```
pnpm install dependency-analysis-plugin --save-dev
```

## Usage

### default

```js
const DependenciesAnalyzerPlugin = require('dependency-analysis-plugin');

module.exports = {
  plugins: [new DependenciesAnalyzerPlugin()],
};
```

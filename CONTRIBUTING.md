# CONTRIBUTING

## Prepare

1. Make sure your pnpm version is 10.x .
2. Install dependencies:

```bash
$ pnpm install
```

It's recommended to use [Volta](https://volta.sh/) to manage the node and pnpm version. And you need to set the `VOLTA_FEATURE_PNPM` environment variable to enable pnpm support.

```bash
export VOLTA_FEATURE_PNPM=1
```

## Build

```bash
$ npm run build
```

## Release

Release with @umijs/tools.

```bash
$ npm run release
```

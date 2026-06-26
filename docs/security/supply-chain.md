# Supply Chain Security

npm パッケージと GitHub Actions のサプライチェーン侵害を前提に、依存追加・依存更新・CI 実行時の運用ルールを定義する。

## パッケージマネージャ

- pnpm 11.x を使う。`package.json` の `packageManager` と GitHub Actions の pnpm major を揃える。
- lockfile は `pnpm-lock.yaml` に一本化する。`package-lock.json` / `yarn.lock` は追加しない。
- registry は `.npmrc` の `https://npm.flatt.tech` に統一する。CI と Dependabot では `TAKUMI_GUARD_TOKEN` を secret から渡す。
- CI は `pnpm install --frozen-lockfile` を使い、lockfile と manifest の不整合を検出する。

## pnpm install 時の防御

- `minimumReleaseAge: 1440` で、公開直後の npm package を即時導入しない。
- `blockExoticSubdeps: true` で、transitive dependency の exotic specifier をブロックする。
- `strictDepBuilds: true` と `allowBuilds` で、未審査の install script / postinstall script を失敗扱いにする。
- build script を許可する package は `pnpm-workspace.yaml` の `allowBuilds` に明示する。

現在の許可方針:

| Package | Policy | Reason |
|---|---|---|
| `esbuild` | allow | Astro / Vite 系ツールチェーンで必要 |
| `sharp` | allow | Astro の画像処理で利用 |
| `workerd` | deny | 通常の lint / test / build では不要 |

依存を追加・更新した後は、次を確認する:

```shell
pnpm install --frozen-lockfile
pnpm ignored-builds
```

`pnpm ignored-builds` に未審査の package が出た場合は、必要性を確認して `allowBuilds` に `true` または `false` を明示する。

## 依存追加時のレビュー観点

- 既存依存で代替できないか。
- 直接依存として入れる必要があるか。
- `install` / `postinstall` / `prepare` などの lifecycle script を持つか。
- lockfile 差分に想定外の transitive dependency が増えていないか。
- メンテナンス状況、直近リリース頻度、issue / advisory の状況に不自然さがないか。
- GitHub Actions を追加する場合は full-length commit SHA で固定し、対応する tag を同じ行のコメントに残す。

## GitHub Actions

- third-party actions は full-length commit SHA で固定する。
- SHA の右側に tag コメントを残し、Dependabot が更新PRで追従できるようにする。
- workflow の `permissions` は最小権限を明示する。CI は `contents: read`、deploy は `contents: read` と `deployments: write` のみを基本とする。

## 依存更新

- Dependabot で npm 依存と GitHub Actions を週次更新する。
- npm と GitHub Actions の更新は別PRに分ける。
- Dependabot の npm 更新には、Dependabot secret として `TAKUMI_GUARD_TOKEN` を登録する。
- Dependabot PR でも `pnpm ignored-builds` の結果と lockfile 差分を確認する。

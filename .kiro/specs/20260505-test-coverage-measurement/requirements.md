# Requirements Document

## Table of Contents

| Section | What You'll Learn |
|---------|-------------------|
| [Introduction](#introduction) | カバレッジ測定の目的と今回の対象範囲を示す |
| [Requirement 1: カバレッジ測定の再現性](#requirement-1-カバレッジ測定の再現性) | 開発者が同じ手順で測定結果を取得できる条件を定義する |
| [Requirement 2: 測定結果の可視化](#requirement-2-測定結果の可視化) | ターミナル、HTML、LCOV の各レポート要件を定義する |
| [Requirement 3: 閾値チェックとの責務分離](#requirement-3-閾値チェックとの責務分離) | report-only と quality gate の使い分けを定義する |
| [Requirement 4: CIでの継続測定](#requirement-4-ciでの継続測定) | CI 上でカバレッジを継続的に観測する条件を定義する |

## Introduction

この spec は、Astro + Cloudflare Pages Functions 構成のブログサイトで、Vitest によるテストカバレッジを安定して測定・確認できる状態を作るための要件を定義する。

既存構成には `pnpm test:coverage`、Vitest v8 coverage 設定、CI の `coverage` job が存在する。2026-05-05 時点では、初期ゲートとして全体 coverage 80%以上を採用する。今回の主目的は「測定結果を再現可能に取得すること」と「現実的な初期品質ゲートを通すこと」であり、日常測定用の report-only command と品質ゲート用の check command の責務を分ける。

### Current Baseline

| Metric | Current |
|--------|---------|
| Statements | 97.97% |
| Branches | 89.71% |
| Functions | 95.23% |
| Lines | 98.90% |

## Requirement 1: カバレッジ測定の再現性

**Objective:** 開発者として、ローカル環境で同じコマンドを実行すれば同じ対象範囲のカバレッジを測定したい。変更前後の比較を安定して行えるようにするため。

#### Acceptance Criteria

1. When 開発者が依存関係を同期した状態で測定コマンドを実行する, the Vitest coverage shall `functions/**/*.ts`, `src/lib/**/*.ts`, `src/hooks/**/*.ts` を測定対象にする
2. When 測定対象にテストファイルや生成物が含まれる, the Vitest coverage shall `**/*.test.ts`, `**/*.test.tsx`, `node_modules/**`, `dist/**`, `coverage/**` を測定対象から除外する
3. If `node_modules` が lockfile と同期していない, then the developer workflow shall `pnpm install --frozen-lockfile` を先に実行する手順を示す
4. The measurement workflow shall Playwright E2E/snapshot test を coverage の対象に含めない

## Requirement 2: 測定結果の可視化

**Objective:** 開発者として、カバレッジ結果をターミナルとブラウザで確認したい。全体傾向と未カバー行の両方を素早く確認できるようにするため。

#### Acceptance Criteria

1. When 測定コマンドを実行する, the Vitest coverage shall ターミナルに summary table を表示する
2. When 測定コマンドが完了する, the Vitest coverage shall `coverage/index.html` を生成する
3. When 測定コマンドが完了する, the Vitest coverage shall `coverage/lcov.info` を生成する
4. The coverage artifacts shall Git 管理対象に含めない

## Requirement 3: 閾値チェックとの責務分離

**Objective:** 開発者として、測定だけをしたい場合と、閾値違反を検出したい場合を分けたい。日常的な観測が不要に失敗扱いにならないようにするため。

#### Acceptance Criteria

1. When 開発者が report-only 測定を実行する, the command shall テストが通過している限り coverage threshold によって exit 1 にならない
2. When 開発者が quality gate 測定を実行する, the command shall configured thresholds を満たさない場合に exit 1 になる
3. The configured thresholds shall statements, branches, functions, lines の全体値をそれぞれ 80% 以上に設定する
4. The workflow shall 現行の `pnpm test:coverage` が threshold check として振る舞うことを明示する

## Requirement 4: CIでの継続測定

**Objective:** 開発者として、Pull Request や main push でカバレッジを継続的に観測したい。ローカルで見落としたカバレッジ低下を把握できるようにするため。

#### Acceptance Criteria

1. When CI が実行される, the workflow shall `coverage` job で Vitest coverage を実行する
2. While 初期導入期間である, the coverage job shall `continue-on-error: true` により他ジョブの blocking gate にしない
3. If coverage gate を引き上げる, then the workflow shall threshold を現在の baseline から段階的に上げる方針を持つ
4. The CI workflow shall dependency install, test execution, coverage reporting の順で実行される

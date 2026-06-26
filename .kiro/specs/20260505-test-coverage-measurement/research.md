# Research: test-coverage-measurement

## Table of Contents

| Section | What You'll Learn |
|---------|-------------------|
| [Summary](#summary) | 現在のカバレッジ基盤と実測結果の要点を示す |
| [Research Log](#research-log) | 調査した設定、コマンド、失敗理由を記録する |
| [Design Decisions](#design-decisions) | 測定と閾値チェックを分ける判断を説明する |
| [Risks & Mitigations](#risks--mitigations) | カバレッジ運用上のリスクと対策を整理する |

## Summary

- **Feature**: test-coverage-measurement
- **Discovery Scope**: Existing coverage setup verification
- **Key Findings**:
  - `package.json` には `test:coverage` があり、`vitest.config.ts` には v8 coverage 設定がある。
  - CI には `coverage` job があり、`continue-on-error: true` で初期運用の警告扱いになっている。
  - 初期改善後の `pnpm test:coverage:check` は、全体80%閾値を満たして exit 0 になる。
  - CLI で閾値を 0 に上書きすると、同じ測定対象で exit 0 のレポート専用実行ができる。

## Research Log

### Existing Test Stack

- **Context**: カバレッジ測定の導入状況を確認するため。
- **Sources Consulted**:
  - `package.json`
  - `vitest.config.ts`
  - `.github/workflows/ci.yml`
  - `README.md`
- **Findings**:
  - Unit/integration test runner は Vitest。
  - E2E/snapshot は Playwright で、カバレッジ測定対象には含めていない。
  - Coverage provider は `@vitest/coverage-v8`。
  - Coverage reporters は `text`, `html`, `lcov`。
- **Implications**:
  - JS/TS のユニットテストカバレッジは既存基盤で測定できる。
  - Playwright の画面テストは目的が異なるため、今回の coverage gate には含めない。

### Coverage Target Scope

- **Context**: 測定対象が広すぎると UI コンポーネント全体を無理に数値化し、メンテナンス性を落とすため。
- **Sources Consulted**:
  - `vitest.config.ts`
  - `src/**/*.test.{ts,tsx}`
  - `functions/**/*.test.ts`
- **Findings**:
  - Coverage include は `functions/**/*.ts`, `src/lib/**/*.ts`, `src/hooks/**/*.ts`, `src/components/knowledge/format.ts`。
  - React コンポーネント全体ではなく、関数・hook・API proxy 周辺を主対象にしている。
  - 未カバーの主な低下要因は `src/hooks/useImageLazyLoad.ts`, `src/hooks/useScrapboxData.ts`, `src/lib/queryClient.ts`。
- **Implications**:
  - 現在の対象範囲は「ロジック中心」の測定として妥当。
  - 測定値を上げるなら hooks と query client 周辺から始めるのが効果的。

### Measurement Result

- **Command**: `pnpm test:coverage`
- **Result**: Test Files 14 passed / Tests 189 passed / exit 1 due to thresholds.
- **Coverage Summary**:

| Metric | Before | After |
|--------|--------|-------|
| Statements | 79.79% (158/198) | 97.97% (194/198) |
| Branches | 73.83% (79/107) | 89.71% (96/107) |
| Functions | 64.28% (27/42) | 95.23% (40/42) |
| Lines | 80.21% (146/182) | 98.90% (180/182) |

- **Thresholds**:

| Metric | Threshold | Status |
|--------|-----------|--------|
| Statements | 80% | Pass |
| Branches | 80% | Pass |
| Functions | 80% | Pass |
| Lines | 80% | Pass |

### Report-only Execution

- **Command**: `pnpm exec vitest run --coverage --coverage.thresholds.lines=0 --coverage.thresholds.functions=0 --coverage.thresholds.statements=0 --coverage.thresholds.branches=0`
- **Result**: Test Files 14 passed / Tests 189 passed / exit 0.
- **Generated Artifacts**:
  - `coverage/index.html`
  - `coverage/lcov.info`
  - `coverage/lcov-report/index.html`

## Design Decisions

### Decision: Keep Coverage Scope Focused on Logic

- **Context**: Astro/React UI と Cloudflare Functions が混在する構成で、すべてを同じ coverage threshold に含めると測定値がノイズ化しやすい。
- **Alternatives Considered**:
  1. Include all `src/**/*.ts(x)` files.
  2. Keep current logic-oriented include list.
- **Selected Approach**: 現在の `include` 方針を維持する。
- **Rationale**: 表示確認は Playwright snapshot が担い、Vitest coverage はロジックの回帰検出に集中させる。
- **Trade-offs**: UI コンポーネントの未測定領域は数値に出にくい。
- **Follow-up**: UI の重要ロジックは hook や pure function に分離して測定対象に入れる。

### Decision: Separate Report-only Measurement from Threshold Check

- **Context**: `pnpm test:coverage` は測定結果を出すが、現行閾値が高いため常に失敗しやすい。
- **Alternatives Considered**:
  1. 閾値を現在値まで下げる。
  2. `test:coverage` の閾値を外す。
  3. 測定専用コマンドと閾値チェックコマンドを分ける。
- **Selected Approach**: 測定専用と閾値チェックを分ける。
- **Rationale**: 日常的な可視化と品質ゲートは別のユースケースであり、同じ exit code にすると運用意図が曖昧になる。
- **Trade-offs**: npm script が1つ増える。
- **Follow-up**: `test:coverage:report` を npm script として追加済み。品質ゲート用途は `test:coverage:check` を使う。

## Risks & Mitigations

- **Risk**: 100% 閾値が常に失敗し、開発者が coverage job を無視する。
  - **Mitigation**: report-only command を用意し、閾値チェックは段階的に現実的な値へ調整する。
- **Risk**: Coverage を上げるためだけの低価値テストが増える。
  - **Mitigation**: hooks/API proxy の分岐やエラー処理など、実際の回帰リスクが高い箇所を優先する。
- **Risk**: `node_modules` が lockfile と同期していないと coverage provider が見つからない。
  - **Mitigation**: 測定前に `pnpm install --frozen-lockfile` を実行する。

# Implementation Plan

## Overview

| # | Task | Requirements | Parallel |
|---|------|--------------|----------|
| 1 | 現在の coverage baseline を記録する | 1.1, 2.1, 2.2, 2.3 | - |
| 2 | report-only 測定コマンドを npm script 化する | 3.1, 3.4 | (P) |
| 3 | quality gate 用コマンド名を明示する | 3.2, 3.4 | (P) |
| 4 | README に測定と閾値チェックの違いを追記する | 1.3, 2.4, 3.1, 3.2 | - |
| 5 | CI coverage job の運用方針を明文化する | 4.1, 4.2, 4.3, 4.4 | - |
| 6 | カバレッジ改善対象を優先順位付けする | 3.3 | (P) |
| 7 | hook/libテストを追加して全体80%以上に引き上げる | 3.3 | - |
| 8 | coverage threshold を80%初期ゲートに調整する | 3.2, 3.3, 4.3 | - |
| 9 | component配線テストを追加する | 3.3 | - |
| 10 | クロスレビュー指摘を反映する | 2.4, 3.3 | - |

- [x] 1. 現在の coverage baseline を記録する
  - `pnpm test:coverage` を実行し、14 test files / 189 tests が通過することを確認する
  - threshold 違反により exit 1 になることを確認する
  - `coverage/index.html` と `coverage/lcov.info` が生成されることを確認する
  - 初期値: statements 79.79%, branches 73.83%, functions 64.28%, lines 80.21%
  - _Requirements: 1.1, 2.1, 2.2, 2.3_

- [x] 2. report-only 測定コマンドを npm script 化する (P)
  - `package.json` に `test:coverage:report` を追加する
  - CLI override で coverage thresholds を 0 にし、テスト通過時は exit 0 にする
  - 追加後に `pnpm test:coverage:report` を実行し、exit 0 と HTML/LCOV 生成を確認する
  - _Requirements: 3.1, 3.4_

- [x] 3. quality gate 用コマンド名を明示する (P)
  - `package.json` に `test:coverage:check` を追加し、`vitest run --coverage` を割り当てる
  - 既存の `test:coverage` を残す場合は threshold check として扱う
  - `pnpm test:coverage:check` が現行 threshold 違反で exit 1 になることを確認する
  - _Requirements: 3.2, 3.4_

- [x] 4. README に測定と閾値チェックの違いを追記する
  - `pnpm test:coverage:report` は日常的な測定・HTML確認用であることを記載する
  - `pnpm test:coverage` / `pnpm test:coverage:check` は threshold check であることを記載する
  - `coverage/` は生成物で Git 管理しないことを記載する
  - _Requirements: 1.3, 2.4, 3.1, 3.2_

- [x] 5. CI coverage job の運用方針を明文化する
  - 現行の `continue-on-error: true` を初期観測フェーズとして説明する
  - 必須 gate 化する条件を、現在 baseline から段階的に上げる方針として記載する
  - CI で report-only にするか quality gate を継続するかは別判断として残す
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. カバレッジ改善対象を優先順位付けする (P)
  - First priority: `src/hooks/useImageLazyLoad.ts` と `src/hooks/useScrapboxData.ts` の基本分岐をテストする
  - Second priority: `src/lib/queryClient.ts` の初期化挙動をテストする
  - 低価値な snapshot 的テストではなく、エラー処理・分岐・副作用境界を優先する
  - _Requirements: 3.3_

- [x] 7. hook/libテストを追加して全体80%以上に引き上げる
  - `src/hooks/useImageLazyLoad.test.tsx` を追加し、IntersectionObserver連携、loadイベント、cleanupを検証する
  - `src/hooks/useScrapboxData.test.tsx` を追加し、fetch成功、limit適用、disabled query、API errorを検証する
  - `src/lib/queryClient.test.ts` を追加し、React Query の既定値を検証する
  - hook/libテスト追加後の値: statements 97.47%, branches 88.78%, functions 95.23%, lines 98.90%
  - _Requirements: 3.3_

- [x] 8. coverage threshold を80%初期ゲートに調整する
  - `vitest.config.ts` の statements, branches, functions, lines threshold を80%に設定する
  - `pnpm test:coverage:check` がテスト通過かつ全体80%以上で成功することを確認する
  - _Requirements: 3.2, 3.3, 4.3_

- [x] 9. component配線テストを追加する
  - `src/components/scrapbox/ScrapboxCard.test.tsx` を追加し、`useImageLazyLoad` と `ScrapboxCard` の `img src` 遅延配線を検証する
  - `src/components/scrapbox/ScrapboxCardList.test.tsx` を追加し、公開コンポーネント経由で `QueryProvider -> useScrapboxData -> fetch -> UI` が通ることを検証する
  - 配線テスト追加後の現在値: statements 97.97%, branches 89.71%, functions 95.23%, lines 98.90%
  - _Requirements: 3.3_

- [x] 10. クロスレビュー指摘を反映する
  - Codex CLI review の P1 指摘に基づき、`.claude/worktrees/` を `.gitignore` に追加して巨大な生成worktreeの誤コミットを防止する
  - Claude Code ultrareview は起動したが、5分timeoutで詳細結果を取得できなかった
  - _Requirements: 2.4, 3.3_

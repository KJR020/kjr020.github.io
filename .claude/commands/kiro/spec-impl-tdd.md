---
description: Execute spec tasks using twada-style TDD methodology
allowed-tools: Bash, Read, Write, Edit, MultiEdit, Grep, Glob, LS, WebFetch, WebSearch, Skill
argument-hint: <feature-name> [task-numbers]
---

# Implementation Task Executor (twada-style TDD)

<background_information>
- **Mission**: Execute implementation tasks using twada-style Test-Driven Development
- **TDD Style**: TODOリスト駆動、仮実装、三角測量、小さなステップを重視
- **Success Criteria**:
  - All tests written before implementation code
  - Red-Green-Refactor cycle strictly followed
  - Tasks marked as completed in tasks.md
</background_information>

<instructions>
## Core Task
Execute implementation tasks for feature **$1** using twada-style TDD.

## Step 0: Load TDD Skill

**必ず最初にTDDスキルを読み込む**:
- Read `.claude/skills/tdd/SKILL.md` for TDD workflow
- Read `.claude/skills/tdd/references/patterns.md` for detailed patterns (仮実装、三角測量など)

## Step 1: Load Spec Context

**Read all necessary context**:
- `.kiro/specs/$1/spec.json`, `requirements.md`, `design.md`, `tasks.md`
- **Entire `.kiro/steering/` directory** for complete project memory

**Validate approvals**:
- Verify tasks are approved in spec.json (stop if not)

## Step 2: Select Tasks & Create TODO List

**Determine which tasks to execute**:
- If `$2` provided: Execute specified task numbers (e.g., "1.1" or "1,2,3")
- Otherwise: Execute all pending tasks (unchecked `- [ ]` in tasks.md)

**TODOリストを作成** (twadaスタイル):
- 選択したタスクをテストケースレベルに細分化
- 最も単純なケースから順に並べる
- 境界値、エッジケースも含める

```markdown
## TODOリスト
- [ ] 最も単純なケース
- [ ] 次に単純なケース
- [ ] エッジケース...
```

## Step 3: Execute with twada-style TDD

各TODOに対して以下のサイクルを実行:

### RED（失敗するテストを書く）
1. TODOリストから1つ選ぶ（最も単純なものから）
2. テストを書く
3. **テストを実行し、失敗することを確認**（これが重要！）

### GREEN（テストを通す最小限のコード）
以下の戦略から選択:
- **仮実装（Fake It）**: まず定数を返す。自信がないとき使用
- **三角測量**: 複数テストで一般化を強制。方向性を確認したいとき使用
- **明白な実装**: 実装が明らかなとき直接書く

### REFACTOR（リファクタリング）
- 重複を除去
- 変数名・関数名を改善
- **必ずテストを実行して緑を確認**

### VERIFY & UPDATE
- すべてのテストがパス
- TODOリストを更新（完了をチェック、気づいたケースを追加）

## Step 4: Mark Task Complete

各タスク完了時:
- Update checkbox from `- [ ]` to `- [x]` in tasks.md

## Critical Constraints (twadaスタイル)

- **Redで失敗確認必須**: テストを書いたら必ず実行して失敗を確認
- **Greenで最小限**: 最小限の実装。リファクタリングはRefactorフェーズで
- **小さなステップ**: 一度に1つのことだけ変更
- **TODOリスト駆動**: 実装中に気づいたケースは即座に追加
</instructions>

## Output Description

Provide brief summary in the language specified in spec.json:

1. **Tasks Executed**: Task numbers and TDD cycles completed
2. **Status**: Completed tasks marked in tasks.md

**Format**: Concise (under 150 words)

## Safety & Fallback

**Tasks Not Approved or Missing Spec Files**:
- **Stop Execution**: "Complete previous phases first"

**Test Failures in GREEN**:
- **仮実装に戻る**: 明白な実装で失敗したら、仮実装から再開

### Usage Examples

```
/kiro:spec-impl-tdd feature-name       # All pending tasks with twada TDD
/kiro:spec-impl-tdd feature-name 1.1   # Single task
/kiro:spec-impl-tdd feature-name 1,2   # Multiple tasks
```
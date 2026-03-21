# Requirements Document

## Introduction
This specification addresses the reorganization of the `src/` directory structure for the Habit Tracker application. As the codebase has grown to 12 modules in a flat structure, it requires better organization to improve maintainability, discoverability, and separation of concerns. The goal is to group related modules logically while maintaining backward compatibility and code quality.

## Project Description (Input)
srcのディレクトリ構成を検討してほしい。規模が大きくなってきたのでモジュールを整理したい

## Current State Analysis
The current `src/` directory contains 12 flat modules:
- `main.rs` - Application entry point
- `cli.rs` - CLI command handling (234 lines)
- `capture.rs` - Capture loop logic (187 lines)
- `config.rs` - Configuration management (266 lines)
- `database.rs` - Database operations (319 lines)
- `error.rs` - Error type definitions (138 lines)
- `image_store.rs` - Screenshot storage (117 lines)
- `logging.rs` - Logging infrastructure (31 lines)
- `metadata.rs` - macOS metadata collection (86 lines)
- `ocr.rs` - OCR text recognition (92 lines)
- `pause_control.rs` - Pause/resume control (114 lines)
- `report.rs` - Report generation (245 lines)

## Requirements

### Requirement 1: Logical Module Grouping
**Objective:** As a developer, I want related modules grouped into logical directories, so that the codebase is easier to navigate and understand.

#### Acceptance Criteria
1. The Habit Tracker shall organize capture-related modules (`capture.rs`, `image_store.rs`, `metadata.rs`, `ocr.rs`) into a dedicated `capture/` directory.
2. The Habit Tracker shall organize data layer modules (`database.rs`, `report.rs`) into a dedicated `data/` directory.
3. The Habit Tracker shall organize infrastructure modules (`config.rs`, `error.rs`, `logging.rs`, `pause_control.rs`) into a dedicated `infra/` directory.
4. The Habit Tracker shall keep `main.rs` and `cli.rs` at the `src/` root level as application entry points.

### Requirement 2: Module Re-exports
**Objective:** As a developer, I want a clean public API through module re-exports, so that internal restructuring does not break external usage.

#### Acceptance Criteria
1. When the directory structure is reorganized, the Habit Tracker shall provide re-exports in each directory's `mod.rs` to maintain backward-compatible imports.
2. The Habit Tracker shall expose only necessary public types and functions through the re-export layer.
3. If a module moves to a subdirectory, the Habit Tracker shall update all internal import paths to use the new structure.

### Requirement 3: Preserve Existing Functionality
**Objective:** As a user, I want all existing features to work unchanged after reorganization, so that the refactoring does not introduce regressions.

#### Acceptance Criteria
1. When the reorganization is complete, the Habit Tracker shall pass all existing unit tests without modification to test logic.
2. The Habit Tracker shall maintain all CLI commands (`start`, `pause`, `resume`, `report`, `ocr`) with identical behavior.
3. The Habit Tracker shall preserve all database schema and data compatibility.

### Requirement 4: Build and Compilation
**Objective:** As a developer, I want the project to compile without warnings after reorganization, so that code quality is maintained.

#### Acceptance Criteria
1. When `cargo build` is executed, the Habit Tracker shall compile without errors or warnings.
2. When `cargo clippy` is executed, the Habit Tracker shall pass with no new warnings introduced by the reorganization.
3. When `cargo test` is executed, the Habit Tracker shall run all tests successfully.

### Requirement 5: Documentation Updates
**Objective:** As a developer, I want the module documentation to reflect the new structure, so that the codebase remains self-documenting.

#### Acceptance Criteria
1. The Habit Tracker shall update doc comments in `main.rs` to describe the new module organization.
2. The Habit Tracker shall add doc comments to each new `mod.rs` file explaining the directory's purpose.
3. If inline documentation references moved modules, the Habit Tracker shall update those references to the new paths.

## Proposed Directory Structure
```
src/
├── main.rs              # Application entry point
├── cli.rs               # CLI command handling
├── capture/
│   ├── mod.rs           # Re-exports
│   ├── loop.rs          # (renamed from capture.rs)
│   ├── image_store.rs   # Screenshot storage
│   ├── metadata.rs      # macOS metadata collection
│   └── ocr.rs           # OCR text recognition
├── data/
│   ├── mod.rs           # Re-exports
│   ├── database.rs      # Database operations
│   └── report.rs        # Report generation
└── infra/
    ├── mod.rs           # Re-exports
    ├── config.rs        # Configuration management
    ├── error.rs         # Error type definitions
    ├── logging.rs       # Logging infrastructure
    └── pause_control.rs # Pause/resume control
```

## Out of Scope
- Adding new features or functionality
- Changing public API behavior
- Database migrations or schema changes
- Performance optimizations

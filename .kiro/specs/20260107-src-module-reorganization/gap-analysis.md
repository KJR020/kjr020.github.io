# Gap Analysis: src-module-reorganization

## 1. Current State Investigation

### Key Files/Modules and Directory Layout
```
src/
├── main.rs         (21 lines)  - Entry point, imports all modules
├── cli.rs          (234 lines) - CLI parsing and command dispatch
├── capture.rs      (187 lines) - Main capture loop
├── config.rs       (266 lines) - Configuration management
├── database.rs     (319 lines) - SQLite database operations
├── error.rs        (138 lines) - All error type definitions
├── image_store.rs  (117 lines) - Screenshot capture and storage
├── logging.rs      (31 lines)  - Logging initialization
├── metadata.rs     (86 lines)  - macOS metadata collection
├── ocr.rs          (92 lines)  - OCR text recognition
├── pause_control.rs(114 lines) - Pause/resume control
└── report.rs       (245 lines) - Report generation
```

### Module Dependency Graph
```
main.rs
  └── cli.rs
        ├── capture::CaptureLoop
        │     ├── config::Config
        │     ├── database::{CaptureRecord, Database}
        │     ├── error::CaptureError
        │     ├── image_store::ImageStore
        │     ├── metadata::Metadata
        │     ├── ocr
        │     └── pause_control::PauseControl
        ├── config::{CliArgs, Config}
        ├── database::Database
        ├── ocr
        ├── pause_control::PauseControl
        └── report::Report
              ├── database::{CaptureRecord, Database}
              └── error::ReportError

ocr.rs        → error::OcrError
metadata.rs   → error::MetadataError
config.rs     → error::ConfigError
database.rs   → error::DatabaseError
image_store.rs→ error::ImageStoreError
```

### Conventions Extracted
- **Naming**: snake_case for files and modules, PascalCase for types
- **Layering**: Flat structure, no explicit layers currently
- **Dependency Direction**: All modules depend on `error.rs`; `cli.rs` is the main orchestrator
- **Testing**: Tests are inline in each module (`#[cfg(test)] mod tests`)
- **Import Pattern**: `use crate::module::Type` throughout

### Integration Surfaces
- **error.rs**: Central error type definitions, used by all other modules
- **database.rs**: CaptureRecord DTO shared between capture, cli, and report
- **config.rs**: Config struct used by capture, cli

## 2. Requirements Feasibility Analysis

### Requirement-to-Asset Map

| Requirement | Existing Assets | Gap Status |
|-------------|-----------------|------------|
| 1.1 capture/ grouping | capture.rs, image_store.rs, metadata.rs, ocr.rs | **None** - Files exist |
| 1.2 data/ grouping | database.rs, report.rs | **None** - Files exist |
| 1.3 infra/ grouping | config.rs, error.rs, logging.rs, pause_control.rs | **None** - Files exist |
| 1.4 Root level entry | main.rs, cli.rs | **None** - Already at root |
| 2.1 Re-exports in mod.rs | N/A | **Missing** - mod.rs files need creation |
| 2.2 Public API exposure | All types already pub | **Constraint** - May need `pub(crate)` adjustments |
| 2.3 Import path updates | 20+ import statements | **Missing** - All imports need updating |
| 3.1 Unit tests pass | Tests in each module | **None** - Tests will move with modules |
| 3.2 CLI behavior | cli.rs orchestration | **None** - No logic changes |
| 3.3 Database compatibility | database.rs | **None** - No schema changes |
| 4.1-4.3 Build/clippy/test | Current state passing | **Constraint** - Must verify after changes |
| 5.1-5.3 Documentation | Existing doc comments | **Missing** - New mod.rs docs needed |

### Identified Gaps
1. **Missing mod.rs files**: 3 new files needed (capture/mod.rs, data/mod.rs, infra/mod.rs)
2. **Import path updates**: ~20 `use crate::` statements need modification
3. **capture.rs naming conflict**: `capture.rs` → `capture/` directory conflict; rename to `loop.rs` or similar

### Complexity Signals
- **Simple refactoring**: No new business logic, just file moves and import updates
- **Dependency chain**: `error.rs` is foundational; must be moved first or handled carefully
- **Circular dependency risk**: Low - current structure has clear dependency direction

## 3. Implementation Approach Options

### Option A: Bottom-Up Migration (Move infra first)
**Rationale**: Move foundational modules (`error.rs`, `config.rs`) first, then dependent modules.

**Sequence**:
1. Create `infra/` with error.rs, config.rs, logging.rs, pause_control.rs
2. Update all imports to use `infra::*`
3. Create `data/` with database.rs, report.rs
4. Update imports to use `data::*`
5. Create `capture/` with remaining modules
6. Final verification

**Trade-offs**:
- ✅ Handles foundational dependencies first
- ✅ Clear incremental progress
- ❌ Many intermediate compilation states
- ❌ More import updates per step

### Option B: Big-Bang Migration (All at once)
**Rationale**: Move all modules simultaneously with re-export layer for compatibility.

**Sequence**:
1. Create all 3 directories with mod.rs files
2. Move all files in single operation
3. Add re-exports in mod.rs files
4. Update main.rs module declarations
5. Verify compilation

**Trade-offs**:
- ✅ Single state transition
- ✅ Fewer intermediate broken states
- ✅ Can use re-exports to minimize import changes
- ❌ Harder to debug if something breaks
- ❌ Larger single commit

### Option C: Hybrid with Re-export Facade (Recommended)
**Rationale**: Create new structure with re-exports that preserve existing import paths, then gradually migrate.

**Sequence**:
1. Create directory structure with mod.rs files
2. Move files to new locations
3. Add re-exports at crate root in main.rs to maintain `crate::module` imports
4. Verify all tests pass
5. (Optional) Gradually update imports to use new paths
6. (Optional) Remove backward-compat re-exports

**Trade-offs**:
- ✅ Maintains backward compatibility during transition
- ✅ Allows gradual migration of import paths
- ✅ Lower risk of breaking changes
- ❌ Temporary duplicate exports
- ❌ Slightly more complex initial setup

## 4. Implementation Complexity & Risk

### Effort: **S (1-3 days)**
- Justification: Straightforward file moves and import updates; no new logic; well-understood Rust module system

### Risk: **Low**
- Justification:
  - Familiar Rust module patterns
  - No external dependencies affected
  - All changes are structural, not behavioral
  - Comprehensive test suite exists
  - Easy rollback (git revert)

## 5. Research Needed
None. This is a pure structural refactoring with well-documented Rust patterns.

## 6. Recommendations for Design Phase

### Preferred Approach
**Option C: Hybrid with Re-export Facade**
- Lowest risk approach
- Maintains compatibility during transition
- Allows incremental import path updates

### Key Design Decisions
1. **Naming for capture module**: Rename `capture.rs` to `loop.rs` or `capture_loop.rs` to avoid directory conflict
2. **Re-export strategy**: Decide between full backward-compat re-exports vs. clean break
3. **Visibility modifiers**: Review if any internal types should become `pub(crate)` instead of `pub`

### Implementation Order
1. infra/ (foundation - error types used everywhere)
2. data/ (database/report - used by capture and cli)
3. capture/ (highest-level domain logic)

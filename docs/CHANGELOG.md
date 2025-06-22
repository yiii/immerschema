
## 1.4.0  –  2025-07-01
* Agile hierarchy fields (`themeId`, `initiativeId`, `epicIds`)
* Hybrid feature tagging (`featureTag`, optional `featureId`)
* Optional Gantt overlay slices for tasks
* Plan & Assign profiles updated to include overlay

## 1.3.2  –  2024-12-30
* Version bump to 1.3.2
* Minor fixes and improvements
* Package build optimizations
* Enhanced Python build configuration
* Major schema refactoring and enhancements
* Enhanced task management system with hour tracking and lifecycle timestamps
* Improved asset and workload management
* Enhanced risk flag system and bottleneck tracking
* Updated audio support and timing schemas
* Comprehensive documentation updates
* New schema validation pipeline and testing framework

## 1.2.0  –  2024-03-21
* Version bump to 1.2.0
* Added new schema combination system
* Enhanced validation pipeline
* Added bottleneck tracking
* Added risk management system
* Added workload monitoring
* Improved audio support

## 1.1.0  –  2024-12-19
* Version bump to 1.1.0

## 1.1.0  –  2024-12-20
* Version bump to 1.1.0

## 1.0.7  –  2024-03-19
* Fixed package.json exports configuration for proper ESM/CommonJS compatibility
* Improved module resolution for schema files

## 1.0.0  –  2025-06-10
* Initial release: core schema, enums, debug extension, project container.
* Added LLM I/O contract with separate prompt/response envelopes and RFC-6902 patch schema.
* Added taxonomy system for human-friendly UI categorization of enums.

## 1.3.3  –  2025-06-18
* Crew/Dept update: `dept` is now part of the core crew slice and available everywhere
* `projectCrew` overlay adds only `shotIds` for cross-shot linkage (no duplicate dept definition)
* Shot-level and global crew share identical validation logic for easier dashboard integration
* Documentation updates in ARCHITECTURE.md to clarify new crew/projectCrew logic 
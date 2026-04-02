# Dashboard Update — Partner Certification Data

## Tasks
- [ ] Rewrite data.ts with real partner certification data from the document (19 partners, gaps, exams passed)
- [ ] Update KPI cards: Total Partners, Certifications Passed, Open Gaps, Avg Readiness Score
- [ ] Update Channel Chart → Gap Distribution chart (Sales Pro, Tech Pro, Implementation Spec, Bootcamp gaps)
- [ ] Update Budget Donut → Certification Category breakdown (donut of exam types passed)
- [ ] Update Campaign Table → Partner Comparison table with gap counts, exams passed, status badges
- [ ] Update Channel Summary → Gap Type Summary cards (Bootcamp, Tech Pro, Sales Pro, Implementation)
- [ ] Update Sidebar labels to match certification context
- [ ] Update Dashboard Header text
- [ ] Test and checkpoint

## Full-Stack Upgrade & File Storage
- [x] Resolve Home.tsx conflict after web-db-user upgrade (keep our custom dashboard)
- [x] Push database schema with pnpm db:push
- [x] Restore OverrideContext and ModificationContext providers in App.tsx
- [x] Integrate File Storage feature — upload/manage documents via S3
- [x] Add file upload UI to the dashboard (dedicated File Storage page with sidebar nav)
- [x] Create tRPC procedures for file upload/list/delete
- [x] Add database table for file metadata
- [x] Test full-stack features and verify all pages still work
- [x] Wire FileStoragePage into Home.tsx navigation switch
- [x] Add FolderOpen icon to Sidebar icon map
- [x] Add File Storage nav item to sidebar navItems
- [x] Write vitest tests for file storage tRPC procedures (15 tests passing)

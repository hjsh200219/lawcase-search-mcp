# Data Schema

> This project has no database. All data is fetched at runtime from the law.go.kr XML API. This document describes the data shapes (TypeScript interfaces) that serve as the project's "schema."

## Data Flow

```
law.go.kr XML API  -->  fast-xml-parser  -->  Typed Objects (types.ts)  -->  MCP / REST response
```

## Core Types Summary

| Interface | Target | Description |
|-----------|--------|-------------|
| `LawListItem` / `LawDetail` | law | Statutes, decrees, ordinances |
| `CaseListItem` / `CaseDetail` | prec | Court precedents |
| `ConstitutionalListItem` / `ConstitutionalDetail` | detc | Constitutional Court decisions |
| `InterpretationListItem` / `InterpretationDetail` | expc | Legal interpretation cases |
| `AdminRuleListItem` / `AdminRuleDetail` | admrul | Administrative rules |
| `OrdinanceListItem` / `OrdinanceDetail` | ordin | Local government ordinances |
| `TreatyListItem` / `TreatyDetail` | trty | Treaties |
| `LegalTermListItem` / `LegalTermDetail` | lstrm | Legal terminology |
| `ElawListItem` / `ElawDetail` | elaw | English translations of laws |
| `CommitteeDecisionListItem` / `CommitteeDecisionDetail` | 11 committees | Committee decisions |
| `AdminAppealListItem` / `AdminAppealDetail` | decc | Administrative appeal cases |
| `OldNewLawListItem` / `OldNewLawDetail` | oldAndNew | Old-new law comparison |
| `LawSystemListItem` / `LawSystemDetail` | lsStmd | Law hierarchy/system diagrams |
| `ThreeWayCompListItem` / `ThreeWayCompDetail` | thdCmp | 3-way comparison |
| `AttachedFormListItem` | licbyl | Attached forms/tables |
| `LawAbbreviationListItem` | lsAbrv | Law abbreviations |
| `LawChangeHistoryListItem` | lsHstInf | Law change history |
| `LawArticleSubDetail` | lawjosub | Article-paragraph-clause drill-down |
| `AILegalTermListItem` | lstrmAI | AI knowledge-base terms |
| `LinkedOrdinanceListItem` | lnkOrd | Linked local ordinances |
| `AdminRuleOldNewListItem` / `AdminRuleOldNewDetail` | admrulOldAndNew | Admin rule old-new comparison |

## Generic Wrapper

All search results are wrapped in `SearchResult<T>`:

```typescript
interface SearchResult<T> {
  totalCount: number;
  currentPage: number;
  items: T[];
}
```

## Source of Truth

All interfaces are defined in `src/types.ts` (~600 lines). See that file for full field definitions with Korean JSDoc comments.

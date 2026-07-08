---
name: xml-enterprise-architecture
description: >-
  Generate valid XML/XMI files that import cleanly into Sparx Enterprise
  Architect 15.2.1559.26. Use this skill whenever the user asks to create,
  author, or edit UML diagrams as importable XML/XMI for Enterprise Architect
  — including class, activity, sequence, use case, state machine, component,
  deployment, object, communication/collaboration, package, composite
  structure, timing, and interaction overview diagrams. Covers the EA XMI 2.1
  structure, element/connector/diagram type catalogs, EAID/EAPK GUID
  conventions, diagram geometry, and the import procedure.
license: MIT
compatibility: >-
  Output targets Sparx Enterprise Architect 15.2.1559.26 using XMI 2.1
  (UML 2.x) with the Enterprise Architect extension. Any agent or tool that can
  write text files can use this skill. No network access required.
metadata:
  author: Muhammad Luthfi
  version: "1.0.0"
  target-tool: Sparx Enterprise Architect 15.2.1559.26
  format: XMI 2.1
---

# XML for Enterprise Architect (XMI 2.1 Generator)

This skill makes you an expert at producing **XML/XMI files that import cleanly
into Sparx Enterprise Architect 15.2.1559.26**. Follow it whenever you must
emit any UML diagram (class, activity, sequence, use case, state machine,
component, deployment, object, communication, package, composite structure,
timing, interaction overview) as importable XML.

## Golden rules (read first)

1. **Always use XMI 2.1 + the EA extension.** The root must be `xmi:XMI` with
   `xmi:version="2.1"`, and every model carries a sibling
   `<xmi:Extension extender="Enterprise Architect" extenderID="6.5">` block.
2. **Two layers, always.** The `<uml:Model>` holds the *logical* model
   (`packagedElement`); the `<xmi:Extension>` holds EA-specific data
   (`elements`, then `connectors`, then `diagrams` — in that order).
3. **Every id is a GUID.** Use `EAID_` for elements, connectors, and diagrams,
   and `EAPK_` for packages. GUID shape is `8_4_4_4_12` hex digits joined by
   underscores, e.g. `EAID_1A2B3C4D_5E6F_7081_92A3_B4C5D6E7F809`.
4. **`xmi:idref` must match `xmi:id`.** Connectors and diagram elements
   reference logical elements by their exact id. A typo = a missing element on
   import.
5. **Diagrams need geometry.** Each `<element>` inside `<diagram>` carries a
   `geometry` string `Left=X;Top=Y;Right=X2;Bottom=Y2;` in positive pixels.
6. **Encoding is `windows-1252`.** Declare it in the XML prolog; avoid raw
   non-ASCII unless you know it round-trips.
7. **Validate before delivering.** XML must be well-formed; ids must resolve;
   the three extension sections must be present and ordered.

## File skeleton

The canonical, copy-ready skeleton lives in
`references/xml-anatomy.md` and a full working class diagram is in
`assets/class-diagram-template.xml`. The required nesting is:

- `xmi:XMI` (version 2.1, namespaces `uml` + `xmi`)
  - `xmi:Documentation` (exporter="Enterprise Architect")
  - `uml:Model` → root `packagedElement` (a Package, id `EAPK_...`)
    - child `packagedElement` entries (classes, use cases, etc.)
  - `xmi:Extension` (extender="Enterprise Architect")
    - `elements` → one `<element>` per logical element
    - `connectors` → one `<connector>` per relationship
    - `diagrams` → one `<diagram>` per diagram, listing element placements

## Workflow

1. **Clarify the diagram type and contents.** Identify which UML diagram is
   requested and list its nodes and relationships.
2. **Mint GUIDs up front.** Generate one stable GUID per element, connector,
   and diagram. Keep a table so `idref`s stay consistent.
3. **Build the logical model** (`uml:Model`) — packagedElements with the right
   `xmi:type` (see `references/element-catalog.md`).
4. **Build the EA extension** — `elements`, then `connectors`, then
   `diagrams`. Use the exact `ea_type` / `type` strings from the catalog.
5. **Place elements on the diagram** with `geometry` strings; avoid overlaps
   (see geometry rules in `references/xml-anatomy.md`).
6. **Validate** well-formedness and id resolution; then deliver the `.xml`.

## Reference files

- `references/element-catalog.md` — full catalog of element `xmi:type`s,
  connector types/`ea_type`s, and diagram `type` strings.
- `references/xml-anatomy.md` — the detailed anatomy of `<element>`,
  `<connector>`, and `<diagram>` plus GUID and geometry rules and the
  copy-ready skeleton.
- `references/diagram-recipes.md` — step-by-step recipes per diagram type
  (class, activity, sequence, use case, state machine, component, etc.).
- `references/examples.md` — complete, valid XMI examples you can adapt.
- `references/troubleshooting.md` — import procedure, validation checklist,
  and a table of common import errors and fixes.
- `assets/class-diagram-template.xml` — a minimal, valid, importable file to
  copy and extend.

## Import (quick note)

In EA: **Publish > Model Exchange > Import > Import Package from XMI**
(`Ctrl+Alt+I`); export is `Ctrl+Alt+E`. Importing XMI *into* a Package
replaces that Package's existing contents — import into a fresh package when in
doubt. Full procedure in `references/troubleshooting.md`.

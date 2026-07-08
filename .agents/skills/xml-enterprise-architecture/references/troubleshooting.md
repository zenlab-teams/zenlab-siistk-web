# Import Procedure, Validation & Troubleshooting

## 1. Import procedure (EA 15.2.1559.26)

1. In the Browser, select (or create) the **Package** that will receive the
   model. Importing replaces that package's contents — use a fresh package if
   you want to keep existing work.
2. Ribbon: **Publish > Model Exchange > Import Package from XMI**
   (shortcut `Ctrl+Alt+I`).
3. Choose the `.xml` file. Pick **XMI 2.1** as the format if prompted.
4. Recommended options: *Strip GUIDs* OFF (keep ids), *Import Diagrams* ON.
5. Click **Import**. Open the imported diagram from the Browser to verify.

> Export (to study EA's own output) is **Publish > Model Exchange > Export**
> (`Ctrl+Alt+E`). Comparing against a real EA export is the best way to debug.

## 2. Validation checklist (run before delivering)

- [ ] XML is well-formed (`xmllint --noout file.xml`).
- [ ] Single root `xmi:XMI`, version `2.1`, both `uml` and `xmi` namespaces.
- [ ] `<xmi:Extension>` present with `elements`, `connectors`, `diagrams`
      in that order.
- [ ] Every `xmi:idref` resolves to a defined `xmi:id`.
- [ ] No duplicate `xmi:id` values.
- [ ] Package ids use `EAPK_`; element/connector/diagram ids use `EAID_`.
- [ ] Each diagram `<element>` has a valid `geometry` and a `subject` that
      matches a real element id.
- [ ] Connector `ea_type` and diagram `type` strings match the catalog
      exactly (mind the space in `Use Case`).
- [ ] Arrows/ampersands escaped (`-&gt;`, `&amp;`).
- [ ] Encoding declared `windows-1252` and file bytes match.

Quick id-resolution check (bash):

```bash
# list ids that are referenced but never defined
comm -23 \
  <(grep -o 'idref="[^"]*"' file.xml | sed 's/.*"\(.*\)"/\1/' | sort -u) \
  <(grep -o 'xmi:id="[^"]*"' file.xml | sed 's/.*"\(.*\)"/\1/' | sort -u)
```

## 3. Common import errors and fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| "Import failed / invalid XMI" | Wrong root or version | Use `xmi:XMI` + `xmi:version="2.1"` and both namespaces |
| Elements import but **no diagram** | Missing/empty `<diagrams>` or wrong `type` | Add `<diagram>` with a valid `type` string |
| Diagram opens **empty** | `subject` ids don't match element ids | Align `subject` with `xmi:id` |
| Boxes stacked on top of each other | Missing/zero `geometry` | Give each placement a real `Left/Top/Right/Bottom` |
| Relationships missing | Connector `source`/`target` idref wrong | Point ends at defined element ids |
| Composition shows as plain line | Aggregation not set | Set `<type aggregation="composite">` on the target end |
| Garbled accented characters | Encoding mismatch | Keep `windows-1252` (or switch declaration + bytes to UTF-8 consistently) |
| Duplicated elements each import | Re-importing into populated package | Import into a fresh package |
| `&` causes parse error | Unescaped ampersand | Use `&amp;` |
| Wrong element kind in EA | `ea_stype` / `xmi:type` mismatch | Make `<properties ea_stype>` match `xmi:type` |

## 4. Tips for fidelity

- The most reliable template is a real EA export of a tiny model. When in
  doubt, ask the user to export one diagram and mirror its structure.
- Keep `extenderID`/`exporterVersion` at `6.5` to match EA 15.x output.
- Generate GUIDs once and reuse them; never hand-edit a single id in only one
  place.

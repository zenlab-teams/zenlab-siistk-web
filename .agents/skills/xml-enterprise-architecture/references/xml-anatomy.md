# XMI 2.1 Anatomy for Enterprise Architect

This file documents the exact structure of an EA-importable XMI 2.1 file and
the rules for ids, properties, and geometry.

## 1. The prolog and root

```xml
<?xml version="1.0" encoding="windows-1252"?>
<xmi:XMI xmi:version="2.1"
         xmlns:uml="http://schema.omg.org/spec/UML/2.1"
         xmlns:xmi="http://schema.omg.org/spec/XMI/2.1">
  <xmi:Documentation exporter="Enterprise Architect" exporterVersion="6.5"/>
  <uml:Model xmi:type="uml:Model" name="EA_Model" visibility="public">
    <!-- packagedElements here -->
  </uml:Model>
  <xmi:Extension extender="Enterprise Architect" extenderID="6.5">
    <elements>   <!-- ... --> </elements>
    <connectors> <!-- ... --> </connectors>
    <diagrams>   <!-- ... --> </diagrams>
  </xmi:Extension>
</xmi:XMI>
```

- `exporterVersion`/`extenderID` of `6.5` is what EA writes for 15.x; keep it.
- The order inside `<xmi:Extension>` matters: **elements, connectors,
  diagrams**.

## 2. GUID conventions

- Format: `PREFIX_` + 32 hex digits grouped `8_4_4_4_12` with underscores.
  - Example: `EAID_2D9F7C10_4B6A_4F0E_9C2A_7E1F0B3D4C5D`.
- Prefixes:
  - `EAID_` — elements, connectors, diagrams, attributes, operations.
  - `EAPK_` — packages.
- The **same id** appears as `xmi:id` on the logical element and is referenced
  by `xmi:idref` in the EA extension and in connector ends. Never reuse an id
  for two different things; never reference an id that is not defined.

## 3. The logical model (`uml:Model`)

The root is a package; everything nests beneath it.

```xml
<uml:Model xmi:type="uml:Model" name="EA_Model" visibility="public">
  <packagedElement xmi:type="uml:Package"
                   xmi:id="EAPK_11111111_1111_1111_1111_111111111111"
                   name="Domain" visibility="public">
    <packagedElement xmi:type="uml:Class"
                     xmi:id="EAID_AAAAAAAA_0000_0000_0000_000000000001"
                     name="Customer" visibility="public">
      <ownedAttribute xmi:type="uml:Property"
                      xmi:id="EAID_AT_0000_0000_0000_000000000001"
                      name="id" visibility="private"/>
      <ownedOperation xmi:type="uml:Operation"
                      xmi:id="EAID_OP_0000_0000_0000_000000000001"
                      name="register" visibility="public"/>
    </packagedElement>
  </packagedElement>
</uml:Model>
```

## 4. The `<element>` (EA extension)

One per logical element. Carries EA metadata that the logical model can't.

```xml
<element xmi:idref="EAID_AAAAAAAA_0000_0000_0000_000000000001"
         xmi:type="uml:Class" name="Customer" scope="public">
  <model package="EAPK_11111111_1111_1111_1111_111111111111"
         tpos="0" ea_localid="1" ea_eleType="element"/>
  <properties documentation="" ea_stype="Class" />
  <project author="Muhammad Luthfi" version="1.0" phase="1.0" status="Proposed"/>
  <attributes>
    <attribute xmi:idref="EAID_AT_0000_0000_0000_000000000001" name="id" scope="Private">
      <properties type="int"/>
    </attribute>
  </attributes>
  <operations>
    <operation xmi:idref="EAID_OP_0000_0000_0000_000000000001" name="register" scope="Public"/>
  </operations>
</element>
```

- `xmi:idref` must equal the logical `xmi:id`.
- `ea_stype` comes from `references/element-catalog.md`.
- `<model package="...">` ties the element to its owning package id.

## 5. The `<connector>` (EA extension)

```xml
<connector xmi:idref="EAID_C0000001_0000_0000_0000_000000000001">
  <source xmi:idref="EAID_AAAAAAAA_0000_0000_0000_000000000001">
    <model ea_localid="1" type="Class" name="Customer"/>
    <role visibility="Public"/>
    <type multiplicity="1" aggregation="none"/>
  </source>
  <target xmi:idref="EAID_BBBBBBBB_0000_0000_0000_000000000002">
    <model ea_localid="2" type="Class" name="Order"/>
    <role visibility="Public"/>
    <type multiplicity="0..*" aggregation="none"/>
  </target>
  <properties ea_type="Association" direction="Source -&gt; Destination"/>
</connector>
```

- `<source>` / `<target>` `xmi:idref` must point to defined element ids.
- `ea_type` and `direction` come from `references/element-catalog.md`.
- For composition set `<target><type aggregation="composite"/>`; for
  aggregation use `aggregation="shared"`.

## 6. The `<diagram>` (EA extension)

```xml
<diagram xmi:id="EAID_D0000001_0000_0000_0000_000000000001">
  <model package="EAPK_11111111_1111_1111_1111_111111111111" owner="EAPK_11111111_1111_1111_1111_111111111111"/>
  <properties name="Domain Class Diagram" type="Logical"/>
  <project author="Muhammad Luthfi" version="1.0"/>
  <elements>
    <element geometry="Left=40;Top=40;Right=200;Bottom=140;"
             subject="EAID_AAAAAAAA_0000_0000_0000_000000000001" seqno="1"/>
    <element geometry="Left=320;Top=40;Right=480;Bottom=140;"
             subject="EAID_BBBBBBBB_0000_0000_0000_000000000002" seqno="2"/>
  </elements>
</diagram>
```

- `subject` references the element id to place.
- `type` is the diagram-type string from the catalog (note `Use Case` has a
  space).
- Connectors are not relisted here; EA draws them from the `<connectors>`
  section between placed elements.

## 7. Geometry rules

- Format: `Left=X;Top=Y;Right=X2;Bottom=Y2;` (trailing semicolon included).
- All values are **positive integers** in pixels; `Right > Left`,
  `Bottom > Top`.
- Typical box: 160 wide × 100 tall. Space columns ~280px apart, rows ~160px.
- Avoid overlaps; give actors/use cases room. Sequence lifelines are placed
  left-to-right along the top; EA extends their lifelines downward
  automatically.

## 8. Well-formedness reminders

- Escape `&` `<` `>` in attribute values (`-&gt;` for arrows, `&amp;`).
- Self-close empty elements (`<properties .../>`).
- One root element only (`xmi:XMI`).
- Keep the `windows-1252` declaration consistent with the actual bytes.

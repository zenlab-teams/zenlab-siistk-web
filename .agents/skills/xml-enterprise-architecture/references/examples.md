# Complete, Valid XMI Examples

All examples are XMI 2.1 with the Enterprise Architect extension and import
into EA 15.2. The class-diagram example is also shipped as a ready file at
`assets/class-diagram-template.xml`.

## 1. Use case diagram

Actor "Customer" associated with use case "Place Order", which includes
"Validate Cart".

```xml
<?xml version="1.0" encoding="windows-1252"?>
<xmi:XMI xmi:version="2.1"
         xmlns:uml="http://schema.omg.org/spec/UML/2.1"
         xmlns:xmi="http://schema.omg.org/spec/XMI/2.1">
  <xmi:Documentation exporter="Enterprise Architect" exporterVersion="6.5"/>
  <uml:Model xmi:type="uml:Model" name="EA_Model" visibility="public">
    <packagedElement xmi:type="uml:Package" xmi:id="EAPK_UC000000_0000_0000_0000_000000000001" name="UseCases" visibility="public">
      <packagedElement xmi:type="uml:Actor" xmi:id="EAID_ACT00001_0000_0000_0000_000000000001" name="Customer" visibility="public"/>
      <packagedElement xmi:type="uml:UseCase" xmi:id="EAID_UCS00001_0000_0000_0000_000000000002" name="Place Order" visibility="public"/>
      <packagedElement xmi:type="uml:UseCase" xmi:id="EAID_UCS00002_0000_0000_0000_000000000003" name="Validate Cart" visibility="public"/>
    </packagedElement>
  </uml:Model>
  <xmi:Extension extender="Enterprise Architect" extenderID="6.5">
    <elements>
      <element xmi:idref="EAID_ACT00001_0000_0000_0000_000000000001" xmi:type="uml:Actor" name="Customer" scope="public">
        <model package="EAPK_UC000000_0000_0000_0000_000000000001" ea_localid="1"/>
        <properties ea_stype="Actor"/>
      </element>
      <element xmi:idref="EAID_UCS00001_0000_0000_0000_000000000002" xmi:type="uml:UseCase" name="Place Order" scope="public">
        <model package="EAPK_UC000000_0000_0000_0000_000000000001" ea_localid="2"/>
        <properties ea_stype="UseCase"/>
      </element>
      <element xmi:idref="EAID_UCS00002_0000_0000_0000_000000000003" xmi:type="uml:UseCase" name="Validate Cart" scope="public">
        <model package="EAPK_UC000000_0000_0000_0000_000000000001" ea_localid="3"/>
        <properties ea_stype="UseCase"/>
      </element>
    </elements>
    <connectors>
      <connector xmi:idref="EAID_CN000001_0000_0000_0000_000000000010">
        <source xmi:idref="EAID_ACT00001_0000_0000_0000_000000000001"><model type="Actor" name="Customer"/></source>
        <target xmi:idref="EAID_UCS00001_0000_0000_0000_000000000002"><model type="UseCase" name="Place Order"/></target>
        <properties ea_type="Association" direction="Unspecified"/>
      </connector>
      <connector xmi:idref="EAID_CN000002_0000_0000_0000_000000000011">
        <source xmi:idref="EAID_UCS00001_0000_0000_0000_000000000002"><model type="UseCase" name="Place Order"/></source>
        <target xmi:idref="EAID_UCS00002_0000_0000_0000_000000000003"><model type="UseCase" name="Validate Cart"/></target>
        <properties ea_type="Include" direction="Source -&gt; Destination"/>
      </connector>
    </connectors>
    <diagrams>
      <diagram xmi:id="EAID_DG000001_0000_0000_0000_000000000020">
        <model package="EAPK_UC000000_0000_0000_0000_000000000001" owner="EAPK_UC000000_0000_0000_0000_000000000001"/>
        <properties name="Order Use Cases" type="Use Case"/>
        <elements>
          <element geometry="Left=40;Top=120;Right=120;Bottom=220;" subject="EAID_ACT00001_0000_0000_0000_000000000001" seqno="1"/>
          <element geometry="Left=300;Top=60;Right=480;Bottom=120;" subject="EAID_UCS00001_0000_0000_0000_000000000002" seqno="2"/>
          <element geometry="Left=300;Top=200;Right=480;Bottom=260;" subject="EAID_UCS00002_0000_0000_0000_000000000003" seqno="3"/>
        </elements>
      </diagram>
    </diagrams>
  </xmi:Extension>
</xmi:XMI>
```

## 2. Activity diagram

Initial → Action "Receive Order" → Decision → (Approve) Action "Ship" → Final.

```xml
<?xml version="1.0" encoding="windows-1252"?>
<xmi:XMI xmi:version="2.1"
         xmlns:uml="http://schema.omg.org/spec/UML/2.1"
         xmlns:xmi="http://schema.omg.org/spec/XMI/2.1">
  <xmi:Documentation exporter="Enterprise Architect" exporterVersion="6.5"/>
  <uml:Model xmi:type="uml:Model" name="EA_Model" visibility="public">
    <packagedElement xmi:type="uml:Package" xmi:id="EAPK_AC000000_0000_0000_0000_000000000001" name="Process" visibility="public">
      <packagedElement xmi:type="uml:Activity" xmi:id="EAID_ACV00001_0000_0000_0000_000000000001" name="Order Handling" visibility="public">
        <node xmi:type="uml:InitialNode" xmi:id="EAID_ND000001_0000_0000_0000_000000000002" name="Start"/>
        <node xmi:type="uml:OpaqueAction" xmi:id="EAID_ND000002_0000_0000_0000_000000000003" name="Receive Order"/>
        <node xmi:type="uml:DecisionNode" xmi:id="EAID_ND000003_0000_0000_0000_000000000004" name="Approved?"/>
        <node xmi:type="uml:OpaqueAction" xmi:id="EAID_ND000004_0000_0000_0000_000000000005" name="Ship"/>
        <node xmi:type="uml:ActivityFinalNode" xmi:id="EAID_ND000005_0000_0000_0000_000000000006" name="End"/>
      </packagedElement>
    </packagedElement>
  </uml:Model>
  <xmi:Extension extender="Enterprise Architect" extenderID="6.5">
    <elements>
      <element xmi:idref="EAID_ND000001_0000_0000_0000_000000000002" xmi:type="uml:InitialNode" name="Start" scope="public"><properties ea_stype="StateNode"/></element>
      <element xmi:idref="EAID_ND000002_0000_0000_0000_000000000003" xmi:type="uml:Action" name="Receive Order" scope="public"><properties ea_stype="Action"/></element>
      <element xmi:idref="EAID_ND000003_0000_0000_0000_000000000004" xmi:type="uml:DecisionNode" name="Approved?" scope="public"><properties ea_stype="Decision"/></element>
      <element xmi:idref="EAID_ND000004_0000_0000_0000_000000000005" xmi:type="uml:Action" name="Ship" scope="public"><properties ea_stype="Action"/></element>
      <element xmi:idref="EAID_ND000005_0000_0000_0000_000000000006" xmi:type="uml:ActivityFinalNode" name="End" scope="public"><properties ea_stype="StateNode"/></element>
    </elements>
    <connectors>
      <connector xmi:idref="EAID_CF000001_0000_0000_0000_000000000010">
        <source xmi:idref="EAID_ND000001_0000_0000_0000_000000000002"/>
        <target xmi:idref="EAID_ND000002_0000_0000_0000_000000000003"/>
        <properties ea_type="ControlFlow" direction="Source -&gt; Destination"/>
      </connector>
      <connector xmi:idref="EAID_CF000002_0000_0000_0000_000000000011">
        <source xmi:idref="EAID_ND000002_0000_0000_0000_000000000003"/>
        <target xmi:idref="EAID_ND000003_0000_0000_0000_000000000004"/>
        <properties ea_type="ControlFlow" direction="Source -&gt; Destination"/>
      </connector>
      <connector xmi:idref="EAID_CF000003_0000_0000_0000_000000000012">
        <source xmi:idref="EAID_ND000003_0000_0000_0000_000000000004"/>
        <target xmi:idref="EAID_ND000004_0000_0000_0000_000000000005"/>
        <properties ea_type="ControlFlow" direction="Source -&gt; Destination"/>
        <labels mb="[Approved]"/>
      </connector>
      <connector xmi:idref="EAID_CF000004_0000_0000_0000_000000000013">
        <source xmi:idref="EAID_ND000004_0000_0000_0000_000000000005"/>
        <target xmi:idref="EAID_ND000005_0000_0000_0000_000000000006"/>
        <properties ea_type="ControlFlow" direction="Source -&gt; Destination"/>
      </connector>
    </connectors>
    <diagrams>
      <diagram xmi:id="EAID_DG000002_0000_0000_0000_000000000020">
        <model package="EAPK_AC000000_0000_0000_0000_000000000001" owner="EAID_ACV00001_0000_0000_0000_000000000001"/>
        <properties name="Order Handling" type="Activity"/>
        <elements>
          <element geometry="Left=120;Top=20;Right=160;Bottom=60;" subject="EAID_ND000001_0000_0000_0000_000000000002" seqno="1"/>
          <element geometry="Left=80;Top=120;Right=240;Bottom=180;" subject="EAID_ND000002_0000_0000_0000_000000000003" seqno="2"/>
          <element geometry="Left=110;Top=240;Right=210;Bottom=300;" subject="EAID_ND000003_0000_0000_0000_000000000004" seqno="3"/>
          <element geometry="Left=80;Top=360;Right=240;Bottom=420;" subject="EAID_ND000004_0000_0000_0000_000000000005" seqno="4"/>
          <element geometry="Left=120;Top=480;Right=160;Bottom=520;" subject="EAID_ND000005_0000_0000_0000_000000000006" seqno="5"/>
        </elements>
      </diagram>
    </diagrams>
  </xmi:Extension>
</xmi:XMI>
```

## 3. Sequence diagram (messages)

Two lifelines, one synchronous call and one reply.

```xml
<?xml version="1.0" encoding="windows-1252"?>
<xmi:XMI xmi:version="2.1"
         xmlns:uml="http://schema.omg.org/spec/UML/2.1"
         xmlns:xmi="http://schema.omg.org/spec/XMI/2.1">
  <xmi:Documentation exporter="Enterprise Architect" exporterVersion="6.5"/>
  <uml:Model xmi:type="uml:Model" name="EA_Model" visibility="public">
    <packagedElement xmi:type="uml:Package" xmi:id="EAPK_SQ000000_0000_0000_0000_000000000001" name="Interactions" visibility="public">
      <packagedElement xmi:type="uml:Class" xmi:id="EAID_LL000001_0000_0000_0000_000000000002" name=":UI" visibility="public"/>
      <packagedElement xmi:type="uml:Class" xmi:id="EAID_LL000002_0000_0000_0000_000000000003" name=":Service" visibility="public"/>
    </packagedElement>
  </uml:Model>
  <xmi:Extension extender="Enterprise Architect" extenderID="6.5">
    <elements>
      <element xmi:idref="EAID_LL000001_0000_0000_0000_000000000002" xmi:type="uml:Sequence" name=":UI" scope="public"><properties ea_stype="Sequence"/></element>
      <element xmi:idref="EAID_LL000002_0000_0000_0000_000000000003" xmi:type="uml:Sequence" name=":Service" scope="public"><properties ea_stype="Sequence"/></element>
    </elements>
    <connectors>
      <connector xmi:idref="EAID_MS000001_0000_0000_0000_000000000010">
        <source xmi:idref="EAID_LL000001_0000_0000_0000_000000000002"/>
        <target xmi:idref="EAID_LL000002_0000_0000_0000_000000000003"/>
        <properties ea_type="Sequence" direction="Source -&gt; Destination"/>
        <labels mb="getData()"/>
        <appearance seqno="1"/>
      </connector>
      <connector xmi:idref="EAID_MS000002_0000_0000_0000_000000000011">
        <source xmi:idref="EAID_LL000002_0000_0000_0000_000000000003"/>
        <target xmi:idref="EAID_LL000001_0000_0000_0000_000000000002"/>
        <properties ea_type="Sequence" direction="Source -&gt; Destination" subtype="Reply"/>
        <labels mb="data"/>
        <appearance seqno="2"/>
      </connector>
    </connectors>
    <diagrams>
      <diagram xmi:id="EAID_DG000003_0000_0000_0000_000000000020">
        <model package="EAPK_SQ000000_0000_0000_0000_000000000001" owner="EAPK_SQ000000_0000_0000_0000_000000000001"/>
        <properties name="Fetch Data" type="Sequence"/>
        <elements>
          <element geometry="Left=80;Top=20;Right=160;Bottom=60;" subject="EAID_LL000001_0000_0000_0000_000000000002" seqno="1"/>
          <element geometry="Left=360;Top=20;Right=440;Bottom=60;" subject="EAID_LL000002_0000_0000_0000_000000000003" seqno="2"/>
        </elements>
      </diagram>
    </diagrams>
  </xmi:Extension>
</xmi:XMI>
```

# EA Element, Connector & Diagram Catalog

Reference for the exact type strings Enterprise Architect 15.2 expects. Use
these verbatim — EA matches on the literal string.

## 1. Element `xmi:type` (logical model + `<element>`)

In `uml:Model`, each `packagedElement` carries `xmi:type`. In the EA extension,
the matching `<element>` carries the same `xmi:type` and an `<properties>`
child with `ea_stype` (EA's short type name).

| Concept | `xmi:type` | EA `ea_stype` |
|---|---|---|
| Class | `uml:Class` | Class |
| Interface | `uml:Interface` | Interface |
| Enumeration | `uml:Enumeration` | Enumeration |
| Data type | `uml:DataType` | DataType |
| Primitive type | `uml:PrimitiveType` | PrimitiveType |
| Signal | `uml:Signal` | Signal |
| Component | `uml:Component` | Component |
| Node (deployment) | `uml:Node` | Node |
| Device | `uml:Node` (stereotype device) | Device |
| Artifact | `uml:Artifact` | Artifact |
| Use case | `uml:UseCase` | UseCase |
| Actor | `uml:Actor` | Actor |
| Package | `uml:Package` | Package |
| Object / instance | `uml:InstanceSpecification` | Object |
| Activity | `uml:Activity` | Activity |
| Action | `uml:Action` (or `uml:OpaqueAction`) | Action |
| Initial node | `uml:InitialNode` | StateNode |
| Activity final | `uml:ActivityFinalNode` | StateNode |
| Flow final | `uml:FlowFinalNode` | StateNode |
| Decision / Merge | `uml:DecisionNode` / `uml:MergeNode` | Decision |
| Fork / Join | `uml:ForkNode` / `uml:JoinNode` | StateNode |
| State | `uml:State` | State |
| Initial (state) | `uml:Pseudostate` (kind initial) | StateNode |
| Final state | `uml:FinalState` | StateNode |
| Lifeline (sequence) | `uml:Lifeline` (EA models as Object/Sequence) | Sequence |
| Port | `uml:Port` | Port |
| Part / Property | `uml:Property` | Part |
| Collaboration | `uml:Collaboration` | Collaboration |
| Boundary | `uml:Class` (stereotype boundary) | Boundary |

> Tip: for nodes that EA stores as "StateNode", set the precise kind via the
> `<properties>` `ea_stype` plus a `<modelElement>`/stereotype where needed.

## 2. Connector types (`<connector>` + `uml:` relationship)

Each `<connector>` has a `<properties ea_type="...">`. The logical model uses
the matching UML construct.

| Relationship | Connector `ea_type` | UML construct |
|---|---|---|
| Association | `Association` | `ownedAttribute` / `packagedElement uml:Association` |
| Aggregation | `Aggregation` | Association with `aggregation="shared"` |
| Composition | `Aggregation` (`ea_subtype` strong) | Association with `aggregation="composite"` |
| Generalization | `Generalization` | `generalization` |
| Realization / Realize | `Realisation` | `uml:Realization` |
| Dependency | `Dependency` | `uml:Dependency` |
| Usage («use») | `Usage` | `uml:Usage` |
| Include (use case) | `Include` | `uml:Include` |
| Extend (use case) | `Extend` | `uml:Extend` |
| Control / Activity flow | `ControlFlow` | `uml:ControlFlow` |
| Object flow | `ObjectFlow` | `uml:ObjectFlow` |
| Message (sequence) | `Sequence` | `uml:Message` |
| Transition (state) | `StateFlow` | `uml:Transition` |
| Information flow | `InformationFlow` | `uml:InformationFlow` |
| Deployment | `Deployment` | `uml:Deployment` |
| Manifest | `Manifest` | `uml:Manifestation` |
| Nesting / Package | `Nesting` | nested `packagedElement` |
| Assembly / Delegate | `Assembly` / `Delegate` | connector via ports |

Connector direction is set with `<properties direction="...">`:
`Source -> Destination`, `Destination -> Source`, `Bi-Directional`, or
`Unspecified`.

## 3. Diagram `type` strings (`<diagram><properties type="...">`)

| Diagram | EA `type` value |
|---|---|
| Class | `Logical` |
| Object | `Object` |
| Composite structure | `CompositeStructure` |
| Package | `Package` |
| Use case | `Use Case` |
| Activity | `Activity` |
| State machine | `Statechart` |
| Sequence | `Sequence` |
| Communication / Collaboration | `Collaboration` |
| Timing | `Timing` |
| Interaction overview | `InteractionOverview` |
| Component | `Component` |
| Deployment | `Deployment` |

> The diagram's `<properties name="..." type="..."/>` `type` must be one of the
> strings above exactly (note the space in `Use Case`).

## 4. Supported XMI flavors in EA 15.2

EA 15.2 can import/export: **XMI 1.1, 1.2, 2.1, 2.4.2, 2.5.1**, plus EA's
**Native XML** and **`.xea`**. This skill standardizes on **XMI 2.1** because it
is the most reliable round-trip for full diagram + geometry data.

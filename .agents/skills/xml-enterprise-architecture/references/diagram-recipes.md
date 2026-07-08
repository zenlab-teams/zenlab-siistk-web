# Per-Diagram Recipes

Each recipe lists the logical elements, the EA element/connector/diagram types,
and placement tips. Pair with `references/element-catalog.md` for exact
strings and `references/xml-anatomy.md` for structure.

## Class diagram (`type="Logical"`)

- **Elements:** `uml:Class`, `uml:Interface`, `uml:Enumeration`, `uml:DataType`.
- **Members:** `ownedAttribute` (Property) and `ownedOperation` (Operation),
  mirrored under `<element><attributes>`/`<operations>`.
- **Connectors:** `Association`, `Aggregation` (shared), `Aggregation` +
  composite, `Generalization`, `Realisation`, `Dependency`.
- **Layout:** grid of boxes 160×100, 280px column gap. Put parents above
  children for generalizations.

## Use case diagram (`type="Use Case"`)

- **Elements:** `uml:Actor`, `uml:UseCase`, optional boundary (`uml:Class`
  stereotype boundary).
- **Connectors:** `Association` (actor–use case), `Include`, `Extend`,
  `Generalization` (actor or use case inheritance).
- **Layout:** actors on the left column, use cases stacked in the center, the
  system boundary box around the use cases.

## Activity diagram (`type="Activity"`)

- **Elements:** `uml:Activity` (container), `uml:Action`/`uml:OpaqueAction`,
  `uml:InitialNode`, `uml:ActivityFinalNode`, `uml:DecisionNode`,
  `uml:MergeNode`, `uml:ForkNode`, `uml:JoinNode`.
- **Connectors:** `ControlFlow` (default), `ObjectFlow` (when passing objects).
  Add `guard` text on flows out of decisions.
- **Layout:** top-to-bottom. Initial node at top, final at bottom; decisions
  branch horizontally.

## Sequence diagram (`type="Sequence"`)

- **Elements:** lifelines modeled as EA `Sequence` objects
  (`uml:Lifeline` / `InstanceSpecification`). Optionally fragments
  (`uml:CombinedFragment`) for alt/loop/opt.
- **Connectors:** `Sequence` (messages). Set message kind via
  `<properties>` (synchronous call, reply, async). Order messages with the
  connector `seqno`/`sequence` so EA stacks them vertically.
- **Layout:** lifelines spaced left-to-right along the top (e.g. Left=40,
  Left=240, Left=440…). EA draws activation bars and vertical lifelines.

## State machine diagram (`type="Statechart"`)

- **Elements:** `uml:State`, `uml:Pseudostate` (initial/choice/junction),
  `uml:FinalState`.
- **Connectors:** `StateFlow` (transitions) with `guard` and `effect`/trigger
  text on `<properties>`.
- **Layout:** initial pseudostate at top-left, transitions flow toward the
  final state.

## Component diagram (`type="Component"`)

- **Elements:** `uml:Component`, `uml:Interface`, `uml:Port`.
- **Connectors:** `Realisation` (component realizes interface), `Usage`
  («use»), `Assembly`/`Delegate` (through ports), `Dependency`.
- **Layout:** components as larger boxes; place provided/required interfaces
  on the component edges.

## Deployment diagram (`type="Deployment"`)

- **Elements:** `uml:Node` (and device-stereotyped nodes), `uml:Artifact`.
- **Connectors:** `Deployment` (artifact onto node), `Manifest`
  (artifact manifests component), `Association` (communication path).
- **Layout:** nodes as 3D box shapes; nest artifacts inside their nodes.

## Object diagram (`type="Object"`)

- **Elements:** `uml:InstanceSpecification` (Objects), with `classifier`
  pointing at the class id.
- **Connectors:** `Association` instance links.

## Communication / Collaboration diagram (`type="Collaboration"`)

- **Elements:** lifelines/objects (`InstanceSpecification`).
- **Connectors:** `Sequence` messages numbered (1, 1.1, 2…) to express order
  without vertical time.

## Package diagram (`type="Package"`)

- **Elements:** `uml:Package` (`EAPK_` ids).
- **Connectors:** `Nesting`, `Dependency`, `Usage` between packages.

## Composite structure (`type="CompositeStructure"`)

- **Elements:** `uml:Class` with internal `uml:Property` parts and `uml:Port`s,
  `uml:Collaboration`.
- **Connectors:** `Assembly`/`Delegate` connectors between ports/parts.

## Timing & Interaction overview

- Timing (`type="Timing"`): lifelines with state-over-time; less common, model
  lifelines as objects and use `StateFlow` for state changes.
- Interaction overview (`type="InteractionOverview"`): an activity diagram
  whose actions are interaction-use references; use `ControlFlow` between them.

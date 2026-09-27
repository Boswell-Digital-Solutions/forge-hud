# Authority boundary

The caller is responsible for authenticating and interpreting its source. Validation
checks structure and known contradictions; it cannot prove backend truth, that a
mapping is semantically correct for an arbitrary application, or that a sender may
approve an action. Do not feed arbitrary user-authored mappings to live authority UI.

Application-owned mappings translate exact source/context/native-state tuples into
presentation roles. `MappingContract.owner` identifies the supplied contract owner;
it is metadata, not an identity credential. Profiles control only fixed language,
density, contrast, reduced motion and source accent. They do not contain mappings.

Snapshots carry source, observation timestamp, role-independent channels, locks,
reason, simulation marking and producer-permitted action IDs. IDs do not include
executable callbacks or transport. The display model can suppress IDs but cannot
create them. The application binds existing handlers and rechecks backend permission
at execution time. Display eligibility is never an authorization token.

An explicit emergency halt is a source/reason object. It overrides a normal or
unmapped workflow state. Invalid profiles/mappings keep a conservative static halt
with `valid: false`, provenance and no actions; ordinary validation errors return
`unavailable`. No frontend operation clears a halt or synthesizes backend clearance.

The initial lock policy suppresses all action IDs. A later integration needing
lock-safe remediation controls must explicitly design and verify that distinction;
this slice does not replace existing UGA or NextAction logic.

Inputs are copied before returning display data. Exported vocabularies and label
pairs are frozen. Consumers must render text as escaped text nodes, never HTML.
There is no networking, persistence, token handling, evidence signing, notification
dispatch, timer, mutable application store, or backend state transition in the package.

Any `simulation: true` snapshot remains conspicuously labeled and action-disabled.
Examples based on pinned source vocabularies are fixtures, not live operational
receipts or evidence that consuming applications are integrated.

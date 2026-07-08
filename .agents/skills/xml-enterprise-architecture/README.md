# xml-enterprise-architecture

An Agent Skill (skills.sh / agentskills.io format) that makes an AI agent an
expert at generating **XML/XMI files that import cleanly into Sparx Enterprise
Architect 15.2.1559.26** — for every UML diagram type.

## What's inside

```
xml-enterprise-architecture/
├─ SKILL.md                       # entry point: frontmatter + core instructions
├─ references/
│  ├─ element-catalog.md          # element / connector / diagram type strings
│  ├─ xml-anatomy.md              # XMI 2.1 structure, GUID & geometry rules
│  ├─ diagram-recipes.md          # step-by-step recipe per diagram type
│  ├─ examples.md                 # full, valid use case / activity / sequence XMI
│  └─ troubleshooting.md          # import steps, validation checklist, error table
└─ assets/
   └─ class-diagram-template.xml  # minimal, valid, importable starter file
```

## Install

With the Agent Skills CLI:

```bash
npx skills add <owner>/<repo>
```

Or drop the `xml-enterprise-architecture/` folder into your agent's skills
directory:

- Claude Code / Claude.ai: `.claude/skills/`
- Codex, Cursor, opencode, Antigravity, etc.: your tool's skills/agent folder

## Validate

```bash
skills-ref validate ./xml-enterprise-architecture
```

## Use

Ask your agent to "create a <diagram type> as XMI for Enterprise Architect".
The agent loads SKILL.md, then pulls detail from `references/` as needed and
adapts `assets/class-diagram-template.xml`.

License: MIT.

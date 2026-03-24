# RevenueLeak Skills

This project includes custom skills for Claude Code. Each skill provides specialized knowledge and patterns for different development tasks.

## Available Skills

| Skill | Command | Description |
|-------|---------|-------------|
| Frontend | `/frontend` | React/Next.js UI development, Tailwind, Framer Motion, premium design patterns |
| Backend | `/backend` | API routes, server actions, webhooks, authentication |
| Database | `/database` | Supabase/PostgreSQL queries, migrations, RLS policies |
| Testing | `/testing` | Jest, React Testing Library, integration tests |
| UI Components | `/ui-components` | shadcn/ui patterns, design system, reusable components |
| Performance | `/performance` | Bundle optimization, caching, Server Components |

## Skill Locations

Skills are located in `.claude/skills/`:

```
.claude/
  skills/
    frontend/SKILL.md
    backend/SKILL.md
    database/SKILL.md
    testing/SKILL.md
    ui-components/SKILL.md
    performance/SKILL.md
```

## Usage

Invoke skills by name when working on related tasks:
- "Use /frontend to build the new dashboard"
- "Apply /backend patterns for the webhook handler"
- "Help me with /database schema design"

Skills are also automatically suggested based on context.

## Adding New Skills

Create a new directory under `.claude/skills/` with a `SKILL.md` file:

```markdown
---
name: skill-name
description: When to use this skill. Be specific about triggers.
---

# Skill Name

Instructions and patterns Claude should follow...
```

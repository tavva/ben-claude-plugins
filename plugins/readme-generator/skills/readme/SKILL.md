---
name: readme
description: This skill should be used when the user asks to "create a README", "write a README", "generate a README", "improve my README", "make my README better", "README best practices", or mentions needing project documentation. Provides guidance for creating excellent READMEs following patterns from awesome-readme.
---

# README Generation

Generate excellent README files that communicate project value clearly and help users get started quickly.

## Core Principles

Great READMEs answer three questions immediately:

1. **What is this?** - Clear, one-sentence description of purpose
2. **Why should I care?** - The problem it solves or value it provides
3. **How do I use it?** - Quick start that gets users running in under a minute

## Before Writing

Analyse the project to understand:

- **Primary audience**: Developers? End users? Both?
- **Project maturity**: Alpha/beta? Production-ready?
- **Complexity level**: Simple utility? Complex framework?
- **Key differentiators**: What makes this stand out from alternatives?

Read existing code, configuration files, and any existing documentation to extract accurate information.

## Essential Sections

### 1. Title and Description

Start with a clear, descriptive title. Follow with a one-paragraph description that explains:

- What the project does (not how it works)
- Who it's for
- Key benefits or features

```markdown
# Project Name

Brief description of what this project does and why it exists.
A sentence about the key benefit or problem it solves.
```

### 2. Visual Elements (When Applicable)

Add visual elements that communicate quickly:

- **Badges**: Build status, version, licence, coverage
- **Logo/Banner**: Professional branding for larger projects
- **Screenshot/GIF**: Show the tool in action (especially for CLIs and UIs)
- **Architecture diagram**: For complex systems

Place badges immediately after the title. Place screenshots/GIFs after the description.

### 3. Quick Start

Provide the fastest path to a working example:

```markdown
## Quick Start

\`\`\`bash
npm install project-name
\`\`\`

\`\`\`javascript
import { thing } from 'project-name';
thing.doSomething();
\`\`\`
```

Keep quick start under 5 steps. Link to detailed installation for complex setups.

### 4. Installation

Cover all supported installation methods:

- Package managers (npm, pip, cargo, brew)
- Building from source
- Docker/container options
- System requirements and prerequisites

Include version compatibility information where relevant.

### 5. Usage

Show real, practical examples:

- Start with the most common use case
- Progress from simple to complex
- Include actual output where helpful
- Cover configuration options

```markdown
## Usage

### Basic Example

\`\`\`javascript
// Description of what this does
const result = doThing(input);
console.log(result);
// Output: expected output
\`\`\`

### Advanced Configuration

\`\`\`javascript
// More complex example with options
\`\`\`
```

### 6. API Reference (For Libraries)

Document public interfaces:

- Function signatures with parameter types
- Return values and their types
- Example usage for each function
- Error handling and edge cases

For extensive APIs, link to separate documentation rather than bloating the README.

### 7. Contributing

Include or link to contribution guidelines:

- How to report bugs
- How to suggest features
- Development setup instructions
- Code style and testing requirements
- Pull request process

### 8. Licence

State the licence clearly. Link to the full LICENCE file.

```markdown
## Licence

MIT - see [LICENCE](LICENCE) for details.
```

## Section Order

Recommended order for most projects:

1. Title + Badges
2. Description
3. Screenshot/Demo (if applicable)
4. Table of Contents (for longer READMEs)
5. Quick Start
6. Installation
7. Usage/Examples
8. API Reference (if applicable)
9. Configuration
10. Contributing
11. Licence
12. Acknowledgements (optional)

## Writing Style

### Be Concise

- Lead with the most important information
- Use bullet points for lists
- Keep paragraphs short (2-4 sentences)
- Remove unnecessary words

### Be Specific

- Show exact commands, not descriptions of commands
- Include actual output examples
- Specify versions and compatibility
- Provide working code, not pseudocode

### Be Scannable

- Use descriptive headings
- Add table of contents for READMEs over 200 lines
- Use code blocks liberally
- Bold key terms and warnings

## Project-Specific Guidance

### CLI Tools

- Show installation via package manager
- Include GIF of the tool in action
- Document all flags and options
- Show common workflows end-to-end

### Libraries/Frameworks

- Focus on API examples
- Show integration with common tools
- Include TypeScript types if available
- Link to comprehensive docs site

### Applications

- Lead with screenshots
- Include system requirements
- Provide download links prominently
- Cover configuration and customisation

### Open Source Projects

- Include badges for build status, coverage, version
- Add contributing guidelines prominently
- Show appreciation for contributors
- Link to community channels (Discord, discussions)

## Common Mistakes to Avoid

- **Starting with installation**: Lead with what the project does first
- **Assuming knowledge**: Explain acronyms and concepts on first use
- **Outdated examples**: Ensure code examples actually work
- **Missing prerequisites**: List all dependencies and requirements
- **Wall of text**: Break up content with headings and code blocks
- **No quick start**: Users should see something working in under a minute
- **Hiding the demo**: Screenshots and GIFs should be near the top

## Quality Checklist

Before finalising a README:

- [ ] Title clearly describes the project
- [ ] Description explains what it does and why
- [ ] Quick start gets users running in under a minute
- [ ] All code examples are tested and working
- [ ] Installation covers all supported methods
- [ ] Screenshots/GIFs show the project in action (where applicable)
- [ ] Badges reflect current project status
- [ ] Links are not broken
- [ ] Licence is clearly stated
- [ ] Contact/contribution info is included

## Additional Resources

For detailed patterns, badge examples, and templates:

- **`references/patterns.md`** - Comprehensive patterns, badge snippets, and structural templates

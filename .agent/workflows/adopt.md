# Adopt an existing project

Goal: learn what the repo is and record it in [project](../project.md). Change no code.

1. **Read.** Manifests, README, scripts, `.gitignore`, `.env.example`, folders, last 10
   commits.
2. **Fill project.md** from what you read. Keep `<>` for what you cannot confirm. Read what a
   command does before you trust it.
3. **Compare with the stack.** Put differences under "Deviations" (for example MUI instead of
   Tailwind). The repo's choices win. Do not migrate unless asked.
4. **Run safe checks** (lint, build, tests). Install only if the user agrees. Record real
   results; mark failures that existed before you touched anything.
5. **Report gaps** in 5 lines: missing `.env.example`, secrets in git, scripts pointing to
   missing files, no tests, outdated README. Fix them only if asked. Then apply
   [done](../done.md) and stop.

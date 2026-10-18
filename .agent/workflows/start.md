# Start a new project

Goal: a small, working, verified base. Do not pre-build features nobody asked for.

1. **Scope.** Purpose, v1 scope, and 3-5 observable acceptance criteria. Ask only if the
   answer changes scope or data.
2. **Stack.** Use [stack](../stack.md) and the picks in [project](../project.md).
3. **Scaffold.** Look at the folder first and keep existing files. Use the official generator
   (for example Vite for React). Add `.gitignore` (`node_modules`, `dist`, `.env`) and
   `.env.example`. Run `git init` only if asked.
4. **Commands.** Install, run, and test must each work from one documented command. Run them
   and record the real results in project.md.
5. **First path.** Build and verify one end-to-end path that meets a criterion (request to
   response, or click to screen). The smoke test must be real.
6. Fill project.md, apply [done](../done.md), stop.

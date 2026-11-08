# Production web deployment

The user wants frequent web updates by saying **“cập nhật lên prod”**.
Follow `web/deploy/PRODUCTION.md` for setup status and the deployment procedure.

- An explicit production-update request authorizes testing, committing the intended
  changes, pushing them, and creating a new `prod-*` tag to trigger the workflow.
  Ordinary edit/preview requests do not authorize a production deployment.
- Preserve unrelated work, private files and live player data. Do not use a broad
  `git add .` or reset the worktree to prepare a deployment.
- Do not assume that Actions secrets, first installation, LIVE sync or HTTPS are
  configured merely because the workflow exists. Report the actual blocker.
- Verify the requested full SHA on `/deploy-version.json` and readiness on
  `/healthz` before reporting deployment complete. A successful push is not
  sufficient evidence.
- The workflow deploys the VPS web. Do not restart the Windows LIVE game during a
  stream or discard pending LIVE–web ownership transfers to speed up deployment.

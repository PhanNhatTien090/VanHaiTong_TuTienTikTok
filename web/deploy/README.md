# Player web deployment

For daily updates triggered by “cập nhật lên prod”, see
[the GitHub Actions production workflow](PRODUCTION.md). After one-time setup,
it transfers only changed files and does not require manual release archives.

The release contains code/assets only. Account migration is private, one-time and must happen before the first cloud start. Engine, TikFinity and TTS stay on the LIVE machine. Gameplay stays locked.

1. Provision supported Linux with persistent disk, Node.js LTS 24+ current patch, nginx, certbot, python3-certbot-nginx, openssl. Use one instance, no PM2 cluster. Open only SSH and 80/443; Node stays on loopback 4320.
2. Extract the tar.gz under `/opt/van-hai-web/releases/<version>`. Run `sudo bash web/deploy/install.sh game.example.com` from the release. It installs without starting the service or overwriting an existing installation.
3. Stop public ingress to the OLD web (stop only its tunnel, not LIVE), wait for its final account save. Securely copy `data/web/accounts.json` and a consistent world snapshot to a private staging directory outside the web root. Use the world snapshot only to preserve webOnly characters. Keep an independent backup of both. Never copy the standalone test `web/data/accounts.json`.
4. Before starting cloud, import as its service user: `sudo -u vanhai-web /usr/bin/node web/cloud/cli.mjs import --data /var/lib/van-hai-web --accounts /private/accounts.json --world /private/world.json`. This refuses to overwrite initialized accounts. Import output prints counts only. Do not delete the original account/world backups.
5. Start the cloud service, reload nginx, configure HTTPS with certbot. Cookies require HTTPS. Verify DNS/HTTPS externally before directing players here; do not weaken cookie security to make HTTP appear to work.
6. Create the agent's PRIVATE JSON config on the LIVE machine with `url` (HTTPS), `secret` (same WEB_SYNC_SECRET as the server environment file), absolute `dataDir`, and optional `sourceUrl` (defaults to the existing local LIVE export). Keep the file in private `data/`, never public/source control. Start `scripts/start-web-cloud-agent.ps1 -ConfigFile <private-path>`. It reads loopback and subscribes to TikFinity comments; it does not run game actions, restart LIVE or forward gifts.
7. Confirm `/healthz` shows ready, profile count and recent sync; verify existing-user login, one-time link, read-only gates, admin/dev denial and data-file denial. The agent retains a checkpoint and at most one pending sync batch; preserve its directory across restarts and code updates.
8. Enable the service on reboot. Configure the Windows agent to start at user logon with the same hidden launch script. Local SQLite snapshots run every 30 minutes (48 retained); add encrypted off-host backup and perform a restore. Do not copy a live `.sqlite` file without its consistent backup operation.

For upgrades, extract a new release beside the previous one and run its `web/deploy/upgrade.sh`. It stops only the cloud web, snapshots the database, switches the code symlink and checks health. On failure it restores the code symlink, never rolls accounts back silently. Data stays in `/var/lib/van-hai-web`.

If rolling all the way back to the old local web, first stop cloud public writes and export cloud accounts via the private CLI while the cloud service is stopped. Reconcile those new accounts/link changes into the old account store using a controlled save/restart process; simply restoring the old JSON would lose new users. Do not edit an account file still held in RAM by a running server.

Limits: current sync is a recoverable profile mirror, not a transactional game event outbox. A complete snapshot is reconciled every 5 minutes; large accidental deletions are blocked. Live status expires after 60 seconds without source updates. Mismatched sequence/agent errors require preserving and inspecting the checkpoint, not resetting it. No raw world export, account import, generic command execution or gameplay endpoint is public.

## Optional exclusive cloud gameplay

The profile deployment above remains the default. To enable the existing web
minigames with shared LIVE progression, update **both** the LIVE server and cloud
release to the same version, back up their stores, and set:

- Cloud service environment: `WEB_CLOUD_GAMEPLAY=1`.
- LIVE server environment: `WEB_SYNC_SECRET`, using the same private secret already
  used by the cloud service and the agent's private JSON config. Set it before
  starting `node server.mjs`; never put its value in Git, a public file, or a URL.
- Keep the existing cloud agent running. It now relays signed ownership commands
  every approximately 1–2 seconds; profile snapshots still run about every
  10–11 seconds plus request time. These are polling intervals, not latency SLAs.

Only one web session may play a linked character. An active LIVE character is
refused at web login: comment `roilive` (or `rời live`) in TikFinity chat, then
retry. This explicitly leaves the game stage; it cannot prove that a TikTok viewer
closed the stream. Another LIVE interaction before the handoff counts as rejoining.
The LIVE server persists a player lock and hands over the full profile before
cloud gameplay is allowed. Web gameplay never waits for LIVE on each action.
LIVE interactions for a locked player do not grant progression. Gifts received
while locked are saved on the LIVE machine and processed after return, using the
existing gift ledger to prevent duplicate credit; they do not immediately appear
in the web player's balance.

Logout freezes cloud gameplay and queues the final profile for LIVE. A visible
web page sends a heartbeat every 30 seconds; after 2 minutes without authenticated
player activity, the agent queues a return. A hidden/closed tab can therefore
lose its active play session. Neither timeouts nor reconnects remove a LIVE lock
without the returned profile. When the machine is offline, a return that has never
been dispatched can be cancelled by the same user's next web login. Once it has
been dispatched, login waits for LIVE acknowledgement: the previous response
might have been lost after LIVE already resumed.

The **first transfer from LIVE needs the LIVE server and agent online**. Once a
profile is owned by cloud, web gameplay can continue while LIVE is off. This is
exclusive ownership with acknowledged handoffs, not simultaneous realtime writing
by two game engines. LIVE profile changes remain mirrored on the existing cadence.

Validation before public launch:

1. Run `npm ci`, `npm run check`, `npm test`, and `npm run test:web` on Node 24+.
2. Use private test data first. Verify login fails while the character is on LIVE,
   `roilive` permits login, direct API calls obey the lock, and LIVE interactions
   cannot change that character while web gameplay is active.
3. Gain progression on web, log out, wait for acknowledgement, then interact on
   LIVE. Verify the returned progress, queued gifts and the web profile mirror.
4. Restart each component during transfer and test a network interruption. Keep
   both data directories, SQLite backups and the agent checkpoint intact.
5. Measure actual TikFinity-to-overlay and handoff latency, including p95, with
   the expected number of players before claiming realtime performance.

Do not reset sequence/generation records or restore one side's old backup while
the other side is running: old snapshots are not an ownership recovery procedure.
To disable gameplay or roll back releases, first stop new web logins, log players
out, and finish all pending returns with the LIVE server and agent online. Do not
turn off `WEB_CLOUD_GAMEPLAY` or deploy an old LIVE server while players are still
locked: old versions do not enforce these locks.

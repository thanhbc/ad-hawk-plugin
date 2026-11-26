# ad-hawk plugins

Claude Code and Codex plugins for ad-hawk, the read-only ad audit assistant.

- **ad-hawk-local**: audit your Meta and Google Ads from Claude Code or Codex.
  It finds wasted spend, broken tracking and budget problems, ranked by money
  at risk, with the evidence. Data stays on this computer and logins are kept
  in the system keychain. Read-only on the ad platforms unless you turn on
  status changes (pause and enable) with AD_HAWK_ENABLE_WRITES=1.
  /ad-hawk-local:findings has your Claude Code session review the data itself
  (no API key); its findings are checked against the data, and the built-in
  rules are used when they fail the check. A Google Ads account can link a
  Google Analytics 4 property to compare the platform's numbers with GA's.
  macOS on Apple silicon only for now; needs Node.js 20 or later.
  Use: /ad-hawk-local:audit, /ad-hawk-local:findings, /ad-hawk-local:fix-first,
  /ad-hawk-local:inbox, /ad-hawk-local:weekly.
- **ad-hawk**: connects to a hosted ad-hawk workspace with an API token.

## Install (Claude Code)

```
/plugin marketplace add thanhbc/ad-hawk-plugin
/plugin install ad-hawk-local@ad-hawk
```

The first start downloads the local server (ad-hawk-local-0.4.1-darwin-arm64.tar.gz) from
this repo's releases, checks it against the sha256 in
plugins/ad-hawk-local/runtime.json, and keeps it in ~/.ad-hawk/runtime/.

## License

Copyright thanhbc. All rights reserved. The code here may be used to run the
plugins; it is not open source.

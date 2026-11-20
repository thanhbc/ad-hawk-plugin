# ad-hawk plugins

Claude Code and Codex plugins for ad-hawk, the read-only ad audit assistant.

- **ad-hawk-local**: sign in to Meta or Google Ads, keep your ad accounts in a
  cache on this computer, and chat about performance and audit findings.
  Logins are kept in the system keychain. Read-only on the ad platforms.
  macOS on Apple silicon only for now; needs Node.js 20 or later.
- **ad-hawk**: connects to a hosted ad-hawk workspace with an API token.

## Install (Claude Code)

```
/plugin marketplace add thanhbc/ad-hawk-plugin
/plugin install ad-hawk-local@ad-hawk
```

The first start downloads the local server (ad-hawk-local-0.1.2-darwin-arm64.tar.gz) from
this repo's releases, checks it against the sha256 in
plugins/ad-hawk-local/runtime.json, and keeps it in ~/.ad-hawk/runtime/.

## License

Copyright thanhbc. All rights reserved. The code here may be used to run the
plugins; it is not open source.

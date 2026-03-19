#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd "$(dirname "$0")/.."
npm run build && npx wrangler pages dev dist --d1=DB --persist-to=.wrangler/state --port 8788

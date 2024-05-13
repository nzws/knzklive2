#!/bin/bash

# https://fly.io/docs/app-guides/multiple-processes/

set -m # to make job control work
caddy run --config /knzk/Caddyfile &
/usr/local/srs/objs/srs -c conf/knzklive.conf &
node /knzk/kernel/index.js &
fg %1 # gross!

#!/bin/bash

# https://fly.io/docs/app-guides/multiple-processes/

set -m # to make job control work

node /knzk/kernel/index.js &
nginx &
/usr/local/srs/objs/srs -c conf/knzklive.conf &
fg %1 # gross!

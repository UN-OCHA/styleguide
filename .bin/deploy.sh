#!/bin/bash

#
# @TODO: add conditional to see if working tree is clean. only proceed when clean.
#

# configure node/gulp for deploy
export NODE_ENV='production'

# build assets
gulp deploy
git add css js

# instruct developer to review/commit/push
echo ""
echo "————————————————————————————————————————————————————————————————————————"
echo "=> To deploy: Please review the diff, commit any changes, and push live."
echo "————————————————————————————————————————————————————————————————————————"
echo ""
git status

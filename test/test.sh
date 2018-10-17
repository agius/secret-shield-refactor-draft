#!/bin/sh

# usage:
# $ docker build -t shield43:latest .
# $ docker run -v `pwd`:/src --rm shield43 /src/test/test.sh

set -ue

mkdir /testrepo
cd /testrepo

git init .
git config user.email 'devnull@mapbox.com'
echo "hello world" > testfile.txt
git add -A
git commit -m 'Initial commit'

if [ -f .git/hooks/pre-commit ]; then
  echo "Local hook already exists!"
  exit 1
fi

shield hook .

if [ -f .git/hooks/pre-commit ]; then
  echo "Local hook added!"
else
  echo "Local hook not added!"
  exit 1
fi

if (grep diff .git/hooks/pre-commit); then
  echo "Local hook correct"
else
  echo "Incorrect local hook"
  exit 1
fi

if (shield hook . | grep 'already exists'); then
  echo "Hook not re-added"
else
  echo "Hook possibly double-added"
  exit 1
fi

if (shield hook -g); then
  echo "Global hook added"
else
  echo "Global hook not added"
  exit 1
fi

if (git config --global --get core.hooksPath | grep 'shield'); then
  echo "Global hook set to shield"
else
  echo "Global hook not set to shield"
  exit 1
fi

if (shield hook -g | grep 'already found'); then
  echo "Global hook not clobbered / re-added"
else
  echo "Global hook incorrectly re-added / clobbered"
  exit 1
fi

mkdir testnesteddir
echo 'an test file' > testnesteddir/nestedtestfile.txt
cd testnesteddir

if (shield hook . | grep 'already exists'); then
  echo "Hook not re-added while in nested dir"
else
  echo "Hook possibly double-added from nested dir"
  exit 1
fi

if [ -f .git/hooks/pre-commit ]; then
  echo "Local hook added in nested dir"
  exit 1
else
  echo "Local hook not added into nested dir"
fi

cd /testrepo

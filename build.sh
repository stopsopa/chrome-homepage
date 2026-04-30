set -e

cat <<EEE

  typechecking...

EEE

NODE_OPTIONS="" node_modules/.bin/tsc

cat <<EEE

  transpiling...

EEE

find extension -type f -name '*.ts' | NODE_OPTIONS="" node es.ts
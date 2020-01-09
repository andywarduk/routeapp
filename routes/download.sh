#!/bin/bash

bearer=$1

function Usage {
	echo "Usage: $0 <bearer>"
  echo "Bearer (Access) token at https://www.strava.com/settings/api "
	exit 1
}

if [ "x$bearer" == "x" ]; then
	Usage
fi

cat routes.txt | while read i
do
  if [ "x$i" != "x" ]; then
    file="$i.json"
    if [ ! -f "$file" ]; then
      echo "Downloading $i..."
      curl -X GET "https://www.strava.com/api/v3/routes/$i" -H "accept: application/json" -H "authorization: Bearer $bearer" -o "$file"
      if fgrep "\"errors\"" "$file"; then
        rm "$file"
      fi
    fi
  fi
done

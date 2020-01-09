#!/bin/bash

host=$1

function Usage {
	echo "Usage: $0 <host>"
	exit 1
}

if [ x$host == "x" ]; then
	Usage
fi

cat routes.txt | while read i
	do ./upload.sh "$i" "$host"
	echo
done

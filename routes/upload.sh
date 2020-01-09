#!/bin/bash

id=$1
host=$2

function Usage {
	echo "Usage: $0 <id> <host>"
	exit 1
}

if [ "x$id" == "x" ]; then
	Usage
fi

if [ ! -f "$id.json" ]; then
	echo "$id.json does not exist"
	exit 2
fi

if [ "x$host" == "x" ]; then
	Usage
fi

curl -X POST -H "Content-type: application/json" --data-binary "@$id.json" "http://$host/routes/add/$id"

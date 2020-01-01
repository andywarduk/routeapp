#!/bin/bash

id=$1

if [ x$id == "" ]; then
	echo "Usage: $0 <id>"
	exit 1
fi

if [ ! -f $id.json ]; then
	echo "$id.json does not exist"
	exit 2
fi

curl -X POST -H "Content-type: application/json" --data-binary @$id.json http://localhost:6200/routes/add/$id

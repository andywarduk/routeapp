#!/bin/bash

host=$1

function Usage {
	echo "Usage: $0 <host>"
	exit 1
}

if [ "x$host" == "x" ]; then
	Usage
fi

curl "http://$host/api/routes/list"

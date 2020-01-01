#!/bin/bash

cat routes.txt| while read i
	do ./upload.sh $i
	echo
done

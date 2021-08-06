#!/bin/bash

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

myip=`ifconfig | sed -En 's/127.0.0.1//;s/.*inet (addr:)?(([0-9]*\.){3}[0-9]*).*/\2/p'`

DEST_SERV=/lib/systemd/system/webcustomprint.service
#cp ./webcustomprint.service $DEST_SERV
#sed -i "s/##FULL_PATH_TO_DIR##/$PWD/" $DEST_SERV
awk -v tmpl="##FULL_PATH_TO_DIR##" -v curdir="$PWD" -v utemp="##CUR_USER_NAME##" -v curuser="$USER" "{sub(tmpl,curdir); sub(utemp,curuser)}1" ./webcustomprint.service > $DEST_SERV

systemctl daemon-reload

sudo systemctl start webcustomprint

sudo systemctl enable webcustomprint

echo "Success. Webservise start at $myip:3000"
#!/bin/bash

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

if [ -z "$1" ]
  then
    echo "No username supplied. Please use 'istall.sh <UserName(not root)>'"
    exit 1
fi

/bin/egrep  -i "^$1:" /etc/passwd
if [ $? -eq 0 ]; then
   echo "User '$1' exists in /etc/passwd"
else 
   echo "User '$1' does not exists in /etc/passwd"
   exit 1
fi

if [ ! -f /usr/bin/node ]; then
   echo "Creating /usr/bin/node symlink to current version !!!"
   sudo ln -s "$(which node)" /usr/bin/node
fi

myip=`ifconfig | sed -En 's/127.0.0.1//;s/.*inet (addr:)?(([0-9]*\.){3}[0-9]*).*/\2/p'`

DEST_SERV=/lib/systemd/system/webcustomprint.service

#awk -v tmpl="##FULL_PATH_TO_DIR##" -v curdir="$PWD" -v utemp="##CUR_USER_NAME##" -v curuser="$USER" "{sub(tmpl,curdir); sub(utemp,curuser)}1" ./webcustomprint.service > $DEST_SERV
awk -v tmpl="##FULL_PATH_TO_DIR##" -v curdir="$PWD" -v utemp="##CUR_USER_NAME##" -v curuser="$1" "{sub(tmpl,curdir); sub(utemp,curuser)}1" ./webcustomprint.service > $DEST_SERV

systemctl daemon-reload

sudo systemctl start webcustomprint

sudo systemctl enable webcustomprint

echo "Success. Webservise start at $myip:3000"
Web service for print on connected Custom VKP80 printer on Linux.

Printer connected by USB and present as /dev/usb/lp0

# prerequisites
## node
```
   1. which node
   2. sudo ln -s /home/ubuntu/.nvm/versions/node/v12.13.1/bin/node (output of above step) /usr/bin/node
```

## mysql
https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04-ru
https://www.digitalocean.com/community/tutorials/how-to-allow-remote-access-to-mysql

## pulseaudio
1. in /etc/pulse/default.pa
`load-module module-native-protocol-unix auth-anonymous=1 socket=/tmp/pulse-socket`

2. add to user and root ~/.config/pulse/client.conf
`default-server = unix:/tmp/pulse-socket`



# Installation



`npm install`
`sudo ./install.sh <UserName(not root)>`

# Webpage
At address <ip address>:3000

# database

sqlite> .mode csv
sqlite> .separator "\t" ---IMPORTANT! should be in double quotes
sqlite> .import ../db_src/uhtt_barcode_ref_all.csv barcodes

# voice
```
add-apt-repository ppa:linvinus/rhvoice
sudo apt-get update

2) Как модуль speech-dispatcher
   sudo apt-get install speech-dispatcher-rhvoice rhvoice-russian

2) Если вы установили пакет speech-dispatcher-rhvoice то нужно выполнить команду
echo "Проверка синтезатора речи" | spd-say -o rhvoice -l ru  -e -t female1


spd-say -o rhvoice -l ru  -t male1 -r -30 "Проверка синтезатора речи"

```

# For manual test

`npm run start`

Copy or make link "webcustomprint.service" to "/lib/systemd/system"

`ln -s /home/pi/share/Custom/webcustomprint/webcustomprint.service /lib/systemd/system/webcustomprint.service`

Whenever you change a service file, systemd has to know it so that it no longer attempts to reference these files and reverts back to using the system copies. . You can do this by typing:
`sudo systemctl daemon-reload`

What's coming after is to launch our app with:
`sudo systemctl start webcustomprint`

You can use following commands to check service status and stop it
`sudo systemctl status webcustomprint` `sudo systemctl stop webcustomprint`

Following commands can be used to do same
`service webcustomprint start` 
`service webcustomprint stop`
`service webcustomprint restart`

Status
`service webcustomprint status` 
```bash
journalctl -u  webcustomprint -b -e
```

Autostart
`sudo systemctl enable webcustomprint`




# Errors

Error opening port:  Error: Permission denied, cannot open /dev/ttyACM0

variants:

1. apt remove modemmanager

2. 
```
ls -l /dev/ttyACM*

sudo adduser YourUserName GroupToJoin
```

3. change permission of /dev/ttyACM0

--------
Can't connect to unix socket /root/.cache/speech-dispatcher/speechd.sock

enter bash under no root

-----------
No sound

sudo usermod -aG `cat /etc/group | grep -e '^pulse:' -e '^audio:' -e '^pulse-access:' -e '^pulse-rt:' -e '^video:' | awk -F: '{print $1}' | tr '\n' ',' | sed 's:,$::g'` `whoami`
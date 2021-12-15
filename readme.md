Web service for print on connected Custom VKP80 printer on Linux.

Printer connected by USB and present as /dev/usb/lp0

# Installation

`npm install`
`sudo ./install.sh`

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



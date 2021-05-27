Web service for print on connected Custom VKP80 printer on Linux.

Printer connected by USB and present as /dev/usb/lp0

Need access

~~sudo chmod +777 /dev/usb/lp0~~

`sudo usermod -a -G lp pi`


For autostart add to /etc/rc.local before `exit 0`

`
# autoran print service
cd /home/pi/share/Custom/webcustomprint
npm run start
`

Copy or make link "webcustomprint.service" to "/lib/systemd/system"

`ln -s /home/pi/share/Custom/webcustomprint/webcustomprint.service /lib/systemd/system/webcustomprint.service`

Whenever you change a service file, systemd has to know it so that it no longer attempts to reference these files and reverts back to using the system copies. . You can do this by typing:
`sudo systemctl daemon-reload`

What's coming after is to launch our app with:
`sudo systemctl start webcustomprint`

You can use following commands to check service status and stop it
`sudo systemctl status webcustomprint` `sudo systemctl stop webcustomprint`

Following commands can be used to do same
`service webcustomprint start` `service webcustomprint status` `service webcustomprint stop`

Autostart
`sudo systemctl enable webcustomprint`
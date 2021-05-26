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

**Not work yet!**
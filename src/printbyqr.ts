import express from 'express';
import fs, { fdatasync, PathLike } from "fs";

const router = express.Router();
const settingsFile = `${__dirname}/printSrc/printbyqr.json`;

export const HomeQrPrefix = "[HOMEPR]";

export type PrintByQrItem = {
    Code: string,
    Text: string;
}

type IOnSimpleEvent = (setts: PrintByQrItem[]) => void;

let OnReloadEvent: IOnSimpleEvent;

export function SetOnReloadEvent(ev: IOnSimpleEvent) {
    OnReloadEvent = ev;
}

// export.OnReloadSettings = OnReloadSettings;

router.get('/', (req, res, next) => {
    let settingStr = "1 Пример что печатать";
    const fileCont: PrintByQrItem[] = LoadQrSettings();
    if (fileCont) {
        settingStr = (fileCont.map(item => {
            return `${item.Code} ${item.Text}`;
        })).join("\n");
    }
    res.render('printbyqr', { homeQrPrefix: HomeQrPrefix, printsettings: settingStr });
});

export function LoadQrSettings(): PrintByQrItem[] {
    if (fs.existsSync(settingsFile)) {
        const filecontStr = fs.readFileSync(settingsFile, "utf-8");
        if (!filecontStr) {
            return null;
        }
        return JSON.parse(filecontStr);
    }
}



router.post('/', (req, res, next) => {
    const settingStr: string = req.body.printsettings;
    let alertStr = "";
    const settings: PrintByQrItem[] = [];

    try {
        const settingStrLines = settingStr.split(/[\n\r]/);
        settingStrLines.forEach(line => {
            line.trim();
            if (!line) {
                return;
            }

            const splitted = line.match(/^(\w+)\s(.+)$/);
            if (!splitted) {
                return;
            }

            const code = splitted[1];
            const text = splitted[2];

            settings.push({ Code: code, Text: text });
        });

        fs.writeFileSync(settingsFile, JSON.stringify(settings));
        alertStr = "Сохранено";

        if (OnReloadEvent) {
            OnReloadEvent(settings);
        }

    } catch (error) {
        alertStr = error;
    }
    res.render('printbyqr', { homeQrPrefix: HomeQrPrefix, printsettings: settingStr, alertStr });
});

export default router;
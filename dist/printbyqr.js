"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadQrSettings = exports.SetOnReloadEvent = exports.HomeQrPrefix = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const settingsFile = `${__dirname}/printSrc/printbyqr.json`;
exports.HomeQrPrefix = "[HOMEPR]";
let OnReloadEvent;
function SetOnReloadEvent(ev) {
    OnReloadEvent = ev;
}
exports.SetOnReloadEvent = SetOnReloadEvent;
// export.OnReloadSettings = OnReloadSettings;
router.get('/', (req, res, next) => {
    let settingStr = "1 Пример что печатать";
    const fileCont = LoadQrSettings();
    if (fileCont) {
        settingStr = (fileCont.map(item => {
            return `${item.Code} ${item.Text}`;
        })).join("\n");
    }
    res.render('printbyqr', { homeQrPrefix: exports.HomeQrPrefix, printsettings: settingStr });
});
function LoadQrSettings() {
    if (fs_1.default.existsSync(settingsFile)) {
        const filecontStr = fs_1.default.readFileSync(settingsFile, "utf-8");
        if (!filecontStr) {
            return null;
        }
        return JSON.parse(filecontStr);
    }
}
exports.LoadQrSettings = LoadQrSettings;
router.post('/', (req, res, next) => {
    const settingStr = req.body.printsettings;
    let alertStr = "";
    const settings = [];
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
        fs_1.default.writeFileSync(settingsFile, JSON.stringify(settings));
        alertStr = "Сохранено";
        if (OnReloadEvent) {
            OnReloadEvent(settings);
        }
    }
    catch (error) {
        alertStr = error;
    }
    res.render('printbyqr', { homeQrPrefix: exports.HomeQrPrefix, printsettings: settingStr, alertStr });
});
exports.default = router;
//# sourceMappingURL=printbyqr.js.map
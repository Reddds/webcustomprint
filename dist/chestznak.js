"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChesZnak = void 0;
const https = __importStar(require("https"));
class ChesZnak {
    static PrepareForRequest(scanned) {
        // Если в коде уже есть разделения на 1d, то не делаем ничего
        if (scanned.includes("\x1d")) {
            return scanned;
        }
        const dmPattern = /^01(?<gtin>\d{14})21(?<serial>.+?)(91(?<code91>.+?))?(92(?<code92>.+?))?(93(?<crypto>.+?))?$/u;
        const matchval = dmPattern.exec(scanned);
        if (!matchval) {
            return null;
        }
        let codeForReq = `%1D01${matchval.groups.gtin}21${matchval.groups.serial}`;
        if (matchval.groups.crypto) {
            codeForReq += `%1D93${matchval.groups.crypto}`;
        }
        if (matchval.groups.code91) {
            codeForReq += `%1D91${matchval.groups.code91}`;
        }
        if (matchval.groups.code92) {
            codeForReq += `%1D92${matchval.groups.code92}`;
        }
        return codeForReq;
    }
    static GetData(scanned) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                if (scanned.length === 13) {
                    https.get(`https://mobile.api.crpt.ru/mobile/check?code=${scanned}&codeType=ean13`, (resp) => {
                        let data = '';
                        // A chunk of data has been received.
                        resp.on('data', (chunk) => {
                            data += chunk;
                        });
                        // The whole response has been received. Print out the result.
                        resp.on('end', () => {
                            console.log(data);
                            const prodInfo = JSON.parse(data);
                            if (!prodInfo || !prodInfo.codeFounded) {
                                reject();
                                return;
                            }
                            resolve({ Name: prodInfo.productName });
                        });
                    }).on("error", (err) => {
                        console.log("Error: " + err.message);
                        reject();
                    });
                    // reject();
                    return;
                }
                const codeForReq = this.PrepareForRequest(scanned);
                if (!codeForReq) {
                    reject();
                    return;
                }
                https.get(encodeURI(`https://mobile.api.crpt.ru/mobile/check?code=${codeForReq}&codeType=datamatrix`), (resp) => {
                    let data = '';
                    // A chunk of data has been received.
                    resp.on('data', (chunk) => {
                        data += chunk;
                    });
                    // The whole response has been received. Print out the result.
                    resp.on('end', () => {
                        console.log(data);
                        const prodInfo = JSON.parse(data);
                        if (!prodInfo || !prodInfo.codeFounded) {
                            reject();
                            return;
                        }
                        // в мс
                        let expDate;
                        if (prodInfo.milkData) {
                            expDate = prodInfo.milkData.expireDate;
                        }
                        else if (prodInfo.drugsData) {
                            expDate = Date.parse(prodInfo.drugsData.expirationDate);
                        }
                        const res = { Name: prodInfo.productName, ExpireDate: expDate };
                        console.log(res);
                        resolve(res);
                    });
                }).on("error", (err) => {
                    console.log("Error: " + err.message);
                    reject();
                    return;
                });
                // reject();
            });
        });
    }
}
exports.ChesZnak = ChesZnak;
//# sourceMappingURL=chestznak.js.map
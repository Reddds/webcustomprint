import * as https from "https";

export type ProdInfo = {
    Name: string,
    /** Дата окончания срока годности в мс */
    ExpireDate?: number
}


export class ChesZnak {

    private static PrepareForRequest(scanned: string): string {
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

    public static async GetData(scanned: string): Promise<ProdInfo | undefined> {
        return await new Promise<ProdInfo>((resolve, reject) => {
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
                    let expDate: number;
                    if (prodInfo.milkData) {
                        expDate = prodInfo.milkData.expireDate;
                    } else if (prodInfo.drugsData) {
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
    }
}
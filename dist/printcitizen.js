const maxImageWidth = 600;
const maxImageHeight = 1000;

function prepareImage(raw) {
    const byteRowLen = Math.ceil(raw.width / 8);
    const printArray = new Uint8Array(byteRowLen * raw.height);
    let arrayPos = 0;
    for (let y = 0; y < raw.height; y++) {
        let b = 0;
        let curBit = 7;
        for (let x = 0; x < raw.width; x++) {
            const r = raw.data[y * raw.width * 4 + x * 4] < 127 ? 1 : 0;

            b |= r << curBit;

            if (curBit === 0 || x === raw.width - 1) {
                printArray[arrayPos] = b;
                arrayPos++;
                // printArray.push(b);
                b = 0;
                curBit = 7;
            } else {
                curBit--;
            }
        }
    }

    const mode = 0;
    const xL = byteRowLen;
    const xH = 0;
    const yL = raw.height & 0xFF;
    const yH = (raw.height >> 8) & 0xFF;

    const header = new Uint8Array([mode, xL, xH, yL, yH]); //0x1d, 0x76, 0x30, 

    const allBuf = new Uint8Array([...header, ...printArray]);
    return allBuf;
}
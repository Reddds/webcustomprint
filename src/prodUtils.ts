import { Scanner } from "./scanner";


export class Singleton {
    private static instance: Scanner;

    constructor() {
        throw new Error('Use Singleton.getInstance()');
    }
    static getInstance() {
        if (!Singleton.instance) {
            Singleton.instance = new Scanner();
            Singleton.instance.Init();
        }
        return Singleton.instance;
    }
}

export function GetInstance() {
    return Singleton.getInstance();
}
Singleton.getInstance();
// export default Singleton;
// module.exports = Singleton;
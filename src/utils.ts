function StringToNumArr(str: string): number[]
{
    const numArr: number[] = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < str.length; i++) {
        numArr.push(Number(str[i]));
    }
    return numArr;
}

function num_letters(k: string, d: boolean = false) {  // целое число прописью, это основа
    let i = '';
    const e = [
        ['', 'тысяч', 'миллион', 'миллиард', 'триллион', 'квадриллион', 'квинтиллион', 'секстиллион', 'септиллион', 'октиллион', 'нониллион', 'дециллион'],
        ['а', 'и', ''],
        ['', 'а', 'ов']
    ];
    if (k === '' || k === '0') return ' ноль'; // 0
    const kSpl = k.split(/(?=(?:\d{3})+$)/);  // разбить число в массив с трёхзначными числами
    if (kSpl[0].length === 1) kSpl[0] = '00' + kSpl[0];
    if (kSpl[0].length === 2) kSpl[0] = '0' + kSpl[0];
    for (let j = (kSpl.length - 1); j >= 0; j--) {  // соединить трёхзначные числа в одно число, добавив названия разрядов с окончаниями
        if (kSpl[j] !== '000') {
            i = (((d && j === (kSpl.length - 1)) || j === (kSpl.length - 2)) && (kSpl[j][2] === '1' || kSpl[j][2] === '2') ? t(kSpl[j], true) : t(kSpl[j])) + declOfNum(kSpl[j], e[0][kSpl.length - 1 - j], (j === (kSpl.length - 2) ? e[1] : e[2])) + i;
        }
    }
    function t(num: string, isThousend: boolean = false) {  // преобразовать трёхзначные числа
        const numAr = StringToNumArr(num);
        const numStrs = [
            ['', ' один', ' два', ' три', ' четыре', ' пять', ' шесть', ' семь', ' восемь', ' девять'],
            [' десять', ' одиннадцать', ' двенадцать', ' тринадцать', ' четырнадцать', ' пятнадцать', ' шестнадцать', ' семнадцать', ' восемнадцать', ' девятнадцать'],
            ['', '', ' двадцать', ' тридцать', ' сорок', ' пятьдесят', ' шестьдесят', ' семьдесят', ' восемьдесят', ' девяносто'],
            ['', ' сто', ' двести', ' триста', ' четыреста', ' пятьсот', ' шестьсот', ' семьсот', ' восемьсот', ' девятьсот'],
            ['', ' одна', ' две']
        ];
        return numStrs[3][numAr[0]] + (numAr[1] === 1 ? numStrs[1][numAr[2]] : numStrs[2][numAr[1]] + (isThousend ? numStrs[4][numAr[2]] : numStrs[0][numAr[2]]));
    }
    return i;
}
function declOfNum(n: string, root: string, end: string[]) {  // склонение именительных рядом с числительным: число (typeof = string), корень (не пустой), окончание
    const k = [2, 0, 1, 1, 1, 2, 2, 2, 2, 2];
    return (root === '' ? '' : ' ' + root + (n[n.length - 2] === "1" ? end[2] : end[k[Number(n[n.length - 1])]]));
}
function razUp(e: string) {  // сделать первую букву заглавной и убрать лишний первый пробел
    return e[1].toUpperCase() + e.substring(2);
}
function sum_letters(a: number) {
    const spl = Number(a).toFixed(2).split('.');  // округлить до сотых и сделать массив двух чисел: до точки и после неё
    return razUp(num_letters(spl[0]) + declOfNum(spl[0], 'рубл', ['ь', 'я', 'ей']) + ' ' + spl[1] + declOfNum(spl[1], 'копе', ['йка', 'йки', 'ек']));
}

export function dayLetters(a: number) {
    const str = String(a);
    return razUp(num_letters(str) + declOfNum(str, 'д', ['ень', 'ня', 'ней']));
}
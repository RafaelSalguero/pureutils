import { syncResolve } from "./promise";
import { asyncThunkToObservable, numEqStr, parseFormattedNumber, xor } from "./logic";
import { delay } from "rxjs/operators";



test("asyncThunkToObs sync", async () => {

    //sync resolve:
    let count = 0;
    const thunk = () => {
        count++;
        return syncResolve(10);
    };

    const obs = asyncThunkToObservable(thunk);

    //Aún no se llama:
    expect(count).toBe(0);

    let result: number = 0;
    //Se resuelve síncronamente:
    obs.subscribe(x => result = x);
    expect(result).toBe(10);
    expect(count).toBe(1);

    result = 0;
    await delay(10);

    //Subsecuentes subscripciones no llaman al thunk
    obs.subscribe(x => result = x);
    expect(result).toBe(10);
    expect(count).toBe(1);

});

test("asyncThunkToObs async", async () => {
    let count = 0;
    const thunk = async () => {
        count++;
        await delay(100);
        return 10;
    };

    const obs = asyncThunkToObservable(thunk);

    //Aún no se llama:
    expect(count).toBe(0);

    let a = 0, b = 0;
    obs.subscribe(x => a = x);

    //La primera llamada:
    expect(count).toBe(1);
    expect(a).toBe(0);

    await delay(10);

    //Otra subscripción antes de que termine la primera:
    obs.subscribe(x => b = x);

    //Ya no hay más llamadas:
    expect(count).toBe(1);
    expect(a).toBe(0);
    expect(b).toBe(0);

    const c = await obs.toPromise();

    //Ya se resolvieron todos los valores:

    expect(a).toBe(10);
    expect(b).toBe(10);
    expect(c).toBe(10);
})

test("numEqStr", () => {
    expect(numEqStr(1, "")).toBe(false);
    expect(numEqStr(1, ".")).toBe(false);
    expect(numEqStr(1, ".1")).toBe(false);
    expect(numEqStr(1, "2")).toBe(false);
    expect(numEqStr(1, "1.1")).toBe(false);

    expect(numEqStr(1, "1")).toBe(true);
    expect(numEqStr(1, "+1")).toBe(true);
    expect(numEqStr(1, "-1")).toBe(false);
    expect(numEqStr(120, "120")).toBe(true);
    expect(numEqStr(120, "120.1")).toBe(false);
    expect(numEqStr(120.1, "120.1")).toBe(true);
    expect(numEqStr(120.1, "120.2")).toBe(false);
    expect(numEqStr(120.1, "+120.2")).toBe(false);
    expect(numEqStr(120.1, "120.12")).toBe(false);
    expect(numEqStr(-120.1, "-120.1")).toBe(true);

    expect(numEqStr(120.1201, "120.12")).toBe(false);
    expect(numEqStr(120.1200001, "120.12")).toBe(true); //debido al epsilon se consideran iguales
    expect(numEqStr(120.1200001, "+120.12")).toBe(true); //debido al epsilon se consideran iguales
    expect(numEqStr(120.1200001, "120.1200000")).toBe(false); //como la cadena es mas larga la comparación es de mas precisión
    expect(numEqStr(120.1200001, "120.1200001")).toBe(true);
    expect(numEqStr(-120.1200001, "120.1200001")).toBe(false);
    expect(numEqStr(120.1200001, "120.13")).toBe(false);

    expect(numEqStr(1000020.13, "1000020.13")).toBe(true);
    expect(numEqStr(1000020.13, "1,000,020.13")).toBe(true);
    expect(numEqStr(1000020.1300000001, "1,000,020.13")).toBe(true);
    expect(numEqStr(1000020.1300000001, "1,000,021.13")).toBe(false);


    expect(numEqStr(1000020.1300000001, "+1,000,020.13")).toBe(true);
    expect(numEqStr(1000020.1300000001, "-1,000,020.13")).toBe(false);
    expect(numEqStr(-1000020.1300000001, "-1,000,020.13")).toBe(true);
    expect(numEqStr(-1000020.1300000001, "+1,000,020.13")).toBe(false);

});

test("parseFormattedNumber", () => {
    expect(parseFormattedNumber("1")).toBe(1);
    expect(parseFormattedNumber("100.1343")).toBe(100.1343);
    expect(parseFormattedNumber("-100.1343")).toBe(-100.1343);
    expect(parseFormattedNumber("-1,000.1343")).toBe(-1000.1343);
    expect(parseFormattedNumber("-1,000,020.1343")).toBe(-1000020.1343);
    expect(parseFormattedNumber("$-1,000,020.1343")).toBe(-1000020.1343);
});

test("xor test", () => {
    expect(xor([1, 2, 3], [2, 3, 4, 5])).toEqual([1, 4, 5]);
    expect(xor([], [2, 3, 4, 5])).toEqual([2, 3, 4, 5]);
    expect(xor([3, 2, 5], [2])).toEqual([3, 5]);
    expect(xor([3, 2, 5], [])).toEqual([3, 2, 5]);
    expect(xor([3, 2, 5], [5, 2, 3])).toEqual([]);
    expect(xor([3, 2, 5], [5, 2, 1, 3])).toEqual([1]);
    expect(xor([3, 2, 5, 0], [5, 2, 1, 3])).toEqual([0, 1]);
});
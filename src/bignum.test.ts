import { add, half, midpoint, toBaseN as toBase, createBase as createNumericSystem } from "./bignum";

const digits = "0123456789ABCDEF"
const dec = createNumericSystem(digits.substr(0, 10));
const bin = createNumericSystem(digits.substr(0, 2));
const hex = createNumericSystem(digits.substr(0, 16));

 

test("add", () => {
    const ret = add("973", "01428", dec);

    expect(ret).toEqual("02401");
});

test("half", () => {
    const ret = half("1738", dec);

    expect(ret).toEqual("0869");
});


test("midpoint", () => {
    const ret = midpoint("1738", "643", dec);

    expect(ret).toEqual("1190");
});

test("toBase", () => {
    const num = 3142;

    expect(toBase(num, 12, bin )).toEqual("110001000110");
    expect(toBase(num, 4, hex )).toEqual("0C46");
    expect(toBase(num, 4, dec )).toEqual("3142");
});


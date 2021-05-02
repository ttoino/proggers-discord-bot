import http from "http";
import https from "https";

export const request = async (url: string): Promise<string> => {
    const lib = url.startsWith("https://") ? https : http;

    return new Promise((resolve, reject) => {
        lib.request(url, (res) => {
            if (
                !res.statusCode ||
                res.statusCode < 200 ||
                res.statusCode >= 300
            ) {
                return reject(new Error(`Status Code: ${res.statusCode}`));
            }

            const data: any[] = [];

            res.on("data", (chunk) => {
                data.push(chunk);
            });

            res.on("end", () => resolve(Buffer.concat(data).toString()));
        })
            .on("error", reject)
            // IMPORTANT
            .end();
    });
};

export const randomChoice = <T>(array: readonly T[]) =>
    array[Math.floor(Math.random() * array.length)];

export const zip = <T, U>(a1: T[], a2: U[]): [T, U][] =>
    a1.map((_, i) => [a1[i], a2[i]]);

export const wait = (time: number): Promise<void> =>
    new Promise((res) => setTimeout(res, time));

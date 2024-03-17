import * as fs from "fs";

/**Fs */
export class Fs {

    /**파일을 생성합니다. */
    public static makeFile(file: string): void {

        fs.writeFileSync(file, JSON.stringify({}));

    };

    /**파일이 존재하는지 확인합니다. */
    public static isExist(file: string): boolean {

        return fs.existsSync(file);

    };

    /**파일에 저장되있는 키에서 값을 가져옵니다. */
    public static getValue(file: string, element: any): any {

        return JSON.parse(fs.readFileSync(file, "utf8"))[element];

    };

    /**해당 키의 값이 존재하는지 확안합니다. */
    public static hasValue(file: string, element: any): boolean {

        if (JSON.parse(fs.readFileSync(file, "utf8"))[element] == undefined || JSON.parse(fs.readFileSync(file, "utf8"))[element] == null) return false;
        else return true;

    };

    /**해당 키의 값을 설정합니다. */
    public static setValue(file: string, element: any, value: any): void {
        const read = JSON.parse(fs.readFileSync(file, "utf8"));
        read[element] = value;
        fs.writeFileSync(file, JSON.stringify(read), "utf8");

    };

    /**해당 키의 값을 삭제합니다. */
    public static removeValue(file: string, element: any): void {

        const read = JSON.parse(fs.readFileSync(file, "utf8"));
        delete read[element]
        fs.writeFileSync(file, JSON.stringify(read), "utf8");

    };

    /**파일의 값들을 모두 문자열로 바꿉니다. */
    public static toStringArray(file: string): string[] {

        return Object.keys(JSON.parse(fs.readFileSync(file, "utf8")));

    };

};
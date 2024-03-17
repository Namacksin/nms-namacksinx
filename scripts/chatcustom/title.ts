import { command } from "bdsx/command";
import { Fs } from "../db";
import { CustomForm, Form, FormDataCustom } from "bdsx/bds/form";
import { CommandBoolean } from "../../setting";

const path: string = "../plugins/nms-namacksinx-main/DataBase/title.json";

if (!Fs.isExist(path)) {
    Fs.makeFile(path);
};

namespace titleCommand {
    export const maxtitlelength: number = 12;

    export const settitleformdata: FormDataCustom = {
        title: "§l§8[ §f칭호 §8]",
        type: "custom_form",
        content: [
            {
                type: "input",
                text: "§8원하는 칭호를 입력해 주세요.",
                default: "§l§7USER"
            }
        ]
    };

    export function MakeTitleCommand(): void {
        command.register("칭호", "칭호를 설정합니다.").overload(async (param, origin) => {
            const entity = origin.getEntity();
            if (!entity?.isPlayer()) return;
            const ni = entity.getNetworkIdentifier();
            const xuid = entity.getXuid();
            const form = await Form.sendTo(ni, settitleformdata);
            if (form === null) return;
            const title: string = form[0];
            if (title.length > maxtitlelength) {
                entity.sendMessage("§c칭호 글자 수 제한을 넘어섰습니다!");
                return;
            };
            Fs.setValue(path, xuid, title);
            entity.sendMessage("§a칭호 설정을 성공적으로 완료했습니다.");
        },{});
    };
};

if (CommandBoolean.titlecommand) {
    titleCommand.MakeTitleCommand();
};
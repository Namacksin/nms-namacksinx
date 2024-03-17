import { PlayerCommandSelector } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { CommandBoolean } from "../setting";
import { events } from "bdsx/event";
import { CustomForm, Form, FormButton, FormDataCustom, SimpleForm } from "bdsx/bds/form";
import { Fs } from "./db";
import { bedrockServer } from "bdsx/launcher";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";

let TpaRequestObject: Record<string, RequestData> = {};

const path: string = "../plugins/nms-namacksinx-main/DataBase/tpa.json";

if (!Fs.isExist(path)) {
    Fs.makeFile(path);
};

class RequestData {
    public requests: Record<string, TpaData> = {};
    constructor() {
        this.requests = {};
    };
};

class TpaData {
    public requestperson: string;
    public tpatype: "tpa" | "tphere";
    constructor(requestperson: string, tpatype: "tpa" | "tphere") {
        this.requestperson = requestperson;
        this.tpatype = tpatype;
    };
};

class TpaSetting {
    public tptoggle: boolean = false;
    public tpauto: boolean = false;
    constructor(tptoggle: boolean, tpauto: boolean) {
        this.tptoggle = tptoggle;
        this.tpauto = tpauto;
    };
};

class TpaCommand {

    public static async sendcheckrequestform(ni: NetworkIdentifier, array: string[]): Promise<void> {
        const form = await Form.sendTo(ni, {
            title: "§l§8[ §f티피 요청함 §8]",
            type: "custom_form",
            content: [
                {
                    type: "dropdown",
                    text: "§l§8티피 요청함.",
                    options: array
                }
            ]  
        });
        if (form === null) return;
        const requestName = array[form[0]];
        const entity = ni.getActor()!;
        const requestob: RequestData = Fs.getValue(path, entity.getXuid());
        const request: TpaData = requestob.requests[requestName];
        const simpleform = new SimpleForm("§l§8[ §f티피 요청 §8]", `§8요청 플레이어 : ${request.requestperson}\n§8요청 타입 " ${request.tpatype}`);
    };

    public static MakeTpaCommand(): void {
        command.register("티피", "티피요청을 합니다.").overload((param, origin, output) => {
            const entity = origin.getEntity();
            if (!entity?.isPlayer()) return;
            const player = param.보낼사람.newResults(origin)[0];
            if (entity.getName() === player.getName()) {
                entity.sendMessage("§c나 자신에게 티피 요청을 보내실 수 없습니다!");
                return;
            };
            const xuid = player.getXuid();
            const tpasetting: TpaSetting = Fs.getValue(path, xuid);
            if (tpasetting.tptoggle) {
                entity.sendMessage(`§e${player.getName()}님께서는 티피 요청을 받지 않도록 설정 중입니다.`);
                return;
            };
            if (tpasetting.tpauto) {
                player.sendMessage(`§a${origin.getName()}님의 티피 요청을 자동으로 수락 했습니다.`)
                entity.teleport(player.getPosition(), player.getDimensionId());
                player.sendMessage(`§eTpa가 수락되어 ${entity.getName()}님이 ${player.getName()}님에게 이동 되었습니다.`);
                entity.sendMessage(`§eTpa가 수락되어 ${entity.getName()}님이 ${player.getName()}님에게 이동 되었습니다.`);
                delete TpaRequestObject[xuid].requests[entity.getName()]
                return;
            };
            TpaRequestObject[xuid].requests[entity.getName()] = new TpaData(entity.getName(), "tpa");
            entity.sendMessage(`§e${player.getName()}님에게 TPA 요청을 보냈습니다.`);
            player.sendMessage(`§e${entity.getName()}님에게 TPA 요청이 왔습니다.`);
        },{
            보낼사람: PlayerCommandSelector
        });

        command.register("티피수락", "티피요청을 수락합니다.").overload((param, origin, output) => {
            const entity = origin.getEntity();
            if (!entity?.isPlayer()) return;
            const player = param.수락할사람.newResults(origin)[0];
            const xuid = entity.getXuid();
            if (TpaRequestObject[xuid].requests[player.getName()] == null || TpaRequestObject[xuid].requests[player.getName()] == undefined) {
                entity.sendMessage("§c해당 플레이어는 당신에게 티피 요청을 보낸 적이 없습니다!");
                return;
            };
            const type = TpaRequestObject[xuid].requests[player.getName()].tpatype;
            if (type === "tpa") {
                player.teleport(entity.getPosition(), entity.getDimensionId());
                player.sendMessage(`§eTpa가 수락되어 ${player.getName()}님이 ${entity.getName()}님에게 이동 되었습니다.`);
                entity.sendMessage(`§eTpa가 수락되어 ${player.getName()}님이 ${entity.getName()}님에게 이동 되었습니다.`);
            } else if (type === "tphere") {
                entity.teleport(player.getPosition(), player.getDimensionId());
                player.sendMessage(`§eTpHere가 수락되어 ${entity.getName()}님이 ${player.getName()}님에게 이동 되었습니다.`);
                entity.sendMessage(`§eTpHere가 수락되어 ${entity.getName()}님이 ${player.getName()}님에게 이동 되었습니다.`);
            };
            delete TpaRequestObject[xuid].requests[player.getName()]
        },{
            수락할사람: PlayerCommandSelector
        });

        command.register("티피거절", "티피요청을 거절합니다.").overload((param, origin, output) => {
            const entity = origin.getEntity();
            if (!entity?.isPlayer()) return;
            const xuid = entity.getXuid();
            const player = param.거절할사람.newResults(origin)[0];
            if (TpaRequestObject[xuid].requests[player.getName()] == null || TpaRequestObject[xuid].requests[player.getName()] == undefined) {
                entity.sendMessage("§c해당 플레이어는 당신에게 티피 요청을 보낸 적이 없습니다!");
                return;
            };
            player.sendMessage(`§a${entity.getName()}님이 당신의 티피요청을 거절 하셨습니다.`);
            entity.sendMessage(`§a${player.getName()}님의 티피요청을 거절했습니다.`);
            delete TpaRequestObject[xuid].requests[player.getName()]
        },{
            거절할사람: PlayerCommandSelector
        });

        command.register("티피히얼", "자신의 위치로 상대에게 티피 요청을 보냅니다.").overload((param, origin, output) => {
            const entity = origin.getEntity();
            if (!entity?.isPlayer()) return;
            const player = param.보낼사람.newResults(origin)[0];
            if (entity.getName() === player.getName()) {
                entity.sendMessage("§c나 자신에게 티피 요청을 보내실 수 없습니다!");
                return;
            };
            const xuid = player.getXuid();
            const tpasetting: TpaSetting = Fs.getValue(path, xuid);
            if (tpasetting.tptoggle) {
                entity.sendMessage(`§e${player.getName()}님께서는 티피 요청을 받지 않도록 설정 중입니다.`);
                return;
            };
            if (tpasetting.tpauto) {
                player.sendMessage(`§a${entity.getName()}님의 티피 요청을 자동으로 수락 했습니다.`)
                player.teleport(entity.getPosition(), entity.getDimensionId());
                player.sendMessage(`§eTpHere가 수락되어 ${player.getName()}님이 ${entity.getName()}님에게 이동 되었습니다.`);
                entity.sendMessage(`§eTpHere가 수락되어 ${player.getName()}님이 ${entity.getName()}님에게 이동 되었습니다.`);
                delete TpaRequestObject[xuid].requests[entity.getName()]
                return;
            };
            TpaRequestObject[xuid].requests[entity.getName()] = new TpaData(entity.getName(), "tphere");
            entity.sendMessage(`§e${player.getName()}님에게 TPHERE 요청을 보냈습니다.`);
            player.sendMessage(`§e${entity.getName()}님에게 TPHERE 요청이 왔습니다.`);
        },{
            보낼사람: PlayerCommandSelector
        });

        command.register("티피토글", "티피 요청을 받을 지 말지 설정합니다.").overload((param, origin, output) => {
            const entity = origin.getEntity();
            if (!entity?.isPlayer()) return;
            const xuid = entity.getXuid();
            const form = new SimpleForm("§l§8[ §f티피 토글 §8]", "§8티피 요청을 받을 지 말지 결정하세요.");
            form.addButton(new FormButton("§l§8[ §f받지않기 §8]\n§r§8티피 요청을 받지 않고 자동으로 거절합니다."));
            form.addButton(new FormButton("§l§8[ §f받기 §8]\n§r§8티피 요청 자동 거절을 취소합니다."));
            form.sendTo(entity.getNetworkIdentifier(), (data) => {
                if (data.response === 0) {
                    const tpasetting: TpaSetting = Fs.getValue(path, xuid);
                    tpasetting.tptoggle = true;
                    Fs.setValue(path, xuid, tpasetting);
                    entity.sendMessage("§a앞으로 티피 요청을 받지 않도록 설정 했습니다.")
                } else if (data.response === 1) {
                    const tpasetting: TpaSetting = Fs.getValue(path, xuid);
                    tpasetting.tptoggle = false;
                    Fs.setValue(path, xuid, tpasetting);
                    entity.sendMessage("§a앞으로 티피 요청을 받도록 설정 했습니다.")
                };
            });
        },{});

        command.register("티피오토", "티피 요청을 자동으로 수락합니다.").overload((param, origin, output) => {
            const entity = origin.getEntity();
            if (!entity?.isPlayer()) return;
            const xuid = entity.getXuid();
            const form = new SimpleForm("§l§8[ §f티피 오토 §8]", "§8티피 요청을 자동으로 받을 지 말지 결정하세요.");
            form.addButton(new FormButton("§l§8[ §f자동받기 §8]\n§r§8티피 요청을 자동으로 수락합니다."));
            form.addButton(new FormButton("§l§8[ §f취소하기 §8]\n§r§8티피 요청 자동 수락을 취소합니다."));
            form.sendTo(entity.getNetworkIdentifier(), (data) => {
                if (data.response === 0) {
                    const tpasetting: TpaSetting = Fs.getValue(path, xuid);
                    tpasetting.tpauto = true;
                    Fs.setValue(path, xuid, tpasetting);
                    entity.sendMessage("§a앞으로 티피 요청을 자동으로 받도록 설정 했습니다.")
                } else if (data.response === 1) {
                    const tpasetting: TpaSetting = Fs.getValue(path, xuid);
                    tpasetting.tpauto = false;
                    Fs.setValue(path, xuid, tpasetting);
                    entity.sendMessage("§c티피요청 자동 받기를 취소 하셨습니다.")
                };
            });
        },{});

        command.register("티피얼", "모든 사람에게 티피 요청을 보냅니다.").overload((param, origin, output) => {
            const entity = origin.getEntity();
            if (!entity?.isPlayer()) return;
            bedrockServer.serverInstance.getPlayers().forEach((player) => {
                const xuid = player.getXuid();
                const tpasetting: TpaSetting = Fs.getValue(path, xuid);
                if (tpasetting.tptoggle) {
                    return;
                };
                if (tpasetting.tpauto) {
                    return;
                };
                if (entity.getName() === player.getName()) return;
                TpaRequestObject[xuid].requests[entity.getName()] = new TpaData(entity.getName(), "tpa");
                entity.sendMessage("§atptoggle, tpauto를 사용중인 플레이어을 제외한 모든 플레이어에게 TPA요청을 보냈습니다.")
                player.sendMessage(`§e${entity.getName()}님에게 TPA 요청이 왔습니다.`);
            },{ });
        },{});

        command.register("티피요청함", "자신에게 온 티피 요청들을 확인합니다.").overload((param, origin) => {
            const entity = origin.getEntity();
            if (!entity?.isPlayer()) return;
            const requests = Object.keys(TpaRequestObject);
            TpaCommand.sendcheckrequestform(entity.getNetworkIdentifier(), requests);
        },{});
    };

    public static EventListener(): void {
        events.playerJoin.on(ev => {
            const player = ev.player;
            const xuid = player.getXuid();
            if (TpaRequestObject[xuid] == null || TpaRequestObject[xuid] == undefined) {
                TpaRequestObject[xuid] = new RequestData();
            };
            if (Fs.getValue(path, xuid) == null || Fs.getValue(path, xuid) == undefined) {
                Fs.setValue(path, xuid, new TpaSetting(false, false));
            };
        });
    };
};

if (CommandBoolean.tpacommand) {
    TpaCommand.MakeTpaCommand();
    TpaCommand.EventListener();
};
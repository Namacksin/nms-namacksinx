import { DimensionId } from "bdsx/bds/actor";
import { Vec3 } from "bdsx/bds/blockpos";
import { Form, FormButton, SimpleForm } from "bdsx/bds/form";
import { command } from "bdsx/command";
import { events } from "bdsx/event";
import { CxxString } from "bdsx/nativetype";
import { CommandBoolean } from "../setting";
import { Player } from "bdsx/bds/player";
import { Fs } from "./db";

const path: string = '../plugins/nms-namacksinx-main/DataBase/home.json';

if (!Fs.isExist(path)) {
    Fs.makeFile(path);
};

export class PlayerHomeData {
    xuid: string;
    name: string;
    homes: Record<string, PositionData> = {};
    constructor(player: Player) {
        this.name = player.getName();
        this.xuid = player.getXuid();
        this.homes = {};
    };
};

class PositionData {
    public position: Vec3;

    public dimensionid: DimensionId;

    constructor(pos: Vec3, dimenid: DimensionId) {
        this.position = pos;
        this.dimensionid = dimenid;
    };
};

class HomeCommand {
    public static EventListener(): void {
        events.playerJoin.on(ev => {
            const player = ev.player;
            const xuid = player.getXuid();
            if (!Fs.hasValue(path, xuid)) {
                const playerhomedata = new PlayerHomeData(player);
                Fs.setValue(path, xuid, playerhomedata);
            };
        });
    };

    public static MakeHomeCommand(): void {
        command.register("셋홈", "지금 서있는 위치를 당신이 지정한 이름으로 저장합니다.").overload((param, origin, output) => {
            const entity = origin.getEntity()!;
            if (!entity.isPlayer()) return;
            const xuid = entity.getXuid();
            const playerhomedata: PlayerHomeData = Fs.getValue(path, xuid);
            playerhomedata.homes[param.홈이름] = new PositionData(entity.getPosition(), entity.getDimensionId());
            Fs.setValue(path, xuid, playerhomedata);
            entity.sendMessage(`§a성공적으로 지금 당신이 서있는 위치를 ${param.홈이름}이라는 이름으로 저장 하였습니다.`);
        },{
            홈이름: CxxString
        });

        command.register("델레트홈", "저장되있는 홈중 하나를 삭제합니다.").overload(async (param, origin, output) => {
            const entity = origin.getEntity()!;
            if (!entity.isPlayer()) return;
            const xuid = entity.getXuid();
            const playerhomedata: PlayerHomeData = Fs.getValue(path, xuid);
            const array = Object.keys(playerhomedata.homes);
            const form = await Form.sendTo(entity.getNetworkIdentifier(), {
                title: "§l§8[ §f홈 삭제 §8]",
                type: "custom_form",
                content: [
                    {
                        type: "dropdown",
                        text: "§8삭제하고 싶은 홈을 선택 해주세요.",
                        options: array
                    }
                ]
            });
            if (form === null) return;
            const homename = array[form[0]];
            delete playerhomedata.homes[homename];
            Fs.setValue(path, xuid, playerhomedata);
            entity.sendMessage(`§a성공적으로 ${homename} 홈이 삭제 되었습니다`);
        },{});

        command.register("리스트홈", "저장되있는 홈의 정보를 봅니다.").overload(async (param, origin, output) => {
            const entity = origin.getEntity()!;
            if (!entity.isPlayer()) return;
            const xuid = entity.getXuid();
            const playerhomedata: PlayerHomeData = Fs.getValue(path, xuid);
            const array = Object.keys(playerhomedata.homes);
            const form = await Form.sendTo(entity.getNetworkIdentifier(), {
                title: "§l§8[ §f홈 정보 §8]",
                type: "custom_form",
                content: [
                    {
                        type: "dropdown",
                        text: "§8정보를 보고싶은 홈을 선택해 주세요 .",
                        options: array
                    }
                ]
            });
            if (form === null) return;
            const homename = array[form[0]];
            const home = playerhomedata.homes[homename];
            const simpleform = new SimpleForm(`§l§8[ §f$홈 정보 §8]`,`§8이름 : ${homename}\n§8위치 : x-${Math.floor(home.position.x)} y-${Math.floor(home.position.y)} z-${Math.floor(home.position.z)}\n§8차원 : ${home.dimensionid}`);
            simpleform.sendTo(entity.getNetworkIdentifier());
        },{});

        command.register("체인지홈", "저장된 홈의 위치를 바꿉니다.").overload((param, origin, output) => {
            const entity = origin.getEntity()!;
            if (!entity.isPlayer()) return;
            const xuid = entity.getXuid();
            const playerhomedata: PlayerHomeData = Fs.getValue(path, xuid);
            if (playerhomedata.homes[param.홈이름] == null || playerhomedata.homes[param.홈이름] == undefined) {
                entity.sendMessage("§c해당 홈은 존재하지 않습니다!")
                return;
            };
            playerhomedata.homes[param.홈이름] = new PositionData(entity.getPosition(), entity.getDimensionId());
            Fs.setValue(path, xuid, playerhomedata);
            entity.sendMessage(`§a${param.홈이름} 위치를 현재 서있는 위치로 변경 하였습니다.`);
        },{
            홈이름: CxxString
        });

        command.register("홈", "저장되있는 홈으로 이동합니다.").overload(async (param, origin, output) => {
            const entity = origin.getEntity()!;
            if (!entity.isPlayer()) return;
            const xuid = entity.getXuid();
            const playerhomedata: PlayerHomeData = Fs.getValue(path, xuid);
            const array = Object.keys(playerhomedata.homes);
            const form = await Form.sendTo(entity.getNetworkIdentifier(), {
                title: "§l§8[ §f홈 §8]",
                type: "custom_form",
                content: [
                    {
                        type: "dropdown",
                        text: "§8이동하고 싶은 홈을 선택 해주세요.",
                        options: array
                    }
                ]
            });
            if (form === null) return;
            const homename = array[form[0]];
            const home = playerhomedata.homes[homename];
            entity.teleport(Vec3.create({x: home.position.x, y: home.position.y, z: home.position.z}));
            entity.sendMessage(`§a성공적으로 ${homename} 홈으로 이동 했습니다`);
        },{});
    };
};

if (CommandBoolean.homecommand) {
    HomeCommand.MakeHomeCommand();
    HomeCommand.EventListener();
};
import { DimensionId } from "bdsx/bds/actor";
import { Vec3 } from "bdsx/bds/blockpos";
import { command } from "bdsx/command";
import { events } from "bdsx/event";
import { CommandBoolean } from "../setting";
import { Player } from "bdsx/bds/player";
import { Fs } from "./db";

const path: string = "../plugins/nms-namacksinx-main/DataBase/back.json";

if (!Fs.isExist(path)) {
    Fs.makeFile(path);
};

class PlayerBackData {
    xuid: string;
    name: string;
    deadpos: PositionData;
    constructor(player: Player, deadpos: PositionData) {
        this.name = player.getName();
        this.xuid = player.getXuid();
        this.deadpos = deadpos;
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

class BackCommand {
    public static EventListener(): void {
        events.entityDie.on(ev => {
            const entity = ev.entity;
            if (!entity.isPlayer()) return;
            const deadpos = new PositionData(entity.getPosition(), entity.getDimensionId());
            const playerbackdata = new PlayerBackData(entity, deadpos);
            Fs.setValue(path, entity.getXuid(), playerbackdata);
        });
    };

    public static MakeBackCommand(): void {
        command.register("죽은위치", "죽은 위치로 텔레포트 합니다.").overload((param, origin, output) => {
            const entity = origin.getEntity()!;
            if (!entity.isPlayer()) return;
            if (!Fs.hasValue(path, entity.getXuid())) {
                entity.sendMessage("§c서버에서 죽은 적이 없습니다!");
                return;
            };
            const playerbackdata: PlayerBackData = Fs.getValue(path, entity.getXuid());
            const deadpos = playerbackdata.deadpos;
            entity.teleport(Vec3.create({x: deadpos.position.x, y: deadpos.position.y, z: deadpos.position.z}), deadpos.dimensionid);
            entity.sendMessage("§a성공적으로 죽었던 위치로 텔레포트 되었습니다");
        },{});
    };
};

if (CommandBoolean.backcommand) {
    BackCommand.MakeBackCommand();
    BackCommand.EventListener();
};
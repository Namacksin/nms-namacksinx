import { Player } from "bdsx/bds/player";
import { Fs } from "./db";
import { Vec3 } from "bdsx/bds/blockpos";
import { DimensionId } from "bdsx/bds/actor";
import { command } from "bdsx/command";
import { CommandBoolean } from "../setting";
import { CommandPermissionLevel } from "bdsx/bds/command";

const path: string = "../plugins/nms-namacksinx-main/DataBase/teleport.json";

if (!Fs.isExist(path)) {
    Fs.makeFile(path);
};

function tpToSpawn(player: Player): void {
    const pd: PositionData = Fs.getValue(path, "spawn");
    const pos = pd.position;
    player.teleport(Vec3.create({x: pos.x, y: pos.y, z: pos.z}), pd.dimensionid);
}; 

function MakeSpawnCommand(): void {
    command.register("스폰", "스폰으로 이동합니다.").overload((param, origin) => {
        const entity = origin.getEntity();
        if (!entity?.isPlayer()) return;
        if (!Fs.hasValue(path, "spawn")) {
            entity.sendMessage("§c아직 스폰이 설정되지 않았습니다!");
        };
        tpToSpawn(entity);
        entity.sendMessage("§e성공적으로 스폰으로 이동 완료 했습니다.");
    },{});

    command.register("스폰설정", "스폰 위치를 설정합니다.", CommandPermissionLevel.Operator).overload((param, origin) => {
        const entity = origin.getEntity();
        if (!entity?.isPlayer()) return;
        Fs.setValue(path, "spawn", new PositionData(entity.getPosition(), entity.getDimensionId()));
        entity.sendMessage("§e성공적으로 스폰 설정을 완료 하였습니다.");
    },{});
};

class PositionData {
    public position: Vec3;

    public dimensionid: DimensionId;

    constructor(pos: Vec3, dimenid: DimensionId) {
        this.position = pos;
        this.dimensionid = dimenid;
    };
};

if (CommandBoolean.spawncommand) {
    MakeSpawnCommand();
};
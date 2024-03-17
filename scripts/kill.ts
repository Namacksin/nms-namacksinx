import { command } from "bdsx/command";
import { CommandBoolean } from "../setting";

class KillCommand {
    public static MakeKillCommand(): void {
        command.register("리스폰", "마인크래프트 월드에서 리스폰 합니다.").overload((param, origin, output) => {
            const entity = origin.getEntity()!;
            if (!entity.isPlayer()) return;
            entity.kill();
            entity.sendMessage("§a성공적으로 월드에서 리스폰 했습니다");
        },{});
    };
};

if (CommandBoolean.killcommand) {
    KillCommand.MakeKillCommand();
};
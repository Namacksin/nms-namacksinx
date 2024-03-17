import { command } from "bdsx/command";
import { CommandBoolean } from "../setting";
import { ItemStack } from "bdsx/bds/inventory";

class ClearCommand {
    public static MakeClearCommand(): void {
        command.register("클리어", "인벤토리에 있는 아이템 칸들을 비웁니다.").overload((param, origin, output) => {
            const entity = origin.getEntity()!;
            if (!entity.isPlayer()) return;
            entity.runCommand('clear @s')
            entity.sendMessage("§a성공적으로 인벤토리에 있는 아이템 칸들을 모두 비웠습니다.");
        },{});

        command.register("삭제", "들고 있는 슬롯의 아이템을 비웁니다.").overload((param, origin) => {
            const entity = origin.getEntity()!;
            if (!entity.isPlayer()) return;
            entity.setMainhandSlot(ItemStack.constructWith("minecraft:air"));
            entity.sendMessage("§a들고 있는 아이템을 삭제 하였습니다.");
        },{});
    };
};

if (CommandBoolean.clearcommand) {
    ClearCommand.MakeClearCommand();
};
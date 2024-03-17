import { MobEffectIds, MobEffectInstance } from "bdsx/bds/effects";
import { command } from "bdsx/command";
import { CommandBoolean } from "../setting";

class EffectCommand {
    public static MakeEffectCommand(): void {
        command.register("야간투시", "야간투시 효과를 지급 받습니다.").overload((param, origin, output) => {
            const entity = origin.getEntity()!;
            if (!entity.isPlayer()) return;
            entity.addEffect(MobEffectInstance.create(MobEffectIds.NightVision, 200000000, 0, false, false, true));
            entity.sendMessage("§a성공적으로 야간투시 효과를 지급 하였습니다.");
        },{});

        command.register("효과모두삭제", "적용된 효과를 모두 삭제합니다.").overload((param, origin, output) => {
            const entity = origin.getEntity()!;
            if (!entity.isPlayer()) return;
            entity.removeAllEffects();
            entity.sendMessage("§a성공적으로 적용된 효과를 모두 삭제 했습니다.");
        },{});
    };
};

if (CommandBoolean.effectcommand) {
    EffectCommand.MakeEffectCommand();
};
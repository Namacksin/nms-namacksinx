import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { events } from "bdsx/event";
import { Fs } from "../db";
import { bedrockServer } from "bdsx/launcher";
import { PlayerClanData } from "../clan";
import { CommandBoolean } from "../../setting";
import { CANCEL } from "bdsx/common";

const path: string = "../plugins/nms-namacksinx-main/DataBase/title.json";
const path2: string = "../plugins/nms-namacksinx-main/DataBase/playerclandata.json";

namespace Chat {
    export function sendAll(message: string): void {
        bedrockServer.serverInstance.getPlayers().forEach((player) => {
            player.sendMessage(message)
        })
    };

    export function EventListener(): void {
        events.packetBefore(MinecraftPacketIds.Text).on((pkt, ni) => {
            const player = ni.getActor();
            if (player == null) return;
            const message = pkt.message.replace(/"/gi, `''`).replace(/\n/gi, "");
            const xuid = player.getXuid();
            let pltitle: string;
            if (Fs.hasValue(path, xuid)) {
                pltitle = Fs.getValue(path, xuid);
            } else {
                pltitle = "§l§8USER";
            };
            if (!Fs.hasValue(path2, xuid)) {
                Chat.sendAll(`§l§8[ §f팀 없음 §8]§f§r §l§8[ §f${pltitle} §8]§f§r §l§8[ §r§f${player.getName()} §l§8]§f§r §8${message}`);
                return CANCEL;
            };
            const data: PlayerClanData = Fs.getValue(path2, xuid);
            const title = data.clantitle;
            const clan = PlayerClanData.getClan(player);
            const role = clan.persons[player.getName()].role;
            Chat.sendAll(`§l§8[ §f${title} §8]§f§r §l§8[ §f${role} §8]§f§r §l§8[ §f${pltitle} §8]§f§r §l§8[ §r§f${player.getName()} §l§8]§f§r §8${message}`);
            return CANCEL;
        });
    };
}

if (CommandBoolean.chatcustom === true) {
    Chat.EventListener();
};

import("./title");
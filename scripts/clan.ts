import { Form, FormButton, FormDataCustom, ModalForm, SimpleForm } from "bdsx/bds/form";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { command } from "bdsx/command"
import { Fs } from "./db";
import { Player } from "bdsx/bds/player";
import { CommandBoolean } from "../setting";
import { Vec3 } from "bdsx/bds/blockpos";
import { DimensionId } from "bdsx/bds/actor";
import { events } from "bdsx/event";
import { CANCEL } from "bdsx/common";

const path: string = "../plugins/nms-namacksinx-main/DataBase/clan.json";
const path2: string = "../plugins/nms-namacksinx-main/DataBase/playerclandata.json";

if (!Fs.isExist(path)) {
    Fs.makeFile(path);
};
if (!Fs.isExist(path2)) {
    Fs.makeFile(path2);
};

const maxclannamelength: number = 12;
const maxclandescriptionlength: number = 40;
const maxpersonnumber: number = 10;
const maxannouncetitlenumber: number = 20;
const maxannounceinfonumber: number = 100;

class Clan {
    public title: string;
    public description: string;
    public pvp: boolean;
    public join: boolean;
    public maxperson: number;
    public persons: Record<string, ClanPerson>;
    public requests: Record<string, ClanPerson>;
    public announce: Record<string, ClanAnnounce>
    public base: PositionData;
    constructor(base: PositionData, title: string, description: string, pvp: boolean, join: boolean, maxperson: number) {
        this.title = title;
        this.description = description;
        this.pvp = pvp;
        this.join = join;
        this.maxperson = maxperson;
        this.persons = {};
        this.requests = {};
        this.announce = {};
        this.base = base;
    };
    public static save(clan: Clan): void {
        Fs.setValue(path, clan.title, clan);
    };
    public static setPerson(clan: Clan, name: string, xuid: string, role: "맴버" | "장로" | "부대표" | "대표"): void {
        clan.persons[name] = new ClanPerson(role, name, xuid);
        PlayerClanData.save(xuid, new PlayerClanData(name, xuid, clan));
    };

    public isInPlayer(player: Player): boolean {
        if (this.persons[player.getName()] == null || this.persons[player.getName()] == undefined) return false;
        else return true;
    };
    public static clanMembersToString(clan: Clan): string[] {
        const array = Object.keys(clan.persons);
        const result = [...new Set(array)];
        return result;
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

class ClanPerson {
    public role: "맴버" | "장로" | "부대표" | "대표";
    public name: string;
    public xuid: string;
    constructor(role: "맴버" | "장로" | "부대표" | "대표", name: string, xuid: string) {
        this.role = role;
        this.name = name;
        this.xuid = xuid;
    };
};

class ClanAnnounce {
    public title: string;
    public info: string;
    public date: string;
    public sender: string;
    constructor(title: string, info: string, date: string, sender: string) {
        this.title = title;
        this.info = info;
        this.date = date;
        this.sender = sender;
    };
};

export class PlayerClanData {
    public name: string;
    public xuid: string;
    public clantitle: string;
    public static hasClan(player: Player): boolean {
        if (Fs.getValue(path2, player.getXuid()) == null || Fs.getValue(path2, player.getXuid()) == undefined) return false;
        else return true;
    };
    public static getClan(player: Player): Clan {
        const playerclandata: PlayerClanData = Fs.getValue(path2, player.getXuid());
        const clantitle = playerclandata.clantitle
        const clan: Clan = Fs.getValue(path, clantitle);
        return clan;
    };
    constructor(name: string, xuid: string, clan: Clan) {
        this.name = name
        this.clantitle = clan.title;
        this.xuid = xuid
    };
    public static save(xuid: string, playerclandata: PlayerClanData): void {
        Fs.setValue(path2, xuid, playerclandata);
    };
};

namespace ClanForm {

    export function isUnfit(title: string, description: string): boolean {
        if (!title || !description) return true;
        if (title.length > maxclannamelength || description.length > maxclandescriptionlength) return true;
        return false;
    };

    export const mainmenuform = new SimpleForm("§l§8[ §f클랜 매인매뉴 §8]", "§8클랜 매인매뉴 입니다. 원하시는 매뉴를 선택해 주세요.", [
        new FormButton("§l§8[ §f클랜 생성 §8]\n§r§8클랜을 생성합니다."),
        new FormButton("§l§8[ §f클랜 가입 §8]\n§r§8클랜에 가입합니다."),
        new FormButton("§l§8[ §f클랜 정보 §8]\n§r§8클랜의 정보를 봅니다."),
        new FormButton("§l§8[ §f내 클랜 §8]\n§r§8자신의 클랜의 정보를 봅니다.")
    ]);

    export function clanjoinform(clan: Clan): SimpleForm {
        const simpleform = new SimpleForm("§l§8[ §f클랜 가입 §8]",  `§8클랜 이름 : ${clan.title}\n§8클랜 설명 : ${clan.description}\n§8클랜 내부 pvp 여부 : ${clan.pvp}\n§8클랜 인원수 : ${Object.keys(clan.persons).length}/${clan.maxperson}\n§8클랜 가입 요청 제도 여부 : ${clan.join}\n§8클랜 맴버 : ${Clan.clanMembersToString(clan)}`);
        simpleform.addButton(new FormButton("§l§8가입하기"));
        simpleform.addButton(new FormButton("§l§8돌아가기"));
        return simpleform;
    };

    export function claninfoform(clan: Clan): SimpleForm {
        const simpleform = new SimpleForm("§l§8[ §f클랜 정보 §8]",  `§8클랜 이름 : ${clan.title}\n§8클랜 설명 : ${clan.description}\n§8클랜 내부 pvp 여부 : ${clan.pvp}\n§8클랜 인원수 : ${Object.keys(clan.persons).length}/${clan.maxperson}\n§8클랜 가입 요청 제도 여부 : ${clan.join}\n§8클랜 맴버 : ${Clan.clanMembersToString(clan)}`);
        simpleform.addButton(new FormButton("§l§8돌아가기"));
        return simpleform;
    };

    export function clanMyClanForm(player: Player): SimpleForm {
        const clan = PlayerClanData.getClan(player);
        const person = clan.persons[player.getName()];
        const form = new SimpleForm("§l§8[ §f내 클랜 §8]", `§r§8내 등급 : ${person.role}`);
        form.addButton(new FormButton("§l§8[ §f클랜 관리 §8]\n§r§8클랜을 관리합니다."));
        form.addButton(new FormButton("§l§8[ §f클랜 공지 §8]\n§r§8클랜의 공지를 보거나 바꿉니다."));
        form.addButton(new FormButton("§l§8[ §f클랜 기지 §8]\n§r§8클랜의 기지를 보거나 바꿉니다."));
        form.addButton(new FormButton("§l§8[ §f클랜원 관리 §8]\n§r§8클랜원 정보를 보거나 관리합니다."));
        form.addButton(new FormButton("§l§8[ §f클랜 해산 §8]\n§r§8클랜을 해산합니다."));
        form.addButton(new FormButton("§l§8[ §f가입 요청함 §8]\n§r§8가입 요청함을 봅니다."));
        form.addButton(new FormButton("§l§8[ §f클럽 탈퇴 §8]\n§r§8클럽을 탈퇴합니다."));
        return form;
    };

    export const clancreatemenu: FormDataCustom = {
        title: "§l§8[ §f클랜 생성 §8]",
        type: "custom_form",
        content: [
            {
                type: "input",
                text: `§8생성할 클랜 이름을 ${maxclannamelength}자 이내로 써 주세요.`
            },
            {
                type: "input",
                text: `§8생성할 클랜 설명을 ${maxclandescriptionlength}자 이내로 써 주세요.`
            },
            {
                type: "toggle",
                text: `§8생성할 클랜의 내부 pvp여부를 선택해 주세요.`
            },
            {
                type: "toggle",
                text: `§8생성할 클랜의 초대 요청 제도 여부를 선택해 주세요.`
            },
            {
                type: "slider",
                text: `§8생성할 클랜의 최대 인원수를 ${maxpersonnumber}명 이내로 선택해 주세요.`,
                min: 3,
                max: maxpersonnumber
            }
        ]
    };

    export const clansettingemenu: FormDataCustom = {
        title: "§l§8[ §f클랜 설정 §8]",
        type: "custom_form",
        content: [
            {
                type: "input",
                text: `§8생성할 클랜 설명을 ${maxclandescriptionlength}자 이내로 써 주세요.`
            },
            {
                type: "toggle",
                text: `§8생성할 클랜의 내부 pvp여부를 선택해 주세요.`
            },
            {
                type: "toggle",
                text: `§8생성할 클랜의 초대 요청 제도 여부를 선택해 주세요.`
            },
            {
                type: "slider",
                text: `§8생성할 클랜의 최대 인원수를 ${maxpersonnumber}명 이내로 선택해 주세요.`,
                min: 3,
                max: maxpersonnumber
            }
        ]
    };

    export function clanjoinmenu(): FormDataCustom {
        const form: FormDataCustom = {
            title: "§l§8[ §f클랜 가입 §8]",
            type: "custom_form",
            content: [
                {
                    type: "dropdown",
                    text: `§8가입하고 싶은 클랜을 선택해 주세요.`,
                    options: Fs.toStringArray(path)
                }
            ]
        };
        return form;
    };

    export function claninfomenu(): FormDataCustom {
        const form: FormDataCustom = {
            title: "§l§8[ §f클랜 정보 §8]",
            type: "custom_form",
            content: [
                {
                    type: "dropdown",
                    text: `§8조회하고 싶은 클랜을 선택해 주세요.`,
                    options: Fs.toStringArray(path)
                }
            ]
        };
        return form;
    }; 

    export function OpenClanMainMenu(ni: NetworkIdentifier): void {
        mainmenuform.sendTo(ni, (data) => {
            if (data.response === 0) {
                OpenClanCreateMenu(ni);
            } else if (data.response === 1) {
                OpenClanJoinMenu(ni);
            } else if (data.response === 2) {
                OpenClanInfoMenu(ni);
            } else if (data.response === 3) {
                OpenClanMyMenu(ni);
            };
        });
    };

    export function ifIsHaveClan(player: Player): boolean {
        if (PlayerClanData.hasClan(player)) return true;
        else return false;
    };

    export function ifIsNotHaveClan(player: Player): void {
        if (!PlayerClanData.hasClan(player)) {
            player.sendMessage("§c소속되어있는 클랜이 없습니다.");
            OpenClanMainMenu(player.getNetworkIdentifier());
            return;
        };
    };

    export async function OpenClanCreateMenu(ni: NetworkIdentifier): Promise<void> {
        const player = ni.getActor()!;
        const form = await Form.sendTo(ni, clancreatemenu);
        if (form === null) {
            OpenClanMainMenu(ni);
            return;
        };
        if (PlayerClanData.hasClan(player)) {
            player.sendMessage("§c이미 소속 되어있는 클랜이 있습니다.");
            OpenClanMainMenu(player.getNetworkIdentifier());
            return;
        };
        const title: string = form[0];
        const description: string = form[1];
        if (ClanForm.isUnfit(title, description)) {
            player.sendMessage("§c클랜 이름 또는 설명이 적합하지 않습니다.");
            OpenClanMainMenu(ni);
            return;
        };
        const pvp: boolean = form[2];
        const join: boolean = form[3];
        const maxperson = form[4];
        const positiondata = new PositionData(player.getPosition(), player.getDimensionId());
        const clan = new Clan(positiondata, title, description, pvp, join, maxperson);
        Clan.setPerson(clan, player.getName(), player.getXuid(), "대표");
        Clan.save(clan);
        player.sendMessage("§e성공적으로 클랜을 생성 했습니다.");
        OpenClanMainMenu(ni);
    };

    export async function OpenClanJoinMenu(ni: NetworkIdentifier): Promise<void> {
        const player = ni.getActor()!;
        const form = await Form.sendTo(ni, clanjoinmenu());
        if (form === null) {
            return;
        };
        if (PlayerClanData.hasClan(player)) {
            player.sendMessage("§c이미 소속 되어있는 클랜이 있습니다.");
            OpenClanMainMenu(player.getNetworkIdentifier());
            return;
        };
        const clantitle: string = Fs.toStringArray(path)[form[0]];
        const clan: Clan = Fs.getValue(path, clantitle);
        if (Object.keys(clan.persons).length === clan.maxperson) {
            player.sendMessage("§c해당 클랜의 인원수가 꽉 찾습니다.");
            OpenClanMainMenu(ni);
            return;
        };
        const simpleform = ClanForm.clanjoinform(clan);
        simpleform.sendTo(ni, (data) => {
            if (data.response === 0) {
                if (clan.join === false) {
                    Clan.setPerson(clan, player.getName(), player.getXuid(), "맴버");
                    Clan.save(clan);
                    player.sendMessage(`§e성공적으로 ${clantitle}에 가입 성공 했습니다.`);
                } else {
                    clan.requests[player.getName()] = new ClanPerson("맴버", player.getName(), player.getXuid());
                    Clan.save(clan);
                    player.sendMessage(`§e성공적으로 ${clantitle}에 가입 요청을 보냈습니다.`);
                };
            } else if (data.response === 1) {
                OpenClanMainMenu(ni);
            };
        });
    };

    export async function OpenClanInfoMenu(ni: NetworkIdentifier): Promise<void> {
        const form = await Form.sendTo(ni, claninfomenu());
        if (form === null) {
            return;
        };
        const clantitle: string = Fs.toStringArray(path)[form[0]];
        const clan: Clan = Fs.getValue(path, clantitle);
        const simpleform = ClanForm.claninfoform(clan);
        simpleform.sendTo(ni, (data) => {
            if (data.response === 0) {
                OpenClanMainMenu(ni);
            };
        });
    };

    export function OpenClanMyMenu(ni: NetworkIdentifier): void {
        const player = ni.getActor()!;
        if (!PlayerClanData.hasClan(player)) {
            player.sendMessage("§c소속 되어있는 클랜이 없습니다.");
            OpenClanMainMenu(player.getNetworkIdentifier());
            return;
        };
        const clan = PlayerClanData.getClan(player);
        const form = clanMyClanForm(player);
        form.sendTo(ni, (data) => {
            if (data.response === 0) {
                OpenClanSettingMenu(ni);
            } else if (data.response === 1) {
                OpenClanAnnounceMenu(ni);
            } else if (data.response === 2) {
                OpenClanBaseMenu(ni);
            } else if (data.response === 3) {
                OpenClanPersonMenu(ni);
            } else if (data.response === 4) {
                OpenClanDeleteMenu(ni);
            } else if (data.response === 5) {
                OpenClanRequestMenu(ni);
            } else if (data.response === 6) {
                OpenClanLeftMenu(ni);
            };
        });
    };

    export async function OpenClanSettingMenu(ni: NetworkIdentifier): Promise<void> {
        const player = ni.getActor()!;
        const clan = PlayerClanData.getClan(player);
        const clanperson = clan.persons[player.getName()];
        if (clanperson.role !== "대표" && clanperson.role !== "부대표") {
            player.sendMessage("§c클랜 설정 권한이 없습니다.");
            OpenClanMyMenu(ni);
            return;
        };
        const form = await Form.sendTo(ni, clansettingemenu);
        if (form === null) {
            OpenClanMyMenu(ni);
            return;
        };
        const description: string = form[0];
        const pvp: boolean = form[1];
        const join: boolean = form[2];
        const maxperson: number = form[3];
        if (ClanForm.isUnfit(description, description)) {
            player.sendMessage("§c클랜 이름 또는 설명이 적합하지 않습니다.");
            OpenClanMyMenu(ni);
            return;
        };
        clan.description = description;
        clan.pvp = pvp;
        clan.join = join;
        clan.maxperson = maxperson;
        Clan.save(clan);
        player.sendMessage("§e성공적으로 클랜 설정을 바꾸었습니다.");
        OpenClanMyMenu(ni);
    };

    export function clanannounceform(clan: Clan): FormDataCustom {
        const array = Object.keys(clan.announce);
        const form: FormDataCustom = {
            title: "§l§8[ §f클랜 공지 §8]",
            type: "custom_form",
            content: [
                {
                    type: "dropdown",
                    text: "§8등록된 공지중 하나를 선택 해주세요.",
                    options: array
                }
            ]
        };
        return form;
    };

    export function clanannounceinfoform(announce: ClanAnnounce): SimpleForm {
        const form = new SimpleForm("§l§8[ §f클랜 공지 §8]", `§8제목 : ${announce.title}\n§8내용 : ${announce.info}\n§8보낸사람 : ${announce.sender}\n§8날짜 : ${announce.date}`, [new FormButton("§l§8돌아가기")]);
        return form;
    };

    export const choiceannouncemenuform: SimpleForm = new SimpleForm("§l§8[ §f클랜 공지 §8]", "§8원하시는 매뉴를 선택해 주세요.", [new FormButton("§l§8[ §f공지 등록 §8]\n§8공지를 등록합니다."), new FormButton("§l§8[ §f공지 보기 §8]\n§8공지를 봅니다.")]);

    export async function OpenClanAnnounceMenu(ni: NetworkIdentifier): Promise<void> {
        const player = ni.getActor()!;
        const choice = choiceannouncemenuform;
        choice.sendTo(ni, async (data) => {
            if (data.response === 0) {
                OpenClanAnnounceCreateMenu(ni);
            } else if (data.response === 1) {
                const clan = PlayerClanData.getClan(player);
                const data = clanannounceform(clan);
                const form = await Form.sendTo(ni, data);
                if (form === null) {
                    OpenClanMyMenu(ni);
                    return;
                };
                const announcetitle = Object.keys(clan.announce)[form[0]];
                const announce = clan.announce[announcetitle];
                const simpleform = clanannounceinfoform(announce);
                simpleform.sendTo(ni, (data) => {
                    if (data.response === 0) {
                        OpenClanMyMenu(ni);
                        return;
                    };
                })
            };
        });
    };

    export async function OpenClanAnnounceCreateMenu(ni: NetworkIdentifier): Promise<void> {
        const player = ni.getActor()!;
        const form = await Form.sendTo(ni, clanannouncemakeform);
        if (form === null) {
            OpenClanMyMenu(ni);
            return;
        };
        const name = player.getName();
        const clan = PlayerClanData.getClan(player);
        const clanperson = clan.persons[name];
        if (clanperson.role !== "대표" && clanperson.role !== "부대표") {
            player.sendMessage(`§c클럽 공지 등록 권한이 없습니다.`);
            OpenClanMyMenu(ni);
            return;
        };
        const title = form[0];
        const info = form[1];
        const date = new Date;
        const datestring = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}시`;
        const announce = new ClanAnnounce(title, info, datestring, name);
        clan.announce[title] = announce;
        Clan.save(clan);
        player.sendMessage("§e클랜에 공지를 등록 했습니다.");
        OpenClanMyMenu(ni);
    };

    export const clanannouncemakeform: FormDataCustom = {
        title: "§l§8[ §f클랜 공지 생성 §8]",
        type: "custom_form",
        content: [
            {
                type: "input",
                text: `§8생성할 공지 제목을 ${maxannouncetitlenumber}자 이내로 써 주세요.`
            },
            {
                type: "input",
                text: `§8생성할 공지 내용을 ${maxannounceinfonumber}자 이내로 써 주세요.`
            },
        ]
    };

    export function OpenClanBaseMenu(ni: NetworkIdentifier): void {
        const choice = choicebasemenuform;
        choice.sendTo(ni, (data) => {
            if (data.response === 0) {
                OpenClanBaseCreateMenu(ni);
            } else if (data.response === 1) {
                ClanBaseShowMenu(ni);
            };
        });
    };

    export const choicebasemenuform: SimpleForm = new SimpleForm("§l§8[ §f클랜 기지 §8]", "§8원하시는 매뉴를 선택해 주세요.", [new FormButton("§l§8[ §f기지 생성 §8]\n§8자신의 위치에 기지를 생성합니다."), new FormButton("§l§8[ §f기지 위치 §8]\n§8기지 위치를 봅니다.")]);

    export function OpenClanBaseCreateMenu(ni: NetworkIdentifier): void {
        const player = ni.getActor()!;
        const clan = PlayerClanData.getClan(player);
        const clanperson = clan.persons[player.getName()];
        if (clanperson.role !== "대표" && clanperson.role !== "부대표") {
            player.sendMessage(`§c클럽 기지 설정 권한이 없습니다.`);
            OpenClanMyMenu(ni);
            return;
        };
        const posdata = new PositionData(player.getPosition(), player.getDimensionId());
        clan.base = posdata;
        Clan.save(clan);
        player.sendMessage("§e클랜 기지를 설정하는데 성공 했습니다.");
        OpenClanMyMenu(ni);
    };

    export function clanbaseinfo(clan: Clan): SimpleForm {
        const base = clan.base;
        return new SimpleForm("§l§8[ §f클랜 기지 정보 §8]", `§8위치 : ${Math.floor(base.position.x)}, ${Math.floor(base.position.y)}, ${Math.floor(base.position.z)}\n§8차원 : ${base.dimensionid}`, [new FormButton("§l§8[ §f돌아가기 §8]\§8돌아갑니다.")]);
    };

    export function ClanBaseShowMenu(ni: NetworkIdentifier): void {
        const player = ni.getActor()!;
        const clan = PlayerClanData.getClan(player);
        const form = clanbaseinfo(clan);
        form.sendTo(ni, (data) => {
            if (data.response === 0) {
                OpenClanMyMenu(ni);
                return;
            };
        });
    };

    export async function OpenClanPersonMenu(ni: NetworkIdentifier): Promise<void> {
        const player = ni.getActor()!;
        const clan = PlayerClanData.getClan(player);
        const person = clan.persons[player.getName()];
        const data = clanpersonform(clan);
        const form = await Form.sendTo(ni, data);
        if (form === null) {
            OpenClanMyMenu(ni);
            return;
        };
        const name = Object.keys(clan.persons)[form[0]];
        const clanperson = clan.persons[name];
        const simpleform = clanpersonsettingform(clanperson);
        simpleform.sendTo(ni, (data) => {
            if (data.response === 0) {
                if (roleCheck(person.role, clanperson.role)) {
                    if (clanperson.role === "부대표") {
                        player.sendMessage("§c해당 클랜원은 더이상 승급이 불가능 합니다.");
                        OpenClanMyMenu(ni);
                        return;
                    };
                    if (clanperson.name === player.getName()) {
                        player.sendMessage("§c나 자신은 승급 불가능 합니다.");
                        OpenClanMyMenu(ni);
                        return;
                    };
                    const newrole = roleUpgrade(clanperson.role);
                    clanperson.role = newrole;
                    clan.persons[name] = clanperson;
                    Clan.save(clan);
                    player.sendMessage("§e성공적으로 클랜원을 승급 시켰습니다.");
                    OpenClanMyMenu(ni);
                } else {
                    player.sendMessage("§c해당 클랜원 보다 등급이 낮습니다.");
                    OpenClanMyMenu(ni);
                    return;
                };
            } else if (data.response === 1) {
                if (roleCheck(person.role, clanperson.role)) {
                    if (clanperson.role === "맴버") {
                        player.sendMessage("§c해당 클랜원은 더이상 강등이 불가능 합니다.");
                        OpenClanMyMenu(ni);
                        return;
                    };
                    if (clanperson.name === player.getName()) {
                        player.sendMessage("§c나 자신은 강등 불가능 합니다.");
                        OpenClanMyMenu(ni);
                        return;
                    };
                    const newrole = roleDowngrade(clanperson.role);
                    clanperson.role = newrole;
                    clan.persons[name] = clanperson;
                    Clan.save(clan);
                    player.sendMessage("§e성공적으로 클랜원을 강등 시켰습니다.");
                    OpenClanMyMenu(ni);
                } else {
                    player.sendMessage("§c해당 클랜원 보다 등급이 낮습니다.");
                    OpenClanMyMenu(ni);
                    return;
                };
            } else if (data.response === 2) {
                if (clanperson.name === player.getName()) {
                    player.sendMessage("§c나 자신은 추방 불가능 합니다.");
                    OpenClanMyMenu(ni);
                    return;
                };
                if (roleCheck(person.role, clanperson.role)) {
                    const form = personkickform();
                    form.sendTo(ni, (data) => {
                        if (data.response === true) {
                            delete clan.persons[clanperson.name];
                            Fs.removeValue(path2, clanperson.xuid);
                            Clan.save(clan);
                            player.sendMessage("§e성공적으로 클랜원을 추방 시켰습니다.");
                            OpenClanMyMenu(ni);
                        } else {
                            OpenClanMyMenu(ni);
                        };
                    })
                } else {
                    player.sendMessage("§c해당 클랜원 보다 등급이 낮습니다.");
                    OpenClanMyMenu(ni);
                    return;
                };
            } else {
                OpenClanMyMenu(ni);
            };
        });
    };

    export function personkickform(): ModalForm {
        const form = new ModalForm("§l§8[ §f클랜원 추방 §8]", "§8정말로 해당 클랜원을 추방 하시겠습니까?");
        form.setButtonConfirm("§l§8추방하기");
        form.setButtonCancel("§l§8돌아가기");
        return form;
    };

    export function clandeleteform(): ModalForm {
        const form = new ModalForm("§l§8[ §f클랜 해산 §8]", "§8정말로 클랜을 해산 하시겠습니까?");
        form.setButtonConfirm("§l§8해산하기");
        form.setButtonCancel("§l§8돌아가기");
        return form;
    };

    export function clanleftform(): ModalForm {
        const form = new ModalForm("§l§8[ §f클랜 탈퇴 §8]", "§8정말로 클랜을 탈퇴 하시겠습니까?");
        form.setButtonConfirm("§l§8탈퇴하기");
        form.setButtonCancel("§l§8돌아가기");
        return form;
    };

    export function roleCheck(role1: "맴버" | "장로" | "부대표" | "대표", role2: "맴버" | "장로" | "부대표" | "대표"): boolean {
        if (role1 === "맴버") {
            return false;
        } else if (role1 === "장로") {
            if (role2 == "맴버") {
                return true;
            } else {
                return false;
            };
        } else if (role1 === "부대표") {
            if (role2 !== "부대표" && role2 !== "대표") {
                return true;
            } else {
                return false;
            };
        } else {
            return true;
        };
    };

    export function roleUpgrade(role: "맴버" | "장로" | "부대표" | "대표"): "장로" | "부대표"  {
        if (role === "맴버") {
            return "장로"
        } else {
            return "부대표";
        };
    };

    export function roleDowngrade(role: "맴버" | "장로" | "부대표" | "대표"): "장로" | "맴버"  {
        if (role === "부대표") {
            return "장로"
        } else {
            return "맴버";
        };
    };

    export function OpenClanDeleteMenu(ni: NetworkIdentifier): void {
        const player = ni.getActor()!;
        const clan = PlayerClanData.getClan(player);
        const clanperson = clan.persons[player.getName()];
        if (clanperson.role !== "대표") {
            player.sendMessage("§c당신을 클랜을 해산할 수 있는 권한이 없습니다.");
            OpenClanMyMenu(ni);
            return;
        };
        const form = clandeleteform();
        form.sendTo(ni, (data) => {
            if (data.response === true) {
                Fs.toStringArray(path2).forEach((xuid) => {
                    const playerclandata: PlayerClanData = Fs.getValue(path2, xuid);
                    if (playerclandata.clantitle === clan.title) {
                        Fs.removeValue(path2, xuid);
                    };
                });
                Fs.removeValue(path, clan.title);
                player.sendMessage("§e클랜이 해산 되었습니다.");
                OpenClanMainMenu(ni);
            } else {
                OpenClanMyMenu(ni);
                return;
            };
        });
    };

    export function OpenClanLeftMenu(ni: NetworkIdentifier): void {
        const player = ni.getActor()!;
        const clan = PlayerClanData.getClan(player);
        const clanperson = clan.persons[player.getName()];
        if (clanperson.role == "대표") {
            player.sendMessage("§c당신을 클랜을 나가실 수 없습니다.");
            OpenClanMyMenu(ni);
            return;
        };
        const form = clanleftform();
        form.sendTo(ni, (data) => {
            if (data.response === true) {
                delete clan.persons[clanperson.name];
                Fs.removeValue(path2, clanperson.xuid);
                Clan.save(clan);
                player.sendMessage("§e성공적으로 클랜을 탈퇴 했습니다.");
                OpenClanMyMenu(ni);
            } else {
                OpenClanMyMenu(ni);
                return;
            };
        });
    };

    export function clanpersonform(clan: Clan): FormDataCustom {
        const array = Object.keys(clan.persons);
        const form: FormDataCustom = {
            title: "§l§8[ §f클랜원 관리 §8]",
            type: "custom_form",
            content: [
                {
                    type: "dropdown",
                    text: "§8관리하고 싶은 클랜원을 선택해 주세요.",
                    options: array
                }
            ]
        };
        return form;
    };

    export function clanrequestform(clan: Clan): FormDataCustom {
        const array = Object.keys(clan.requests);
        const form: FormDataCustom = {
            title: "§l§8[ §f가입 요청함 §8]",
            type: "custom_form",
            content: [
                {
                    type: "dropdown",
                    text: "§8가입 요청을 수락할 플레이어를 선택해 주세요.",
                    options: array
                }
            ]
        };
        return form;
    };

    export function clanpersonsettingform(person: ClanPerson): SimpleForm {
        return new SimpleForm("§l§8[ §f클랜원 관리 §8]", `§8이름 : ${person.name}\n§8등급 : ${person.role}`, [new FormButton("§l§8[ §f승급하기 §8]\n§8클랜원을 승급 시킵니다."), new FormButton("§l§8[ §f강등하기 §8]\n§8클랜원을 강등 시킵니다."), new FormButton("§l§8[ §f추방하기 §8]\n§8클랜원을 추방 시킵니다."), new FormButton("§l§8[ §f돌아가기 §8]\n§8돌아갑니다.")]);
    };

    export async function OpenClanRequestMenu(ni: NetworkIdentifier): Promise<void> {
        const player = ni.getActor()!;
        const clan = PlayerClanData.getClan(player);
        const clanperson = clan.persons[player.getName()];
        if (clanperson.role === "맴버") {
            player.sendMessage("§c등급이 낮아 가입 요청을 수락할 수 없습니다.");
            OpenClanMyMenu(ni);
            return;
        };
        const data = clanrequestform(clan);
        const form = await Form.sendTo(ni, data)
        if (form === null) {
            OpenClanMyMenu(ni);
            return;
        };
        const name = Object.keys(clan.requests)[form[0]];
        const person = clan.requests[name];
        Clan.setPerson(clan, person.name, person.xuid, "맴버");
        delete clan.requests[name];
        Clan.save(clan);
        player.sendMessage("§e성공적으로 초대 요청을 수락 했습니다.");
        OpenClanMainMenu(ni);
    };
};

namespace ClanCommand {
    export function MakeClanCommand(): void {
        command.register("클랜", "클랜 매인 매뉴를 엽니다.").overload((param, origin) => {
            const entity = origin.getEntity();
            if (!entity?.isPlayer()) return;
            const ni = entity.getNetworkIdentifier();
            ClanForm.OpenClanMainMenu(ni);
        },{});
    };

    export function EventListener(): void {
        events.entityHurt.on(ev => {
            const entity = ev.entity;
            const attacker = ev.damageSource.getDamagingEntity();
            if (!entity.isPlayer()) return;
            if (!attacker?.isPlayer()) return;
            const clan = PlayerClanData.getClan(entity);
            if (clan.title === PlayerClanData.getClan(attacker).title) {
                if (clan.pvp === false) {
                    attacker.sendMessage("§c같은 길드끼리 타격이 불가능 합니다.");
                    return CANCEL;
                };
            };
        });
    };
};

if (CommandBoolean.clancommand) {
    ClanCommand.MakeClanCommand();
};
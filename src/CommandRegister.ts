import {PermissionFlagsBits, REST, Routes, SlashCommandBuilder} from "discord.js";
import {Config} from "./Config";

const command = [
    new SlashCommandBuilder()
        .setName('투표')
        .setDescription('투표 관리 명령어')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
        .addSubcommand(subcommand =>
            subcommand
                .setName('시작')
                .setDescription('투표를 시작합니다.')
                .addStringOption(option =>
                    option
                        .setName('옵션1')
                        .setDescription('옵션 1의 이름을 입력하세요.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('옵션2')
                        .setDescription('옵션 2의 이름을 입력하세요.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('옵션3')
                        .setDescription('옵션 3의 이름을 입력하세요.')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('옵션4')
                        .setDescription('옵션 4의 이름을 입력하세요.')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('옵션5')
                        .setDescription('옵션 5의 이름을 입력하세요.')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('종료')
                .setDescription('투표를 종료합니다.')
        )
]

const token = process.env.TOKEN || Config.token;
const clientId = process.env.CLIENT_ID || Config.clientId;

const rest = new REST({version: '10'}).setToken(token);

export async function registerCommands() {
    try {
        await rest.put(
            Routes.applicationCommands(clientId),
            {body: command},
        );

        console.log('Successfully registered application commands.');
    } catch (error) {
        console.error(error);
    }
}
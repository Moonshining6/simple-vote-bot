import {v4 as uuidv4} from 'uuid';
import {ButtonStyle, Channel, Client, ComponentType, Interaction, Message, TextChannel, User} from "discord.js";

type VoteOption = {
    name: string;
    voters: User[];
}

export class VoteSession {
    private readonly _id: string;
    private readonly _options: VoteOption[];
    private _message: Message | null = null;
    private _client: Client;
    private _interactionId: string | null = null;

    constructor(options: VoteOption[], client: Client) {
        this._id = uuidv4();
        this._options = options;
        this._client = client;
    }

    public async start(channel: Channel): Promise<void> {
        if (!(channel instanceof TextChannel)) {
            throw new Error("Channel is not a text channel!");
        }

        this._interactionId = channel.guild.id + channel.id + this._id;
        this._message = await channel.send({
            embeds: this.makeEmbeds(),
            components: [{
                type: ComponentType.ActionRow,
                components: this.makeButtons()
            }]
        });

        this._client.on("interactionCreate", this.interactionHandler);
    }

    private makeButtons(): { style: any; label: string; type: any; customId: string }[] {
        return this._options.map((option, index) => {
            return {
                type: ComponentType.Button,
                label: option.name,
                style: ButtonStyle.Primary,
                customId: this._id + index
            }
        });
    }

    private interactionHandler = async (interaction: Interaction) => {
        if (interaction.isButton() && interaction.customId.startsWith(this._id)) {
            const index = parseInt(interaction.customId.replace(this._id, ""));

            await this.vote(index, interaction.user);

            await interaction.update({
                embeds: this.makeEmbeds(),
            });
        }
    }

    public async vote(index: number, user: User) {
        if (this._message === null) {
            throw new Error("VoteSession is not started!");
        }

        const alreadyVoted = this._options.some((option) => {
            return option.voters.some((voter) => {
                return voter.id === user.id;
            });
        });

        if (alreadyVoted) {
            this._options.forEach((option) => {
                option.voters = option.voters.filter((voter) => {
                    return voter.id !== user.id;
                });
            });
        }

        this._options[index].voters.push(user);
    }

    private makeEmbeds() {
        return [{
            title: "투표",
            description: `투표가 시작되었습니다!`,
            fields: [...this.generateVotersFields(), {
                name: "총 투표 수",
                value: `${this.totalVoteCount()}표!`,
            }]
        }]
    }

    public async end() {
        if (this._message === null) {
            throw new Error("VoteSession is not started!");
        }

        await this._message.edit({
            embeds: [{
                title: "투표",
                description: `투표가 종료되었습니다!`,
                fields: [...this.generateVotersFields(), {
                    name: "총 투표 수",
                    value: `${this.totalVoteCount()}표!`,
                }, {
                    name: "우승자",
                    value: this.getWinner(),
                }]
            }],
            components: []
        });
    }

    private getWinner() {
        let max = 0;
        let winner = "";

        for (const option of this._options) {
            if (option.voters.length > max) {
                max = option.voters.length;
                winner = option.name;
            }
        }

        return winner;
    }

    private totalVoteCount() {
        let total = 0;

        for (const option of this._options) {
            total += option.voters.length;
        }

        return total;
    }

    private generateVotersFields() {
        return this._options.map((option) => {
            return {
                name: option.name,
                value: `${option.voters.length}표!`,
                inline: true
            }
        })
    }
}
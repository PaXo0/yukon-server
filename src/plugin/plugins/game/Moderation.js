import GamePlugin from '@plugin/GamePlugin'


export default class Moderation extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'mute_player': this.mutePlayer,
            'kick_player': this.kickPlayer,
            'ban_player': this.banPlayer
        }
    }

    async mutePlayer(args, user) {
        if (!user.isModerator) {
            return
        }

        let recipient = this.usersById[args.id]

        if (recipient && recipient.rank < user.rank) {
            await this.applyMute(user.id, args.id)
            recipient.close()
        }
    }

    kickPlayer(args, user) {
        if (!user.isModerator) {
            return
        }

        let recipient = this.usersById[args.id]

        if (recipient && recipient.rank < user.rank) {
            recipient.close()
        }
    }

    async banPlayer(args, user) {
        if (!user.isModerator) {
            return
        }

        let recipient = this.usersById[args.id]

        if (!recipient) {
            return
        }

        let recipientRank = await this.getRecipientRank(recipient, args.id)

        if (recipientRank < user.rank) {
            await this.applyBan(user.id, args.id)
			
            recipient.close()
        }
    }

    async applyBan(moderator, id, hours = 24, message = 'In-game Menu') {
        let expires = Date.now() + (hours * 60 * 60 * 1000)
			
        let banCount = await this.db.getBanCount(id)
        // 5th ban is a permanent ban
        if (banCount >= 4) {
            this.db.users.update({ permaBan: true }, { where: { id: id }})
        }

        this.db.bans.create({ userId: id, expires: expires, moderatorId: moderator, message: message })
    }

    async applyMute(moderator, id, hours = 24, message = 'In-game Menu') {
        let expires = Date.now() + (hours * 60 * 60 * 1000)
			
        let muteCount = await this.db.getMuteCount(id)
        // 5th mute is a permanent mute
        if (muteCount >= 4) {
            this.db.users.update({ permaMute: true }, { where: { id: id }})
        }

        this.db.mute.create({ userId: id, expires: expires, moderatorId: moderator, message: message })
    }

    async getRecipientRank(recipient, id) {
        return (recipient)
            ? recipient.rank
            : (await this.db.getUserById(id)).rank
    }

}

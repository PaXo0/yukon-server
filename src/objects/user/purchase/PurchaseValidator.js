import { isNumber } from '@utils/validation'


export default class PurchaseValidator {

    constructor(user) {
        this.user = user
    }

    get crumbs() {
        return this.user.crumbs
    }

    item(id) {
        return this.validate(id, 'items', this.user.inventory)
    }

    igloo(id) {
        return this.validate(id, 'igloos', this.user.igloos)
    }

    furniture(id) {
        return this.validate(id, 'furnitures')
    }

    pet(id) {
        return this.validate(id, 'pets')
    }

    flooring(id) {
        return this.validate(id, 'floorings', [this.user.room.flooring])
    }

    validate(id, type, includes = []) {
        id = parseInt(id)

        if (!isNumber(id)) {
            return false
        }

        let item = this.crumbs[type][id]

        if (!item) {
            return false

        } else if (includes.includes(id)) {
            this.user.send('error', { error: 'You already have this item.' })
            return false

        } else if (this.user.rank == 20) {
            return item

        }else if (!item.active) {
            this.user.send('error', { error: 'This item is not currently available.' })
            return false

        } else if (item.mascot && this.user.rank != 10) {
            this.user.send('error', { error: 'This item is not available.' })
            return false

        } else if (item.staff && this.user.rank < 2) {
            this.user.send('error', { error: 'This item is a staff item.' })
            return false

        } else if (item.cost > this.user.coins) {
            this.user.send('error', { error: 'You need more coins.' })
            return false

        } else {
            return item
        }
    }

}

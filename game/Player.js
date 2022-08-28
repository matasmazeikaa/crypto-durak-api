export default class Player {
    hand = {}
    isAttacker = false
    name = ""
    id = ""
    isReady = false

    constructor({name, id}) {
        this.name = name
        this.id = id
    }

    get isHandEmpty() {
        return Object.keys(this.hand).length === 0
    }

    getHand() {
        return this.hand
    }

    addCardToHand(card) {
        this.hand = {
            ...this.hand,
            [card.id]: card
        }
    }

    removeCardFromHand(card) {
        delete this.hand[card.id]
    }

    setAttacker(value) {
        this.isAttacker = value
    }

    toggleReady() {
        this.isReady = !this.isReady
    }
}
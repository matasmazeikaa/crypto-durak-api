import Deck from "./Deck"
import Player from "./Player"

const MAX_HAND_COUNT = 6

const COMMANDS = {
    ATTACK: 'attack',
    DEFEND: 'defend',
    TAKE_OPENED_CARDS: 'take-opened-cards',
    END_TURN: 'end-turn'
}

export default class Game {
    players = []
    deck = {
        cards: [],
        trump: null
    }
    discardedCards = []
    openedCards = []
    attacker = null
    isGameLive = false
    playerTurn = 0
    currentPlayer = {
        id: null,
        name: null
    }
    winner = null
    cryptoAmount = 0

    constructor({ players, cryptoAmount }) {
        this.initPlayers(players)
        this.setCryptoAmount(cryptoAmount)
    }

    get isCardsOpened() {
        return this.openedCards.length > 0
    }

    get allOpenedCards() {
        if (!this.openedCards) {
            return []
        }

        return this.openedCards.flatMap((openedCard) => {
            if (!openedCard.defend) {
                return openedCard.attack
            }

            return [openedCard.attack, openedCard.defend]
        })
    }

    initPlayers(players) {
        // Hardcoding players for the moment
        console.log(players)
        this.players = players.map((player) => new Player({ name: player.name, id: player.id }))
        console.log(this.players)
    }

    addPlayer(player) {
        const newPlayer = new Player({ name: player.name, id: player.id })

        this.players.push(newPlayer)
    }


    initDeck() {
        this.deck = new Deck()
    }

    dealCards() {
        if (this.deck.isEmpty) {
            return
        }

        this.players.forEach((player) => {
            const playerHandCount = Object.keys(player.hand).length

            for (let i = 0; i < MAX_HAND_COUNT - playerHandCount; i++) {
                if (this.deck.isEmpty) {
                    break;
                }
                
                player.addCardToHand(this.deck.cards[this.deck.cards.length - 1])
                this.deck.removeTopCard()

                if (this.deck.isEmpty) {
                    break;
                }
            }
        })
    }

    setFirstAttacker(player) {
        // TODO For now let's pick a random person
        // later we will add as first attacker is the one that has the lowest trump card

        this.attacker = 0
        this.players[0].setAttacker(true)
        this.currentPlayer = this.players[0]
    }

    setCryptoAmount(amount) {
        this.cryptoAmount = amount;
    }

    changeTurn() {
        const nextTurn = this.playerTurn + 1

        if (nextTurn > this.players.length - 1) {
            this.playerTurn = 0
            this.currentPlayer = this.players[0]

            return
        }

        this.playerTurn = nextTurn
        this.currentPlayer = this.players[nextTurn]
    }

    changeAttacker() {
        const nextAttacker = this.attacker + 1;

        if (nextAttacker > this.players.length - 1) {
            this.attacker = 0
            this.players.forEach((player, index) => {
                if (index === 0) {
                    player.isAttacker = true
                } else {
                    player.isAttacker = false
                }
            })

            return
        }

        this.attacker = nextAttacker
        this.players.forEach((player, index) => {
            if (index === nextAttacker) {
                player.isAttacker = true
            } else {
                player.isAttacker = false
            }
        })
    }

    gameLoop() {
        let isWinner = false
    }

    removeOpenedCards() {
        this.openedCards = []
    }

    discardCards() {
        this.discardedCards = [...this.discardedCards, ...this.allOpenedCards]
        this.removeOpenedCards()
    }

    endGame (winner) {
        this.winner = winner
    }
 
    runCommand(card, player, command) {

        if (command === COMMANDS.ATTACK) {
            const isSameLabelCards = this.allOpenedCards.some((openedCard) => openedCard.label === card.label)

            console.log(this.openedCards)
            console.log(card)

            if (this.isCardsOpened && !isSameLabelCards) {
                console.log('There are no cards with this label on the board, choose another card or end turn')

                return;
            }

            this.players[this.playerTurn].removeCardFromHand(card)

            this.openedCards = [
                ...this.openedCards,
                { attack: card, defend: null }
            ]

            console.log(this.playerTurn.isHandEmpty)
            console.log(this.deck.isEmpty)

            if (this.currentPlayer.isHandEmpty && this.deck.isEmpty) {
                this.endGame(player)
            }

            this.changeTurn()
        }

        if (command === COMMANDS.DEFEND) {
            const lastCardIndex = this.openedCards.length - 1

            const attackingCard = this.openedCards[lastCardIndex].attack

            if (attackingCard.suit !== card.suit && card.trump === false) {
                console.log('The suit is wrong')

                return
            }

            if (attackingCard.weight >= card.weight) {
                console.log('You cannot play this card its too weak')

                return
            }

            this.players[this.playerTurn].removeCardFromHand(card)

            this.openedCards[lastCardIndex] = {
                attack: attackingCard,
                defend: card
            }

            if (this.currentPlayer.isHandEmpty && this.deck.isEmpty) {
                this.endGame(player)
            }

            this.changeTurn()
        }

        if (command === COMMANDS.TAKE_OPENED_CARDS) {
            this.openedCards.forEach((card) => {
                this.currentPlayer.addCardToHand(card.attack)

                if (card.defend) {
                    this.currentPlayer.addCardToHand(card.defend)
                }
            })
            this.removeOpenedCards()
            this.changeTurn()
            this.dealCards()
        }

        if (command === COMMANDS.END_TURN) {
            this.changeAttacker()
            this.changeTurn()
            this.dealCards()
            this.discardCards()

            console.log(this.attacker)
            console.log(this.currentPlayer)
        }
    }

    startGame() {
        this.isGameLive = true
        this.initDeck()
        this.dealCards()
        this.setFirstAttacker()
    }
}
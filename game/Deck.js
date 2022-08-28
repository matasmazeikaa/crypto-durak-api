import Card from "./Card.js";
import { RANKS, SUITS } from "./constants";

export default class Deck {
    cards = [];
    trump = null;

    constructor() {
        this.initCards();
        this.shuffle();
        this.setTrump();
    }

    get isEmpty() {
        return this.length === 0;
    }

    get length() {
        return this.cards.length
    }

    initCards() {
        this.cards = []

        Object.values(SUITS).forEach((suit) => {
            Object.values(RANKS).forEach((rank) => this.cards.push(new Card({ suit, rank })))
        })
    }

    shuffle() {
        const { cards } = this;

        for (let i = cards.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
    }

    setTrump() {
        this.trump = this.cards[0];

        this.cards
            .filter((card) => card.suit === this.trump.suit)
            .forEach((card) => card.setTrump(true));
    }

    removeTopCard() {
        this.cards.pop()
    }
}


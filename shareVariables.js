export let allPiecesOnBoard = [];
export let history = [];
export let currentPiece;

export function syncAllPiecesOnBoard(newValue) {
    allPiecesOnBoard = newValue;
}

export function syncHistory(newValue) {
    history = newValue;
}

export function syncCurrentPiece(newValue) {
    currentPiece = newValue;
}
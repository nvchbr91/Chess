import {
    clamp,
 } from '../rules/utils.js';

export const king = {
    name: 'king',
    validMoves(currentPiece, allPiecesOnBoard, n) {
        const deltas = [[1, 0], [1, 1],
                        [0, 1], [-1, 1],
                        [-1, 0], [-1, -1],
                        [0, -1], [1, -1]];

        const { validMoves, takeAble, unTakeAble } =
            clamp(deltas, currentPiece, allPiecesOnBoard, n);

        return {
            validMoves: validMoves,
            takeAble: takeAble,
            unTakeAble
        };
    },
    canChangeStateCondition(currentPiece, n) {
        return false;
    }
}
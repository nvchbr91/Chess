import {
    clamp,
    noPassThrough
} from '../rules/utils.js';
 
export const bishop = {
    name: 'bishop',
    validMoves(currentPiece, allPiecesOnBoard, n) {
        const deltas = [];

        for (let dx = -n + 1; dx <= n - 1; dx++) {
            if (dx === 0) continue;
            deltas.push([dx, dx]);
            deltas.push([dx, -dx]);
        }

        const { validMoves, takeAble, unTakeAble } =
            clamp(deltas, currentPiece, allPiecesOnBoard, n);

        const filteredMoves =
            noPassThrough(currentPiece, validMoves, takeAble, unTakeAble);
        
        const filteredTakeAble =
            noPassThrough(currentPiece, takeAble, takeAble, unTakeAble);

        return {
            validMoves: filteredMoves,
            takeAble: filteredTakeAble,
            unTakeAble
        };
    },
    canChangeStateCondition(currentPiece, n) {
        return false;
    }
}
import {
    clamp,
} from '../rules/utils.js';
 
export const pawn = {
    name: 'pawn',
    states: ['queen', 'rook', 'knight', 'bishop'],
    validMoves(currentPiece, allPiecesOnBoard, n) {
        const deltas = [];

        if (currentPiece.class === 0) {
            deltas.push([0, -1]);
            deltas.push([-1, -1]);
            deltas.push([1, -1]);
        } else if (currentPiece.class === 1) {
            deltas.push([0, 1]);
            deltas.push([-1, 1]);
            deltas.push([1, 1])
        }

        const { validMoves, takeAble, unTakeAble } =
            clamp(deltas, currentPiece, allPiecesOnBoard, n);

        const filteredValidMoves =
            validMoves.filter(p => Math.abs(p.pos.x - currentPiece.pos.x) === 0);
        
        const filteredTakeAble =
            takeAble.filter(p => Math.abs(p.pos.x - currentPiece.pos.x) !== 0);

        return {
            validMoves: filteredValidMoves,
            takeAble: filteredTakeAble,
            unTakeAble
        };
    },
    canChangeStateCondition(currentPiece, n) {
        if (currentPiece.pos.y === 1 && currentPiece.class === 0) {
            return true;
        } else if (currentPiece.pos.y === n && currentPiece.class === 1) {
            return true;
        } else {
            return false;
        }
    }
}
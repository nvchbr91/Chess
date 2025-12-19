import {
    clamp
} from '../rules/utils.js';
 
export const knight = {
    name: 'knight',
    validMoves(currentPiece, allPiecesOnBoard, n) {
        const deltas = [
            [2, 1], [2, -1],
            [-2, 1], [-2, -1],
            [1, 2], [1, -2],
            [-1, 2], [-1, -2],
        ];

        return clamp(deltas, currentPiece, allPiecesOnBoard, n);
    },
    canChangeStateCondition(currentPiece, n) {
        return false;
    }
}
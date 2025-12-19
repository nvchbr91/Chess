import {
    pieces
 } from './pieces.js';
import {
    render,
    changeStateBoard,
    loadImage,
    getPositionByMouse,
    sync,
} from './render.js';
import {
    isValidMove,
    createPiece
} from './pieces/rules/utils.js'

import {
    allPiecesOnBoard,
    history,
    syncAllPiecesOnBoard,
    currentPiece,
    syncCurrentPiece,
} from './shareVariables.js'

// Sau này sửa thành manager chỉ export, các files khác thì chỉ import từ manager.

const canvas = document.getElementById('boardGame');
const canvasChangingState = document.getElementById('changingState')
const ctxChangeingState = canvasChangingState.getContext('2d');
const ctx = canvas.getContext('2d');
const imageCache = {};

let n = 8;
let rect;
let cellSize;
let pieceSizeRatio = 0.9;
let canvasSizeRatio = 0.7
let dragging = false;
let showValidMoves = 0;
export let test = { changingState: false }

synchronize();

for (let i = 0; i < 10; i++) {
    let x, y;

    if (allPiecesOnBoard.length === 0) {
        x = Math.floor(Math.random() * 8);
        y = Math.floor(Math.random() * 8);
    } else {
        const occupied = allPiecesOnBoard.map(
            p => 8 * (p.pos.y - 1) + (p.pos.x - 1)
        );

        const pos = randomExclusive(occupied, 64);
        x = pos % 8;
        y = Math.floor(pos / 8);
    }

    const rules = [
        pieces.king,
        pieces.queen,
        pieces.rook,
        pieces.bishop,
        pieces.knight,
        pieces.pawn
    ];

    const pieceRule = rules[Math.floor(Math.random() * rules.length)];
    const cls = Math.floor(Math.random() * 2);
    const color = cls === 0 ? 'white' : 'black';

    const tmp = createPiece(
        x + 1,
        y + 1,
        cls,
        `assets/${color}_${pieceRule.name}.png`,
        pieceRule
    )
    tmp.shape.image = loadImage(ctx, tmp);
    allPiecesOnBoard.push(tmp);
}

function randomExclusive(excluded, max) {
    const available = [];

    for (let i = 0; i < max; i++) {
        if (!excluded.includes(i)) {
            available.push(i);
        }
    }

    return available[Math.floor(Math.random() * available.length)];
}

function clonePiece(p) {
    return {
        pos: { ...p.pos },
        originPos: { ...p.originPos },
        class: p.class,
        shape: { ...p.shape },
        validMoves: [...p.validMoves],
        takeAble: [...p.takeAble],
        unTakeAble: [...p.unTakeAble],
        getRules: p.getRules
    };
}

export function cloneAllPiecesOnBoard(allPiecesOnBoard) {
    return allPiecesOnBoard.map(clonePiece);
}

function pushHistory(allPiecesOnBoard) {
    const h = history[history.length - 1];

    if (history[history.length-1].length !== allPiecesOnBoard.length) {
        history.push(cloneAllPiecesOnBoard(allPiecesOnBoard));
        return;
    } else {
        for (let i = 0; i < h.length; i++) {
            if (h[i].pos.x !== allPiecesOnBoard[i].pos.x ||
                h[i].pos.y !== allPiecesOnBoard[i].pos.y) {
                history.push(cloneAllPiecesOnBoard(allPiecesOnBoard));
                return;
            }
        }
    }
}

function synchronize() {
    sync({
        canvas,
        canvasChangingState,
        ctxChangeingState,
        ctx,
        n,
        rect,
        cellSize,
        pieceSizeRatio,
        canvasSizeRatio,
        dragging,
        showValidMoves,
        changingState: test.changingState,
        imageCache,
    })
}

function resize() {
    const size = Math.min(window.innerWidth, window.innerHeight) * canvasSizeRatio;
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    rect = canvas.getBoundingClientRect();
    cellSize = size / n;
    canvasChangingState.width = cellSize;
    canvasChangingState.height = size + cellSize/2;
    canvasChangingState.style.marginLeft = `${cellSize / 2}px`;
    canvasChangingState.style.marginTop = `${cellSize / 2}px`;
    for (let i = 0; i < allPiecesOnBoard.length; i++) {
        allPiecesOnBoard[i].shape.size = cellSize * pieceSizeRatio;
    }

    synchronize();
}

canvas.addEventListener('mousedown', e => {
    const pos = getPositionByMouse(e, canvas, cellSize, false);
    let clickedPiece = null;

    if (test.changingState) return;
    for (let i = 0; i < allPiecesOnBoard.length; i++) {
        const p = allPiecesOnBoard[i];
        if (p.pos.x === pos.x && p.pos.y === pos.y) {
            clickedPiece = p;
        }
    }

    const prepareCurrentPiece = () => {
        dragging = true;
        currentPiece.originPos.x = currentPiece.pos.x;
        currentPiece.originPos.y = currentPiece.pos.y;

        const cP = currentPiece.getRules.validMoves(
            currentPiece,
            allPiecesOnBoard,
            n
        );

        currentPiece.validMoves = cP.validMoves;
        currentPiece.takeAble = cP.takeAble;
        currentPiece.unTakeAble = cP.unTakeAble;
    };


    if (showValidMoves % 2 === 0) {
        if (clickedPiece) {
            syncCurrentPiece(clickedPiece);
            prepareCurrentPiece();
            showValidMoves++;
        }
    }

    else {
        if (clickedPiece && clickedPiece === currentPiece) {
            prepareCurrentPiece();
        }
        else if (isValidMove(currentPiece, pos.x, pos.y)) {
            const isTake = currentPiece.takeAble.some(
                p => p.pos.x === pos.x && p.pos.y === pos.y
            );

            if (isTake) {
                syncAllPiecesOnBoard(allPiecesOnBoard.filter(
                    p => !(p.pos.x === pos.x && p.pos.y === pos.y)
                ))
            }

            currentPiece.pos.x = pos.x;
            currentPiece.pos.y = pos.y;

            pushHistory(allPiecesOnBoard);
        }

        showValidMoves++;
    }

    if (currentPiece && currentPiece.getRules.canChangeStateCondition(currentPiece, n)) {
        test.changingState = true;
        dragging = false;
        showValidMoves = 0;

        render({
            ctx,
            canvas,
            cellSize,
            n,
            showValidMoves,
            dragging,
            pos,
            currentPiece,
            pieces: allPiecesOnBoard,
        });

        changeStateBoard(
            currentPiece,
            ctx,
            canvas,
            ctxChangeingState,
            cellSize,
        );
    } else {
        render({
            ctx,
            canvas,
            cellSize,
            n,
            showValidMoves,
            dragging,
            pos,
            currentPiece,
            pieces: allPiecesOnBoard,
        });
    }
});


window.addEventListener('mousemove', e => {
    const cellPos = getPositionByMouse(e, canvas, cellSize, false);
    let hoveringPiece = false;

    if (test.changingState) return;

    for (const p of allPiecesOnBoard) {
        if (p.pos.x === cellPos.x && p.pos.y === cellPos.y) {
            hoveringPiece = true;
            break;
        }
    }
    canvas.style.cursor = hoveringPiece ? 'pointer' : 'default';

    if (!currentPiece) return;

    if (dragging) {
        const pos = getPositionByMouse(e, canvas, cellSize, true);
        canvas.style.cursor = 'pointer';

        currentPiece.pos.x = pos.x;
        currentPiece.pos.y = pos.y;

        if (cellPos.x !== currentPiece.originPos.x || cellPos.y !== currentPiece.originPos.y) showValidMoves = 0;
    }

    if (dragging || showValidMoves % 2 === 1) {
        if (isValidMove(currentPiece, cellPos.x, cellPos.y)) {
            canvas.style.cursor = 'pointer';
        }

        render({
            ctx,
            canvas,
            cellSize,
            n,
            showValidMoves,
            dragging,
            cellPos,
            currentPiece,
            pieces: allPiecesOnBoard,
        });
    }
});

window.addEventListener('mouseup', e => {
    if (!currentPiece) return;
    if (!dragging) return;

    dragging = false;

    const pos = getPositionByMouse(e, canvas, cellSize, false);

    if (test.changingState) return;

    if (isValidMove(currentPiece, pos.x, pos.y)) {
        const isTake = currentPiece.takeAble.some(
            p => p.pos.x === pos.x && p.pos.y === pos.y
        );

        if (isTake) {
            syncAllPiecesOnBoard(allPiecesOnBoard.filter(
                p => !(p.pos.x === pos.x && p.pos.y === pos.y)
            ))
        }

        currentPiece.pos.x = pos.x;
        currentPiece.pos.y = pos.y;

        pushHistory(allPiecesOnBoard);

    } else {
        currentPiece.pos.x = currentPiece.originPos.x;
        currentPiece.pos.y = currentPiece.originPos.y;
    }

    if (currentPiece && currentPiece.getRules.canChangeStateCondition(currentPiece, n)) {
        test.changingState = true;
        dragging = false;
        showValidMoves = 0;

        render({
            ctx,
            canvas,
            cellSize,
            n,
            showValidMoves,
            dragging,
            pos,
            currentPiece,
            pieces: allPiecesOnBoard,
        });

        changeStateBoard(
            currentPiece,
            ctx,
            canvas,
            ctxChangeingState,
            cellSize,
        );
    } else {
        render({
            ctx,
            canvas,
            cellSize,
            n,
            showValidMoves,
            dragging,
            pos,
            currentPiece,
            pieces: allPiecesOnBoard,
        });
    }
});

window.addEventListener('resize', () => {
    if (test.changingState) return;
    resize();
    render({
        ctx,
        canvas,
        cellSize,
        n,
        showValidMoves,
        dragging,
        cellPos: null,
        currentPiece,
        pieces: allPiecesOnBoard,
    });
});

window.addEventListener('load', () => {
    resize();

    requestAnimationFrame(() => {
        resize();
        history.push(cloneAllPiecesOnBoard(allPiecesOnBoard));
        render({
            ctx,
            canvas,
            cellSize,
            n,
            showValidMoves,
            dragging,
            cellPos: null,
            currentPiece,
            pieces: allPiecesOnBoard,
        });
    });
});
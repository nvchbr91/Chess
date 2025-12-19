import {
    pieces
} from './pieces.js';
 
import {
    createPiece
} from './pieces/rules/utils.js'

import {
    test,
    cloneAllPiecesOnBoard
} from './manager.js';

import {
    history,
    allPiecesOnBoard,
    syncAllPiecesOnBoard,
    currentPiece,
    syncCurrentPiece
} from './shareVariables.js'

let canvas;
let canvasChangingState = document.getElementById('changingState');
let ctxChangingState = canvasChangingState.getContext('2d');
let ctx;
let n;
let rect;
let cellSize;
let pieceSizeRatio;
let canvasSizeRatio;
let dragging;
let showValidMoves;
let changingState = false;
let imageCache;
let pieceStates = [];
let hoveringPiece = false;

// Fix drawGrowCell while changingState
// Fix hovering canvasChangingBoard while it closed
// Fix low resolution while changingState

function drawBoard(c1 = '#f7f7e6ff', c2 = '#416f9cff') {
    for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
            ctx.fillStyle = (x + y) % 2 === 0 ? c1 : c2;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

function drawDots(moves, symbol = 'O', exclude = []) {
    ctx.fillStyle = 'black';
    ctx.font = `${cellSize / 3}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const m of moves) {
        if (exclude.some(p => p.pos.x === m.pos.x && p.pos.y === m.pos.y)) continue;

        ctx.fillText(
            symbol,
            (m.pos.x - 0.5) * cellSize,
            (m.pos.y - 0.5) * cellSize
        );
    }
}

function drawGlowCell(ctx, x, y, width, height, lineWidth, color = 'cyan', blur = 25) {
    ctx.save();

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;

    ctx.strokeRect(
        (x - 1) * cellSize,
        (y - 1) * cellSize,
        width,
        height
    );

    ctx.restore();
}

function drawGlowCircle(ctx, x, y, cellSize, radius, color = 'cyan', blur = 25) {
    ctx.save();

    ctx.strokeStyle = color;
    ctx.lineWidth = cellSize / 15;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;

    const cx = (x - 0.5) * cellSize;
    const cy = (y - 0.5) * cellSize;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

function dimCanvas(ctx, canvas, alpha = 0.3, color = 'black') {
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

export function sync(variables) {
    ({
        canvas,
        canvasChangingState,
        ctxChangingState,
        ctx,
        n,
        rect,
        cellSize,
        pieceSizeRatio,
        canvasSizeRatio,
        dragging,
        showValidMoves,
        changingState,
        imageCache,
    } = variables);
}

export function loadImage(ctx, piece) {
    // Don't do it this way anymore. When starting, pre-load all images and put them into imageCache, then access them when needed.
    const src = piece.shape.image;
    if (imageCache[src]) return imageCache[src];

    const img = new Image();
    img.src = src;

    img.onload = () => {
        drawPiece(ctx, piece, cellSize)
    }

    imageCache[src] = img;
    return img;
}

export function drawPiece(ctx, piece, cellSize) {
    const size = piece.shape.size;
    const img = piece.shape.image;

    if (!img || !img.complete) return;

    const x = (piece.pos.x - 1) * cellSize + (cellSize - size) / 2;
    const y = (piece.pos.y - 1) * cellSize + (cellSize - size) / 2;

    ctx.drawImage(img, x, y, size, size);
}

export function getPositionByMouse(e, canvas, cellSize, moving) {
    const rect = canvas.getBoundingClientRect();
    const mx = Math.min(Math.max(e.clientX - rect.left, cellSize/2), canvas.width - cellSize/2);
    const my = Math.min(Math.max(e.clientY - rect.top, cellSize / 2), canvas.height - cellSize / 2);

    if (moving) {
        return {
            x: mx / cellSize + 0.5,
            y: my / cellSize + 0.5
        };
    }

    return {
        x: Math.floor(mx / cellSize) + 1,
        y: Math.floor(my / cellSize) + 1
    };
}

export function changeStateBoard(currentPiece, ctx, canvas, ctxChangingStates, cellSize) {
    dimCanvas(ctx, canvas, 0.3);
    canvas.style.cursor = 'default';
    pieceStates = [];
    changingState = true;
    ctxChangingState = ctxChangingStates;

    const sLength = currentPiece.getRules.states.length;
    const rules = {
        'king': pieces.king,
        'queen': pieces.queen,
        'rook': pieces.rook,
        'bishop': pieces.bishop,
        'knight': pieces.knight,
        'pawn': pieces.pawn
    };

    ctxChangingState.fillStyle = '#ffffffff'

    for (let i = 0; i < sLength; i++) {
        let src = `assets/${currentPiece.class === 0 ? 'white' : 'black'}_${currentPiece.getRules.states[i]}.png`

        ctxChangingState.fillRect(
            0,
            i * cellSize,
            cellSize,
            cellSize
        );

        let tmp = createPiece(1,
            i + 1,
            currentPiece.class,
            src,
            rules[currentPiece.getRules.states[i]]);
        tmp.shape.size = cellSize * 0.9;
        tmp.shape.image = loadImage(ctxChangingState, tmp);
        drawPiece(ctxChangingState, tmp, cellSize);

        pieceStates.push(tmp);
    }

    ctxChangingState.fillStyle = '#a11919ff'

    ctxChangingState.fillRect(
        0,
        cellSize * sLength,
        cellSize,
        cellSize/2
    );

    ctxChangingState.fillStyle = '#ffffffff'
    ctxChangingState.font = `${cellSize / 3}px sans-serif`;
    ctxChangingState.textAlign = 'center';
    ctxChangingState.textBaseline = 'middle';

    ctxChangingState.fillText(
        'X',
        cellSize / 2,
        cellSize * sLength + cellSize / 4
    );
}

export function render(state) {
    const {
        ctx,
        canvas,
        cellSize,
        n,
        showValidMoves,
        dragging,
        cellPos,
        currentPiece,
        pieces,
    } = state;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();

    if ((showValidMoves % 2 === 1 || dragging) && currentPiece) {
        drawDots(currentPiece.validMoves, 'O', currentPiece.takeAble);

        for (const target of currentPiece.takeAble) {
            drawGlowCircle(
                ctx,
                target.pos.x,
                target.pos.y,
                cellSize,
                cellSize / 3,
                "red"
            );
        }

        drawGlowCell(
            ctx,
            currentPiece.originPos.x,
            currentPiece.originPos.y,
            cellSize,
            cellSize,
            cellSize / 15
        );

        if (
            cellPos &&
            (cellPos.x !== currentPiece.originPos.x ||
            cellPos.y !== currentPiece.originPos.y)
        ) {
            drawGlowCell(
                ctx,
                cellPos.x,
                cellPos.y,
                cellSize,
                cellSize,
                cellSize / 15
            );
        }
    }

    for (const piece of pieces) {
        if (piece !== currentPiece) drawPiece(ctx, piece, cellSize);
    }
    if (currentPiece) drawPiece(ctx, currentPiece, cellSize);
}

export function renderChangingState(e, hoveringPiece) {
    const rect = canvasChangingState.getBoundingClientRect();
    const pos = getPositionByMouse(e, canvasChangingState, rect, cellSize, false);
    ctxChangingState.clearRect(0, 0, canvasChangingState.width, canvasChangingState.height);

    ctxChangingState.fillStyle = '#ffffffff';

    for (let i = 0; i < pieceStates.length; i++) {
        ctxChangingState.fillRect(
            0,
            i * cellSize,
            cellSize,
            cellSize
        );
        drawPiece(ctxChangingState, pieceStates[i], cellSize);
    }

    ctxChangingState.fillStyle = '#a11919ff';

    ctxChangingState.fillRect(
        0,
        cellSize * pieceStates.length,
        cellSize,
        cellSize/2
    );

    ctxChangingState.fillStyle = '#ffffffff'
    ctxChangingState.font = `${cellSize / 3}px sans-serif`;
    ctxChangingState.textAlign = 'center';
    ctxChangingState.textBaseline = 'middle';

    ctxChangingState.fillText(
        'X',
        cellSize / 2,
        cellSize * pieceStates.length + cellSize / 4
    );

    if (hoveringPiece) {
        if (pos.y === pieceStates.length + 1) {
            drawGlowCell(ctxChangingState, pos.x, pos.y, cellSize, cellSize/2, cellSize / 15);
        } else {
            drawGlowCell(ctxChangingState, pos.x, pos.y, cellSize, cellSize, cellSize / 15);   
        }
    }
}

canvasChangingState.addEventListener('mousedown', e => {
    if (!changingState) return;
    const rect = canvasChangingState.getBoundingClientRect();
    const pos = getPositionByMouse(e, canvasChangingState, cellSize, false);
    const my = Math.min(Math.max(e.clientY - rect.top, cellSize / 2), canvasChangingState.height - cellSize / 2);
    const y = Math.floor(my * 2 / cellSize) + 0.5 - Math.floor(my / cellSize);
    
    if (pos.y === pieceStates.length + 1) {
        if (y === pieceStates.length + 0.5) {
            if (!history[history.length - 2]) return;
            syncAllPiecesOnBoard(cloneAllPiecesOnBoard(history[history.length - 2]));
            history.pop();

            render({
                ctx,
                canvas,
                cellSize,
                n,
                showValidMoves,
                dragging,
                pos,
                currentPiece: null,
                pieces: allPiecesOnBoard,
            });

            test.changingState = false;
            changingState = false;
            ctxChangingState.clearRect(0, 0, canvasChangingState.width, canvasChangingState.height);
        }
    }

    for (const piece of pieceStates) {
        if (piece.pos.x === pos.x && piece.pos.y === pos.y) {
            const oldPos = { ...currentPiece.pos };

            syncAllPiecesOnBoard(allPiecesOnBoard.filter(p => p !== currentPiece));

            piece.pos = oldPos;
            piece.originPos = { ...oldPos };

            allPiecesOnBoard.push(piece);

            syncAllPiecesOnBoard(allPiecesOnBoard);
            syncCurrentPiece(piece);

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

            test.changingState = false;
            changingState = false;
            ctxChangingState.clearRect(0, 0, canvasChangingState.width, canvasChangingState.height);
        }
    }
})

canvasChangingState.addEventListener('mousemove', e => {
    if (!changingState) return;

    const rect = canvasChangingState.getBoundingClientRect();
    const pos = getPositionByMouse(e, canvasChangingState, cellSize, false);
    hoveringPiece = false;

    const mx = Math.min(Math.max(e.clientX - rect.left, cellSize/2), canvasChangingState.width - cellSize/2);
    const my = Math.min(Math.max(e.clientY - rect.top, cellSize / 2), canvasChangingState.height - cellSize / 2);

    let x = Math.floor(mx / cellSize) + 1;
    let y = Math.floor(my * 2 / cellSize) + 0.5 - Math.floor(my / cellSize);

    for (const p of pieceStates) {
        if ((p.pos.x === pos.x && p.pos.y === pos.y) ||
            1 === x && pieceStates.length+0.5 === y) {
            hoveringPiece = true;
            break;
        }
    }

    canvasChangingState.style.cursor = hoveringPiece ? 'pointer' : 'default';

    renderChangingState(e, hoveringPiece)
})

canvasChangingState.addEventListener('mouseleave', e => {
    if (!changingState) return;
    hoveringPiece = false;
    renderChangingState(e, hoveringPiece);
})
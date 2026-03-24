<!-- lib/components/SignatureModal.svelte -->
<script>
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let canvas;
    let signatureCanvas;
    let isDrawing = false;

    onMount(() => {
        signatureCanvas = canvas.getContext('2d');
        setupCanvas();
    });

    const setupCanvas = () => {
        canvas.width = 500;
        canvas.height = 200;
        signatureCanvas.fillStyle = 'white';
        signatureCanvas.fillRect(0, 0, canvas.width, canvas.height);
        signatureCanvas.strokeStyle = 'black';
        signatureCanvas.lineWidth = 2;
        signatureCanvas.lineCap = 'round';

        // Event listeners
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
    };

    const startDrawing = (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        signatureCanvas.beginPath();
        signatureCanvas.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        signatureCanvas.lineTo(x, y);
        signatureCanvas.stroke();
    };

    const stopDrawing = () => {
        isDrawing = false;
    };

    const clearSignature = () => {
        signatureCanvas.fillStyle = 'white';
        signatureCanvas.fillRect(0, 0, canvas.width, canvas.height);
    };

    const saveSignature = () => {
        const dataUrl = canvas.toDataURL();
        dispatch('save', dataUrl);
    };
</script>

<div class="modal-overlay">
    <div class="modal">
        <h3>Draw your signature</h3>
        
        <canvas bind:this={canvas}></canvas>
        
        <div class="actions">
            <button on:click={clearSignature}>Clear</button>
            <button on:click={saveSignature} class="save">Save</button>
            <button on:click={() => dispatch('close')}>Cancel</button>
        </div>
    </div>
</div>

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    canvas {
        border: 1px solid #ddd;
        margin: 16px 0;
        cursor: crosshair;
    }

    .actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
    }

    button {
        padding: 8px 16px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
    }

    button.save {
        background: #2563eb;
        color: white;
        border-color: #2563eb;
    }
</style>
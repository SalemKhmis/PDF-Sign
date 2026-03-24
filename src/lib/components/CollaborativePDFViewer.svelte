<!-- lib/components/CollaborativePDFViewer.svelte -->
<script>
    import { onMount, onDestroy } from 'svelte';
    import { writable } from 'svelte/store';
    import * as Y from 'yjs';
    import { fabric } from 'fabric';
    import { PDFDocument, rgb } from 'pdf-lib';
    import UserCursor from './UserCursor.svelte';
    import SignatureModal from './SignatureModal.svelte';

    export let pdfFile;
    export let ydoc;
    export let provider;
    export let userName;
    export let roomId;

    let canvas;
    let fabricCanvas;
    let pdfDocument = writable(null);
    let currentPage = writable(1);
    let totalPages = writable(0);
    let selectedTool = writable('move');
    let showSignatureModal = writable(false);
    let signatureData = writable(null);
    let users = writable([]);
    
    // Yjs shared types
    let yAnnotations;
    let yUsers;

    // User color
    const userColor = getUserColor(userName);

    onMount(async () => {
        // Initialize Fabric canvas with better defaults
        fabricCanvas = new fabric.Canvas(canvas, {
            width: 800,
            height: 1000,
            selection: true,
            preserveObjectStacking: true,
            allowTouchScrolling: true
        });

        // Load PDF
        await loadPDF();

        // Initialize Yjs shared types
        yAnnotations = ydoc.getArray('annotations');
        
        // Subscribe to Yjs updates
        yAnnotations.observe(handleAnnotationsUpdate);
        
        // Awareness for cursors
        provider.awareness.setLocalState({
            user: {
                name: userName,
                color: userColor,
                cursor: null,
                page: 1
            }
        });

        provider.awareness.on('change', handleAwarenessChange);

        // Setup canvas event listeners
        setupCanvasListeners();

        // Initial users list
        handleAwarenessChange();
    });

    onDestroy(() => {
        if (fabricCanvas) {
            fabricCanvas.dispose();
        }
        if (yAnnotations) {
            yAnnotations.unobserve(handleAnnotationsUpdate);
        }
        if (provider) {
            provider.awareness.off('change', handleAwarenessChange);
        }
    });

    const getUserColor = (name) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${hash % 360}, 70%, 50%)`;
    };

    const loadPDF = async () => {
        const fileReader = new FileReader();
        
        fileReader.onload = async (e) => {
            const pdfData = new Uint8Array(e.target.result);
            const pdfDoc = await PDFDocument.load(pdfData);
            pdfDocument.set(pdfDoc);
            totalPages.set(pdfDoc.getPageCount());
            
            // Render first page
            await renderPDFPage(1);
        };
        
        fileReader.readAsArrayBuffer(pdfFile);
    };

    const renderPDFPage = async (pageNum) => {
        const doc = $pdfDocument;
        if (!doc) return;

        const page = doc.getPage(pageNum - 1);
        const { width, height } = page.getSize();
        
        // Update canvas size
        fabricCanvas.setWidth(width);
        fabricCanvas.setHeight(height);
        
        // Clear existing objects but keep annotations for this page
        const currentObjects = fabricCanvas.getObjects().filter(obj => 
            obj.page === pageNum
        );
        fabricCanvas.clear();
        
        // Add back the annotations for this page
        currentObjects.forEach(obj => fabricCanvas.add(obj));

        // Render PDF as background
        const pdfBytes = await doc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        fabric.Image.fromURL(url, (img) => {
            img.set({
                selectable: false,
                evented: false,
                lockMovementX: true,
                lockMovementY: true,
                hasControls: false,
                hasBorders: false
            });
            fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));
            URL.revokeObjectURL(url);
        });

        // Load annotations for this page from Yjs
        loadPageAnnotations(pageNum);
    };

    const loadPageAnnotations = (pageNum) => {
        const annotations = yAnnotations.toArray().filter(a => a.page === pageNum);
        
        annotations.forEach(annotation => {
            if (annotation.type === 'signature' || annotation.type === 'initials') {
                fabric.Image.fromURL(annotation.data, (img) => {
                    img.set({
                        ...annotation.position,
                        annotationId: annotation.id,
                        user: annotation.user,
                        page: annotation.page,
                        hasControls: true,
                        hasBorders: true,
                        borderColor: getUserColor(annotation.user),
                        cornerColor: getUserColor(annotation.user)
                    });
                    fabricCanvas.add(img);
                    fabricCanvas.renderAll();
                });
            } else if (annotation.type === 'text') {
                const text = new fabric.IText(annotation.data.text, {
                    ...annotation.position,
                    annotationId: annotation.id,
                    user: annotation.user,
                    page: annotation.page,
                    fontSize: annotation.data.fontSize || 20,
                    fontFamily: 'Arial',
                    fill: annotation.data.color || '#000000',
                    hasControls: true,
                    hasBorders: true,
                    borderColor: getUserColor(annotation.user),
                    cornerColor: getUserColor(annotation.user)
                });
                fabricCanvas.add(text);
                fabricCanvas.renderAll();
            }
        });
    };

    const setupCanvasListeners = () => {
        fabricCanvas.on('mouse:move', (e) => {
            const pointer = fabricCanvas.getPointer(e.e);
            provider.awareness.setLocalStateField('cursor', {
                x: pointer.x,
                y: pointer.y,
                page: $currentPage
            });
        });

        fabricCanvas.on('mouse:down', (e) => {
            if ($selectedTool === 'signature' && $signatureData) {
                addSignature(e);
            } else if ($selectedTool === 'text') {
                addText(e);
            } else if ($selectedTool === 'initials' && $signatureData) {
                addInitials(e);
            }
        });

        fabricCanvas.on('object:moving', (e) => {
            const obj = e.target;
            if (obj.annotationId) {
                // Update Yjs annotation
                const annotations = yAnnotations.toArray();
                const index = annotations.findIndex(a => a.id === obj.annotationId);
                
                if (index !== -1) {
                    yAnnotations.delete(index, 1);
                    yAnnotations.insert(index, [{
                        ...annotations[index],
                        position: {
                            left: obj.left,
                            top: obj.top,
                            scaleX: obj.scaleX,
                            scaleY: obj.scaleY
                        }
                    }]);
                }
            }
        });

        fabricCanvas.on('object:modified', (e) => {
            const obj = e.target;
            if (obj.annotationId) {
                fabricCanvas.renderAll();
            }
        });
    };

    const addSignature = (e) => {
        const pointer = fabricCanvas.getPointer(e.e);
        const id = generateId();
        
        fabric.Image.fromURL($signatureData, (img) => {
            img.set({
                left: pointer.x - 50,
                top: pointer.y - 25,
                scaleX: 0.3,
                scaleY: 0.3,
                hasControls: true,
                hasBorders: true,
                annotationId: id,
                user: userName,
                page: $currentPage,
                borderColor: userColor,
                cornerColor: userColor
            });

            fabricCanvas.add(img);
            fabricCanvas.setActiveObject(img);
            fabricCanvas.renderAll();

            // Add to Yjs
            yAnnotations.push([{
                id,
                type: 'signature',
                data: $signatureData,
                position: {
                    left: img.left,
                    top: img.top,
                    scaleX: img.scaleX,
                    scaleY: img.scaleY
                },
                page: $currentPage,
                user: userName,
                timestamp: Date.now()
            }]);
        });
    };

    const addInitials = (e) => {
        const pointer = fabricCanvas.getPointer(e.e);
        const id = generateId();
        
        fabric.Image.fromURL($signatureData, (img) => {
            img.set({
                left: pointer.x - 30,
                top: pointer.y - 15,
                scaleX: 0.15,
                scaleY: 0.15,
                hasControls: true,
                hasBorders: true,
                annotationId: id,
                user: userName,
                page: $currentPage,
                borderColor: userColor,
                cornerColor: userColor
            });

            fabricCanvas.add(img);
            fabricCanvas.setActiveObject(img);
            fabricCanvas.renderAll();

            // Add to Yjs
            yAnnotations.push([{
                id,
                type: 'initials',
                data: $signatureData,
                position: {
                    left: img.left,
                    top: img.top,
                    scaleX: img.scaleX,
                    scaleY: img.scaleY
                },
                page: $currentPage,
                user: userName,
                timestamp: Date.now()
            }]);
        });
    };

    const addText = (e) => {
        const pointer = fabricCanvas.getPointer(e.e);
        const id = generateId();
        
        const text = new fabric.IText('Double click to edit', {
            left: pointer.x,
            top: pointer.y,
            fontFamily: 'Arial',
            fontSize: 20,
            fill: '#000000',
            hasControls: true,
            hasBorders: true,
            annotationId: id,
            user: userName,
            page: $currentPage,
            borderColor: userColor,
            cornerColor: userColor
        });

        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        fabricCanvas.renderAll();

        // Add to Yjs
        yAnnotations.push([{
            id,
            type: 'text',
            data: {
                text: text.text,
                fontSize: text.fontSize,
                color: text.fill
            },
            position: {
                left: text.left,
                top: text.top
            },
            page: $currentPage,
            user: userName,
            timestamp: Date.now()
        }]);

        // Listen for text changes
        text.on('modified', () => {
            const annotations = yAnnotations.toArray();
            const index = annotations.findIndex(a => a.id === id);
            
            if (index !== -1) {
                yAnnotations.delete(index, 1);
                yAnnotations.insert(index, [{
                    ...annotations[index],
                    data: {
                        text: text.text,
                        fontSize: text.fontSize,
                        color: text.fill
                    },
                    position: {
                        left: text.left,
                        top: text.top
                    }
                }]);
            }
        });
    };

    const handleAnnotationsUpdate = () => {
        // Reload current page annotations
        loadPageAnnotations($currentPage);
    };

    const handleAwarenessChange = () => {
        const states = Array.from(provider.awareness.getStates().values());
        const activeUsers = states
            .filter(state => state.user)
            .map(state => ({
                ...state.user,
                cursor: state.cursor
            }));
        
        users.set(activeUsers);
    };

    const generateId = () => {
        return `${userName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    const downloadPDF = async () => {
        const doc = $pdfDocument;
        if (!doc) return;

        // Get all annotations
        const allAnnotations = yAnnotations.toArray();

        // Apply annotations to PDF
        for (const annotation of allAnnotations) {
            const page = doc.getPage(annotation.page - 1);
            const { width, height } = page.getSize();
            
            if (annotation.type === 'signature' || annotation.type === 'initials') {
                // Convert base64 to image and embed in PDF
                try {
                    const signatureImage = await fetch(annotation.data);
                    const signatureBytes = await signatureImage.arrayBuffer();
                    const signatureEmbed = await doc.embedPng(signatureBytes);
                    
                    page.drawImage(signatureEmbed, {
                        x: annotation.position.left,
                        y: height - annotation.position.top - (50 * annotation.position.scaleY),
                        width: 150 * annotation.position.scaleX,
                        height: 50 * annotation.position.scaleY
                    });
                } catch (error) {
                    console.error('Error embedding signature:', error);
                }
            } else if (annotation.type === 'text') {
                page.drawText(annotation.data.text || '', {
                    x: annotation.position.left,
                    y: height - annotation.position.top,
                    size: annotation.data.fontSize || 20,
                    color: rgb(0, 0, 0)
                });
            }
        }

        // Save PDF
        const pdfBytes = await doc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `collaborative-document-${roomId}.pdf`;
        link.click();
        
        URL.revokeObjectURL(url);
    };

    const changePage = async (newPage) => {
        if (newPage >= 1 && newPage <= $totalPages) {
            currentPage.set(newPage);
            await renderPDFPage(newPage);
            
            // Update awareness with new page
            provider.awareness.setLocalStateField('page', newPage);
        }
    };

    const deleteSelected = () => {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject && activeObject.annotationId) {
            const annotations = yAnnotations.toArray();
            const index = annotations.findIndex(a => a.id === activeObject.annotationId);
            
            if (index !== -1) {
                yAnnotations.delete(index, 1);
                fabricCanvas.remove(activeObject);
                fabricCanvas.renderAll();
            }
        }
    };
</script>

<div class="collaborative-viewer">
    <div class="toolbar">
        <div class="room-info">
            <span class="room-badge">Room: {roomId}</span>
            <span class="user-badge" style="background: {userColor}">
                {userName}
            </span>
        </div>

        <div class="tools">
            <button 
                class:active={$selectedTool === 'move'}
                on:click={() => selectedTool.set('move')}
                title="Move objects"
            >
                🖱️ Move
            </button>
            <button 
                class:active={$selectedTool === 'signature'}
                on:click={() => showSignatureModal.set(true)}
                title="Add signature"
            >
                ✍️ Signature
            </button>
            <button 
                class:active={$selectedTool === 'initials'}
                on:click={() => {
                    if ($signatureData) {
                        selectedTool.set('initials');
                    } else {
                        showSignatureModal.set(true);
                    }
                }}
                title="Add initials"
            >
                🔤 Initials
            </button>
            <button 
                class:active={$selectedTool === 'text'}
                on:click={() => selectedTool.set('text')}
                title="Add text"
            >
                📝 Text
            </button>
            <button 
                on:click={deleteSelected}
                title="Delete selected"
                disabled={!fabricCanvas.getActiveObject()}
            >
                🗑️ Delete
            </button>
        </div>

        <div class="page-controls">
            <button 
                on:click={() => changePage($currentPage - 1)}
                disabled={$currentPage === 1}
            >
                ←
            </button>
            <span class="page-info">
                Page {$currentPage} / {$totalPages}
            </span>
            <button 
                on:click={() => changePage($currentPage + 1)}
                disabled={$currentPage === $totalPages}
            >
                →
            </button>
        </div>

        <button class="download-btn" on:click={downloadPDF}>
            ⬇️ Download PDF
        </button>
    </div>

    <div class="main-container">
        <div class="users-sidebar">
            <h4>Active Users ({$users.length})</h4>
            <div class="users-list">
                {#each $users as user}
                    <div class="user-item" style="border-left-color: {user.color}">
                        <span class="user-name">{user.name}</span>
                        {#if user.cursor && user.cursor.page === $currentPage}
                            <span class="user-page">Page {user.cursor.page}</span>
                        {:else if user.page}
                            <span class="user-page">Page {user.page}</span>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>

        <div class="canvas-wrapper">
            <div class="canvas-container">
                <canvas bind:this={canvas}></canvas>
                
                <!-- Render cursors -->
                {#each $users as user}
                    {#if user.cursor && user.cursor.page === $currentPage && user.name !== userName}
                        <UserCursor 
                            position={user.cursor} 
                            color={user.color}
                            name={user.name}
                        />
                    {/if}
                {/each}
            </div>
        </div>
    </div>
</div>

{#if $showSignatureModal}
    <SignatureModal 
        on:close={() => showSignatureModal.set(false)}
        on:save={(data) => {
            signatureData.set(data);
            selectedTool.set('signature');
            showSignatureModal.set(false);
        }}
    />
{/if}

<style>
    .collaborative-viewer {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: #1a1a1a;
    }

    .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 24px;
        background: #ffffff;
        border-bottom: 1px solid #e5e7eb;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .room-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .room-badge {
        padding: 6px 12px;
        background: #f3f4f6;
        border-radius: 6px;
        font-size: 14px;
        color: #374151;
    }

    .user-badge {
        padding: 6px 16px;
        border-radius: 20px;
        color: white;
        font-weight: 600;
        font-size: 14px;
    }

    .tools {
        display: flex;
        gap: 8px;
        background: #f9fafb;
        padding: 4px;
        border-radius: 8px;
    }

    .tools button {
        padding: 8px 16px;
        border: none;
        background: transparent;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .tools button:hover {
        background: #e5e7eb;
    }

    .tools button.active {
        background: #2563eb;
        color: white;
    }

    .tools button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .page-controls {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #f9fafb;
        padding: 4px;
        border-radius: 8px;
    }

    .page-controls button {
        padding: 6px 12px;
        border: none;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        border: 1px solid #e5e7eb;
    }

    .page-controls button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .page-info {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
    }

    .download-btn {
        padding: 8px 20px;
        background: #10b981;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
    }

    .download-btn:hover {
        background: #059669;
    }

    .main-container {
        display: flex;
        flex: 1;
        overflow: hidden;
    }

    .users-sidebar {
        width: 240px;
        background: #f9fafb;
        border-right: 1px solid #e5e7eb;
        padding: 20px;
        overflow-y: auto;
    }

    .users-sidebar h4 {
        margin: 0 0 16px 0;
        color: #374151;
        font-size: 16px;
    }

    .users-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .user-item {
        padding: 8px 12px;
        background: white;
        border-left: 4px solid;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .user-name {
        font-weight: 500;
        color: #1f2937;
    }

    .user-page {
        font-size: 12px;
        color: #6b7280;
    }

    .canvas-wrapper {
        flex: 1;
        overflow: auto;
        background: #404040;
        position: relative;
    }

    .canvas-container {
        position: relative;
        display: inline-block;
        margin: 20px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }

    canvas {
        display: block;
        background: white;
    }
</style>
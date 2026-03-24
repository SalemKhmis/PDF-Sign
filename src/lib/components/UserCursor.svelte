<!-- lib/components/UserCursor.svelte -->
<script>
    export let position;
    export let color;
    export let name;

    // Update cursor position based on scroll
    $: style = `
        left: ${position.x}px;
        top: ${position.y}px;
        background: ${color};
    `;
</script>

<div class="cursor" style={style}>
    <div class="cursor-icon">✎</div>
    <div class="cursor-label">{name}</div>
</div>

<style>
    .cursor {
        position: absolute;
        width: 20px;
        height: 20px;
        pointer-events: none;
        z-index: 1000;
        transform: translate(-5px, -5px);
    }

    .cursor-icon {
        width: 20px;
        height: 20px;
        border-radius: 2px 20px 2px 2px;
        background: inherit;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
    }

    .cursor-label {
        position: absolute;
        left: 25px;
        top: 0;
        background: inherit;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
    }
</style>